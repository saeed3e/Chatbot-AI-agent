import React from 'react';
import { PlusCircle, MessageSquare, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { AIMessage } from '../types/ai';

interface ChatSession {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  children?: React.ReactNode;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onToggle,
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  children
}) => {
  return (
    <div className="relative">
      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors"
          >
            <PlusCircle size={18} />
            <span>New chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="px-2 space-y-2 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Recent Sessions */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 px-2">Recent Sessions</h3>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                  session.id === currentSessionId
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageSquare size={18} />
                  <span className="truncate">{session.title || 'New Chat'}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded-full transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Persistent Chat History */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2 px-2">Chat History</h3>
            {children}
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-4 ${
          isOpen ? 'left-64' : 'left-0'
        } z-10 p-2 bg-gray-900 text-white rounded-r-lg transition-all duration-300 hover:bg-gray-800`}
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </div>
  );
};
