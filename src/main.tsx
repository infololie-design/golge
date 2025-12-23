import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- GÜVENLİ ÖNBELLEK TEMİZLİĞİ ---
const cleanupAndReload = async () => {
  // Eğer bu oturumda zaten temizlik yaptıysak, DUR.
  if (sessionStorage.getItem('cleanup_done') === 'true') {
    return;
  }

  console.log('Temizlik başlıyor...');

  // 1. Service Worker'ları sil
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }

  // 2. Cache'leri sil
  if ('caches' in window) {
    const keys = await caches.keys();
    for (const key of keys) {
      await caches.delete(key);
    }
  }

  // 3. İşaret koy ve yenile
  sessionStorage.setItem('cleanup_done', 'true');
  window.location.reload();
};

// Sadece sayfa ilk yüklendiğinde bir kez kontrol et
window.addEventListener('load', () => {
  // Eğer daha önce temizlenmediyse temizle
  if (!sessionStorage.getItem('cleanup_done')) {
    cleanupAndReload();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
