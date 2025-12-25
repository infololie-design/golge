import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- VERSİYON KONTROLÜ VE TEMİZLİK ---
const APP_VERSION = '1.2.0'; // Bunu her büyük güncellemede değiştir

const clearCacheAndStorage = async () => {
  const currentVersion = localStorage.getItem('app_version');

  // Eğer versiyon değişmişse veya hiç yoksa temizlik yap
  if (currentVersion !== APP_VERSION) {
    console.log('Yeni versiyon tespit edildi. Temizlik yapılıyor...');

    // 1. Service Worker'ları Sil
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }

    // 2. Cache Storage'ı Sil
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
    }

    // 3. LocalStorage'ı Temizle (Sadece bizim app ile ilgili olanları)
    // Dikkat: Supabase session'ı (giriş bilgisi) gitmesin diye onu koruyabiliriz
    // Ama en temizi her şeyi silip tekrar giriş yaptırmaktır.
    localStorage.clear();
    sessionStorage.clear();

    // 4. Yeni versiyonu kaydet
    localStorage.setItem('app_version', APP_VERSION);

    // 5. Sayfayı zorla yenile (Sunucudan taze çek)
    window.location.reload();
  }
};

// Uygulama başlarken temizliği kontrol et
clearCacheAndStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
