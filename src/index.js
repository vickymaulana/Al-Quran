import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register service worker with update detection
if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      const swUrl = `/service-worker.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          // eslint-disable-next-line no-console
          console.log('ServiceWorker registration successful with scope: ', registration.scope);

          // Check for updates periodically
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available! Dispatch custom event for UpdateBanner
                  window.dispatchEvent(new Event('sw-update-available'));
                  // eslint-disable-next-line no-console
                  console.log('New service worker available. Update banner shown.');
                }
              });
            }
          });
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('ServiceWorker registration failed:', error);
        });
    });
  } else {
    // In development, ensure any previously registered SW is unregistered
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    }).catch(() => { });
  }
}
