import React from 'react';
import { ROOMS, RoomType } from '../types';
import { X } from 'lucide-react';

interface SidebarProps {
  currentRoom: RoomType;
  onRoomChange: (room: RoomType) => void;
  isOpen: boolean;     // Yeni özellik
  onClose: () => void; // Yeni özellik
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoom, onRoomChange, isOpen, onClose }) => {
  return (
    <>
      {/* MOBİL İÇİN KARARTMA PERDESİ (Overlay) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR KUTUSU */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 md:w-64 h-full bg-zinc-950 border-r border-zinc-900
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="p-6 h-full flex flex-col">
          
          {/* Başlık ve Kapat Butonu */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-red-600 tracking-widest">GÖLGE</h1>
            <button onClick={onClose} className="md:hidden text-zinc-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
              Odalar
            </h2>
            <nav className="space-y-2">
              {ROOMS.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onRoomChange(room.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left group ${
                    currentRoom === room.id
                      ? 'bg-red-900/20 text-red-500 border border-red-900/30'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{room.icon}</span>
                  <span className="font-medium">{room.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto pt-6 border-t border-zinc-900">
            <p className="text-xs text-zinc-600 leading-relaxed">
              Keşfetmek istediğin odayı seç. Her oda, senin gölgenin farklı bir yönünü ortaya çıkaracak.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
