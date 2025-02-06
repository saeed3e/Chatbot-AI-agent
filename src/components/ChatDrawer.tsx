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
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onToggle,
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}) => {
  return (
    <>
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
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-800 ${
                session.id === currentSessionId ? 'bg-gray-800' : ''
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare size={18} className="shrink-0" />
              <span className="flex-1 truncate text-sm">
                {session.title || 'New Chat'}
              </span>
              {session.id === currentSessionId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
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
    </>
  );
};
