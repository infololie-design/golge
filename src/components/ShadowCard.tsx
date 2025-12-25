import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, PenLine } from 'lucide-react';

interface ShadowReport {
  type: string;
  archetype: string;
  analysis: string;
  homework: string[];
}

interface ShadowCardProps {
  data: ShadowReport;
  onComplete?: (feedback: string) => void;
  isCompleted?: boolean; // YENİ: Dışarıdan gelen tamamlandı bilgisi
}

export const ShadowCard: React.FC<ShadowCardProps> = ({ data, onComplete, isCompleted = false }) => {
  const [tasks, setTasks] = useState(
    data.homework.map(task => ({ text: task, completed: false, note: '' }))
  );
  const [isSubmitted, setIsSubmitted] = useState(isCompleted);

  // Eğer dışarıdan "Tamamlandı" bilgisi gelirse (Sayfa yenilenince), state'i güncelle
  useEffect(() => {
    if (isCompleted) {
      setIsSubmitted(true);
      // Görsel olarak da hepsini yapılmış gibi gösterelim (Opsiyonel)
      setTasks(prev => prev.map(t => ({ ...t, completed: true })));
    }
  }, [isCompleted]);

  const toggleTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const updateNote = (index: number, note: string) => {
    const newTasks = [...tasks];
    newTasks[index].note = note;
    setTasks(newTasks);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (onComplete) {
      const summary = tasks.map((t, i) => 
        `Görev ${i+1}: ${t.completed ? 'YAPILDI' : 'YAPILMADI'} - Not: ${t.note}`
      ).join('\n');
      
      onComplete(summary);
    }
  };

  return (
    <div className={`w-full max-w-2xl border-l-4 rounded-r-lg shadow-2xl p-6 my-6 animate-fade-in overflow-hidden relative transition-colors ${isSubmitted ? 'bg-zinc-900/50 border-green-600' : 'bg-zinc-950 border-red-600'}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>

      {/* Başlık */}
      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4 relative z-10">
        <div className={`p-2 rounded-lg ${isSubmitted ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
          {isSubmitted ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : <AlertTriangle className="text-red-500 w-6 h-6" />}
        </div>
        <div>
          <h2 className={`text-xl font-bold tracking-widest uppercase ${isSubmitted ? 'text-green-500' : 'text-red-500'}`}>
            {isSubmitted ? 'TAMAMLANMIŞ RAPOR' : 'GÖLGE RAPORU'}
          </h2>
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Gizli Benlik Analizi</span>
        </div>
      </div>

      {/* Arketip & Analiz */}
      <div className="mb-8 relative z-10">
        <h3 className="text-3xl font-serif text-white mb-4">{data.archetype}</h3>
        <div className="bg-zinc-900/50 p-5 rounded-lg border border-zinc-800/50">
          <p className="text-zinc-300 italic leading-relaxed">"{data.analysis}"</p>
        </div>
      </div>

      {/* Görev Listesi */}
      <div className="mb-8 relative z-10">
        <h4 className="text-sm font-bold text-zinc-400 mb-4 uppercase flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Yüzleşme Görevleri
        </h4>
        
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={index} className={`p-4 rounded-lg border transition-all ${task.completed || isSubmitted ? 'bg-green-900/10 border-green-900/30' : 'bg-zinc-900/30 border-zinc-800'}`}>
              <div className="flex items-start gap-3 cursor-pointer" onClick={() => !isSubmitted && toggleTask(index)}>
                <div className={`mt-1 min-w-[20px] h-5 rounded border flex items-center justify-center transition-colors ${task.completed || isSubmitted ? 'bg-green-600 border-green-600' : 'border-zinc-600'}`}>
                  {(task.completed || isSubmitted) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className={`text-sm leading-relaxed ${(task.completed || isSubmitted) ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
                  {task.text}
                </span>
              </div>

              {/* Yorum Kutusu (Sadece aktifken göster) */}
              {!isSubmitted && (
                <div className="mt-3 ml-8">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                    <PenLine className="w-3 h-3" />
                    <span>Deneyim Notu:</span>
                  </div>
                  <textarea
                    value={task.note}
                    onChange={(e) => updateNote(index, e.target.value)}
                    placeholder="Bunu yaparken ne hissettin? Zorlandın mı?"
                    className="w-full bg-black/20 text-zinc-300 text-sm p-2 rounded border border-zinc-800 focus:border-red-900/50 focus:outline-none resize-none h-16"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Aksiyon Butonu */}
      {!isSubmitted ? (
        <button 
          onClick={handleSubmit}
          className="w-full py-4 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-bold uppercase tracking-wide shadow-lg shadow-red-900/20"
        >
          Gelişimi Kaydet ve Dönüşümü Başlat
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="text-center p-3 bg-green-900/20 text-green-400 rounded border border-green-900/30 text-sm font-medium">
          ✓ Bu aşama tamamlandı. Dönüşüm başladı.
        </div>
      )}
    </div>
  );
};
