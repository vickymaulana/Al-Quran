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

// Register service worker (simple registration for the custom service-worker.js in public)
if ('serviceWorker' in navigator) {
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
}
