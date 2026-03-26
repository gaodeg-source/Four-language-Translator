const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
