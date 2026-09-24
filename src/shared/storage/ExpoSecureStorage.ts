import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { AppError } from '@/shared/errors/AppError';

import type { SecureStorage } from './SecureStorage';

const webMemoryStorage = new Map<string, string>();

export class ExpoSecureStorage implements SecureStorage {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return webMemoryStorage.get(key) ?? null;
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch (error: unknown) {
      throw new AppError('No fue posible leer la sesión segura.', 'STORAGE_ERROR', error);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      webMemoryStorage.set(key, value);
      return;
    }

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
    if (Platform.OS === 'web') {
      webMemoryStorage.delete(key);
      return;
    }

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
