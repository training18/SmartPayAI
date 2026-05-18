/**
 * Personal tab navigator.
 *
 * Three tabs back the personal experience: Cards (wallet root), Scan (OCR
 * entry-point), and Transactions (recent activity + AI routing visualization).
 *
 * Visual styling is centralized in `src/navigation/screen-options` so the
 * tab bar matches the glass-on-dark aesthetic of every screen.
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { personalTabsOptions } from '@/src/navigation';

export default function PersonalLayout() {
  return (
    <Tabs screenOptions={personalTabsOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
