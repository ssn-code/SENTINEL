const DEFAULT_API_PORT = '8000';

function getBrowserApiBaseUrl() {
  if (typeof window === 'undefined') {
    return `http://127.0.0.1:${DEFAULT_API_PORT}`;
  }

  const { origin, protocol, hostname, port } = window.location;

  // In Vite dev, always talk directly to the backend on port 8000.
  // `hostname` never contains the port, so checking `hostname.includes(':3000')`
  // misroutes requests when the app is opened via a LAN IP or custom local host.
  if (import.meta.env.DEV || port === '3000' || port === '5173') {
    return `${protocol}//${hostname}:${DEFAULT_API_PORT}`;
  }

  // In production, the reverse proxy exposes the API under `/api`.
  return `${origin}/api`;
}

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || getBrowserApiBaseUrl();

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function fetchApiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), init);
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  if (isJson) {
    const payload = (await response.json()) as T | { detail?: string };

    if (!response.ok) {
      const detail =
        typeof payload === 'object' && payload && 'detail' in payload && typeof payload.detail === 'string'
          ? payload.detail
          : `API request failed with status ${response.status}`;
      throw new Error(detail);
    }

    return payload as T;
  }

  const bodyText = await response.text();
  const firstLine = bodyText.split('\n').map((line) => line.trim()).find(Boolean) || 'Empty response body';

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}: ${firstLine}`);
  }

  throw new Error(`Expected JSON response but received ${contentType || 'unknown content type'}.`);
}
