// Safeguard against scripts trying to assign window.fetch when it only has a getter
(function() {
  try {
    if (typeof window !== 'undefined') {
      let currentFetch = window.fetch;
      const desc: PropertyDescriptor = {
        get() {
          return currentFetch;
        },
        set(fn: typeof fetch) {
          currentFetch = fn;
        },
        configurable: true,
        enumerable: true,
      };
      try {
        Object.defineProperty(window, 'fetch', desc);
      } catch {}
      if (typeof Window !== 'undefined' && Window.prototype) {
        try {
          Object.defineProperty(Window.prototype, 'fetch', desc);
        } catch {}
      }
    }
  } catch {}
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
