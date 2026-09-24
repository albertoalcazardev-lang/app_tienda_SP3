import { env } from '@/app/config/env';
import { AuthLocalDataSource } from '@/features/auth/data/datasources/AuthLocalDataSource';
import { AuthRemoteDataSource } from '@/features/auth/data/datasources/AuthRemoteDataSource';
import { AuthRepositoryImpl } from '@/features/auth/data/repositories/AuthRepositoryImpl';
import { MockAuthRepository } from '@/features/auth/data/repositories/MockAuthRepository';
import { GetCurrentUser } from '@/features/auth/domain/use-cases/GetCurrentUser';
import { LoginUser } from '@/features/auth/domain/use-cases/LoginUser';
import { LogoutUser } from '@/features/auth/domain/use-cases/LogoutUser';
import { FetchHttpClient } from '@/shared/http/FetchHttpClient';
import { ExpoSecureStorage } from '@/shared/storage/ExpoSecureStorage';

import type { AppConfig } from '../config/env';
import type { Dependencies } from './Dependencies';

export function createDependencies(config: AppConfig = env): Dependencies {
  const httpClient = new FetchHttpClient(config.apiUrl);
  const secureStorage = new ExpoSecureStorage();
  const localDataSource = new AuthLocalDataSource(secureStorage);
  const remoteDataSource = new AuthRemoteDataSource(httpClient);
  const authRepository = config.useMocks
    ? new MockAuthRepository(localDataSource)
    : new AuthRepositoryImpl(remoteDataSource, localDataSource);

  return Object.freeze({
    loginUser: new LoginUser(authRepository),
    logoutUser: new LogoutUser(authRepository),
    getCurrentUser: new GetCurrentUser(authRepository),
  });
}
