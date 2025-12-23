import { useState, useEffect, useRef } from 'react';
import { Message, ApiResponse, RoomType } from '../types';
import { getSessionId, saveMessages, loadMessages } from '../utils/sessionManager';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { ShadowCard } from './ShadowCard'; // <--- YENİ: Kart bileşenini ekledik
import { motion } from 'framer-motion';

const N8N_WEBHOOK_URL = 'https://n8n.lolie.com.tr/webhook/61faf25c-aab1-4246-adfe-2caa274fb839';

interface ChatContainerProps {
  currentRoom: RoomType;
}

// <--- YENİ: JSON Algılama Fonksiyonu
const parseShadowReport = (content: string) => {
  try {
    // Markdown kod bloklarını temizle (```json ... ```)
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    // JSON olup olmadığına bak
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
  const initializeRef = useRef(false);
  const previousRoomRef = useRef<RoomType | null>(null);

  useEffect(() => {
    const stored = loadMessages();
    if (stored.length > 0) {
      setMessages(stored as Message[]);
    }
  }, []);

  useEffect(() => {
    if (!initializeRef.current && messages.length === 0) {
      initializeRef.current = true;
      fetchInitialMessage();
    }
  }, [messages]);

  useEffect(() => {
    if (previousRoomRef.current && previousRoomRef.current !== currentRoom) {
      handleRoomChange();
    }
    previousRoomRef.current = currentRoom;
  }, [currentRoom]);

  const handleRoomChange = async () => {
    setIsLoading(true);
    setMessages([]);

    try {
      const systemMessage = `[SİSTEM: Kullanıcı '${currentRoom}' odasına geçti. Konuyu buna göre değiştir ve sert bir giriş sorusu sor.]`;

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: systemMessage,
          sessionId: sessionId.current,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ApiResponse = await response.json();
      const aiResponse = data.response || data.message || 'Üzgünüm, bir yanıt oluşturamadım.';

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages([aiMessage]);
      saveMessages([aiMessage]);
    } catch (error) {
      console.error('Error changing room:', error);

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages([errorMessage]);
      saveMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInitialMessage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '/start',
          sessionId: sessionId.current,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ApiResponse = await response.json();
      const aiResponse = data.response || data.message || 'Üzgünüm, bir yanıt oluşturamadım.';

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages([aiMessage]);
      saveMessages([aiMessage]);
    } catch (error) {
      console.error('Error fetching initial message:', error);

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages([errorMessage]);
      saveMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId: sessionId.current,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ApiResponse = await response.json();
      const aiResponse = data.response || data.message || 'Üzgünüm, bir yanıt oluşturamadım.';

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        sender: 'ai',
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // h-screen yerine h-[100dvh] kullanarak mobil tarayıcı sorununu çözdük
    <div className="flex flex-col h-[100dvh] w-full md:ml-0 bg-gradient-to-b from-black via-gray-950 to-black">
      
      {/* Mesaj Alanı */}
      {/* pt-24: Üst menüden kurtarmak için artırıldı */}
      {/* pb-32: Alt input alanından kurtarmak için artırıldı */}
      <div className="flex-1 overflow-y-auto pt-24 pb-32 px-4 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-gray-600 text-center mt-20"
            >
              <p>Karanlığa hoş geldiniz...</p>
            </motion.div>
          )}

          {messages.map((message, index) => {
            const reportData = message.sender === 'ai' ? parseShadowReport(message.content) : null;

            if (reportData) {
              return <ShadowCard key={message.id} data={reportData} />;
            }

            return <MessageBubble key={message.id} message={message} index={index} />;
          })}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Alanı */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
