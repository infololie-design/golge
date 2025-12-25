import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Message, ApiResponse, RoomType } from '../types';
import { saveMessages, loadMessages } from '../utils/sessionManager';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { ShadowCard } from './ShadowCard';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { simpleDecrypt, simpleEncrypt } from '../utils/encryption';

const N8N_WEBHOOK_URL = 'https://n8n.lolie.com.tr/webhook/61faf25c-aab1-4246-adfe-2caa274fb839';

interface ChatContainerProps {
  currentRoom: RoomType;
  userId: string;
  isSafeMode: boolean;
  onProgressUpdate: () => void;
  userGender: string; // <--- YENİ: Cinsiyet Prop'u
}

export interface ChatContainerHandle {
  triggerModeSwitch: (newMode: boolean) => void;
}

// --- GÜÇLENDİRİLMİŞ JSON DEDEKTİFİ (CIMBIZ) ---
const parseShadowReport = (content: string) => {
  try {
    let cleanContent = content.replace(/```json/g, '').replace(/```/g, '');
    const jsonMatch = cleanContent.match(/\{[\s\S]*"type":\s*"shadow_report"[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    return null;
  }
  return null;
};

// --- GÖREV DURUMLARINI ÇÖZÜMLE ---
const parseTaskStatus = (reportContent: string) => {
  const tasksStatus = [false, false, false]; 
  if (reportContent.includes('Görev 1: YAPILDI')) tasksStatus[0] = true;
  if (reportContent.includes('Görev 2: YAPILDI')) tasksStatus[1] = true;
  if (reportContent.includes('Görev 3: YAPILDI')) tasksStatus[2] = true;
  return tasksStatus;
};

export const ChatContainer = forwardRef<ChatContainerHandle, ChatContainerProps>(({ currentRoom, userId, isSafeMode, onProgressUpdate, userGender }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRoomInitializing, setIsRoomInitializing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = userId; 
  const currentRoomRef = useRef<RoomType>(currentRoom);
  const initializedRooms = useRef<Set<string>>(new Set());
  const lastActivityTime = useRef<number>(Date.now());

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useImperativeHandle(ref, () => ({
    triggerModeSwitch: (newMode: boolean) => {
      const systemPrompt = newMode 
        ? `[SİSTEM: MOD DEĞİŞTİ - GÜVENLİ MODA GEÇİLDİ]` 
        : `[SİSTEM: MOD DEĞİŞTİ - GÖLGE MODUNA DÖNÜLDÜ]`;
      processAIRequest({ message: systemPrompt, mode: newMode ? 'safe' : 'shadow' }, currentRoom);
    }
  }));

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const timeDiff = now - lastActivityTime.current;
        if (isLoading && timeDiff > 10000) {
          setIsLoading(false);
          setIsRoomInitializing(false);
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

  useEffect(() => {
    const loadHistoryFromCloud = async () => {
      setIsLoading(true);
      setIsRoomInitializing(false); 
      setMessages([]); 

      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .eq('room', currentRoom)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const historyMessages: Message[] = data.map((item: any) => ({
            id: item.id.toString(),
            content: simpleDecrypt(item.content),
            sender: item.role === 'user' ? 'user' : 'ai',
            timestamp: new Date(item.created_at)
          }))
          .filter((msg: Message) => !msg.content.includes('[SİSTEM'));

          setMessages(historyMessages);
          setIsLoading(false);
          
        } else {
           if (!initializedRooms.current.has(currentRoom)) {
            initializedRooms.current.add(currentRoom);
            setIsRoomInitializing(true);
            
            if (currentRoom === 'yuzlesme') {
              fetchInitialMessage();
            } else {
              triggerRoomIntro(currentRoom);
            }
          } else {
            setIsLoading(false);
          }
        }

      } catch (err) {
        console.error("Geçmiş yüklenirken hata:", err);
        setIsLoading(false);
        setIsRoomInitializing(false);
      }
    };

    loadHistoryFromCloud();
  }, [currentRoom, userId]);

  const processAIRequest = async (payload: any, targetRoom: string) => {
    if (currentRoomRef.current === targetRoom) {
      setIsLoading(true);
      lastActivityTime.current = Date.now();
    }

    try {
      const response = await fetchWithTimeout(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...payload, 
          sessionId: sessionId, 
          room: targetRoom,
          mode: payload.mode || (isSafeMode ? 'safe' : 'shadow'),
          gender: userGender // <--- YENİ: Cinsiyet bilgisini n8n'e gönderiyoruz
        }), 
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

      if (currentRoomRef.current === targetRoom) {
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        setIsRoomInitializing(false);
      }

    } catch (error) {
      console.error('AI Process Error:', error);
      if (currentRoomRef.current === targetRoom) {
        setIsLoading(false);
        setIsRoomInitializing(false);
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

    setMessages(prev => [...prev, userMessage]);
    processAIRequest({ message: content }, currentRoom);
  };

  const handleTaskCompletion = async (feedbackSummary: string) => {
    const reportContent = `📝 **GÖREV RAPORU:**\n\n${feedbackSummary}`;
    
    const userNoteMessage: Message = {
      id: crypto.randomUUID(),
      content: reportContent,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userNoteMessage]);

    try {
      await supabase.from('chat_history').insert({
        user_id: userId,
        chat_id: userId,
        role: 'user',
        content: simpleEncrypt(reportContent),
        room: currentRoom
      });

      await supabase.from('user_progress').upsert({
        user_id: userId,
        room_id: currentRoom
      }, { onConflict: 'user_id, room_id' });

      onProgressUpdate(); 

    } catch (err) {
      console.error("Rapor kaydedilemedi:", err);
    }

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
    <div className={`flex flex-col h-[100dvh] w-full md:ml-0 transition-colors duration-500 ${isSafeMode ? 'bg-slate-950' : 'bg-gradient-to-b from-black via-gray-950 to-black'}`}>
      
      <div className="flex-1 overflow-y-auto pt-48 pb-48 px-4 scroll-smooth overscroll-contain">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {messages.length === 0 && !isLoading && !isRoomInitializing && (
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
            
            if (message.content.includes('📝 **GÖREV RAPORU:**')) {
              return null;
            }

            if (reportData) {
              const nextMessage = messages[index + 1];
              const isCompleted = nextMessage?.content.includes('📝 **GÖREV RAPORU:**');
              
              // YENİ: Görev durumlarını çözümle
              const completedTasks = isCompleted ? parseTaskStatus(nextMessage.content) : undefined;

              return (
                <ShadowCard 
                  key={message.id} 
                  data={reportData} 
                  onComplete={handleTaskCompletion}
                  isCompleted={isCompleted} 
                  initialTaskStatus={completedTasks} // <--- YENİ: Kart'a gönderiyoruz
                />
              );
            }

            return <MessageBubble key={message.id} message={message} index={index} />;
          })}

          {(isLoading || isRoomInitializing) && <TypingIndicator />}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      <ChatInput onSend={sendMessage} disabled={isLoading || isRoomInitializing} />
    </div>
  );
});
