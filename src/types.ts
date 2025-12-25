export type RoomType = 'yuzlesme' | 'kokler' | 'iliskiler' | 'para' | 'simya'; // Simya eklendi

export interface Room {
  id: RoomType;
  name: string;
  icon: string;
}

export const ROOMS: Room[] = [
  { id: 'yuzlesme', name: 'Yüzleşme', icon: '🔥' },
  { id: 'kokler', name: 'Kökler', icon: '🌳' },
  { id: 'iliskiler', name: 'İlişkiler', icon: '❤️‍🩹' },
  { id: 'para', name: 'Para', icon: '💰' },
  { id: 'simya', name: 'Simya (Final)', icon: '🏆' }, // Yeni Oda
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
