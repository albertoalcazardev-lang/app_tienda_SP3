import type { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';
import { LoginUser } from '@/features/auth/domain/use-cases/LoginUser';
import { AppError } from '@/shared/errors/AppError';

import { sessionFixture } from './fixtures';

describe('LoginUser', () => {
  it('retorna la sesión y normaliza el usuario', async () => {
    const repository: AuthRepository = {
      login: jest.fn().mockResolvedValue(sessionFixture),
      getCurrentSession: jest.fn().mockResolvedValue(null),
      logout: jest.fn(),
    };
    const useCase = new LoginUser(repository);

    await expect(
      useCase.execute({ username: '  auditor_demo  ', password: 'secret' }),
    ).resolves.toEqual(sessionFixture);
    expect(repository.login).toHaveBeenCalledWith({
      username: 'auditor_demo',
      password: 'secret',
    });
  });

  it('propaga credenciales inválidas sin fabricar una sesión', async () => {
    const error = new AppError('invalid-credentials', 'rechazado');
    const repository: AuthRepository = {
      login: jest.fn().mockRejectedValue(error),
      getCurrentSession: jest.fn().mockResolvedValue(null),
      logout: jest.fn(),
    };

    await expect(
      new LoginUser(repository).execute({
        username: 'incorrecto',
        password: 'incorrecta',
      }),
    ).rejects.toBe(error);
  });

  it('propaga el error de conexión', async () => {
    const error = new AppError('offline', 'sin red');
    const repository: AuthRepository = {
      login: jest.fn().mockRejectedValue(error),
      getCurrentSession: jest.fn().mockResolvedValue(null),
      logout: jest.fn(),
    };

    await expect(
      new LoginUser(repository).execute({ username: 'usuario', password: 'x' }),
    ).rejects.toBe(error);
  });
});
