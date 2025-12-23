import { motion } from 'framer-motion';
import { ROOMS, RoomType } from '../types';

interface SidebarProps {
  currentRoom: RoomType;
  onRoomChange: (room: RoomType) => void;
}

const roomIcons = {
  'Yüzleşme': '🔥',
  'Anne/Baba Yarası': '💔',
  'İlişkiler': '💔',
  'Para': '💰',
};

export const Sidebar = ({ currentRoom, onRoomChange }: SidebarProps) => {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-950 via-black to-gray-950 border-r border-gray-800/50 pt-20 overflow-y-auto"
    >
      <div className="p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
          Odalar
        </h2>

        <nav className="space-y-2">
          {ROOMS.map((room) => (
            <motion.button
              key={room}
              onClick={() => onRoomChange(room)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                currentRoom === room
                  ? 'bg-red-900/30 border border-red-900/50 text-red-300'
                  : 'text-gray-400 hover:bg-gray-900/30 border border-transparent hover:border-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{roomIcons[room as keyof typeof roomIcons]}</span>
                <span className="font-medium text-sm">{room}</span>
              </div>
            </motion.button>
          ))}
        </nav>

        <div className="mt-8 pt-4 border-t border-gray-800/50">
          <p className="text-xs text-gray-600 leading-relaxed">
            Keşfetmek istediğin odayı seç. Her oda, senin gölgenin farklı bir yönünü ortaya çıkaracak.
          </p>
        </div>
      </div>
    </motion.aside>
  );
};
