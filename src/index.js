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

// Register service worker only in production to avoid caching issues during development
if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      const swUrl = `/service-worker.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          // eslint-disable-next-line no-console
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('ServiceWorker registration failed:', error);
        });
    });
  } else {
    // In development, ensure any previously registered SW is unregistered to prevent stale caching
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    }).catch(() => {});
  }
}
