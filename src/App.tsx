import React, { useState, useRef } from 'react';
import { Send, Bot, User, Settings, Save, X, Edit2, StopCircle, AlertCircle } from 'lucide-react';
import { AIMessage, AVAILABLE_MODELS } from './types/ai';
import { AIService } from './lib/ai-service';

function App() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [configError, setConfigError] = useState('');
  
  const aiServiceRef = useRef<AIService>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCurrentModelName = () => {
    const model = AVAILABLE_MODELS.find(m => m.id === selectedModel);
    return model ? model.name : 'AI Model';
  };

  const initializeAI = (key: string, model: string) => {
    aiServiceRef.current = new AIService({
      provider: 'openai',
      apiKey: key,
      modelName: model
    });
  };

  const handleSaveConfig = () => {
    setConfigError('');
    if (!apiKey.trim()) {
      setConfigError('Please enter your API key');
      return;
    }
    initializeAI(apiKey, selectedModel);
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
    if ((!input.trim() && !customMessages) || !apiKey) return;

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
      const response = await aiServiceRef.current!.sendMessage(messagesToSend, abortControllerRef.current.signal);
      setMessages([...messagesToSend, { role: 'assistant', content: response }]);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error:', error);
        setMessages([...messagesToSend, { 
          role: 'assistant', 
          content: 'Sorry, there was an error processing your request.' 
        }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
            <div className="p-4 bg-gray-50 border-b space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setConfigError('');
                  }}
                  placeholder="Enter your OpenRouter API key"
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    configError ? 'border-red-500' : ''
                  }`}
                />
                {configError && (
                  <div className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle size={16} />
                    {configError}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsConfigOpen(false);
                    setConfigError('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  <X size={20} className="inline-block mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  <Save size={20} className="inline-block mr-1" />
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.role === 'assistant' && (
                  <Bot className="text-indigo-600" size={20} />
                )}
                <div className="flex-1 max-w-[80%]">
                  {editingMessageIndex === index ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                        rows={3}
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
                    <div
                      className={`p-3 rounded-lg group relative ${
                        message.role === 'assistant'
                          ? 'bg-gray-100'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {message.content}
                      {message.role === 'user' && (
                        <button
                          onClick={() => handleEditMessage(index)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 size={16} className="text-gray-500 hover:text-gray-700" />
                        </button>
                      )}
                    </div>
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
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded"
                disabled={!apiKey || isLoading}
              />
              <button
                type="submit"
                disabled={!apiKey || !input.trim() || isLoading}
                className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;