import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import 'assets/css/index.scss';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode> removed to fix YouTube Iframe double-mount issues
  <HelmetProvider>
    <App />
  </HelmetProvider>
  // </React.StrictMode>
);
