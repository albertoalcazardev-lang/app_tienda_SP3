import type {
  AuthRepository,
  LoginCredentials,
} from '../../domain/repositories/AuthRepository';
import type { Session } from '../../domain/entities/Session';
import type { AuthLocalDataSource } from '../datasources/AuthLocalDataSource';
import type { AuthRemoteDataSource } from '../datasources/AuthRemoteDataSource';
import { UserMapper } from '../mappers/UserMapper';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly remoteDataSource: AuthRemoteDataSource,
    private readonly localDataSource: AuthLocalDataSource,
    private readonly userMapper: UserMapper,
  ) {}

  async login(credentials: LoginCredentials): Promise<Session> {
    const result = await this.remoteDataSource.login(credentials);
    const session: Session = {
      token: result.token,
      user: this.userMapper.toDomain(result.user),
    };

    await this.localDataSource.saveSession(session);
    return session;
  }

  getCurrentSession(): Promise<Session | null> {
    return this.localDataSource.getSession();
  }

  logout(): Promise<void> {
    // Fake Store API no publica un endpoint de cierre de sesión. La limpieza
    // local es obligatoria y clearSession es segura cuando no existen claves.
    return this.localDataSource.clearSession();
  }
}
