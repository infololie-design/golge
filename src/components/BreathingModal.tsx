import React, { useState, useEffect } from 'react';
import { X, Wind, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const BreathingModal = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0); // 0: Nefes Al, 1: Tut, 2: Ver
  const [text, setText] = useState("Derin bir nefes al...");

  // 4-7-8 Nefes Tekniği Döngüsü
  useEffect(() => {
    const cycle = () => {
      // 1. Nefes Al (4 saniye)
      setStep(0);
      setText("Burnundan derin bir nefes al... (4 sn)");
      
      setTimeout(() => {
        // 2. Tut (7 saniye)
        setStep(1);
        setText("Nefesini içinde tut... (7 sn)");
        
        setTimeout(() => {
          // 3. Ver (8 saniye)
          setStep(2);
          setText("Ağzından yavaşça ver... (8 sn)");
        }, 7000);

      }, 4000);
    };

    cycle(); // İlk başlatma
    const interval = setInterval(cycle, 19000); // Döngü (4+7+8 = 19sn)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg text-center relative">
        
        {/* Kapat Butonu */}
        <button 
          onClick={onClose}
          className="absolute -top-16 right-0 p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <h2 className="text-2xl font-bold text-blue-400 mb-8 tracking-widest uppercase">Güvenli Alan</h2>

        {/* Nefes Animasyonu */}
        <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
          {/* Dış Halka (Genişleyip Daralan) */}
          <motion.div 
            animate={{
              scale: step === 0 ? 1.5 : (step === 1 ? 1.5 : 1),
              opacity: step === 2 ? 0.5 : 1,
            }}
            transition={{ duration: step === 0 ? 4 : (step === 1 ? 0 : 8), ease: "easeInOut" }}
            className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
          />
          
          {/* İç Daire */}
          <motion.div 
            animate={{
              scale: step === 0 ? 1.2 : (step === 1 ? 1.2 : 0.8),
            }}
            transition={{ duration: step === 0 ? 4 : (step === 1 ? 0 : 8), ease: "easeInOut" }}
            className="w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-900/50 z-10"
          >
            <Wind className="w-12 h-12 text-white" />
          </motion.div>
        </div>

        {/* Yönlendirme Metni */}
        <h3 className="text-xl text-white font-medium mb-4 min-h-[3rem] transition-all duration-500">
          {text}
        </h3>

        <p className="text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">
          Şu an güvendesin. Hiçbir yere yetişmek zorunda değilsin. Sadece bu ana odaklan.
        </p>

        <div className="mt-8 flex justify-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 0 ? 'bg-blue-500' : 'bg-zinc-800'}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? 'bg-blue-500' : 'bg-zinc-800'}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? 'bg-blue-500' : 'bg-zinc-800'}`} />
        </div>

      </div>
    </div>
  );
};
