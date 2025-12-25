import React, { useEffect, useState } from 'react';
import { X, Calendar, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const JournalModal = ({ onClose, userId }: { onClose: () => void, userId: string }) => {
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      // Kullanıcının mesaj attığı tarihleri çek
      const { data, error } = await supabase
        .from('chat_history')
        .select('created_at')
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        // Tarihleri "YYYY-MM-DD" formatına çevir ve benzersizleri al
        const dates = new Set(data.map(item => item.created_at.split('T')[0]));
        setActiveDates(Array.from(dates));
      }
    } catch (error) {
      console.error('Journal error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Takvim Hesaplamaları
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Pazar
    
    // Pazartesi'den başlatmak için düzenleme (Pazar 0 -> 6, diğerleri -1)
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
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Kapat Butonu */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-white tracking-widest">GÖLGE GÜNLÜĞÜ</h2>
          </div>
          <p className="text-zinc-500 text-sm mb-8">Yüzleşme yolculuğunun takvimi.</p>

          {/* Takvim Header */}
          <div className="flex items-center justify-between mb-6 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:text-red-400 text-zinc-400"><ChevronLeft /></button>
            <span className="font-bold text-lg text-zinc-200">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={() => changeMonth(1)} className="p-1 hover:text-red-400 text-zinc-400"><ChevronRight /></button>
          </div>

          {/* Gün İsimleri */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(day => (
              <div key={day} className="text-xs text-zinc-600 font-medium uppercase">{day}</div>
            ))}
          </div>

          {/* Günler */}
          <div className="grid grid-cols-7 gap-2">
            {/* Boşluklar */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Ayın Günleri */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              // Tarih formatı oluştur: YYYY-MM-DD
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isActive = activeDates.includes(dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div 
                  key={day}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all relative
                    ${isActive 
                      ? 'bg-red-900/20 text-red-400 border border-red-900/50 shadow-[0_0_10px_rgba(220,38,38,0.2)]' 
                      : 'bg-zinc-900/30 text-zinc-600 border border-transparent'}
                    ${isToday ? 'ring-1 ring-white/50' : ''}
                  `}
                >
                  {day}
                  {isActive && (
                    <div className="absolute bottom-1.5 w-1 h-1 bg-red-500 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* İstatistik */}
          <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-zinc-400">
              <Activity className="w-4 h-4" />
              <span>Toplam Aktif Gün:</span>
            </div>
            <span className="text-white font-bold text-lg">{activeDates.length}</span>
          </div>

        </div>
      </div>
    </div>
  );
};
