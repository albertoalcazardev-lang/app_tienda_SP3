import { AppError } from '@/shared/errors/AppError';

import type { SecureStorage } from '@/shared/storage/SecureStorage';
import type { AuthSessionDto } from '../dto/UserDto';
import { isUserDto } from './AuthRemoteDataSource';

const SESSION_KEY = 'auth.session.v1';

export interface AuthLocalDataSourceContract {
  getSession(): Promise<AuthSessionDto | null>;
  saveSession(session: AuthSessionDto): Promise<void>;
  clearSession(): Promise<void>;
}

export class AuthLocalDataSource implements AuthLocalDataSourceContract {
  constructor(private readonly storage: SecureStorage) {}

  async getSession(): Promise<AuthSessionDto | null> {
    const serialized = await this.storage.getItem(SESSION_KEY);
    if (serialized === null) return null;

    try {
      const parsed: unknown = JSON.parse(serialized);
      if (!isAuthSessionDto(parsed)) {
        throw new Error('Unexpected session shape');
      }
      return parsed;
    } catch (error: unknown) {
      throw new AppError('La sesión almacenada no es válida.', 'INVALID_RESPONSE', error);
    }
  }

  saveSession(session: AuthSessionDto): Promise<void> {
    return this.storage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clearSession(): Promise<void> {
    return this.storage.removeItem(SESSION_KEY);
  }
}

function isAuthSessionDto(value: unknown): value is AuthSessionDto {
  return (
    typeof value === 'object' &&
    value !== null &&
    'user' in value &&
    'accessToken' in value &&
    isUserDto(value.user) &&
    typeof value.accessToken === 'string' &&
    value.accessToken.length > 0
  );
}
