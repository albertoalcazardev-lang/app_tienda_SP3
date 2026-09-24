import { AuthRemoteDataSource } from '@/features/auth/data/datasources/AuthRemoteDataSource';
import { AuthRepositoryImpl } from '@/features/auth/data/repositories/AuthRepositoryImpl';
import { AppError } from '@/shared/errors/AppError';

import type { AuthLocalDataSourceContract } from '@/features/auth/data/datasources/AuthLocalDataSource';
import type { AuthRemoteDataSourceContract } from '@/features/auth/data/datasources/AuthRemoteDataSource';
import type { AuthSessionDto, UserDto } from '@/features/auth/data/dto/UserDto';
import type { HttpClient } from '@/shared/http/HttpClient';

const userDto: UserDto = {
  id: 'user-1',
  email: 'demo@demo.com',
  name: 'Usuario Demo',
};

const session: AuthSessionDto = {
  accessToken: 'token-123',
  user: userDto,
};

function createRemote(
  overrides: Partial<AuthRemoteDataSourceContract> = {},
): AuthRemoteDataSourceContract {
  return {
    login: async () => session,
    getCurrentUser: async () => userDto,
    logout: async () => undefined,
    ...overrides,
  };
}

function createLocal(
  overrides: Partial<AuthLocalDataSourceContract> = {},
): AuthLocalDataSourceContract {
  return {
    getSession: async () => null,
    saveSession: async () => undefined,
    clearSession: async () => undefined,
    ...overrides,
  };
}

describe('AuthRepositoryImpl', () => {
  it('convierte UserDto a User y persiste la sesión al iniciar', async () => {
    const saveSession = jest.fn(async () => undefined);
    const repository = new AuthRepositoryImpl(
      createRemote(),
      createLocal({ saveSession }),
    );

    await expect(
      repository.login({ email: 'demo@demo.com', password: 'Demo1234' }),
    ).resolves.toEqual(userDto);
    expect(saveSession).toHaveBeenCalledWith(session);
  });

  it('elimina la sesión local después de cerrar la sesión remota', async () => {
    const remoteLogout = jest.fn(async () => undefined);
    const clearSession = jest.fn(async () => undefined);
    const repository = new AuthRepositoryImpl(
      createRemote({ logout: remoteLogout }),
      createLocal({ getSession: async () => session, clearSession }),
    );

    await repository.logout();

    expect(remoteLogout).toHaveBeenCalledWith('token-123');
    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  it('elimina la sesión local incluso si falla el cierre remoto', async () => {
    const remoteError = new AppError('Servidor no disponible.', 'NETWORK_ERROR');
    const clearSession = jest.fn(async () => undefined);
    const repository = new AuthRepositoryImpl(
      createRemote({ logout: jest.fn(async () => Promise.reject(remoteError)) }),
      createLocal({ getSession: async () => session, clearSession }),
    );

    await expect(repository.logout()).rejects.toBe(remoteError);
    expect(clearSession).toHaveBeenCalledTimes(1);
  });
});

describe('AuthRemoteDataSource', () => {
  it('rechaza una respuesta HTTP con forma inválida', async () => {
    const invalidPayload: unknown = { user: { id: 'missing-fields' } };
    const httpClient: HttpClient = {
      async get<T>() {
        return invalidPayload as T;
      },
      async post<TResponse>() {
        return invalidPayload as TResponse;
      },
    };
    const dataSource = new AuthRemoteDataSource(httpClient);

    await expect(
      dataSource.login({ email: 'demo@demo.com', password: 'Demo1234' }),
    ).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });
});
