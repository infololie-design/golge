import { useState, useEffect, useRef } from 'react';
import { Message, ApiResponse, RoomType } from '../types';
import { getSessionId, saveMessages, loadMessages } from '../utils/sessionManager';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { ShadowCard } from './ShadowCard';
import { motion } from 'framer-motion';

const N8N_WEBHOOK_URL = 'https://n8n.lolie.com.tr/webhook/61faf25c-aab1-4246-adfe-2caa274fb839';

interface ChatContainerProps {
  currentRoom: RoomType;
}

// JSON Algılama Fonksiyonu
const parseShadowReport = (content: string) => {
  try {
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    if (cleanJson.startsWith('{') && cleanJson.includes('"type": "shadow_report"')) {
      return JSON.parse(cleanJson);
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const ChatContainer = ({ currentRoom }: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());
  
  // Hangi odaların başlatıldığını takip etmek için (Tekrar tekrar "Merhaba" demesin)
  const initializedRooms = useRef<Set<string>>(new Set());

  // --- ODA DEĞİŞİMİ VE YÜKLEME MANTIĞI ---
  useEffect(() => {
    // 1. Odaya girince hemen o odanın eski mesajlarını yükle
    const roomMessages = loadMessages(currentRoom);
    setMessages(roomMessages);

    // 2. Eğer bu oda daha önce hiç konuşulmamışsa (Boşsa) -> AI'yı Başlat
    // initializedRooms kontrolü: Kullanıcı sayfayı yenilemeden odalar arası gezerse tekrar tetiklenmesin
    if (roomMessages.length === 0 && !initializedRooms.current.has(currentRoom)) {
      initializedRooms.current.add(currentRoom);
      
      if (currentRoom === 'yuzlesme') {
        fetchInitialMessage(); // İlk açılış (/start)
      } else {
        triggerRoomIntro(currentRoom); // Diğer odalar (Sistem mesajı)
      }
    }
  }, [currentRoom]);

  // --- YENİ ODA İÇİN AI TETİKLEME ---
  const triggerRoomIntro = async (room: string) => {
    setIsLoading(true);
    try {
      const systemMessage = `[SİSTEM: Kullanıcı '${room}' odasına geçti. Konuyu buna göre değiştir ve sert bir giriş sorusu sor.]`;
      
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: systemMessage, sessionId: sessionId.current }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data: ApiResponse = await response.json();
      const aiResponse = data.response || data.message || 'Üzgünüm, bir yanıt oluşturamadım.';

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      // Mesajı ekle ve BU ODAYA kaydet
      setMessages(prev => {
        const updated = [...prev, aiMessage];
        saveMessages(updated, room);
        return updated;
      });
    } catch (error) {
      console.error('Room intro error:', error);
      // Hata olsa bile boş bırakma, kullanıcı yazabilsin
    } finally {
      setIsLoading(false);
    }
  };

  // --- İLK AÇILIŞ (/start) ---
  const fetchInitialMessage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '/start', sessionId: sessionId.current }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data: ApiResponse = await response.json();
      const aiResponse = data.response || data.message || 'Üzgünüm, bir yanıt oluşturamadım.';

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages([aiMessage]);
      saveMessages([aiMessage], 'yuzlesme'); // Yüzleşme odasına kaydet
    } catch (error) {
      console.error('Initial fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- MESAJ GÖNDERME ---
  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    // Kullanıcı mesajını ekle ve BU ODAYA kaydet
    const tempMessages = [...messages, userMessage];
    setMessages(tempMessages);
    saveMessages(tempMessages, currentRoom);
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, sessionId: sessionId.current }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data: ApiResponse = await response.json();
      const aiResponse = data.response || data.message || 'Üzgünüm, bir yanıt oluşturamadım.';

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      // AI cevabını ekle ve BU ODAYA kaydet
      setMessages(prev => {
        const final = [...prev, aiMessage];
        saveMessages(final, currentRoom);
        return final;
      });

    } catch (error) {
      console.error('Send error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full md:ml-0 bg-gradient-to-b from-black via-gray-950 to-black">
      
      <div className="flex-1 overflow-y-auto pt-32 pb-48 px-4 scroll-smooth overscroll-contain">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-gray-600 text-center mt-10"
            >
              <p>Karanlığa hoş geldiniz...</p>
            </motion.div>
          )}

          {messages.map((message, index) => {
            const reportData = message.sender === 'ai' ? parseShadowReport(message.content) : null;
            if (reportData) return <ShadowCard key={message.id} data={reportData} />;
            return <MessageBubble key={message.id} message={message} index={index} />;
          })}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};
