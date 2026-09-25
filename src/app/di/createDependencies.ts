import { env } from '@/app/config/env';
import { AuthLocalDataSource } from '@/features/auth/data/datasources/AuthLocalDataSource';
import { AuthRemoteDataSource } from '@/features/auth/data/datasources/AuthRemoteDataSource';
import { AuthRepositoryImpl } from '@/features/auth/data/repositories/AuthRepositoryImpl';
import { MockAuthRepository } from '@/features/auth/data/repositories/MockAuthRepository';
import { GetCurrentUser } from '@/features/auth/domain/use-cases/GetCurrentUser';
import { LoginUser } from '@/features/auth/domain/use-cases/LoginUser';
import { LogoutUser } from '@/features/auth/domain/use-cases/LogoutUser';
import { CartRemoteDataSource } from '@/features/carts/data/datasources/CartRemoteDataSource';
import { CartRepositoryImpl } from '@/features/carts/data/repositories/CartRepositoryImpl';
import { GetCarts } from '@/features/carts/domain/use-cases/GetCarts';
import { UserRemoteDataSource } from '@/features/users/data/datasources/UserRemoteDataSource';
import { UserRepositoryImpl } from '@/features/users/data/repositories/UserRepositoryImpl';
import { GetUsers } from '@/features/users/domain/use-cases/GetUsers';
import { FetchHttpClient } from '@/shared/http/FetchHttpClient';
import { ExpoSecureStorage } from '@/shared/storage/ExpoSecureStorage';

import type { AppConfig } from '../config/env';
import type { Dependencies } from './Dependencies';

import { createInventoryDependencies } from './createInventoryDependencies';

export function createDependencies(config: AppConfig = env): Dependencies {
  const httpClient = new FetchHttpClient(config.apiUrl);
  const secureStorage = new ExpoSecureStorage();
  const localDataSource = new AuthLocalDataSource(secureStorage);
  const remoteDataSource = new AuthRemoteDataSource(httpClient);
  const authRepository = config.useMocks
    ? new MockAuthRepository(localDataSource)
    : new AuthRepositoryImpl(remoteDataSource, localDataSource);

  const fakeStoreHttpClient = new FetchHttpClient(config.fakeStoreApiUrl);

  const userRemoteDataSource = new UserRemoteDataSource(fakeStoreHttpClient);
  const userRepository = new UserRepositoryImpl(userRemoteDataSource);

  const cartRemoteDataSource = new CartRemoteDataSource(fakeStoreHttpClient);
  const cartRepository = new CartRepositoryImpl(cartRemoteDataSource);

  return Object.freeze({
    inventory: createInventoryDependencies(authRepository),
    loginUser: new LoginUser(authRepository),
    logoutUser: new LogoutUser(authRepository),
    getCurrentUser: new GetCurrentUser(authRepository),
    getUsers: new GetUsers(userRepository),
    getCarts: new GetCarts(cartRepository),
  });
}