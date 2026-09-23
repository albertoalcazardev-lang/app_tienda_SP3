import { AppError } from '@/shared/errors/AppError';
import type { Connectivity } from '@/shared/http/Connectivity';
import type { HttpClient } from '@/shared/http/HttpClient';

import type { LoginRequestDto } from '../dto/LoginRequestDto';
import { parseLoginResponse } from '../dto/LoginResponseDto';
import { isUserDto, type UserDto } from '../dto/UserDto';

export interface RemoteLoginResult {
  readonly token: string;
  readonly user: UserDto;
}

export interface AuthRemoteDataSource {
  login(credentials: LoginRequestDto): Promise<RemoteLoginResult>;
}

export class ApiAuthRemoteDataSource implements AuthRemoteDataSource {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly connectivity: Connectivity,
  ) {}

  async login(credentials: LoginRequestDto): Promise<RemoteLoginResult> {
    const isOnline = await this.connectivity.isOnline().catch(() => false);

    if (!isOnline) {
      throw new AppError(
        'offline',
        'El dispositivo no tiene acceso a internet.',
      );
    }

    const loginResponse = await this.httpClient.request({
      method: 'POST',
      path: '/auth/login',
      body: credentials,
    });

    if ([400, 401, 403].includes(loginResponse.status)) {
      throw new AppError(
        'invalid-credentials',
        'La API rechazó las credenciales.',
      );
    }

    if (loginResponse.status < 200 || loginResponse.status >= 300) {
      throw new AppError(
        'unexpected',
        `La autenticación falló con estado ${loginResponse.status}.`,
      );
    }

    const { token } = parseLoginResponse(loginResponse.data);
    const usersResponse = await this.httpClient.request({
      method: 'GET',
      path: '/users',
    });

    if (usersResponse.status < 200 || usersResponse.status >= 300) {
      throw new AppError(
        'unexpected',
        `No fue posible identificar al usuario: ${usersResponse.status}.`,
      );
    }

    if (!Array.isArray(usersResponse.data)) {
      throw new AppError(
        'invalid-response',
        'La lista de usuarios no es válida.',
      );
    }

    const user = usersResponse.data.find(
      (candidate): candidate is UserDto =>
        isUserDto(candidate) && candidate.username === credentials.username,
    );

    if (!user) {
      throw new AppError(
        'invalid-response',
        'La API autenticó al usuario, pero no proporcionó un perfil identificable.',
      );
    }

    return { token, user };
  }
}
