import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ChatHistoryProps {
  chats: {
    id: string;
    timestamp: number;
    preview: string;
  }[];
  onLoadChat: (chatId: string) => void;
  currentSessionId: string;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  chats,
  onLoadChat,
  currentSessionId
}) => {
  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`relative group p-4 rounded-lg border ${
            chat.id === currentSessionId
              ? 'bg-blue-50 border-blue-200'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{chat.preview}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(chat.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => onLoadChat(chat.id)}
              className="invisible group-hover:visible ml-2 p-1 text-gray-400 hover:text-gray-600"
              title="Resume this chat"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
