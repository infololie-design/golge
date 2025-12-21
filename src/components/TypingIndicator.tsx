import { motion } from 'framer-motion';

export const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="flex-1 flex items-center gap-2 text-sm text-gray-500">
        <motion.div
          className="flex gap-1 bg-gray-900/30 px-4 py-3 rounded-2xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-red-900/60 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
        <span className="text-xs italic">Gölge düşünüyor...</span>
      </div>
    </div>
  );
};
