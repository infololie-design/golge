import { Trash2, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { resetSession } from '../utils/sessionManager';

export const Header = () => {
  const handleReset = () => {
    if (confirm('Oturumu sıfırlamak istediğinize emin misiniz? Tüm konuşma geçmişi silinecek.')) {
      resetSession();
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800/50"
    >
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Moon className="w-6 h-6 text-red-900" />
          </motion.div>
          <h1 className="text-xl font-semibold text-gray-100 tracking-wide">
            Gölge
          </h1>
        </div>

        <button
          onClick={handleReset}
          className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
          title="Reset Session"
        >
          <Trash2 className="w-5 h-5 text-gray-500 group-hover:text-red-800 transition-colors" />
        </button>
      </div>
    </motion.header>
  );
};
