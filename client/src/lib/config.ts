// Detecta automaticamente a URL da API baseado no ambiente

const isDev = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL;

// Em desenvolvimento: localhost:5000
// Em produção: pode ser uma URL diferente (Render, Railway, etc)
export const API_BASE_URL = apiUrl || (isDev ? 'http://localhost:5000' : window.location.origin);

console.log('[CONFIG] API_BASE_URL:', API_BASE_URL);

// Helper para fazer fetch com a URL correta
export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
}
