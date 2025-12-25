import React from 'react';
import { X, Unlock, Sparkles, ArrowRight } from 'lucide-react';

interface AlchemyUnlockedModalProps {
  onClose: () => void;
  onGoToAlchemy: () => void;
}

export const AlchemyUnlockedModal: React.FC<AlchemyUnlockedModalProps> = ({ onClose, onGoToAlchemy }) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[80] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-amber-950 to-black border border-amber-500/30 w-full max-w-md rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)] relative text-center">
        
        {/* Kapat Butonu */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-amber-500/50 hover:text-amber-500 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 flex flex-col items-center">
          
          {/* İkon Efekti */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 rounded-full"></div>
            <div className="w-20 h-20 bg-amber-900/30 border border-amber-500/50 rounded-full flex items-center justify-center relative z-10">
              <Unlock className="w-10 h-10 text-amber-400" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-200 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold text-amber-400 mb-2 tracking-widest uppercase">KİLİT AÇILDI</h2>
          <h3 className="text-xl font-serif text-white mb-4">Simya Odası Seni Bekliyor</h3>
          
          <p className="text-amber-200/70 text-sm mb-8 leading-relaxed">
            Yüzleşme cesaretini gösterdin ve köklerine indin. Artık gölgeni altına dönüştürme vakti geldi. Büyük Simyacı hazır.
          </p>

          <button 
            onClick={onGoToAlchemy}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/50"
          >
            Simya Odasına Gir
            <ArrowRight className="w-5 h-5" />
          </button>

        </div>
      </div>
    </div>
  );
};
