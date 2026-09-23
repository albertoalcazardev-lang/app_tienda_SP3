const DEFAULT_API_URL = 'https://fakestoreapi.com';

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export const env = Object.freeze({
  apiUrl: normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL),
  requestTimeoutMs: 10_000,
});
