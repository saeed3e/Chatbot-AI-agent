import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, isUser }) => {
  return (
    <div
      className={`flex ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : 'javascript';
              
              return !inline ? (
                <div className="my-4">
                  <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className="bg-gray-800 text-gray-200 px-1 py-0.5 rounded">
                  {children}
                </code>
              );
            },
            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
            ul: ({ children }) => (
              <ul className="list-disc ml-6 mb-4 last:mb-0">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal ml-6 mb-4 last:mb-0">{children}</ol>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4 last:mb-0">
                <table className="min-w-full border border-gray-300">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 px-4 py-2">{children}</td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
