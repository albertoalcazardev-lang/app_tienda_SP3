import { AppError } from '@/shared/errors/AppError';
import type { SecureStorage } from '@/shared/storage/SecureStorage';

import type { Session } from '../../domain/entities/Session';
import type { User } from '../../domain/entities/User';

export const AUTH_STORAGE_KEYS = Object.freeze({
  token: 'mercado.session.token',
  user: 'mercado.session.user',
});

export interface AuthLocalDataSourceContract {
  saveSession(session: Session): Promise<void>;
  getSession(): Promise<Session | null>;
  clearSession(): Promise<void>;
}

function isStoredUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'number' &&
    Number.isInteger(user.id) &&
    user.id > 0 &&
    typeof user.username === 'string' &&
    typeof user.email === 'string' &&
    typeof user.displayName === 'string' &&
    (user.role === 'administrator' || user.role === 'auditor' || user.role === 'client')
  );
}

export class AuthLocalDataSource implements AuthLocalDataSourceContract {
  constructor(private readonly storage: SecureStorage) {}

  async saveSession(session: Session): Promise<void> {
    try {
      await this.storage.setItem(AUTH_STORAGE_KEYS.token, session.token);
      await this.storage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(session.user));
    } catch (error: unknown) {
      await this.clearSession().catch(() => undefined);
      throw new AppError(
        'No fue posible guardar la sesión de forma segura.',
        'STORAGE_ERROR',
        error,
      );
    }
  }

  async getSession(): Promise<Session | null> {
    const [token, serializedUser] = await Promise.all([
      this.storage.getItem(AUTH_STORAGE_KEYS.token),
      this.storage.getItem(AUTH_STORAGE_KEYS.user),
    ]);
    if (!token || !serializedUser) return null;

    try {
      const user: unknown = JSON.parse(serializedUser);
      if (!isStoredUser(user)) {
        await this.clearSession();
        return null;
      }
      return { token, user };
    } catch {
      await this.clearSession();
      return null;
    }
  }

  async clearSession(): Promise<void> {
    const results = await Promise.allSettled([
      this.storage.removeItem(AUTH_STORAGE_KEYS.token),
      this.storage.removeItem(AUTH_STORAGE_KEYS.user),
    ]);
    const failure = results.find((result) => result.status === 'rejected');
    if (failure?.status === 'rejected') {
      throw new AppError(
        'No fue posible eliminar completamente la sesión local.',
        'STORAGE_ERROR',
        failure.reason,
      );
    }
  }
}
