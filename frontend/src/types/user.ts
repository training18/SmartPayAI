/**
 * User domain types.
 *
 * `UserRole` drives role-based navigation: see `app/_layout.tsx` where
 * `Stack.Protected` guards are evaluated against the active session role.
 *
 * Types are aligned with the backend Prisma `User` model and auth response.
 */

import type { BackendUserRole } from './api';

/** Frontend-friendly role (lowercase). */
export type UserRole = 'personal' | 'merchant';

/** Maps backend enum to frontend lowercase. */
export function mapBackendRole(role: BackendUserRole | string): UserRole {
  return role.toLowerCase() as UserRole;
}

/** User profile as returned by the backend. */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Auth session persisted in secure storage.
 *
 * Holds the JWT token pair + user profile snapshot so the app can
 * bootstrap without a network call on cold start.
 */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** Login request payload. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Registration request payload. */
export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  /** Optional — defaults to `personal` on the backend when omitted. */
  role?: UserRole;
}
