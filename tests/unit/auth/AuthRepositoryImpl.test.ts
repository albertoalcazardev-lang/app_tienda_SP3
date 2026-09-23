import type { AuthLocalDataSource } from '@/features/auth/data/datasources/AuthLocalDataSource';
import type {
  AuthRemoteDataSource,
  RemoteLoginResult,
} from '@/features/auth/data/datasources/AuthRemoteDataSource';
import { UserMapper } from '@/features/auth/data/mappers/UserMapper';
import { AuthRepositoryImpl } from '@/features/auth/data/repositories/AuthRepositoryImpl';
import type { Session } from '@/features/auth/domain/entities/Session';
import { AppError } from '@/shared/errors/AppError';

import { sessionFixture, userDto } from './fixtures';

class FakeRemoteDataSource implements AuthRemoteDataSource {
  constructor(
    private readonly result: RemoteLoginResult | null,
    private readonly failure?: Error,
  ) {}

  async login(): Promise<RemoteLoginResult> {
    if (this.failure) {
      throw this.failure;
    }
    if (!this.result) {
      throw new Error('Resultado fake ausente.');
    }
    return this.result;
  }
}

class FakeLocalDataSource implements AuthLocalDataSource {
  savedSession: Session | null = null;

  constructor(private readonly restoredSession: Session | null = null) {}

  async saveSession(session: Session): Promise<void> {
    this.savedSession = session;
  }

  async getSession(): Promise<Session | null> {
    return this.restoredSession;
  }

  async clearSession(): Promise<void> {
    this.savedSession = null;
  }
}

describe('AuthRepositoryImpl', () => {
  it('mapea el DTO, asigna el rol y guarda la sesión sin contraseña', async () => {
    const local = new FakeLocalDataSource();
    const repository = new AuthRepositoryImpl(
      new FakeRemoteDataSource({ token: 'jwt-demo', user: userDto }),
      local,
      new UserMapper(),
    );

    const session = await repository.login({
      username: userDto.username,
      password: 'never-store-this',
    });

    expect(session.user.role).toBe('auditor');
    expect(local.savedSession).toEqual(session);
    expect(JSON.stringify(local.savedSession)).not.toContain(
      'never-store-this',
    );
  });

  it('no guarda sesión cuando falla el acceso remoto', async () => {
    const local = new FakeLocalDataSource();
    const repository = new AuthRepositoryImpl(
      new FakeRemoteDataSource(
        null,
        new AppError('invalid-credentials', 'rechazado'),
      ),
      local,
      new UserMapper(),
    );

    await expect(
      repository.login({ username: 'x', password: 'y' }),
    ).rejects.toMatchObject({ code: 'invalid-credentials' });
    expect(local.savedSession).toBeNull();
  });

  it('restaura la sesión persistida', async () => {
    const repository = new AuthRepositoryImpl(
      new FakeRemoteDataSource(null),
      new FakeLocalDataSource(sessionFixture),
      new UserMapper(),
    );

    await expect(repository.getCurrentSession()).resolves.toEqual(
      sessionFixture,
    );
  });
});
