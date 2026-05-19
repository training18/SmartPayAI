/**
 * Centralized screen-options factories.
 *
 * Each navigator in `app/` pulls its options from one of these factories so
 * that visual consistency is enforced and theming can be changed in a single
 * file (background, header colors, fade transitions, etc.).
 */

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { Palette } from '@/src/constants';

/** Stack options shared across the root, auth and merchant stacks. */
export const baseStackOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: Palette.background },
  animation: 'fade',
};

/** Stack options for screens presented modally over the wallet. */
export const modalStackOptions: NativeStackNavigationOptions = {
  ...baseStackOptions,
  presentation: 'modal',
  animation: 'slide_from_bottom',
};

/** Bottom-tab options for the personal experience. */
export const personalTabsOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: Palette.surface,
    borderTopColor: Palette.glassBorder,
    borderTopWidth: 1,
    height: 64,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
  tabBarActiveTintColor: Palette.primarySoft,
  tabBarInactiveTintColor: Palette.textSecondary,
};
