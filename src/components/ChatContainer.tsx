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
  
  // YENİ: Anlık oda takibi için Ref (State yerine Ref kullanıyoruz ki her an güncel olsun)
  const currentRoomRef = useRef<RoomType>(currentRoom);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const initializedRooms = useRef<Set<string>>(new Set());

  // Oda her değiştiğinde Ref'i güncelle
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // --- ODA DEĞİŞİMİ ---
  useEffect(() => {
    // 1. Önceki isteği iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 2. Mesajları yükle
    const roomMessages = loadMessages(currentRoom);
    setMessages(roomMessages);
    setIsLoading(false);

    // 3. Oda boşsa AI'yı başlat
    if (roomMessages.length === 0 && !initializedRooms.current.has(currentRoom)) {
      initializedRooms.current.add(currentRoom);
      if (currentRoom === 'yuzlesme') {
        fetchInitialMessage();
      } else {
        triggerRoomIntro(currentRoom);
      }
    }
  }, [currentRoom]);

  // --- GÜVENLİ FETCH FONKSİYONU ---
  const fetchAI = async (payload: any, targetRoom: string) => {
    // Yeni iptal kumandası
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, sessionId: sessionId.current }),
        signal: signal,
      });

      if (!response.ok) throw new Error('Network error');
      const data: ApiResponse = await response.json();
      const aiResponse = data.response || data.message || '...';

      // --- KRİTİK GÜVENLİK KONTROLÜ ---
      // Cevap geldiğinde, kullanıcı hala isteği attığı odada mı?
      if (currentRoomRef.current !== targetRoom) {
        console.log(`İstek iptal edildi: Kullanıcı ${targetRoom} odasından ${currentRoomRef.current} odasına geçti.`);
        return; // HİÇBİR ŞEY YAPMA, DUR.
      }

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => {
        const updated = [...prev, aiMessage];
        saveMessages(updated, targetRoom);
        return updated;
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted cleanly.');
      } else {
        console.error('Fetch error:', error);
      }
    } finally {
      // Sadece hala aynı odadaysak loading'i kapat
      if (currentRoomRef.current === targetRoom) {
        setIsLoading(false);
      }
    }
  };

  const triggerRoomIntro = (room: string) => {
    const systemMessage = `[SİSTEM: Kullanıcı '${room}' odasına geçti. Konuyu buna göre değiştir ve sert bir giriş sorusu sor.]`;
    fetchAI({ message: systemMessage }, room);
  };

  const fetchInitialMessage = () => {
    fetchAI({ message: '/start' }, 'yuzlesme');
  };

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    // Mesajı hemen ekle
    const tempMessages = [...messages, userMessage];
    setMessages(tempMessages);
    saveMessages(tempMessages, currentRoom);

    // AI isteğini başlat
    fetchAI({ message: content }, currentRoom);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
