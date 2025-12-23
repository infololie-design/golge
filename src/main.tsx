import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- ZOMBİ SW TEMİZLİĞİ ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 1. Önce var olanları silmeye çalış
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });

    // 2. Bizim "İmha Timi"ni (sw.js) yükle
    // URL'in sonuna rastgele sayı ekliyoruz ki tarayıcı yeni dosya olduğunu anlasın (?v=...)
    navigator.serviceWorker.register('/sw.js?v=' + Date.now()).then((reg) => {
      // Yeni SW yüklendiğinde sayfayı yenile
      reg.onupdatefound = () => {
        const installingWorker = reg.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'activated') {
              window.location.reload();
            }
          };
        }
      };
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
