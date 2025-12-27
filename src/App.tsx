import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatContainer, ChatContainerHandle } from './components/ChatContainer';
import { Auth } from './components/Auth';
import { JournalModal } from './components/JournalModal';
import { AlchemyUnlockedModal } from './components/AlchemyUnlockedModal';
import { RoomType, ROOMS } from './types';
import { Menu, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const [currentRoom, setCurrentRoom] = useState<RoomType>(ROOMS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  
  const [completedRooms, setCompletedRooms] = useState<string[]>([]);
  const [showAlchemyModal, setShowAlchemyModal] = useState(false);
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Kullanıcı Cinsiyeti
  const [userGender, setUserGender] = useState<string>('female');

  const chatRef = useRef<ChatContainerHandle>(null);

  // YENİ ÇÖZÜM: Önceki oda sayısını tutan Ref
  // Başlangıç değeri -1 (Henüz hiç yükleme yapılmadı demek)
  const lastRoomCountRef = useRef<number>(-1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      clearTimeout(timeout);
      
      if (session) {
        checkProgress(session.user.id);
        setUserGender(session.user.user_metadata?.gender || 'female');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      
      if (session) {
        checkProgress(session.user.id);
        setUserGender(session.user.user_metadata?.gender || 'female');
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const checkProgress = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('room_id')
        .eq('user_id', userId);

      if (data) {
        const rooms = data.map(item => item.room_id);
        const currentCount = rooms.length;
        const prevCount = lastRoomCountRef.current;

        // KESİN ÇÖZÜM MANTIĞI:
        
        // Durum 1: Sayfa ilk kez yükleniyor (prevCount -1)
        if (prevCount === -1) {
          // Sadece hafızayı güncelle, MODALI AÇMA.
          lastRoomCountRef.current = currentCount;
          setCompletedRooms(rooms);
          return; 
        }

        // Durum 2: Canlı değişim (Kullanıcı sohbet ederken tamamladı)
        // Eğer eskiden 2'den az odası varken, ŞİMDİ 2 veya daha fazla odası olduysa
        if (prevCount < 2 && currentCount >= 2) {
          setShowAlchemyModal(true);
        }

        // Hafızayı ve state'i güncelle
        lastRoomCountRef.current = currentCount;
        setCompletedRooms(rooms);
      }
    } catch (error) {
      console.error('Progress check error:', error);
    }
  };

  const handleRoomChange = (roomId: RoomType) => {
    setCurrentRoom(roomId);
    setIsSidebarOpen(false);
  };

  const handleToggleSafeMode = () => {
    const newMode = !isSafeMode;
    setIsSafeMode(newMode);
    if (chatRef.current) {
      chatRef.current.triggerModeSwitch(newMode);
    }
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className={`flex h-screen text-white overflow-hidden transition-colors duration-500 ${isSafeMode ? 'bg-slate-950' : 'bg-black'}`}>
      
      {showJournal && <JournalModal userId={session.user.id} onClose={() => setShowJournal(false)} />}
      
      {showAlchemyModal && (
        <AlchemyUnlockedModal 
          onClose={() => setShowAlchemyModal(false)} 
          onGoToAlchemy={() => {
            setCurrentRoom('simya');
            setShowAlchemyModal(false);
          }} 
        />
      )}

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 z-50">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
        <span className={`ml-4 font-bold text-lg tracking-widest ${isSafeMode ? 'text-cyan-400' : 'text-red-500'}`}>
          {isSafeMode ? 'GÜVENLİ ALAN' : 'GÖLGE'}
        </span>
      </div>

      <Sidebar 
        currentRoom={currentRoom} 
        onRoomChange={handleRoomChange}
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isSafeMode={isSafeMode}
        onToggleSafeMode={handleToggleSafeMode}
        onOpenJournal={() => {
          setShowJournal(true);
          setIsSidebarOpen(false);
        }}
        completedRooms={completedRooms}
      />

      <main className="flex-1 h-full w-full relative">
        <ChatContainer 
          ref={chatRef} 
          currentRoom={currentRoom} 
          userId={session.user.id} 
          isSafeMode={isSafeMode}
          onProgressUpdate={() => checkProgress(session.user.id)}
          userGender={userGender} 
        />
      </main>

    </div>
  );
}

export default App;
