import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- ZORUNLU YENİLEME SİSTEMİ ---
const CURRENT_VERSION = "1.0.5"; // Her güncellemede bu sayıyı değiştir!

// 1. Eski Service Worker'ları temizle
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

// 2. Versiyon kontrolü yap
const storedVersion = localStorage.getItem('app_version');
if (storedVersion !== CURRENT_VERSION) {
  // Versiyon değişmişse önbelleği temizle ve sayfayı yenile
  console.log('Yeni versiyon bulundu! Temizlik yapılıyor...');
  
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
  
  localStorage.setItem('app_version', CURRENT_VERSION);
  // Sonsuz döngüye girmemesi için reload'u bir kez yap
  window.location.reload();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
