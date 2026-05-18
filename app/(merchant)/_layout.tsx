/**
 * Merchant stack navigator.
 *
 * Single-screen stack for now — additional drill-down screens (payment
 * details, provider settings) will be added as siblings of `index.tsx`.
 */

import { Stack } from 'expo-router';

import { baseStackOptions } from '@/src/navigation';

export default function MerchantLayout() {
  return <Stack screenOptions={baseStackOptions} />;
}
