import { LoginUser } from '@/features/auth/domain/use-cases/LoginUser';
import { LogoutUser } from '@/features/auth/domain/use-cases/LogoutUser';
import { AppError } from '@/shared/errors/AppError';

import type { User } from '@/features/auth/domain/entities/User';
import type { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';

const user: User = {
  id: 'user-1',
  email: 'demo@demo.com',
  name: 'Usuario Demo',
};

function createRepository(overrides: Partial<AuthRepository> = {}): AuthRepository {
  return {
    login: async () => user,
    logout: async () => undefined,
    getCurrentUser: async () => null,
    ...overrides,
  };
}

describe('LoginUser', () => {
  it('inicia sesión y normaliza el correo', async () => {
    const login = jest.fn(async () => user);
    const useCase = new LoginUser(createRepository({ login }));

    await expect(
      useCase.execute({ email: '  DEMO@DEMO.COM ', password: 'Demo1234' }),
    ).resolves.toEqual(user);
    expect(login).toHaveBeenCalledWith({
      email: 'demo@demo.com',
      password: 'Demo1234',
    });
  });

  it('propaga el error controlado de credenciales inválidas', async () => {
    const invalidCredentials = new AppError(
      'Credenciales inválidas.',
      'AUTH_INVALID_CREDENTIALS',
    );
    const useCase = new LoginUser(
      createRepository({
        login: jest.fn(async () => Promise.reject(invalidCredentials)),
      }),
    );

    await expect(
      useCase.execute({ email: 'bad@example.com', password: 'incorrecta' }),
    ).rejects.toBe(invalidCredentials);
  });

  it('no oculta errores inesperados del repositorio', async () => {
    const unexpected = new Error('storage unavailable');
    const useCase = new LoginUser(
      createRepository({ login: jest.fn(async () => Promise.reject(unexpected)) }),
    );

    await expect(
      useCase.execute({ email: 'demo@demo.com', password: 'Demo1234' }),
    ).rejects.toBe(unexpected);
  });
});

describe('LogoutUser', () => {
  it('delega el cierre de sesión al contrato del repositorio', async () => {
    const logout = jest.fn(async () => undefined);
    const useCase = new LogoutUser(createRepository({ logout }));

    await useCase.execute();

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
