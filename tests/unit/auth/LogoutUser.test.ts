import type { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';
import { LogoutUser } from '@/features/auth/domain/use-cases/LogoutUser';
import { AppError } from '@/shared/errors/AppError';

function createRepository(logout: jest.Mock): AuthRepository {
  return {
    login: jest.fn(),
    getCurrentSession: jest.fn(),
    logout,
  };
}

describe('LogoutUser', () => {
  it('delega el cierre en el contrato del repositorio', async () => {
    const logout = jest.fn().mockResolvedValue(undefined);
    const useCase = new LogoutUser(createRepository(logout));

    await useCase.execute();

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('finaliza aunque la sesión local ya no exista', async () => {
    const logout = jest.fn().mockResolvedValue(undefined);
    const useCase = new LogoutUser(createRepository(logout));

    await expect(useCase.execute()).resolves.toBeUndefined();
    await expect(useCase.execute()).resolves.toBeUndefined();
    expect(logout).toHaveBeenCalledTimes(2);
  });

  it('propaga el error local tipado para permitir un reintento seguro', async () => {
    const error = new AppError('secure-storage', 'fallo simulado');
    const useCase = new LogoutUser(
      createRepository(jest.fn().mockRejectedValue(error)),
    );

    await expect(useCase.execute()).rejects.toBe(error);
  });
});
