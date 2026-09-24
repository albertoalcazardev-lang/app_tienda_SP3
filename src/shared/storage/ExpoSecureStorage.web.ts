import { AppError } from '@/shared/errors/AppError';
import type { SecureStorage } from './SecureStorage';

// SecureStore solo existe en iOS/Android. En web la demo dura esta pestaña.
export class ExpoSecureStorage implements SecureStorage {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch (error: unknown) {
      throw new AppError('No fue posible leer la sesión.', 'STORAGE_ERROR', error);
    }
  }
  async setItem(key: string, value: string): Promise<void> {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error: unknown) {
      throw new AppError('No fue posible guardar la sesión.', 'STORAGE_ERROR', error);
    }
  }
  async removeItem(key: string): Promise<void> {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error: unknown) {
      throw new AppError('No fue posible cerrar la sesión.', 'STORAGE_ERROR', error);
    }
  }
}
