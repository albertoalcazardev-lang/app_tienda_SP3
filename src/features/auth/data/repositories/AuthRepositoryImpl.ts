import type { Session } from '../../domain/entities/Session';
import type {
  AuthRepository,
  LoginCredentials,
} from '../../domain/repositories/AuthRepository';
import type { AuthLocalDataSourceContract } from '../datasources/AuthLocalDataSource';
import type { AuthRemoteDataSourceContract } from '../datasources/AuthRemoteDataSource';
import { UserMapper } from '../mappers/UserMapper';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly remote: AuthRemoteDataSourceContract,
    private readonly local: AuthLocalDataSourceContract,
  ) {}

  async login(credentials: LoginCredentials): Promise<Session> {
    const result = await this.remote.login(credentials);
    const session = { token: result.token, user: UserMapper.toDomain(result.user) };
    await this.local.saveSession(session);
    return session;
  }

  getCurrentSession(): Promise<Session | null> {
    return this.local.getSession();
  }

  logout(): Promise<void> {
    // Fake Store API no ofrece logout: US02 elimina solamente la sesión local.
    return this.local.clearSession();
  }
}
