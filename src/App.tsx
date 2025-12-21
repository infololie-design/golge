import { Header } from './components/Header';
import { ChatContainer } from './components/ChatContainer';

function App() {
  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <ChatContainer />
    </div>
  );
}

export default App;
