/**
 * Scan stack — owned by the Scan tab.
 *
 * Wrapping the tab in its own Stack lets us push a sibling "Enter details
 * manually" form (`/scan/manual`) without losing the tab bar context.
 */

import { Stack } from 'expo-router';

import { baseStackOptions } from '@/src/navigation';

export default function ScanStackLayout() {
  return <Stack screenOptions={baseStackOptions} />;
}
