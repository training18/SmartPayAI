/**
 * Cross-platform secure key/value storage.
 *
 * Native: expo-secure-store (Keychain / EncryptedSharedPreferences).
 * Web:    localStorage (SecureStore is native-only).
 *
 * Following the pattern from https://docs.expo.dev/router/advanced/authentication/
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export async function setItem(key: string, value: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (e) {
      console.error('[storage] localStorage unavailable:', e);
    }
    return;
  }

  if (value === null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch (e) {
      console.error('[storage] localStorage unavailable:', e);
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}
