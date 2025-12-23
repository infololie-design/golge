import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { RoomType } from './types';

function App() {
  const [currentRoom, setCurrentRoom] = useState<RoomType>('Yüzleşme');

  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <Sidebar currentRoom={currentRoom} onRoomChange={setCurrentRoom} />
      <ChatContainer currentRoom={currentRoom} />
    </div>
  );
}

export default App;
