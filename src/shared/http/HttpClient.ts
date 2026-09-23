export type HttpMethod = 'GET' | 'POST';

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  headers?: Readonly<Record<string, string>>;
  body?: unknown;
  timeoutMs?: number;
}

export interface HttpResponse {
  status: number;
  data: unknown;
}

export interface HttpClient {
  request(request: HttpRequest): Promise<HttpResponse>;
}
