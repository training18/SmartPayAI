/**
 * Virtual card service.
 *
 * Endpoint:
 *   GET /virtual-cards/me — get the user's demo virtual card
 */

import { apiClient } from './api-client';
import type { VirtualCard } from '@/src/types';

export const virtualCardService = {
  /** Get the current user's virtual card (auto-created on registration). */
  async getMyCard(): Promise<VirtualCard | null> {
    try {
      const { data } = await apiClient.get<VirtualCard>('/virtual-cards/me');
      return data;
    } catch {
      // Returns null if no virtual card exists (shouldn't happen after registration)
      return null;
    }
  },
};
