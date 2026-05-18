/**
 * Authentication service.
 *
 * Boundary between the UI/store and the (future) backend. The mock impl
 * below returns a deterministic session — swap the body of `signIn` /
 * `signOut` with real network calls when the API is ready; the store and
 * hooks layer above will not need to change.
 */

import type { AuthSession, UserRole } from '@/src/types';

export interface SignInPayload {
  email: string;
  role: UserRole;
}

export const authService = {
  async signIn({ email, role }: SignInPayload): Promise<AuthSession> {
    // TODO: replace with real API call.
    await new Promise((r) => setTimeout(r, 300));
    return {
      token: `mock-token-${Date.now()}`,
      user: {
        id: `user-${role}`,
        email,
        fullName: role === 'merchant' ? 'Acme Merchant' : 'Alexander W.',
        role,
        createdAt: new Date().toISOString(),
      },
    };
  },

  async signOut(): Promise<void> {
    await new Promise((r) => setTimeout(r, 150));
  },
};
