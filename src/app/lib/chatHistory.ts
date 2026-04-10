import { apiUrl } from './apiBase';

function getAuthUserId(): string {
  return localStorage.getItem('authUserId') || '';
}

export async function saveChatToCloud(chat: any): Promise<void> {
  const userId = getAuthUserId();
  if (!userId || !chat?.id) return;

  await fetch(apiUrl('/api/chat-history'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, chat }),
  });
}

export async function loadChatListFromCloud(): Promise<any[] | null> {
  const userId = getAuthUserId();
  if (!userId) return null;
  const resp = await fetch(apiUrl(`/api/chat-history?userId=${encodeURIComponent(userId)}`));
  if (!resp.ok) return null;
  const data = await resp.json();
  return Array.isArray(data?.chats) ? data.chats : null;
}

export async function loadChatByIdFromCloud(chatId: string): Promise<any | null> {
  const userId = getAuthUserId();
  if (!userId || !chatId) return null;
  const resp = await fetch(apiUrl(`/api/chat-history/${encodeURIComponent(chatId)}?userId=${encodeURIComponent(userId)}`));
  if (!resp.ok) return null;
  const data = await resp.json();
  return data?.chat || null;
}
