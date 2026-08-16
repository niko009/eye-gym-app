import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource-variable/nunito';
import App from './App.tsx';
import {initializeTelegram} from './platform/telegram.ts';
import './index.css';

async function bootstrap() {
  await window.__telegramSdkReady;
  initializeTelegram();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
