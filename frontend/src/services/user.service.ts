/**
 * User profile service.
 *
 * Endpoints:
 *   GET   /users/me       — get current user profile
 *   PATCH /users/me/onboard — mark onboarding complete
 */

import { apiClient } from './api-client';
import type { User } from '@/src/types';
import { mapBackendRole } from '@/src/types/user';

/** Raw backend user response (role is uppercase enum). */
interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt?: string;
}

function mapUser(u: BackendUser): User {
  return { ...u, role: mapBackendRole(u.role) };
}

export const userService = {
  /** Fetch the authenticated user's profile. */
  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<BackendUser>('/users/me');
    return mapUser(data);
  },

  /** Complete user onboarding. */
  async completeOnboarding(): Promise<User> {
    const { data } = await apiClient.patch<BackendUser>('/users/me/onboard');
    return mapUser(data);
  },
};
