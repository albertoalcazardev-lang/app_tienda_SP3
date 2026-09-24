import { AppError } from '@/shared/errors/AppError';

import type { User } from '../../domain/entities/User';
import type {
  AuthRepository,
  LoginCredentials,
} from '../../domain/repositories/AuthRepository';
import type { AuthLocalDataSourceContract } from '../datasources/AuthLocalDataSource';
import { UserMapper } from '../mappers/UserMapper';

const DEMO_EMAIL = 'demo@demo.com';
const DEMO_PASSWORD = 'Demo1234';
const MOCK_USER = {
  id: 'demo-user',
  email: DEMO_EMAIL,
  name: 'Usuario Demo',
} as const;

export class MockAuthRepository implements AuthRepository {
  constructor(
    private readonly localDataSource: AuthLocalDataSourceContract,
    private readonly delayMs = 350,
  ) {}

  async login(credentials: LoginCredentials): Promise<User> {
    await delay(this.delayMs);
    const role =
      credentials.email === 'admin@demo.com'
        ? 'admin'
        : credentials.email === 'auditor@demo.com'
          ? 'auditor'
          : 'client';
    if (
      ![DEMO_EMAIL, 'admin@demo.com', 'auditor@demo.com'].includes(credentials.email) ||
      credentials.password !== DEMO_PASSWORD
    ) {
      throw new AppError(
        'Correo o contraseña incorrectos. Usa las credenciales de demostración.',
        'AUTH_INVALID_CREDENTIALS',
      );
    }

    const demoUser: User = {
      ...MOCK_USER,
      id: `demo-${role}`,
      email: credentials.email,
      role,
    };
    await this.localDataSource.saveSession({
      user: demoUser,
      accessToken: 'mock-development-token',
    });
    return UserMapper.toDomain(demoUser);
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await this.localDataSource.getSession();
    return session === null ? null : UserMapper.toDomain(session.user);
  }

  async logout(): Promise<void> {
    await this.localDataSource.clearSession();
  }
}

function delay(milliseconds: number): Promise<void> {
  if (milliseconds <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
