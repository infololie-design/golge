import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatContainer, ChatContainerHandle } from './components/ChatContainer';
import { Auth } from './components/Auth';
import { JournalModal } from './components/JournalModal';
import { AlchemyUnlockedModal } from './components/AlchemyUnlockedModal'; // YENİ
import { RoomType, ROOMS } from './types';
import { Menu, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const [currentRoom, setCurrentRoom] = useState<RoomType>(ROOMS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  
  // YENİ STATE'LER
  const [completedRooms, setCompletedRooms] = useState<string[]>([]);
  const [showAlchemyModal, setShowAlchemyModal] = useState(false);
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const chatRef = useRef<ChatContainerHandle>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) checkProgress(session.user.id); // Giriş yapınca kontrol et
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProgress(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- İLERLEME KONTROLÜ ---
  const checkProgress = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('room_id')
        .eq('user_id', userId);

      if (data) {
        const rooms = data.map(item => item.room_id);
        
        // Eğer yeni bir oda tamamlandıysa ve toplam 2 olduysa KUTLAMA YAP
        // (Daha önce 2'den azsa ve şimdi 2 veya fazlaysa)
        if (completedRooms.length < 2 && rooms.length >= 2) {
          setShowAlchemyModal(true);
        }
        
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
      
      {/* MODALLAR */}
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
        completedRooms={completedRooms} // Veriyi App'ten alıyor
      />

      <main className="flex-1 h-full w-full relative">
        <ChatContainer 
          ref={chatRef} 
          currentRoom={currentRoom} 
          userId={session.user.id} 
          isSafeMode={isSafeMode}
          onProgressUpdate={() => checkProgress(session.user.id)} // Güncelleme tetikleyici
        />
      </main>

    </div>
  );
}

export default App;
