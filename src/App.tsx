import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { RoomType, ROOMS } from './types';
import { Menu } from 'lucide-react'; // Menü ikonu ekledik

function App() {
  const [currentRoom, setCurrentRoom] = useState<RoomType>(ROOMS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Menü durumu

  const handleRoomChange = (roomId: RoomType) => {
    setCurrentRoom(roomId);
    setIsSidebarOpen(false); // Mobilde oda seçince menüyü kapat
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      
      {/* MOBİL İÇİN ÜST BAŞLIK (HEADER) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 z-50">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-4 font-bold text-lg text-red-500 tracking-widest">GÖLGE</span>
      </div>

      {/* SIDEBAR (YAN MENÜ) */}
      <Sidebar 
        currentRoom={currentRoom} 
        onRoomChange={handleRoomChange}
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* SOHBET ALANI */}
      <main className="flex-1 h-full w-full relative">
        <ChatContainer currentRoom={currentRoom} />
      </main>

    </div>
  );
}

export default App;
