const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function assetUrl(path) {
  if (!path) return '';
  return `${SERVER_ORIGIN}${path}`;
}
