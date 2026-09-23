import { SecureAuthLocalDataSource } from '@/features/auth/data/datasources/AuthLocalDataSource';
import type { SecureStorage } from '@/shared/storage/SecureStorage';

import { sessionFixture } from './fixtures';

class MemorySecureStorage implements SecureStorage {
  readonly values = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.values.delete(key);
  }
}

describe('SecureAuthLocalDataSource', () => {
  it('guarda token, ID y rol sin almacenar contraseña', async () => {
    const storage = new MemorySecureStorage();
    const dataSource = new SecureAuthLocalDataSource(storage);

    await dataSource.saveSession(sessionFixture);

    expect([...storage.values.values()].join(' ')).toContain(
      sessionFixture.token,
    );
    expect([...storage.values.values()].join(' ')).toContain('auditor');
    expect([...storage.values.values()].join(' ')).not.toContain('password');
    await expect(dataSource.getSession()).resolves.toEqual(sessionFixture);
  });

  it('descarta una sesión persistida incompleta', async () => {
    const storage = new MemorySecureStorage();
    storage.values.set('mercado.session.token', 'jwt');
    storage.values.set('mercado.session.user', '{"id":3}');
    const dataSource = new SecureAuthLocalDataSource(storage);

    await expect(dataSource.getSession()).resolves.toBeNull();
    expect(storage.values.size).toBe(0);
  });
});
