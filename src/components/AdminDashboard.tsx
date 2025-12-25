import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, MessageSquare, Activity, X } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalMessages: number;
  activeToday: number;
}

export const AdminDashboard = ({ onClose }: { onClose: () => void }) => {
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalMessages: 0, activeToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 1. Tüm mesaj geçmişini çek (Analiz için)
      // Not: Gerçek projede bu kadar veri çekilmez, "count" kullanılır ama şimdilik MVP için yeterli.
      const { data, error } = await supabase
        .from('chat_history')
        .select('user_id, created_at');

      if (error) throw error;

      if (data) {
        // Benzersiz kullanıcıları say (Set kullanarak)
        const uniqueUsers = new Set(data.map(item => item.user_id)).size;
        
        // Bugün atılan mesajları say
        const today = new Date().toISOString().split('T')[0];
        const activeToday = data.filter(item => item.created_at.startsWith(today)).length;

        setStats({
          totalUsers: uniqueUsers,
          totalMessages: data.length,
          activeToday: activeToday
        });
      }
    } catch (error) {
      console.error('Admin stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-widest">YÖNETİM PANELİ</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-wider">Sistem Durumu & İstatistikler</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-900/20 rounded-full text-zinc-400 hover:text-red-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center text-zinc-500 animate-pulse">Veriler analiz ediliyor...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Kart 1: Kullanıcılar */}
              <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 hover:border-blue-900/50 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-zinc-400 text-sm font-medium uppercase">Toplam Kullanıcı</span>
                </div>
                <p className="text-4xl font-bold text-white">{stats.totalUsers}</p>
              </div>

              {/* Kart 2: Mesajlar */}
              <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 hover:border-purple-900/50 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-900/20 rounded-lg text-purple-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-zinc-400 text-sm font-medium uppercase">Toplam Mesaj</span>
                </div>
                <p className="text-4xl font-bold text-white">{stats.totalMessages}</p>
              </div>

              {/* Kart 3: Bugün */}
              <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 hover:border-green-900/50 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-900/20 rounded-lg text-green-400">
                    <Activity className="w-6 h-6" />
                  </div>
                  <span className="text-zinc-400 text-sm font-medium uppercase">Bugünkü Aktivite</span>
                </div>
                <p className="text-4xl font-bold text-white">{stats.activeToday} <span className="text-sm font-normal text-zinc-500">mesaj</span></p>
              </div>

            </div>
          )}

          {/* Gelecek Özellikler İçin Yer */}
          <div className="mt-12 p-6 border border-dashed border-zinc-800 rounded-xl text-center">
            <p className="text-zinc-600 text-sm">Paket Yönetimi ve İndirim Kodları yakında eklenecek...</p>
          </div>
        </div>
      </div>
    </div>
  );
};
