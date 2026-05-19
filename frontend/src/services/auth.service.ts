/**
 * Authentication service.
 *
 * Communicates with the backend auth endpoints:
 *   POST /auth/register — create account + auto-provision virtual card
 *   POST /auth/login    — email/password → JWT token pair
 *   POST /auth/refresh  — refresh token → new token pair
 *
 * The store and hooks layer above will not need to change when
 * switching between environments.
 */

import { apiClient } from './api-client';
import { STORAGE_KEYS } from '@/src/constants';
import { getItem, setItem } from './storage.service';
import type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/src/types';
import { mapBackendRole } from '@/src/types/user';

/** Response shape from login/register (after envelope unwrap). */
interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isOnboarded: boolean;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

/** Transform backend auth response to frontend AuthSession. */
function toSession(res: AuthResponse): AuthSession {
  return {
    accessToken: res.accessToken,
    refreshToken: res.refreshToken,
    user: {
      ...res.user,
      role: mapBackendRole(res.user.role),
    },
  };
}

/** Persist tokens and session to secure storage. */
async function persistSession(session: AuthSession): Promise<void> {
  await Promise.all([
    setItem(STORAGE_KEYS.accessToken, session.accessToken),
    setItem(STORAGE_KEYS.refreshToken, session.refreshToken),
    setItem(STORAGE_KEYS.session, JSON.stringify(session)),
  ]);
}

/** Clear all auth data from secure storage. */
async function clearPersistedSession(): Promise<void> {
  await Promise.all([
    setItem(STORAGE_KEYS.accessToken, null),
    setItem(STORAGE_KEYS.refreshToken, null),
    setItem(STORAGE_KEYS.session, null),
  ]);
}

export const authService = {
  /**
   * Register a new user.
   * Backend auto-creates a virtual card for personal accounts.
   */
  async register(payload: RegisterPayload): Promise<AuthSession> {
    // Backend enum is uppercase (PERSONAL / MERCHANT); map from frontend casing.
    const body = {
      ...payload,
      ...(payload.role ? { role: payload.role.toUpperCase() } : {}),
    };
    const { data } = await apiClient.post<AuthResponse>('/auth/register', body);
    const session = toSession(data);
    await persistSession(session);
    return session;
  },

  /**
   * Login with email and password.
   */
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    const session = toSession(data);
    await persistSession(session);
    return session;
  },

  /**
   * Refresh the access token using the stored refresh token.
   * Called automatically by the API client interceptor on 401.
   */
  async refreshTokens(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await getItem(STORAGE_KEYS.refreshToken);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const { data } = await apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    );
    await setItem(STORAGE_KEYS.accessToken, data.accessToken);
    await setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
    return data;
  },

  /**
   * Sign out — clear all persisted auth state.
   */
  async signOut(): Promise<void> {
    await clearPersistedSession();
  },

  /**
   * Hydrate session from secure storage on app cold start.
   */
  async hydrateSession(): Promise<AuthSession | null> {
    const raw = await getItem(STORAGE_KEYS.session);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      await clearPersistedSession();
      return null;
    }
  },
};

/** Re-export for backward compatibility with existing store imports. */
export type SignInPayload = LoginPayload;
