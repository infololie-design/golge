import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatContainer, ChatContainerHandle } from './components/ChatContainer'; // Handle eklendi
import { Auth } from './components/Auth';
import { RoomType, ROOMS } from './types';
import { Menu, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const [currentRoom, setCurrentRoom] = useState<RoomType>(ROOMS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ChatContainer'a erişmek için Ref
  const chatRef = useRef<ChatContainerHandle>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRoomChange = (roomId: RoomType) => {
    setCurrentRoom(roomId);
    setIsSidebarOpen(false);
  };

  // PANİK BUTONUNA BASILINCA
  const handlePanic = () => {
    if (chatRef.current) {
      chatRef.current.triggerPanicMode(); // ChatContainer'daki fonksiyonu çalıştır
      setIsSidebarOpen(false); // Mobilde menüyü kapat
    }
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
    <div className="flex h-screen bg-black text-white overflow-hidden">
      
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 z-50">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-4 font-bold text-lg text-red-500 tracking-widest">GÖLGE</span>
      </div>

      <Sidebar 
        currentRoom={currentRoom} 
        onRoomChange={handleRoomChange}
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onOpenBreathing={handlePanic} // <--- ARTIK PANİK MODUNU TETİKLİYOR
      />

      <main className="flex-1 h-full w-full relative">
        <ChatContainer 
          ref={chatRef} // <--- REF BAĞLANDI
          currentRoom={currentRoom} 
          userId={session.user.id} 
        />
      </main>

    </div>
  );
}

export default App;
