import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, AlertCircle, CheckCircle2, User } from 'lucide-react';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // YENİ: Cinsiyet State'i (Varsayılan: Kadın)
  const [gender, setGender] = useState<'male' | 'female'>('female');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // --- GİRİŞ YAP ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // --- KAYIT OL (GÜNCELLENDİ) ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // YENİ: Cinsiyeti kullanıcının kimliğine (metadata) kaydediyoruz
            data: {
              gender: gender 
            }
          }
        });
        if (error) throw error;
        
        setSuccess("Hesabın başarıyla oluşturuldu! Şimdi giriş yapabilirsin.");
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 tracking-widest mb-2">GÖLGE</h1>
            <p className="text-zinc-500 text-sm">
              {isLogin ? 'Zihnin karanlık dehlizlerine dön.' : 'Yüzleşmeye başlamak için kaydol.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-900/50 rounded-lg flex items-start gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">E-Posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-red-900/50 transition-colors"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-red-900/50 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* YENİ: CİNSİYET SEÇİMİ (Sadece Kayıt Olurken Görünür) */}
            {!isLogin && (
              <div className="animate-fade-in">
                <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Cinsiyet (Analiz İçin)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                      gender === 'female' 
                        ? 'bg-red-900/20 border-red-500 text-red-400' 
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Kadın
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                      gender === 'male' 
                        ? 'bg-red-900/20 border-red-500 text-red-400' 
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Erkek
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? 'Giriş Yap' : 'Kayıt Ol'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              {isLogin ? "Hesabın yok mu? Kayıt ol" : "Zaten hesabın var mı? Giriş yap"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
