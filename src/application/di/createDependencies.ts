import { env } from '@/application/config/env';
import { SecureAuthLocalDataSource } from '@/features/auth/data/datasources/AuthLocalDataSource';
import { ApiAuthRemoteDataSource } from '@/features/auth/data/datasources/AuthRemoteDataSource';
import { UserMapper } from '@/features/auth/data/mappers/UserMapper';
import { AuthRepositoryImpl } from '@/features/auth/data/repositories/AuthRepositoryImpl';
import { GetCurrentSession } from '@/features/auth/domain/use-cases/GetCurrentSession';
import { LoginUser } from '@/features/auth/domain/use-cases/LoginUser';
import { ExpoConnectivity } from '@/shared/http/ExpoConnectivity';
import { FetchHttpClient } from '@/shared/http/FetchHttpClient';
import { ExpoSecureStorage } from '@/shared/storage/ExpoSecureStorage';

import type { Dependencies } from './Dependencies';

export function createDependencies(): Dependencies {
  const httpClient = new FetchHttpClient(env.apiUrl, env.requestTimeoutMs);
  const connectivity = new ExpoConnectivity();
  const secureStorage = new ExpoSecureStorage();
  const remoteDataSource = new ApiAuthRemoteDataSource(
    httpClient,
    connectivity,
  );
  const localDataSource = new SecureAuthLocalDataSource(secureStorage);
  const authRepository = new AuthRepositoryImpl(
    remoteDataSource,
    localDataSource,
    new UserMapper(),
  );

  return {
    loginUser: new LoginUser(authRepository),
    getCurrentSession: new GetCurrentSession(authRepository),
  };
}
