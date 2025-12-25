import React from 'react';
import { X, Lock, CheckCircle2, Circle } from 'lucide-react';
import { ROOMS } from '../types';

interface LockedModalProps {
  onClose: () => void;
  completedRooms: string[];
}

export const LockedModal: React.FC<LockedModalProps> = ({ onClose, completedRooms }) => {
  // Simya hariç diğer odaları listele
  const requiredRooms = ROOMS.filter(r => r.id !== 'simya');

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative animate-fade-in">
        
        {/* Kapat Butonu */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 text-center">
          {/* Kilit İkonu */}
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
            <Lock className="w-10 h-10 text-zinc-500" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 tracking-widest">KAPI KİLİTLİ</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Simya odası, dönüşümün son aşamasıdır. Oraya girmeden önce diğer odalardaki gölgelerinle yüzleşip görevlerini tamamlamalısın.
          </p>

          {/* İlerleme Listesi */}
          <div className="space-y-3 text-left bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Gereksinimler</h3>
            
            {requiredRooms.map(room => {
              const isDone = completedRooms.includes(room.id);
              return (
                <div key={room.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${isDone ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                      {room.icon}
                    </span>
                    <span className={`text-sm font-medium ${isDone ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {room.name}
                    </span>
                  </div>
                  
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-700" />
                  )}
                </div>
              );
            })}
          </div>

          <button 
            onClick={onClose}
            className="mt-8 w-full py-3 bg-zinc-100 hover:bg-white text-black font-bold rounded-lg transition-colors"
          >
            Yüzleşmeye Devam Et
          </button>

        </div>
      </div>
    </div>
  );
};
