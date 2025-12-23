import React from 'react';
import { ROOMS, RoomType } from '../types';
import { X, Trash2 } from 'lucide-react'; // Çöp kutusu ikonu eklendi
import { clearSession } from '../utils/sessionManager'; // Silme fonksiyonu eklendi

interface SidebarProps {
  currentRoom: RoomType;
  onRoomChange: (room: RoomType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoom, onRoomChange, isOpen, onClose }) => {
  
  // SIFIRLAMA FONKSİYONU
  const handleReset = () => {
    if (window.confirm('Tüm konuşma geçmişi ve hafıza silinecek. En başa dönmek istediğine emin misin?')) {
      clearSession(); // Hafızayı temizle
      window.location.reload(); // Sayfayı yenile
    }
  };

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
          
          {/* BAŞLIK VE BUTONLAR */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-red-600 tracking-widest">GÖLGE</h1>
            
            <div className="flex items-center gap-3">
              {/* ÇÖP KUTUSU (RESET) BUTONU */}
              <button 
                onClick={handleReset}
                className="text-zinc-500 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-zinc-900"
                title="Tüm geçmişi sil ve sıfırla"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              {/* MOBİL KAPATMA BUTONU */}
              <button onClick={onClose} className="md:hidden text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* MENÜ LİSTESİ */}
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
                      ? 'bg-red-900/20 border-red-900/50' 
                      : 'bg-transparent border-transparent hover:bg-zinc-900'
                  }`}
                >
                  <span className="text-xl">{room.icon}</span>
                  <span className={`font-medium text-sm ${
                    currentRoom === room.id ? 'text-red-400' : 'text-zinc-300 group-hover:text-white'
                  }`}>
                    {room.name}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* ALT BİLGİ */}
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
