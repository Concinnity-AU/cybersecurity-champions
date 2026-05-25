import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { postHeight } from './lib/iframe';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Initial height ping for embedders, after first paint.
requestAnimationFrame(() => requestAnimationFrame(postHeight));
