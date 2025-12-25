import React, { useEffect, useState } from 'react';
import { X, Calendar, Activity, ChevronLeft, ChevronRight, MessageSquare, Map, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ROOMS } from '../types';

interface DayStats {
  messageCount: number;
  roomsVisited: string[];
  userMessageCount: number;
}

export const JournalModal = ({ onClose, userId }: { onClose: () => void, userId: string }) => {
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // YENİ STATE'LER: Seçilen gün ve detayları
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayStats, setDayStats] = useState<DayStats | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchActivity();
  }, []);

  // 1. Sadece tarihleri çek (Takvimi boyamak için)
  const fetchActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('created_at')
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        const dates = new Set(data.map(item => item.created_at.split('T')[0]));
        setActiveDates(Array.from(dates));
        
        // Bugünün tarihini otomatik seç
        const today = new Date().toISOString().split('T')[0];
        if (dates.has(today)) {
          handleDateClick(today);
        }
      }
    } catch (error) {
      console.error('Journal error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Bir güne tıklayınca detayları çek
  const handleDateClick = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setLoadingDetails(true);
    setDayStats(null);

    try {
      // O günün başlangıcı ve bitişi
      const startOfDay = `${dateStr}T00:00:00.000Z`;
      const endOfDay = `${dateStr}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from('chat_history')
        .select('room, role')
        .eq('user_id', userId)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      if (error) throw error;

      if (data) {
        // İstatistikleri hesapla
        const uniqueRooms = Array.from(new Set(data.map(item => item.room)));
        const userMsgs = data.filter(item => item.role === 'user').length;

        setDayStats({
          messageCount: data.length,
          roomsVisited: uniqueRooms,
          userMessageCount: userMsgs
        });
      }
    } catch (error) {
      console.error('Details error:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Yardımcı: Oda isminden İkon bulma
  const getRoomIcon = (roomId: string) => {
    const room = ROOMS.find(r => r.id === roomId);
    return room ? room.icon : '❓';
  };

  const getRoomName = (roomId: string) => {
    const room = ROOMS.find(r => r.id === roomId);
    return room ? room.name : roomId;
  };

  // Takvim Hesaplamaları
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-white tracking-widest">GÖLGE GÜNLÜĞÜ</h2>
          </div>
          <p className="text-zinc-500 text-sm mb-6">Yüzleşme yolculuğunun izleri.</p>

          {/* --- TAKVİM --- */}
          <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => changeMonth(-1)} className="p-1 hover:text-red-400 text-zinc-400"><ChevronLeft /></button>
              <span className="font-bold text-zinc-200">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button onClick={() => changeMonth(1)} className="p-1 hover:text-red-400 text-zinc-400"><ChevronRight /></button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
              {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(day => (
                <div key={day} className="text-[10px] text-zinc-600 font-medium uppercase">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startingDay }).map((_, i) => <div key={`empty-${i}`} />)}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isActive = activeDates.includes(dateStr);
                const isSelected = selectedDate === dateStr;

                return (
                  <button 
                    key={day}
                    onClick={() => handleDateClick(dateStr)}
                    disabled={!isActive} // Sadece aktif günler tıklanabilir
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all relative
                      ${isActive 
                        ? 'text-zinc-200 hover:bg-zinc-800 cursor-pointer' 
                        : 'text-zinc-700 cursor-default'}
                      ${isSelected ? 'bg-red-900/30 border border-red-500/50 text-red-400' : ''}
                    `}
                  >
                    {day}
                    {isActive && !isSelected && (
                      <div className="w-1 h-1 bg-red-500 rounded-full mt-1"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* --- GÜN DETAYI (ALT PANEL) --- */}
          {selectedDate && (
            <div className="animate-fade-in border-t border-zinc-800 pt-6">
              <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {selectedDate.split('-').reverse().join('.')} Özeti
              </h3>

              {loadingDetails ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                </div>
              ) : dayStats ? (
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* İstatistik Kutusu */}
                  <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">Etkileşim</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{dayStats.messageCount}</div>
                    <div className="text-xs text-zinc-600 mt-1">{dayStats.userMessageCount} tanesi senin mesajın</div>
                  </div>

                  {/* Odalar Kutusu */}
                  <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                      <Map className="w-4 h-4" />
                      <span className="text-xs">Gezilen Odalar</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dayStats.roomsVisited.map(room => (
                        <span key={room} className="text-xl" title={getRoomName(room)}>
                          {getRoomIcon(room)}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <p className="text-zinc-600 text-sm">Bu tarihte veri bulunamadı.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
