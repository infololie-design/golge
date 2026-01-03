import React, { useState, useEffect } from 'react';
import { ROOMS, RoomType } from '../types';
import { X, Trash2, LogOut, ShieldCheck, Calendar, Lock, UserX } from 'lucide-react';
import { clearSession } from '../utils/sessionManager';
import { supabase } from '../lib/supabase';
import { AdminDashboard } from './AdminDashboard';
import { LockedModal } from './LockedModal';

const ADMIN_EMAIL = 'm.mrcn94@gmail.com'; 

interface SidebarProps {
  currentRoom: RoomType;
  onRoomChange: (room: RoomType) => void;
  isOpen: boolean;
  onClose: () => void;
  isSafeMode?: boolean;
  onToggleSafeMode?: () => void;
  onOpenJournal: () => void;
  completedRooms: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentRoom, 
  onRoomChange, 
  isOpen, 
  onClose, 
  onOpenJournal,
  completedRooms
}) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email || null);
    });
  }, []);

  const handleResetProgress = async () => {
    const confirmed = window.confirm(
      'DİKKAT: Tüm konuşma geçmişin ve odalardaki ilerlemen SUNUCUDAN SİLİNECEK. En başa dönmek istediğine emin misin?'
    );

    if (confirmed) {
      setIsDeleting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('chat_history').delete().eq('user_id', user.id);
          await supabase.from('user_progress').delete().eq('user_id', user.id);
        }
        clearSession();
        window.location.reload();
      } catch (error) {
        console.error('Sıfırlama hatası:', error);
        alert('Hata oluştu.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'HESABIMI SİL: Bu işlem geri alınamaz! Hesabın ve tüm verilerin kalıcı olarak silinecek. Onaylıyor musun?'
    );

    if (confirmed) {
      setIsDeleting(true);
      try {
        const { error } = await supabase.rpc('delete_own_user');
        if (error) throw error;
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.reload();
      } catch (error) {
        console.error('Hesap silme hatası:', error);
        alert('Hesap silinirken bir hata oluştu. Lütfen tekrar dene.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Çıkış yapmak istediğine emin misin?')) {
      await supabase.auth.signOut();
    }
  };

  const isAlchemyUnlocked = completedRooms.length >= 2; 

  return (
    <>
      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
      
      {showLockedModal && (
        <LockedModal 
          onClose={() => setShowLockedModal(false)} 
          completedRooms={completedRooms} 
        />
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 md:w-64 h-[100dvh] bg-zinc-950 border-r border-zinc-900
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
        overflow-y-auto overflow-x-hidden
      `}>
        
        {/* 
           TEK BİR KAYDIRMA KONTEYNERİ
           min-h-full: İçerik az olsa bile en az ekran boyu kadar olsun.
           flex flex-col: İçeriği dikey diz.
        */}
        <div className="min-h-full flex flex-col">

          {/* ÜST KISIM (Başlık ve Odalar) */}
          <div className="p-6 flex-1">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-red-600 tracking-widest">GÖLGE</h1>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleResetProgress} 
                  disabled={isDeleting}
                  className="text-zinc-500 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-zinc-900 disabled:opacity-50"
                >
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
                {ROOMS.map((room) => {
                  const isLocked = room.id === 'simya' && !isAlchemyUnlocked;
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        if (isLocked) {
                          setShowLockedModal(true);
                        } else {
                          onRoomChange(room.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-4 rounded-lg transition-all duration-200 text-left group border ${
                        currentRoom === room.id
                          ? 'bg-red-900/20 border-red-900/50 text-red-400'
                          : 'bg-transparent border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white'
                      } ${isLocked ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{room.icon}</span>
                        <span className="font-medium text-sm">{room.name}</span>
                      </div>
                      {isLocked && <Lock className="w-4 h-4 text-zinc-600" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 
             ALT KISIM (Butonlar)
             pb-32: (128px) ÇOK BÜYÜK alt boşluk bıraktım.
             Böylece en alttaki buton asla ekranın dibine yapışmaz, yukarı kaydırılabilir.
          */}
          <div className="p-6 border-t border-zinc-900 space-y-2 bg-zinc-950 pb-32">
            <button onClick={onOpenJournal} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all mb-2 border border-zinc-800 hover:border-zinc-700">
              <Calendar className="w-5 h-5" />
              <span className="font-medium text-sm">Gölge Günlüğü</span>
            </button>

            {userEmail === ADMIN_EMAIL && (
              <button onClick={() => setShowAdmin(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-blue-400 transition-all mb-2 border border-zinc-800">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-medium text-sm">Yönetim Paneli</span>
              </button>
            )}

            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-500 hover:bg-zinc-900 hover:text-gray-300 transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Çıkış Yap</span>
            </button>

            {/* HESAP SİLME BUTONU - ARTIK GÖRÜNECEK */}
            <button 
              onClick={handleDeleteAccount} 
              disabled={isDeleting}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-900 hover:bg-red-950/30 hover:text-red-600 transition-all mt-4 opacity-70 hover:opacity-100"
            >
              <UserX className="w-5 h-5" />
              <span className="font-medium text-xs">Hesabımı Sil</span>
            </button>
          </div>
          
        </div>
      </aside>
    </>
  );
};
