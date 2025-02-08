import { useEffect, useCallback } from 'react';
import { AIMessage } from '../types/ai';

interface UseChatPersistenceProps {
  messages: AIMessage[];
  setMessages: (messages: AIMessage[]) => void;
  currentSessionId: string;
  setCurrentSessionId: (id: string) => void;
}

export const useChatPersistence = ({
  messages,
  setMessages,
  currentSessionId,
  setCurrentSessionId
}: UseChatPersistenceProps) => {
  // Load chat from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('chat');
    if (chatId) {
      const savedChat = localStorage.getItem(`chat_${chatId}`);
      if (savedChat) {
        try {
          const parsedChat = JSON.parse(savedChat);
          // Ensure we're not overwriting an existing chat
          if (!currentSessionId || currentSessionId !== chatId) {
            setMessages(parsedChat.messages);
            setCurrentSessionId(chatId);
            // Update URL to reflect the loaded chat
            const url = new URL(window.location.href);
            url.searchParams.set('chat', chatId);
            window.history.replaceState({}, '', url.toString());
          }
        } catch (e) {
          console.error('Error loading chat from URL:', e);
        }
      }
    }
  }, [setMessages, setCurrentSessionId, currentSessionId]);

  // Save chat to localStorage whenever it changes
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      localStorage.setItem(`chat_${currentSessionId}`, JSON.stringify({
        messages,
        timestamp: Date.now()
      }));
      
      // Update URL with chat ID
      const url = new URL(window.location.href);
      url.searchParams.set('chat', currentSessionId);
      window.history.replaceState({}, '', url.toString());
    }
  }, [messages, currentSessionId]);

  const loadChat = useCallback((chatId: string) => {
    const savedChat = localStorage.getItem(`chat_${chatId}`);
    if (savedChat) {
      try {
        const parsedChat = JSON.parse(savedChat);
        setMessages(parsedChat.messages);
        setCurrentSessionId(chatId);
        
        // Update URL without triggering a page reload
        const url = new URL(window.location.href);
        if (url.searchParams.get('chat') !== chatId) {
          url.searchParams.set('chat', chatId);
          window.history.pushState({}, '', url.toString());
        }

        // Save current chat state
        localStorage.setItem(`chat_${chatId}`, JSON.stringify({
          messages: parsedChat.messages,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error loading chat:', e);
      }
    }
  }, [setMessages, setCurrentSessionId]);

  const getAllChats = useCallback(() => {
    const chats: { id: string; timestamp: number; preview: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chat_')) {
        try {
          const chatData = JSON.parse(localStorage.getItem(key) || '');
          // Validate chat data structure
          if (!chatData || !Array.isArray(chatData.messages)) {
            console.warn('Invalid chat data structure for:', key);
            continue;
          }
          const chatId = key.replace('chat_', '');
          const lastMessage = chatData.messages.length > 0 ? chatData.messages[chatData.messages.length - 1] : null;
          chats.push({
            id: chatId,
            timestamp: chatData.timestamp || Date.now(),
            preview: lastMessage?.content?.slice(0, 100) || 'Empty chat'
          });
        } catch (e) {
          console.error('Error parsing chat data:', e);
        }
      }
    }
    return chats.sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  return {
    loadChat,
    getAllChats
  };
};
