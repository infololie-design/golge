import { Message } from '../types';

const SESSION_KEY = 'golge_session_id';

export const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

// GÜNCELLEME: Artık oda ismine (roomId) göre kaydediyoruz
export const saveMessages = (messages: Message[], roomId: string = 'yuzlesme') => {
  localStorage.setItem(`golge_messages_${roomId}`, JSON.stringify(messages));
};

// GÜNCELLEME: Artık oda ismine (roomId) göre çekiyoruz
export const loadMessages = (roomId: string = 'yuzlesme'): Message[] => {
  const saved = localStorage.getItem(`golge_messages_${roomId}`);
  if (saved) {
    return JSON.parse(saved).map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  }
  return [];
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  // Tüm odaların mesajlarını temizle
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('golge_messages_')) {
      localStorage.removeItem(key);
    }
  });
};
