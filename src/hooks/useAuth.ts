/**
 * Public auth hook.
 *
 * Components should depend on this hook (not the store directly) so that
 * we can later swap the underlying state implementation without touching
 * UI. This also enforces a minimal API surface for screens.
 */

import { useAuthStore, selectIsAuthenticated, selectRole } from '@/src/store/auth.store';

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const isSubmitting = useAuthStore((s) => s.isSubmitting);
  const error = useAuthStore((s) => s.error);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const role = useAuthStore(selectRole);

  return { session, role, isAuthenticated, isHydrating, isSubmitting, error, signIn, signOut };
}
