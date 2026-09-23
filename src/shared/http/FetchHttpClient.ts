import { AppError } from '@/shared/errors/AppError';

import type { HttpClient, HttpRequest, HttpResponse } from './HttpClient';

export class FetchHttpClient implements HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultTimeoutMs: number,
  ) {}

  async request(request: HttpRequest): Promise<HttpResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      request.timeoutMs ?? this.defaultTimeoutMs,
    );

    try {
      const response = await fetch(`${this.baseUrl}${request.path}`, {
        method: request.method,
        headers: {
          Accept: 'application/json',
          ...(request.body === undefined
            ? {}
            : { 'Content-Type': 'application/json' }),
          ...request.headers,
        },
        body:
          request.body === undefined ? undefined : JSON.stringify(request.body),
        signal: controller.signal,
      });

      const rawBody = await response.text();
      let data: unknown = null;

      if (rawBody.length > 0) {
        try {
          data = JSON.parse(rawBody) as unknown;
        } catch {
          data = rawBody;
        }
      }

      return { status: response.status, data };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError(
          'timeout',
          'La solicitud excedió el tiempo límite.',
          {
            cause: error,
          },
        );
      }

      throw new AppError('offline', 'No fue posible contactar al servidor.', {
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
