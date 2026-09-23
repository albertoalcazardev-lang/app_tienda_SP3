import {
  ApiAuthRemoteDataSource,
  type AuthRemoteDataSource,
} from '@/features/auth/data/datasources/AuthRemoteDataSource';
import { AppError } from '@/shared/errors/AppError';
import type { Connectivity } from '@/shared/http/Connectivity';
import type {
  HttpClient,
  HttpRequest,
  HttpResponse,
} from '@/shared/http/HttpClient';

import { userDto } from './fixtures';

class FakeHttpClient implements HttpClient {
  readonly requests: HttpRequest[] = [];

  constructor(private readonly results: Array<HttpResponse | Error>) {}

  async request(request: HttpRequest): Promise<HttpResponse> {
    this.requests.push(request);
    const result = this.results.shift();

    if (!result) {
      throw new Error('No hay una respuesta fake configurada.');
    }
    if (result instanceof Error) {
      throw result;
    }

    return result;
  }
}

function createDataSource(
  httpClient: HttpClient,
  online = true,
): AuthRemoteDataSource {
  const connectivity: Connectivity = {
    isOnline: jest.fn().mockResolvedValue(online),
  };
  return new ApiAuthRemoteDataSource(httpClient, connectivity);
}

describe('ApiAuthRemoteDataSource', () => {
  it('envía POST /auth/login y obtiene el usuario autenticado', async () => {
    const httpClient = new FakeHttpClient([
      { status: 200, data: { token: 'jwt-demo' } },
      { status: 200, data: [userDto] },
    ]);
    const dataSource = createDataSource(httpClient);

    await expect(
      dataSource.login({ username: userDto.username, password: 'secret' }),
    ).resolves.toEqual({ token: 'jwt-demo', user: userDto });
    expect(httpClient.requests).toEqual([
      {
        method: 'POST',
        path: '/auth/login',
        body: { username: userDto.username, password: 'secret' },
      },
      { method: 'GET', path: '/users' },
    ]);
  });

  it('convierte 401 en credenciales inválidas', async () => {
    const dataSource = createDataSource(
      new FakeHttpClient([{ status: 401, data: 'incorrect' }]),
    );

    await expect(
      dataSource.login({ username: 'x', password: 'y' }),
    ).rejects.toMatchObject({ code: 'invalid-credentials' });
  });

  it('evita toda solicitud HTTP cuando no hay conexión', async () => {
    const httpClient = new FakeHttpClient([]);
    const dataSource = createDataSource(httpClient, false);

    await expect(
      dataSource.login({ username: 'x', password: 'y' }),
    ).rejects.toMatchObject({ code: 'offline' });
    expect(httpClient.requests).toHaveLength(0);
  });

  it('rechaza respuestas sin token y no consulta usuarios', async () => {
    const httpClient = new FakeHttpClient([{ status: 200, data: {} }]);
    const dataSource = createDataSource(httpClient);

    await expect(
      dataSource.login({ username: 'x', password: 'y' }),
    ).rejects.toMatchObject({ code: 'invalid-response' });
    expect(httpClient.requests).toHaveLength(1);
  });

  it('propaga un timeout controlado', async () => {
    const timeout = new AppError('timeout', 'agotado');
    const dataSource = createDataSource(new FakeHttpClient([timeout]));

    await expect(
      dataSource.login({ username: 'x', password: 'y' }),
    ).rejects.toBe(timeout);
  });
});
