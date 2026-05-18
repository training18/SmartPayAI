/**
 * Centralized navigation typing.
 *
 * Expo Router auto-generates typed routes (see `app.json` -> `experiments.typedRoutes`).
 * The interfaces below complement those with manual param-list typings for
 * places where we use `useNavigation()` / `useLocalSearchParams` directly.
 */

import type { UserRole } from './user';

/** Top-level route groups. Keep in sync with `app/` directory groups. */
export type RootGroup = '(auth)' | '(personal)' | '(merchant)';

/** Param list for the Personal bottom-tab navigator. */
export interface PersonalTabsParamList extends Record<string, object | undefined> {
  index: undefined;
  scan: undefined;
  transactions: undefined;
}

/** Param list for the Merchant stack. */
export interface MerchantStackParamList extends Record<string, object | undefined> {
  index: undefined;
}

/** Param list for the Auth stack. */
export interface AuthStackParamList extends Record<string, object | undefined> {
  'sign-in': undefined;
}

/** Maps a role to the group that should be reachable post-authentication. */
export const ROLE_TO_GROUP: Record<UserRole, Exclude<RootGroup, '(auth)'>> = {
  personal: '(personal)',
  merchant: '(merchant)',
};
