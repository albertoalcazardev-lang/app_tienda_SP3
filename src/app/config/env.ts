import { AppError } from '@/shared/errors/AppError';

export interface AppConfig {
  readonly apiUrl: string;
  readonly requestTimeoutMs: number;
}

function parseApiUrl(value: string | undefined): string {
  const candidate = value?.trim() || 'https://fakestoreapi.com';

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

function parseTimeout(value: string | undefined): number {
  const candidate = Number(value?.trim() || '10000');

  if (!Number.isInteger(candidate) || candidate <= 0) {
    throw new AppError(
      'EXPO_PUBLIC_REQUEST_TIMEOUT_MS debe ser un entero positivo.',
      'CONFIG_ERROR',
    );
  }

  return candidate;
}

export const env: AppConfig = Object.freeze({
  apiUrl: parseApiUrl(process.env.EXPO_PUBLIC_API_URL),
  requestTimeoutMs: parseTimeout(process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS),
});
