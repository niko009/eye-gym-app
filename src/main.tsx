import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource-variable/nunito';
import App from './App.tsx';
import {initializeTelegram} from './platform/telegram.ts';
import './index.css';

initializeTelegram();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
