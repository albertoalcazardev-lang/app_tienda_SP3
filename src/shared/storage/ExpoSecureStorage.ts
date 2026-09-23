import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { SecureStorage } from './SecureStorage';

const webMemoryStorage = new Map<string, string>();

export class ExpoSecureStorage implements SecureStorage {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return webMemoryStorage.get(key) ?? null;
    }

    return SecureStore.getItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      webMemoryStorage.set(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      webMemoryStorage.delete(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  }
}
