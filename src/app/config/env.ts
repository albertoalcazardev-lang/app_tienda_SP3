import { AppError } from '@/shared/errors/AppError';

export interface AppConfig {
  readonly apiUrl: string;
  readonly fakeStoreApiUrl: string;
  readonly useMocks: boolean;
}

function parseApiUrl(value: string | undefined): string {
  const candidate = value?.trim() || 'https://api.example.com';

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Unsupported protocol');
    }
    return candidate.replace(/\/$/, '');
  } catch (error: unknown) {
    throw new AppError(
      'EXPO_PUBLIC_API_URL debe ser una URL HTTP o HTTPS válida.',
      'CONFIG_ERROR',
      error,
    );
  }
}

function parseUseMocks(value: string | undefined): boolean {
  if (value === undefined || value.trim() === '') {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;

  throw new AppError('EXPO_PUBLIC_USE_MOCKS debe ser "true" o "false".', 'CONFIG_ERROR');
}

export const env: AppConfig = Object.freeze({
  apiUrl: parseApiUrl(process.env.EXPO_PUBLIC_API_URL),
  fakeStoreApiUrl: parseApiUrl(
    process.env.EXPO_PUBLIC_FAKESTORE_API_URL ?? 'https://fakestoreapi.com',
  ),
  useMocks: parseUseMocks(process.env.EXPO_PUBLIC_USE_MOCKS),
});
