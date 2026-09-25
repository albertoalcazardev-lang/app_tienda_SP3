import { AppError } from '@/shared/errors/AppError';

import type { HttpClient } from '@/shared/http/HttpClient';
import type { UserDto } from '../dto/UserDto';

export interface UserRemoteDataSourceContract {
  getUsers(): Promise<UserDto[]>;
}

export class UserRemoteDataSource implements UserRemoteDataSourceContract {
  constructor(private readonly httpClient: HttpClient) {}

  async getUsers(): Promise<UserDto[]> {
    const payload = await this.httpClient.get<unknown>('/users');
    if (!isUserDtoArray(payload)) {
      throw new AppError(
        'La respuesta del directorio de usuarios no es válida.',
        'INVALID_RESPONSE',
      );
    }
    return payload;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUserDto(value: unknown): value is UserDto {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.email === 'string' &&
    typeof value.username === 'string' &&
    typeof value.phone === 'string' &&
    isRecord(value.name) &&
    typeof value.name.firstname === 'string' &&
    typeof value.name.lastname === 'string'
  );
}

function isUserDtoArray(value: unknown): value is UserDto[] {
  return Array.isArray(value) && value.every(isUserDto);
}
