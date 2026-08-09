const BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Une erreur est survenue');
  return body.data;
}

export const getFloorPrices = () => request('/api/floor-prices');
export const getMarkets = () => request('/api/markets');
export const login = (phone, password) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
