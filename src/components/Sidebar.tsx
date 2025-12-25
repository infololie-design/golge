import React, { useState, useEffect } from 'react';
import { ROOMS, RoomType } from '../types';
import { X, Trash2, LogOut, ShieldCheck } from 'lucide-react';
import { clearSession } from '../utils/sessionManager';
import { supabase } from '../lib/supabase';
import { AdminDashboard } from './AdminDashboard';

const ADMIN_EMAIL = 'm.mrcn94@gmail.com'; 

interface SidebarProps {
  currentRoom: RoomType;
  onRoomChange: (room: RoomType) => void;
  isOpen: boolean;
  onClose: () => void;
  isSafeMode?: boolean; // Artık kullanılmıyor ama prop hatası vermesin diye opsiyonel bıraktık
  onToggleSafeMode?: () => void;
  onOpenBreathing?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoom, onRoomChange, isOpen, onClose }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email || null);
    });
  }, []);

  const handleReset = () => {
    if (window.confirm('Tüm konuşma geçmişi ve hafıza silinecek. En başa dönmek istediğine emin misin?')) {
      clearSession();
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Çıkış yapmak istediğine emin misin?')) {
      await supabase.auth.signOut();
    }
  };

  return (
    <>
      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 md:w-64 h-full bg-zinc-950 border-r border-zinc-900
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
        flex flex-col
      `}>
        <div className="p-6 flex-1 flex flex-col">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-red-600 tracking-widest">GÖLGE</h1>
            
            <div className="flex items-center gap-3">
              <button onClick={handleReset} className="text-zinc-500 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-zinc-900">
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="md:hidden text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Odalar</h2>
            <nav className="space-y-2">
              {ROOMS.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onRoomChange(room.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg transition-all duration-200 text-left group border ${
                    currentRoom === room.id
                      ? 'bg-red-900/20 border-red-900/50 text-red-400'
                      : 'bg-transparent border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{room.icon}</span>
                  <span className="font-medium text-sm">{room.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-900 space-y-2">
          
          {/* NEFES ALANI BUTONU KALDIRILDI */}

          {userEmail === ADMIN_EMAIL && (
            <button onClick={() => setShowAdmin(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-blue-400 transition-all mb-2 border border-zinc-800">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium text-sm">Yönetim Paneli</span>
            </button>
          )}

          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-500 hover:bg-zinc-900 hover:text-red-400 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
};
