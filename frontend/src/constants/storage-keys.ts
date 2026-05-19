/**
 * Persistent storage keys.
 *
 * Auth-sensitive entries are written through expo-secure-store on native
 * (Keychain / EncryptedSharedPreferences) and through localStorage on web.
 */

export const STORAGE_KEYS = {
  session: 'smartpay.session.v1',
} as const;
