import React from 'react';
import { AlertTriangle, Save, CheckCircle2 } from 'lucide-react';

interface ShadowReport {
  type: string;
  archetype: string;
  analysis: string;
  homework: string[];
}

interface ShadowCardProps {
  data: ShadowReport;
}

export const ShadowCard: React.FC<ShadowCardProps> = ({ data }) => {
  return (
    <div className="w-full max-w-2xl bg-zinc-950 border-l-4 border-red-600 rounded-r-lg shadow-2xl p-6 my-6 animate-fade-in overflow-hidden relative">
      {/* Arka plan efekti */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>

      {/* Başlık */}
      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4 relative z-10">
        <div className="p-2 bg-red-900/20 rounded-lg">
          <AlertTriangle className="text-red-500 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-red-500 tracking-widest uppercase">GÖLGE RAPORU</h2>
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Gizli Benlik Analizi</span>
        </div>
      </div>

      {/* Arketip */}
      <div className="mb-8 relative z-10">
        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Tespit Edilen Arketip</span>
        <h3 className="text-3xl md:text-4xl font-serif text-white leading-tight">{data.archetype}</h3>
      </div>

      {/* Analiz */}
      <div className="mb-8 bg-zinc-900/50 p-5 rounded-lg border border-zinc-800/50 relative z-10">
        <p className="text-zinc-300 italic leading-relaxed text-lg">"{data.analysis}"</p>
      </div>

      {/* Ödevler */}
      <div className="mb-8 relative z-10">
        <h4 className="text-sm font-bold text-zinc-400 mb-4 uppercase flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Yüzleşme Görevleri
        </h4>
        <div className="space-y-3">
          {data.homework.map((task, index) => (
            <div key={index} className="flex items-start gap-4 group p-3 hover:bg-zinc-900/50 rounded-lg transition-colors border border-transparent hover:border-zinc-800">
              <div className="mt-1 min-w-[24px] h-6 flex items-center justify-center bg-zinc-800 rounded-full text-xs text-zinc-400 font-mono group-hover:bg-red-900/30 group-hover:text-red-400 transition-colors">
                {index + 1}
              </div>
              <span className="text-zinc-300 text-sm leading-relaxed group-hover:text-white transition-colors">{task}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buton */}
      <button 
        onClick={() => alert("Rapor şimdilik tarayıcı hafızasına kaydedildi.")}
        className="w-full py-4 bg-gradient-to-r from-red-900/20 to-zinc-900 hover:from-red-900/30 hover:to-zinc-800 text-red-400 border border-red-900/30 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium uppercase tracking-wide group relative z-10"
      >
        <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
        Raporu Arşivle
      </button>
    </div>
  );
};
