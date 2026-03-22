const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:80').replace(/\/$/, '');

const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

export { API_BASE_URL, buildApiUrl };
