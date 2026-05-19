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

import { authService } from '@/src/services/auth.service';
import type { AuthSession, LoginPayload, RegisterPayload, UserRole } from '@/src/types';

interface AuthState {
  session: AuthSession | null;
  isHydrating: boolean;
  isSubmitting: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  clearSession: () => void;

  /**
   * Legacy signIn adapter — maps old role-picker calls to the new login flow.
   * @deprecated Use `login` or `register` instead.
   */
  signIn: (payload: LoginPayload) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isHydrating: true,
  isSubmitting: false,
  error: null,

  async hydrate() {
    try {
      const session = await authService.hydrateSession();
      set({ session });
    } catch (e) {
      console.error('[auth] failed to hydrate session', e);
      set({ session: null });
    } finally {
      set({ isHydrating: false });
    }
  },

  async login(payload) {
    set({ isSubmitting: true, error: null });
    try {
      const session = await authService.login(payload);
      set({ session });
    } catch (e: unknown) {
      const message = extractErrorMessage(e, 'Login failed');
      set({ error: message });
      throw e;
    } finally {
      set({ isSubmitting: false });
    }
  },

  async register(payload) {
    set({ isSubmitting: true, error: null });
    try {
      const session = await authService.register(payload);
      set({ session });
    } catch (e: unknown) {
      const message = extractErrorMessage(e, 'Registration failed');
      set({ error: message });
      throw e;
    } finally {
      set({ isSubmitting: false });
    }
  },

  /** Legacy adapter — delegates to login. */
  async signIn(payload: LoginPayload): Promise<void> {
    set({ isSubmitting: true, error: null });
    try {
      const session = await authService.login(payload);
      set({ session });
    } catch (e: unknown) {
      const message = extractErrorMessage(e, 'Login failed');
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
      set({ session: null, error: null });
    }
  },

  /** Called by the API client interceptor on failed refresh. */
  clearSession() {
    set({ session: null, error: null });
  },
}));

// ── Selector helpers ────────────────────────────────────────────────────────

export const selectIsAuthenticated = (s: AuthState) => s.session !== null;
export const selectRole = (s: AuthState): UserRole | null => s.session?.user.role ?? null;

// ── Error extraction ────────────────────────────────────────────────────────

function extractErrorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const axiosError = e as { response?: { data?: { message?: string | string[] } } };
    const msg = axiosError.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}
