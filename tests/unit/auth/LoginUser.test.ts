import type { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';
import { LoginUser } from '@/features/auth/domain/use-cases/LoginUser';
import { sessionFixture } from './fixtures';

it('normaliza el usuario y devuelve la sesión', async () => {
  const repository: AuthRepository = {
    login: jest.fn().mockResolvedValue(sessionFixture),
    getCurrentSession: jest.fn(),
    logout: jest.fn(),
  };
  await expect(
    new LoginUser(repository).execute({
      username: '  auditor_demo  ',
      password: 'secret',
    }),
  ).resolves.toEqual(sessionFixture);
  expect(repository.login).toHaveBeenCalledWith({
    username: 'auditor_demo',
    password: 'secret',
  });
});
