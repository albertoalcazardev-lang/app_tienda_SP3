import type { User } from '../../domain/entities/User';
import type {
  AuthRepository,
  LoginCredentials,
} from '../../domain/repositories/AuthRepository';
import type { AuthLocalDataSourceContract } from '../datasources/AuthLocalDataSource';
import type { AuthRemoteDataSourceContract } from '../datasources/AuthRemoteDataSource';
import { UserMapper } from '../mappers/UserMapper';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly remoteDataSource: AuthRemoteDataSourceContract,
    private readonly localDataSource: AuthLocalDataSourceContract,
  ) {}

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await this.remoteDataSource.login(credentials);
    await this.localDataSource.saveSession(response);
    return UserMapper.toDomain(response.user);
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await this.localDataSource.getSession();
    if (session === null) return null;

    const userDto = await this.remoteDataSource.getCurrentUser(session.accessToken);
    await this.localDataSource.saveSession({
      accessToken: session.accessToken,
      user: userDto,
    });
    return UserMapper.toDomain(userDto);
  }

  async logout(): Promise<void> {
    const session = await this.localDataSource.getSession();

    try {
      if (session !== null) {
        await this.remoteDataSource.logout(session.accessToken);
      }
    } finally {
      await this.localDataSource.clearSession();
    }
  }
}
