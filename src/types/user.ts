/**
 * User domain types.
 *
 * `UserRole` drives role-based navigation: see `app/_layout.tsx` where
 * `Stack.Protected` guards are evaluated against the active session role.
 */

export type UserRole = 'personal' | 'merchant';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
}
