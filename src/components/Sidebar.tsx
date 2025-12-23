import React from 'react';
import { ROOMS, RoomType } from '../types';
import { X } from 'lucide-react';

interface SidebarProps {
  currentRoom: RoomType;
  onRoomChange: (room: RoomType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoom, onRoomChange, isOpen, onClose }) => {
  return (
    <>
      {/* MOBİL İÇİN KARARTMA PERDESİ */}
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
          
          {/* Başlık */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-red-600 tracking-widest">GÖLGE</h1>
            <button onClick={onClose} className="md:hidden text-zinc-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menü Listesi */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
              Odalar
            </h2>
            <nav className="space-y-2">
              {ROOMS.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onRoomChange(room.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg transition-all duration-200 text-left group border ${
                    currentRoom === room.id
                      ? 'bg-red-900/20 border-red-900/50' // Aktif buton arka planı
                      : 'bg-transparent border-transparent hover:bg-zinc-900' // Pasif buton
                  }`}
                >
                  {/* İkon */}
                  <span className="text-xl">{room.icon}</span>
                  
                  {/* İsim (Rengi zorla beyaz/gri yapıyoruz) */}
                  <span className={`font-medium text-sm ${
                    currentRoom === room.id ? 'text-red-400' : 'text-zinc-300 group-hover:text-white'
                  }`}>
                    {room.name}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Alt Bilgi */}
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
