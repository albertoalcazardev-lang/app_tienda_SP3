import { AppError } from '@/shared/errors/AppError';

import type { HttpClient } from '@/shared/http/HttpClient';
import type { LoginRequestDto, LoginResponseDto, UserDto } from '../dto/UserDto';

export interface AuthRemoteDataSourceContract {
  login(credentials: LoginRequestDto): Promise<LoginResponseDto>;
  getCurrentUser(accessToken: string): Promise<UserDto>;
  logout(accessToken: string): Promise<void>;
}

export class AuthRemoteDataSource implements AuthRemoteDataSourceContract {
  constructor(private readonly httpClient: HttpClient) {}

  async login(credentials: LoginRequestDto): Promise<LoginResponseDto> {
    const payload = await this.httpClient.post<unknown, LoginRequestDto>(
      '/auth/login',
      credentials,
    );
    if (!isLoginResponseDto(payload)) {
      throw new AppError(
        'La respuesta de inicio de sesión no es válida.',
        'INVALID_RESPONSE',
      );
    }
    return payload;
  }

  async getCurrentUser(accessToken: string): Promise<UserDto> {
    const payload = await this.httpClient.get<unknown>('/auth/me', {
      headers: authorizationHeader(accessToken),
    });
    if (!isUserDto(payload)) {
      throw new AppError('La respuesta del perfil no es válida.', 'INVALID_RESPONSE');
    }
    return payload;
  }

  async logout(accessToken: string): Promise<void> {
    await this.httpClient.post<unknown, Readonly<Record<string, never>>>(
      '/auth/logout',
      {},
      { headers: authorizationHeader(accessToken) },
    );
  }
}

function authorizationHeader(accessToken: string): Readonly<Record<string, string>> {
  return { Authorization: `Bearer ${accessToken}` };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isUserDto(value: unknown): value is UserDto {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.email === 'string' &&
    typeof value.name === 'string'
  );
}

function isLoginResponseDto(value: unknown): value is LoginResponseDto {
  return (
    isRecord(value) &&
    isUserDto(value.user) &&
    typeof value.accessToken === 'string' &&
    value.accessToken.length > 0
  );
}
