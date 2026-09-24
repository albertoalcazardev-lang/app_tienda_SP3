export interface HttpRequestOptions {
  readonly headers?: Readonly<Record<string, string>>;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface HttpRequest {
  readonly method: HttpMethod;
  readonly path: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
}

export interface HttpResponse {
  readonly status: number;
  readonly data: unknown;
}

export interface HttpClient {
  request(request: HttpRequest): Promise<HttpResponse>;
  get<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  post<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: HttpRequestOptions,
  ): Promise<TResponse>;
}
