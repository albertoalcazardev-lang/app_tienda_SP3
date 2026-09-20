export interface HttpRequestOptions {
  readonly headers?: Readonly<Record<string, string>>;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
}

export interface HttpClient {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  post<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: HttpRequestOptions,
  ): Promise<TResponse>;
}
