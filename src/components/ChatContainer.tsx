import { useState, useEffect, useRef } from 'react';
import { Message, ApiResponse, RoomType } from '../types';
import { saveMessages } from '../utils/sessionManager';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { ShadowCard } from './ShadowCard';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase'; // Supabase eklendi
import { simpleDecrypt } from '../utils/encryption'; // Şifre çözücü eklendi

const N8N_WEBHOOK_URL = 'https://n8n.lolie.com.tr/webhook/61faf25c-aab1-4246-adfe-2caa274fb839';

interface ChatContainerProps {
  currentRoom: RoomType;
  userId: string;
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

export const ChatContainer = ({ currentRoom, userId }: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const sessionId = userId; 
  
  const currentRoomRef = useRef<RoomType>(currentRoom);
  const initializedRooms = useRef<Set<string>>(new Set());
  const lastActivityTime = useRef<number>(Date.now());

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // --- GÖRÜNÜRLÜK KONTROLÜ ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const timeDiff = now - lastActivityTime.current;
        if (isLoading && timeDiff > 10000) {
          setIsLoading(false);
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            content: '⚠️ Uygulama arka planda kaldığı için bağlantı koptu. Lütfen son mesajınızı tekrar gönderin.',
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } else {
        lastActivityTime.current = Date.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoading]);

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

  // --- ODA DEĞİŞİMİ VE GEÇMİŞİ YÜKLEME (BULUTTAN) ---
  useEffect(() => {
    const loadHistoryFromCloud = async () => {
      setIsLoading(true);
      setMessages([]); // Önce temizle

      try {
        // 1. Supabase'den verileri çek
        // Sadece bu kullanıcının verilerini çek (RLS zaten koruyor ama biz yine de filtreleyelim)
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId) 
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // 2. Verileri işle ve şifrelerini çöz
          const historyMessages: Message[] = data.map((item: any) => ({
            id: item.id.toString(),
            content: simpleDecrypt(item.content), // Şifreyi çöz
            sender: item.role === 'user' ? 'user' : 'ai', // Rolü eşleştir
            timestamp: new Date(item.created_at)
          }));

          // 3. Sadece şu anki odanın mesajlarını filtrele?
          // NOT: Şu an veritabanında "hangi oda" bilgisi yok. 
          // O yüzden tüm geçmişi getiriyoruz. İleride "room" sütunu ekleyebiliriz.
          // Şimdilik tüm akışı gösteriyoruz, bu da bir "Yolculuk" hissi verir.
          setMessages(historyMessages);
          
          // Eğer hiç mesaj yoksa (Yeni kullanıcı) -> Başlat
        } else {
           if (!initializedRooms.current.has(currentRoom)) {
            initializedRooms.current.add(currentRoom);
            if (currentRoom === 'yuzlesme') {
              fetchInitialMessage();
            } else {
              triggerRoomIntro(currentRoom);
            }
          }
        }

      } catch (err) {
        console.error("Geçmiş yüklenirken hata:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistoryFromCloud();
  }, [currentRoom, userId]); // Oda veya Kullanıcı değişince çalış

  const processAIRequest = async (payload: any, targetRoom: string) => {
    if (currentRoomRef.current === targetRoom) {
      setIsLoading(true);
      lastActivityTime.current = Date.now();
    }

    try {
      const response = await fetchWithTimeout(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, sessionId: sessionId }),
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

      // Ekrana bas (Kaydetme işini zaten n8n yapıyor)
      if (currentRoomRef.current === targetRoom) {
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }

    } catch (error) {
      console.error('AI Process Error:', error);
      if (currentRoomRef.current === targetRoom) {
        setIsLoading(false);
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

    // Mesajı ekrana bas
    setMessages(prev => [...prev, userMessage]);
    
    // AI isteğini başlat
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
