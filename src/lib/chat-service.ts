import { AIMessage } from '../types/ai';

export interface ChatSession {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
}

const STORAGE_KEY = 'chat_sessions';

export class ChatService {
  private static instance: ChatService;
  private sessions: ChatSession[] = [];

  private constructor() {
    this.loadSessions();
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private loadSessions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.sessions = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt)
        }));
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  }

  private saveSessions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Failed to save chat sessions:', error);
    }
  }

  createSession(): ChatSession {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date()
    };
    this.sessions.unshift(session);
    this.saveSessions();
    return session;
  }

  updateSession(sessionId: string, updates: Partial<ChatSession>) {
    const index = this.sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      this.sessions[index] = { ...this.sessions[index], ...updates };
      this.saveSessions();
    }
  }

  deleteSession(sessionId: string) {
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    this.saveSessions();
  }

  getSessions(): ChatSession[] {
    return [...this.sessions];
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.find(s => s.id === sessionId);
  }

  // Automatically generate a title based on the first message
  generateTitle(messages: AIMessage[]): string {
    const firstUserMessage = messages.find(m => m.role === 'user')?.content;
    if (firstUserMessage) {
      // Take first 30 characters of the message or up to the first newline
      const title = firstUserMessage.split('\n')[0].slice(0, 30);
      return title.length < firstUserMessage.length ? `${title}...` : title;
    }
    return 'New Chat';
  }
}
