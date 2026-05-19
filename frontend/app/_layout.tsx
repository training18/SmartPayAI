/**
 * Root layout.
 *
 * Responsibilities:
 *   1. Bootstrap the auth session from secure storage before rendering routes.
 *   2. Provide the navigation theme.
 *   3. Gate the three top-level route groups with `Stack.Protected` so the
 *      visible navigator always matches the active role.
 *
 * Architecture note: this layout owns ZERO business logic. All session
 * decisions are derived from the `useAuth` hook which in turn reads the
 * auth store. Swapping the auth backend never requires editing this file.
 */

import { useEffect } from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { Palette } from '@/src/constants';
import { useAuth } from '@/src/hooks/useAuth';
import { useAuthStore } from '@/src/store/auth.store';
import { baseStackOptions } from '@/src/navigation';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already prevented — no-op.
});

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Palette.background,
    card: Palette.surface,
    border: Palette.glassBorder,
    primary: Palette.primary,
    text: Palette.textPrimary,
  },
};

export default function RootLayout() {
  const hydrate = useAuthStore((s: { hydrate: () => Promise<void> }) => s.hydrate);
  const { isHydrating, isAuthenticated, role } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrating) SplashScreen.hideAsync().catch(() => {});
  }, [isHydrating]);

  if (isHydrating) return null;

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={baseStackOptions}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && role === 'personal'}>
          <Stack.Screen name="(personal)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && role === 'merchant'}>
          <Stack.Screen name="(merchant)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
