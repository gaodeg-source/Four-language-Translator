import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { PhoneFrame } from './app/PhoneFrame.tsx';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <PhoneFrame>
    <App />
  </PhoneFrame>
);
