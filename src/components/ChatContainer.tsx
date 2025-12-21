import { useState, useEffect, useRef } from 'react';
import { Message, ApiResponse } from '../types';
import { getSessionId, saveMessages, loadMessages } from '../utils/sessionManager';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { motion } from 'framer-motion';

const N8N_WEBHOOK_URL = 'https://n8n.lolie.com.tr/webhook/61faf25c-aab1-4246-adfe-2caa274fb839';

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    const stored = loadMessages();
    if (stored.length > 0) {
      setMessages(stored as Message[]);
    } else {
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Merhaba. Ben senin gölge benliğinim. Burada, içindeki en derin düşünceleri, bastırılmış duyguları ve karanlık köşeleri keşfetmek için varım. Ne söylemek istiyorsun?',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      saveMessages([welcomeMessage]);
    }
  }, []);

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
    <div className="flex flex-col h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-gray-600 text-center"
            >
              <p>Karanlığa hoş geldiniz...</p>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};
