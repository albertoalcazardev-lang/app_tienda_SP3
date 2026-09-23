import type { User } from '../../domain/entities/User';
import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { UserRemoteDataSourceContract } from '../datasources/UserRemoteDataSource';
import { UserMapper } from '../mappers/UserMapper';

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly remoteDataSource: UserRemoteDataSourceContract) {}

  async getUsers(): Promise<User[]> {
    const dtos = await this.remoteDataSource.getUsers();
    return dtos.map(UserMapper.toDomain);
  }
}