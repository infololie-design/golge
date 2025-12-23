export type RoomType = 'yuzlesme' | 'anne_baba' | 'iliskiler' | 'para';

export interface Room {
  id: RoomType;
  name: string;
  icon: string; // İkonu basit string (emoji) olarak tutacağız
}

export const ROOMS: Room[] = [
  { id: 'yuzlesme', name: 'Yüzleşme', icon: '🔥' },
  { id: 'anne_baba', name: 'Anne/Baba Yarası', icon: '💔' },
  { id: 'iliskiler', name: 'İlişkiler', icon: '❤️‍🩹' },
  { id: 'para', name: 'Para', icon: '💰' },
];

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ApiResponse {
  response?: string;
  message?: string;
  reply?: string;
}
