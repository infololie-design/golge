import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  index: number;
}

export const MessageBubble = ({ message, index }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'bg-gray-800/80 text-gray-100 rounded-2xl rounded-tr-md px-4 py-3'
            : 'text-gray-300'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-red-400">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-400">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-300">{children}</li>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-900/50 px-1.5 py-0.5 rounded text-red-300 text-sm">
                    {children}
                  </code>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-gray-500' : 'text-gray-600'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </motion.div>
  );
};
