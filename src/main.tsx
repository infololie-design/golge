import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- KILL SWITCH (ÖNBELLEK TEMİZLEYİCİ) ---
// Eğer tarayıcıda kayıtlı bir Service Worker varsa, onu bul ve yok et.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister()
        .then(() => console.log('Eski Service Worker silindi. Site güncelleniyor...'));
    }
  });
  
  // Önbellekleri de temizlemeye çalış
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
