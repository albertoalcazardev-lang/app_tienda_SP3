import type { HttpClient, HttpRequestOptions } from './HttpClient';
export interface MutationHttpClient extends HttpClient {
  put<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: HttpRequestOptions,
  ): Promise<TResponse>;
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T>;
}
