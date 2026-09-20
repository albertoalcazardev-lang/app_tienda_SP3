import * as SecureStore from 'expo-secure-store';

import { AppError } from '@/shared/errors/AppError';

import type { SecureStorage } from './SecureStorage';

export class ExpoSecureStorage implements SecureStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error: unknown) {
      throw new AppError('No fue posible leer la sesión segura.', 'STORAGE_ERROR', error);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error: unknown) {
      throw new AppError(
        'No fue posible guardar la sesión segura.',
        'STORAGE_ERROR',
        error,
      );
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error: unknown) {
      throw new AppError(
        'No fue posible eliminar la sesión segura.',
        'STORAGE_ERROR',
        error,
      );
    }
  }
}
