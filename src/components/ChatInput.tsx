import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-gray-800/50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Gölgenize ne söylemek istersiniz?"
            disabled={disabled}
            rows={1}
            className="flex-1 bg-gray-900/50 text-gray-100 placeholder-gray-600 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-800/50"
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              overflowY: 'auto',
            }}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="bg-red-900 hover:bg-red-800 disabled:bg-gray-800 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
