/**
 * Transactions stack — owned by the Activity tab.
 *
 * Wrapping the tab in its own Stack lets us push a detail screen
 * (`/transactions/[id]`) without losing the tab bar context.
 */

import { Stack } from 'expo-router';

import { baseStackOptions } from '@/src/navigation';

export default function TransactionsStackLayout() {
  return <Stack screenOptions={baseStackOptions} />;
}
