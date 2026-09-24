import {
  AUTH_STORAGE_KEYS,
  AuthLocalDataSource,
} from '@/features/auth/data/datasources/AuthLocalDataSource';
import type { SecureStorage } from '@/shared/storage/SecureStorage';
import { sessionFixture } from './fixtures';

class MemoryStorage implements SecureStorage {
  readonly values = new Map<string, string>();
  readonly removed: string[] = [];
  async getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  async setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  async removeItem(key: string) {
    this.removed.push(key);
    this.values.delete(key);
  }
}

it('guarda la sesión sin contraseña y la restaura', async () => {
  const storage = new MemoryStorage();
  const source = new AuthLocalDataSource(storage);
  await source.saveSession(sessionFixture);
  expect([...storage.values.values()].join(' ')).not.toContain('password');
  await expect(source.getSession()).resolves.toEqual(sessionFixture);
});

it('el cierre elimina solo las claves privadas y es idempotente', async () => {
  const storage = new MemoryStorage();
  storage.values.set(AUTH_STORAGE_KEYS.token, 'jwt');
  storage.values.set(AUTH_STORAGE_KEYS.user, '{}');
  storage.values.set('public', 'ok');
  const source = new AuthLocalDataSource(storage);
  await source.clearSession();
  await source.clearSession();
  expect(storage.removed).toEqual(
    expect.arrayContaining([AUTH_STORAGE_KEYS.token, AUTH_STORAGE_KEYS.user]),
  );
  expect(storage.values.get('public')).toBe('ok');
});
