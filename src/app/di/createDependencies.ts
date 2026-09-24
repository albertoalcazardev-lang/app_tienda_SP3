import { env } from '@/app/config/env';
import { AuthLocalDataSource } from '@/features/auth/data/datasources/AuthLocalDataSource';
import { AuthRemoteDataSource } from '@/features/auth/data/datasources/AuthRemoteDataSource';
import { AuthRepositoryImpl } from '@/features/auth/data/repositories/AuthRepositoryImpl';
import { GetCurrentSession } from '@/features/auth/domain/use-cases/GetCurrentSession';
import { LoginUser } from '@/features/auth/domain/use-cases/LoginUser';
import { LogoutUser } from '@/features/auth/domain/use-cases/LogoutUser';
import { FetchHttpClient } from '@/shared/http/FetchHttpClient';
import { ExpoConnectivity } from '@/shared/http/ExpoConnectivity';
import { ExpoSecureStorage } from '@/shared/storage/ExpoSecureStorage';

import type { AppConfig } from '../config/env';
import type { Dependencies } from './Dependencies';

export function createDependencies(config: AppConfig = env): Dependencies {
  const httpClient = new FetchHttpClient(config.apiUrl, config.requestTimeoutMs);
  const connectivity = new ExpoConnectivity();
  const secureStorage = new ExpoSecureStorage();
  const localDataSource = new AuthLocalDataSource(secureStorage);
  const remoteDataSource = new AuthRemoteDataSource(httpClient, connectivity);
  const authRepository = new AuthRepositoryImpl(remoteDataSource, localDataSource);

  return Object.freeze({
    loginUser: new LoginUser(authRepository),
    logoutUser: new LogoutUser(authRepository),
    getCurrentSession: new GetCurrentSession(authRepository),
  });
}
