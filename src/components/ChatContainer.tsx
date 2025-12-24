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
  
  // Anlık oda takibi için Ref
  const currentRoomRef = useRef<RoomType>(currentRoom);
  
  // Hangi odaların başlatıldığını takip etmek için
  const initializedRooms = useRef<Set<string>>(new Set());

  // Son işlem zamanını takip et (Arka plan kontrolü için)
  const lastActivityTime = useRef<number>(Date.now());

  // Oda her değiştiğinde Ref'i güncelle
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // --- YENİ: ARKA PLAN / GÖRÜNÜRLÜK KONTROLÜ ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Kullanıcı ekrana geri döndü
        const now = Date.now();
        const timeDiff = now - lastActivityTime.current;

        // Eğer 10 saniyeden fazla arka planda kaldıysa ve hala yükleniyor görünüyorsa
        if (isLoading && timeDiff > 10000) {
          setIsLoading(false);
          // Kullanıcıya uyarı mesajı ekle
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            content: '⚠️ Uygulama arka planda kaldığı için bağlantı koptu. Lütfen son mesajınızı tekrar gönderin.',
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages(prev => {
            const updated = [...prev, errorMessage];
            saveMessages(updated, currentRoomRef.current);
            return updated;
          });
        }
      } else {
        // Kullanıcı arka plana gitti, zamanı kaydet
        lastActivityTime.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoading]); // isLoading değişince listener güncellenir

  // --- ZAMAN AŞIMI ---
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 40000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  // --- ODA DEĞİŞİMİ ---
  useEffect(() => {
    const roomMessages = loadMessages(currentRoom);
    setMessages(roomMessages);
    setIsLoading(false);

    if (roomMessages.length === 0 && !initializedRooms.current.has(currentRoom)) {
      initializedRooms.current.add(currentRoom);
      if (currentRoom === 'yuzlesme') {
        fetchInitialMessage();
      } else {
        triggerRoomIntro(currentRoom);
      }
    }
  }, [currentRoom]);

  // --- MERKEZİ AI İŞLEME ---
  const processAIRequest = async (payload: any, targetRoom: string) => {
    if (currentRoomRef.current === targetRoom) {
      setIsLoading(true);
      lastActivityTime.current = Date.now(); // İşlem başlangıç zamanını kaydet
    }

    try {
      const response = await fetchWithTimeout(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, sessionId: sessionId.current }),
      });

      if (!response.ok) throw new Error('Network error');
      const data: ApiResponse = await response.json();
      const aiResponse = data.response || data.message || '...';

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      const currentStoredMessages = loadMessages(targetRoom);
      const updatedMessages = [...currentStoredMessages, aiMessage];
      saveMessages(updatedMessages, targetRoom);

      if (currentRoomRef.current === targetRoom) {
        setMessages(updatedMessages);
        setIsLoading(false);
      }

    } catch (error) {
      console.error('AI Process Error:', error);
      if (currentRoomRef.current === targetRoom) {
        setIsLoading(false);
        // Hata durumunda kullanıcıya bilgi ver
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          content: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const triggerRoomIntro = (room: string) => {
    const systemMessage = `[SİSTEM: Kullanıcı '${room}' odasına geçti. Konuyu buna göre değiştir ve sert bir giriş sorusu sor.]`;
    processAIRequest({ message: systemMessage }, room);
  };

  const fetchInitialMessage = () => {
    processAIRequest({ message: '/start' }, 'yuzlesme');
  };

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    const tempMessages = [...messages, userMessage];
    setMessages(tempMessages);
    saveMessages(tempMessages, currentRoom);

    processAIRequest({ message: content }, currentRoom);
  };

  const handleTaskCompletion = async (feedbackSummary: string) => {
    const systemPrompt = `
      [SİSTEM BİLGİSİ: Kullanıcı verilen gölge görevlerini tamamladı ve şu notları düştü:
      ${feedbackSummary}
      
      TALİMAT: Artık "Yüzleşme/Sorgulama" aşamasını bitir. "ENTEGRASYON/REHBERLİK" aşamasına geç.
      Kullanıcının notlarını analiz et. Zorlandığı yerleri şefkatle ama gerçekçi bir dille yorumla.
      Artık onu karanlıkta bırakma, tünelin ucundaki ışığı göster. Daha yapıcı, daha bilge bir tona bürün.]
    `;
    await processAIRequest({ message: systemPrompt }, currentRoom);
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
            
            if (reportData) {
              return (
                <ShadowCard 
                  key={message.id} 
                  data={reportData} 
                  onComplete={handleTaskCompletion} 
                />
              );
            }

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
