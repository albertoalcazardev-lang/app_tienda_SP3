import { AppError } from '@/shared/errors/AppError';

import type { HttpRequestOptions } from './HttpClient';
import type { MutationHttpClient } from './MutationHttpClient';

const DEFAULT_TIMEOUT_MS = 10_000;

export class FetchHttpClient implements MutationHttpClient {
  constructor(private readonly baseUrl: string) {}

  get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(path, { method: 'GET' }, options);
  }

  post<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: HttpRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(
      path,
      { method: 'POST', body: JSON.stringify(body) },
      options,
    );
  }

  put<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: HttpRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(
      path,
      { method: 'PUT', body: JSON.stringify(body) },
      options,
    );
  }
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' }, options);
  }
  private async request<T>(
    path: string,
    init: RequestInit,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );

    const abortFromCaller = () => controller.abort();
    options?.signal?.addEventListener('abort', abortFromCaller, { once: true });

    try {
      const response = await fetch(`${this.baseUrl}${normalizePath(path)}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
      });

      const payload: unknown = await readResponseBody(response);
      if (!response.ok) {
        throw new AppError(getHttpErrorMessage(payload, response.status), 'HTTP_ERROR', {
          status: response.status,
          payload,
        });
      }

      // T is intentionally asserted only at the transport boundary. Data sources request
      // `unknown` and perform runtime validation before values enter the domain.
      return payload as T;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (controller.signal.aborted) {
        throw new AppError(
          'La solicitud excedió el tiempo permitido.',
          'NETWORK_ERROR',
          error,
        );
      }
      throw new AppError(
        'No fue posible conectar con el servidor.',
        'NETWORK_ERROR',
        error,
      );
    } finally {
      clearTimeout(timeoutId);
      options?.signal?.removeEventListener('abort', abortFromCaller);
    }
  }
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch (error: unknown) {
    throw new AppError(
      'El servidor devolvió una respuesta no válida.',
      'INVALID_RESPONSE',
      error,
    );
  }
}

function getHttpErrorMessage(payload: unknown, status: number): string {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    typeof payload.message === 'string'
  ) {
    return payload.message;
  }
  return `La solicitud falló con código HTTP ${status}.`;
}
