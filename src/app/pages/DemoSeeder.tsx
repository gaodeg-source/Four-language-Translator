import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const DEMO_ID = 'demo-chat-001';

const DEMO_CHAT = {
  id: DEMO_ID,
  name: '中文 → 한국어 1',
  lang: 'kr',
  sourceLang: 'cn',
  targetLang: 'kr',
  isPolite: true,
  vibes: ['sweet', 'friendly'],
  personaPrompt: '',
  toneMode: 'formal',
  horrificMode: '',
  background: null,
  voice: '',
  messages: [
    { id: 'm1', input: '你好，今天怎么样？', output: '안녕하세요, 오늘은 어떠세요?', timestamp: Date.now() - 60000 * 10 },
    { id: 'm2', input: '我很好，谢谢！你呢？', output: '저는 잘 지내고 있어요, 감사합니다! 당신은요?', timestamp: Date.now() - 60000 * 8 },
    { id: 'm3', input: '今天天气真的很好', output: '오늘 날씨가 정말 좋네요', timestamp: Date.now() - 60000 * 5 },
    { id: 'm4', input: '我们明天一起去吃饭吧', output: '내일 같이 밥 먹으러 가요', timestamp: Date.now() - 60000 * 2 },
  ],
};

function seed() {
  localStorage.setItem('localPurgeV1Done', '1');
  localStorage.setItem('chatList', JSON.stringify([DEMO_CHAT]));
  localStorage.setItem(`chat_${DEMO_ID}`, JSON.stringify(DEMO_CHAT));
  localStorage.setItem('selectedDirection', JSON.stringify({ sourceLang: 'cn', targetLang: 'kr' }));
}

export function DemoChatSeeder() {
  const navigate = useNavigate();
  useEffect(() => {
    seed();
    navigate(`/chat/${DEMO_ID}`, { replace: true });
  }, [navigate]);
  return null;
}

export function DemoSettingsSeeder() {
  const navigate = useNavigate();
  useEffect(() => {
    seed();
    navigate(`/settings/${DEMO_ID}`, { replace: true });
  }, [navigate]);
  return null;
}
