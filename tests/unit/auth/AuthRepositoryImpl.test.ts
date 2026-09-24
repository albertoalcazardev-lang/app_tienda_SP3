import type { AuthLocalDataSourceContract } from '@/features/auth/data/datasources/AuthLocalDataSource';
import type { AuthRemoteDataSourceContract } from '@/features/auth/data/datasources/AuthRemoteDataSource';
import { AuthRepositoryImpl } from '@/features/auth/data/repositories/AuthRepositoryImpl';
import { sessionFixture, userDto } from './fixtures';

it('mapea el perfil, asigna rol y persiste la sesión', async () => {
  let saved = null;
  const remote: AuthRemoteDataSourceContract = {
    login: jest.fn().mockResolvedValue({ token: 'jwt-demo', user: userDto }),
  };
  const local: AuthLocalDataSourceContract = {
    saveSession: jest.fn((value) => {
      saved = value;
      return Promise.resolve();
    }),
    getSession: jest.fn(),
    clearSession: jest.fn(),
  };
  const result = await new AuthRepositoryImpl(remote, local).login({
    username: 'auditor_demo',
    password: 'never-store',
  });
  expect(result.user.role).toBe('auditor');
  expect(saved).toEqual(result);
  expect(JSON.stringify(saved)).not.toContain('never-store');
});

it('logout limpia localmente sin endpoint remoto', async () => {
  const remote: AuthRemoteDataSourceContract = { login: jest.fn() };
  const local: AuthLocalDataSourceContract = {
    saveSession: jest.fn(),
    getSession: jest.fn().mockResolvedValue(sessionFixture),
    clearSession: jest.fn().mockResolvedValue(undefined),
  };
  await new AuthRepositoryImpl(remote, local).logout();
  expect(local.clearSession).toHaveBeenCalledTimes(1);
  expect(remote.login).not.toHaveBeenCalled();
});
