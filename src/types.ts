export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ApiResponse {
  response?: string;
  message?: string;
  error?: string;
}
