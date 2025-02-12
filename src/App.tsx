import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Settings, Edit2, StopCircle } from 'lucide-react';
import { ConfigPanel } from './components/ConfigPanel';
import { OnlineStatus } from './components/OnlineStatus';
import { ChatMessage } from './components/ChatMessage';
import { AIMessage, AVAILABLE_MODELS } from './types/ai';
import { AIService } from './lib/ai-service';
import { WelcomeModal } from './components/WelcomeModal';
import { ApiStatus } from './components/ApiStatus';
import { SettingsService } from './lib/settings-service';
import { ChatDrawer } from './components/ChatDrawer';
import { ChatService } from './lib/chat-service';
import { ChatHistory } from './components/ChatHistory';
import { useChatPersistence } from './hooks/useChatPersistence';

function App() {
  const settingsService = useRef(SettingsService.getInstance());
  const chatService = useRef(ChatService.getInstance());
  const aiServiceRef = useRef<AIService>();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Chat and Message States
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // UI States
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [configError, setConfigError] = useState('');

  // Settings States
  const [apiKey, setApiKey] = useState(() => {
    const settings = settingsService.current.getAllSettings();
    return settings.apiKey || '';
  });
  const [selectedModel, setSelectedModel] = useState(() => {
    const settings = settingsService.current.getAllSettings();
    if (settings.modelName) {
      return settings.modelName;
    }
    return AVAILABLE_MODELS[0].models[0].id;
  });

  // Initialize chat persistence hook
  const { loadChat, getAllChats } = useChatPersistence({
    messages,
    setMessages,
    currentSessionId,
    setCurrentSessionId
  });

  // Load chat from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('chat');
    if (chatId && (!currentSessionId || currentSessionId !== chatId)) {
      loadChat(chatId);
    }
  }, [loadChat, currentSessionId]);

  const getCurrentModelName = () => {
    for (const category of AVAILABLE_MODELS) {
      const model = category.models.find(m => m.id === selectedModel);
      if (model) return model.name;
    }
    return 'AI Model';
  };

  const initializeAI = (key: string, model: string) => {
    aiServiceRef.current = new AIService({
      provider: 'openai',
      apiKey: key,
      modelName: model
    });
  };

  useEffect(() => {
    if (apiKey) {
      initializeAI(apiKey, selectedModel);
      setShowWelcome(false);
    }

    // Create initial session if none exists
    const sessions = chatService.current.getSessions();
    if (sessions.length === 0) {
      const newSession = chatService.current.createSession();
      setCurrentSessionId(newSession.id);
    } else {
      setCurrentSessionId(sessions[0].id);
      setMessages(sessions[0].messages);
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setConfigError('');
  };

  const handleApiKeyKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && apiKey.trim()) {
      e.preventDefault();
      handleSaveConfig();
      setIsConfigOpen(false);
    }
  };

  const handleSaveConfig = () => {
    if (!apiKey.trim()) {
      setConfigError('Please enter your API key');
      return;
    }

    // Clear all error states
    setConfigError('');
    setInput('');

    // Update settings and initialize AI
    settingsService.current.updateSettings({
      apiKey: apiKey,
      modelName: selectedModel
    });
    initializeAI(apiKey, selectedModel);

    // Close the panel
    setIsConfigOpen(false);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleEditMessage = (index: number) => {
    if (messages[index].role === 'user') {
      setEditingMessageIndex(index);
      setEditingContent(messages[index].content);
    }
  };

  const handleSaveEdit = async () => {
    if (editingMessageIndex !== null && editingContent.trim()) {
      const newMessages = [...messages];
      newMessages[editingMessageIndex] = {
        ...newMessages[editingMessageIndex],
        content: editingContent
      };

      // Remove all messages after the edited one
      newMessages.splice(editingMessageIndex + 1);

      setMessages(newMessages);
      setEditingMessageIndex(null);
      setEditingContent('');

      // Regenerate AI response
      await handleSubmit(null, newMessages);
    }
  };

  const handleSubmit = async (e: React.FormEvent | null, customMessages?: AIMessage[]) => {
    if (e) e.preventDefault();

    // Early validation
    if (!apiKey) {
      setInput('');
      setConfigError('Please enter your API key to start chatting');
      setIsConfigOpen(true);
      return;
    }

    if (!navigator.onLine) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'You are currently offline. Please check your internet connection and try again.' 
      }]);
      return;
    }

    if (!input.trim() && !customMessages) return;

    if (!aiServiceRef.current) {
      initializeAI(apiKey, selectedModel);
    }

    const messagesToSend = customMessages || [...messages, { role: 'user', content: input }];

    if (!customMessages) {
      setMessages(messagesToSend);
      setInput('');
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      let streamedResponse = '';
      const response = await aiServiceRef.current!.sendMessage(
        messagesToSend,
        abortControllerRef.current.signal,
        (chunk) => {
          streamedResponse += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[newMessages.length - 1]?.role === 'assistant') {
              newMessages[newMessages.length - 1] = {
                role: 'assistant',
                content: streamedResponse
              };
            } else {
              newMessages.push({ role: 'assistant', content: streamedResponse });
            }
            return newMessages;
          });
        }
      );
      
      // Update the messages with the final response
      const finalMessages = [...messagesToSend, { role: 'assistant', content: response }];
      setMessages(finalMessages);

      // Update session with the final messages
      if (currentSessionId) {
        chatService.current.updateSession(currentSessionId, {
          messages: finalMessages,
          title: chatService.current.generateTitle(finalMessages)
        });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error:', error);
        const updatedMessages = [...messagesToSend, {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.'
        }];
        setMessages(updatedMessages);

        // Update session with error message
        if (currentSessionId) {
          chatService.current.updateSession(currentSessionId, {
            messages: updatedMessages
          });
        }
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleNewChat = () => {
    const newSession = chatService.current.createSession();
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = chatService.current.getSession(sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    chatService.current.deleteSession(sessionId);
    const sessions = chatService.current.getSessions();
    if (sessions.length === 0) {
      handleNewChat();
    } else {
      handleSelectSession(sessions[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {showWelcome && (
        <WelcomeModal
          onComplete={(key) => {
            // Save API key to settings
            settingsService.current.updateSettings({
              apiKey: key,
              modelName: selectedModel
            });
            // Update state
            setApiKey(key);
            initializeAI(key, selectedModel);
            setShowWelcome(false);
          }}
          onSkip={() => setShowWelcome(false)}
        />
      )}

      {apiKey && <ApiStatus
        apiKey={apiKey}
        onInvalidKey={() => {
          settingsService.current.clearApiKey();
          setIsConfigOpen(true);
        }}
      />}

      <ChatDrawer
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        sessions={chatService.current.getSessions()}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      >
        <ChatHistory
          chats={getAllChats()}
          onLoadChat={loadChat}
          currentSessionId={currentSessionId}
        />
      </ChatDrawer>


      <main className={`transition-all duration-300 ${isDrawerOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-2rem)]">
            <OnlineStatus />
            {/* Header */}
            <div className="bg-indigo-600 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Bot className="text-white" size={24} />
                  <h1 className="text-xl font-bold text-white">AI Chat</h1>
                </div>
                <button
                  onClick={() => setIsConfigOpen(!isConfigOpen)}
                  className="text-white hover:bg-indigo-700 p-2 rounded-full"
                >
                  <Settings size={20} />
                </button>
              </div>
              {apiKey && (
                <div className="mt-2 text-indigo-100 text-sm">
                  Using model: {getCurrentModelName()}
                </div>
              )}
            </div>

            {/* Config Panel */}
            {isConfigOpen && (
              <ConfigPanel
                apiKey={apiKey}
                selectedModel={selectedModel}
                configError={configError}
                onApiKeyChange={handleApiKeyChange}
                onApiKeyKeyPress={handleApiKeyKeyPress}
                onModelSelect={(modelId) => {
                  setSelectedModel(modelId);
                  initializeAI(apiKey, modelId);
                  settingsService.current.updateSettings({
                    apiKey,
                    modelName: modelId
                  });
                }}
                onSave={handleSaveConfig}
                onClose={() => {
                  setIsConfigOpen(false);
                  setConfigError('');
                }}
              />
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 13rem)' }}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  {message.role === 'assistant' && (
                    <Bot className="text-indigo-600" size={20} />
                  )}
                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    {editingMessageIndex === index ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 resize-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingMessageIndex(null)}
                            className="px-2 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-2 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <ChatMessage
                        content={message.content}
                        isUser={message.role === 'user'}
                      />
                    )}
                  </div>
                  {message.role === 'user' && (
                    <User className="text-indigo-600" size={20} />
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center justify-between text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot size={20} />
                    <span>Thinking...</span>
                  </div>
                  <button
                    onClick={handleStopGeneration}
                    className="text-red-500 hover:text-red-700 flex items-center space-x-1"
                  >
                    <StopCircle size={20} />
                    <span>Stop</span>
                  </button>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-white sticky bottom-0">
              <div className="flex space-x-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(null);
                    }
                  }}
                  placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                  className="flex-1 p-3 border rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={!apiKey || isLoading}
                  rows={1}
                  style={{ minHeight: '2.5rem', maxHeight: '150px' }}
                />
                <button
                  type="submit"
                  disabled={!apiKey || !input.trim() || isLoading}
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={!apiKey ? 'Please enter your API key in settings' : 'Send message'}
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;