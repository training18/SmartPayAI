/**
 * Persistent storage keys.
 *
 * Auth-sensitive entries are written through expo-secure-store on native
 * (Keychain / EncryptedSharedPreferences) and through localStorage on web.
 */

export const STORAGE_KEYS = {
  /** Full serialized AuthSession (user + tokens). */
  session: 'smartpay.session.v1',
  /** JWT access token — used by the API client interceptor. */
  accessToken: 'smartpay.access_token.v1',
  /** JWT refresh token — used for silent token renewal. */
  refreshToken: 'smartpay.refresh_token.v1',
} as const;
