import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Login } from './pages/Login';
import { LanguageSelect } from './pages/LanguageSelect';
import { Setup } from './pages/Setup';
import { Chat } from './pages/Chat';
import { Settings } from './pages/Settings';
import { SetupEN } from './pages/SetupEN';
import { ChatEN } from './pages/ChatEN';
import { SettingsEN } from './pages/SettingsEN';
import { SetupJP } from './pages/SetupJP';
import { ChatJP } from './pages/ChatJP';
import { SettingsJP } from './pages/SettingsJP';
import { Flashcard } from './pages/Flashcard';
import { SystemSettings } from './pages/SystemSettings';
import { Collections } from './pages/Collections';
import { VoiceSelect } from './pages/VoiceSelect';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Toaster } from './components/ui/sonner';
import { Navigate } from 'react-router';

function purgeLegacyLocalDataOnce() {
  const doneKey = 'localPurgeV1Done';
  if (localStorage.getItem(doneKey) === '1') return;

  const keysToRemove = [
    'currentChat',
    'currentChatEN',
    'currentChatJP',
    'chatList',
    'collections',
    'flashcardText',
    'selectedDirection',
    '_pendingVoice',
  ];

  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }

  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith('chat_')) {
      localStorage.removeItem(key);
    }
  }

  localStorage.setItem(doneKey, '1');
}

export default function App() {
  useEffect(() => {
    purgeLegacyLocalDataOnce();
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/select-language" element={<LanguageSelect />} />
          {/* Chinese → Korean */}
          <Route path="/setup" element={<Setup />} />
          <Route path="/chat/:chatId?" element={<Chat />} />
          <Route path="/settings/:chatId" element={<Settings />} />
          {/* Chinese → English */}
          <Route path="/setup-en" element={<SetupEN />} />
          <Route path="/chat-en/:chatId?" element={<ChatEN />} />
          <Route path="/settings-en/:chatId" element={<SettingsEN />} />
          {/* Chinese ↔ Japanese */}
          <Route path="/setup-jp" element={<SetupJP />} />
          <Route path="/chat-jp/:chatId?" element={<ChatJP />} />
          <Route path="/settings-jp/:chatId" element={<SettingsJP />} />
          {/* Shared */}
          <Route path="/flashcard" element={<Flashcard />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/voice-select" element={<VoiceSelect />} />
          <Route path="/system-settings" element={<SystemSettings />} />
          <Route path="/onboarding" element={<Navigate to="/setup" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}