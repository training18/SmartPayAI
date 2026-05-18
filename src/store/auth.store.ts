/**
 * Auth store — single source of truth for the active session.
 *
 * Architecture note: we deliberately keep this as a thin slice. The
 * heavy lifting (network, persistence) lives in `auth.service` and
 * `storage.service` so the store stays declarative and testable.
 *
 * Persistence is bootstrapped in `app/_layout.tsx` via `hydrate()` which
 * the SessionProvider runs on mount before the splash screen is hidden.
 */

import { create } from 'zustand';

import { STORAGE_KEYS } from '@/src/constants';
import { authService, type SignInPayload } from '@/src/services/auth.service';
import { getItem, setItem } from '@/src/services/storage.service';
import type { AuthSession, UserRole } from '@/src/types';

interface AuthState {
  session: AuthSession | null;
  isHydrating: boolean;
  isSubmitting: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  signIn: (payload: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isHydrating: true,
  isSubmitting: false,
  error: null,

  async hydrate() {
    try {
      const raw = await getItem(STORAGE_KEYS.session);
      set({ session: raw ? (JSON.parse(raw) as AuthSession) : null });
    } catch (e) {
      console.error('[auth] failed to hydrate session', e);
      set({ session: null });
    } finally {
      set({ isHydrating: false });
    }
  },

  async signIn(payload) {
    set({ isSubmitting: true, error: null });
    try {
      const session = await authService.signIn(payload);
      await setItem(STORAGE_KEYS.session, JSON.stringify(session));
      set({ session });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Sign-in failed';
      set({ error: message });
      throw e;
    } finally {
      set({ isSubmitting: false });
    }
  },

  async signOut() {
    try {
      await authService.signOut();
    } finally {
      await setItem(STORAGE_KEYS.session, null);
      set({ session: null });
    }
  },
}));

/** Selector helpers — encourage callers to subscribe to the minimum slice. */
export const selectIsAuthenticated = (s: AuthState) => s.session !== null;
export const selectRole = (s: AuthState): UserRole | null => s.session?.user.role ?? null;
