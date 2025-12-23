import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- ZOMBİ TEMİZLİĞİ ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Eski Service Worker silindi.');
    }
    // Eğer eski bir SW bulup sildiysek ve bu ilk yükleme değilse, sayfayı yenile
    if (registrations.length > 0 && !sessionStorage.getItem('reloaded')) {
      sessionStorage.setItem('reloaded', 'true');
      window.location.reload();
    }
  });
}

// Önbellekleri temizle
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach((name) => {
      caches.delete(name);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
