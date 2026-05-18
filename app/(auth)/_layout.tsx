/**
 * Auth group layout.
 *
 * Contains only public, unauthenticated screens. The parent root layout
 * controls whether this group is mounted via `Stack.Protected`.
 */

import { Stack } from 'expo-router';

import { baseStackOptions } from '@/src/navigation';

export default function AuthLayout() {
  return <Stack screenOptions={baseStackOptions} />;
}
