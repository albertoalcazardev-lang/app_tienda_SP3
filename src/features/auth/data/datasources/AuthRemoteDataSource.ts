import { AppError } from '@/shared/errors/AppError';
import type { Connectivity } from '@/shared/http/Connectivity';
import type { HttpClient } from '@/shared/http/HttpClient';

import { isLoginResponseDto, isUserDto } from '../dto/UserDto';
import type { LoginRequestDto, UserDto } from '../dto/UserDto';

export interface RemoteLoginResult {
  readonly token: string;
  readonly user: UserDto;
}
export interface AuthRemoteDataSourceContract {
  login(credentials: LoginRequestDto): Promise<RemoteLoginResult>;
}

export class AuthRemoteDataSource implements AuthRemoteDataSourceContract {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly connectivity: Connectivity,
  ) {}

  async login(credentials: LoginRequestDto): Promise<RemoteLoginResult> {
    const online = await this.connectivity.isOnline().catch(() => false);
    if (!online)
      throw new AppError('El dispositivo no tiene acceso a internet.', 'OFFLINE');

    const login = await this.httpClient.request({
      method: 'POST',
      path: '/auth/login',
      body: credentials,
    });
    if ([400, 401, 403].includes(login.status)) {
      throw new AppError('La API rechazó las credenciales.', 'AUTH_INVALID_CREDENTIALS');
    }
    if (login.status < 200 || login.status >= 300 || !isLoginResponseDto(login.data)) {
      throw new AppError(
        'La respuesta de autenticación no es válida.',
        'INVALID_RESPONSE',
      );
    }

    const users = await this.httpClient.request({ method: 'GET', path: '/users' });
    if (users.status < 200 || users.status >= 300 || !Array.isArray(users.data)) {
      throw new AppError('La lista de usuarios no es válida.', 'INVALID_RESPONSE');
    }
    const user = users.data.find(
      (candidate): candidate is UserDto =>
        isUserDto(candidate) && candidate.username === credentials.username,
    );
    if (!user)
      throw new AppError(
        'No fue posible identificar el perfil autenticado.',
        'INVALID_RESPONSE',
      );
    return { token: login.data.token, user };
  }
}
