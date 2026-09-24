import type { SecureStorage } from '@/shared/storage/SecureStorage';
import { AppError } from '@/shared/errors/AppError';

import type { Session } from '../../domain/entities/Session';
import type { User } from '../../domain/entities/User';

export const AUTH_STORAGE_KEYS = Object.freeze({
  token: 'mercado.session.token',
  user: 'mercado.session.user',
});

export interface AuthLocalDataSource {
  saveSession(session: Session): Promise<void>;
  getSession(): Promise<Session | null>;
  clearSession(): Promise<void>;
}

function isStoredUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const validRole =
    candidate.role === 'administrator' ||
    candidate.role === 'auditor' ||
    candidate.role === 'client';

  return (
    typeof candidate.id === 'number' &&
    Number.isInteger(candidate.id) &&
    candidate.id > 0 &&
    typeof candidate.username === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.displayName === 'string' &&
    validRole
  );
}

export class SecureAuthLocalDataSource implements AuthLocalDataSource {
  constructor(private readonly storage: SecureStorage) {}

  async saveSession(session: Session): Promise<void> {
    try {
      await this.storage.setItem(AUTH_STORAGE_KEYS.token, session.token);
      await this.storage.setItem(
        AUTH_STORAGE_KEYS.user,
        JSON.stringify(session.user),
      );
    } catch (error) {
      await this.clearSession().catch(() => undefined);
      throw new AppError(
        'secure-storage',
        'No fue posible guardar la sesión de forma segura.',
        { cause: error },
      );
    }
  }

  async getSession(): Promise<Session | null> {
    const [token, serializedUser] = await Promise.all([
      this.storage.getItem(AUTH_STORAGE_KEYS.token),
      this.storage.getItem(AUTH_STORAGE_KEYS.user),
    ]);

    if (!token || !serializedUser) {
      return null;
    }

    try {
      const user = JSON.parse(serializedUser) as unknown;

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
    const failure = results.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );

    if (failure) {
      throw new AppError(
        'secure-storage',
        'No fue posible eliminar completamente la sesión local.',
        { cause: failure.reason },
      );
    }
  }
}
