/**
 * Public auth hook.
 *
 * Components should depend on this hook (not the store directly) so that
 * we can later swap the underlying state implementation without touching
 * UI. This also enforces a minimal API surface for screens.
 */

import { useAuthStore } from '@/src/store/auth.store';
import type { AuthSession, LoginPayload, RegisterPayload, UserRole } from '@/src/types';

export function useAuth() {
  const store = useAuthStore();

  const {
    session,
    isHydrating,
    isSubmitting,
    error,
    login,
    register,
    signOut,
  } = store;

  const isAuthenticated = session !== null;
  const role: UserRole | null = session?.user.role ?? null;

  /** @deprecated Use `login` instead. */
  const signIn = login;

  return {
    session,
    role,
    isAuthenticated,
    isHydrating,
    isSubmitting,
    error,
    login,
    register,
    signIn,
    signOut,
  };
}
