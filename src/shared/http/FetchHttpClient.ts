import { AppError } from '@/shared/errors/AppError';

import type {
  HttpClient,
  HttpRequest,
  HttpRequestOptions,
  HttpResponse,
} from './HttpClient';

const DEFAULT_TIMEOUT_MS = 10_000;

export class FetchHttpClient implements HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultTimeoutMs = DEFAULT_TIMEOUT_MS,
  ) {}

  async get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    const response = await this.request({ method: 'GET', path, ...options });
    return this.requireSuccess<T>(response);
  }

  async post<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: HttpRequestOptions,
  ): Promise<TResponse> {
    const response = await this.request({
      method: 'POST',
      path,
      body,
      ...options,
    });
    return this.requireSuccess<TResponse>(response);
  }

  async request(request: HttpRequest): Promise<HttpResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      request.timeoutMs ?? this.defaultTimeoutMs,
    );

    const abortFromCaller = () => controller.abort();
    request.signal?.addEventListener('abort', abortFromCaller, { once: true });

    try {
      const response = await fetch(`${this.baseUrl}${normalizePath(request.path)}`, {
        method: request.method,
        headers: {
          Accept: 'application/json',
          ...(request.body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...request.headers,
        },
        body: request.body === undefined ? undefined : JSON.stringify(request.body),
        signal: controller.signal,
      });

      const payload: unknown = await readResponseBody(response);
      return { status: response.status, data: payload };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (controller.signal.aborted) {
        throw new AppError('La solicitud excedió el tiempo permitido.', 'TIMEOUT', error);
      }
      throw new AppError(
        'No fue posible conectar con el servidor.',
        'NETWORK_ERROR',
        error,
      );
    } finally {
      clearTimeout(timeoutId);
      request.signal?.removeEventListener('abort', abortFromCaller);
    }
  }

  private requireSuccess<T>(response: HttpResponse): T {
    if (response.status < 200 || response.status >= 300) {
      throw new AppError(
        getHttpErrorMessage(response.data, response.status),
        'HTTP_ERROR',
        { status: response.status, payload: response.data },
      );
    }

    // T se afirma solo en el límite de transporte. Cada Data Source valida
    // la forma del dato antes de permitir que entre al dominio.
    return response.data as T;
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
