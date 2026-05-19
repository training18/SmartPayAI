/**
 * Application configuration.
 *
 * Provides environment-aware settings. On Expo, the debugger host gives us
 * the dev machine's IP, so physical devices can reach the backend without
 * manual setup.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolve the backend API base URL.
 *
 * - iOS simulator / Android emulator: `localhost` works directly.
 * - Physical device: we extract the dev machine IP from Expo's debugger host.
 * - Production: replace with your deployed API URL.
 */
function resolveApiBaseUrl(): string {
  // Allow explicit override via Expo extra config
  const explicitUrl = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
  if (explicitUrl) return explicitUrl;

  const port = 3000;

  if (__DEV__) {
    // Expo provides the dev server host (e.g. "192.168.1.42:8081")
    const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      return `http://${ip}:${port}`;
    }

    // Fallback for simulator
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${port}`; // Android emulator loopback
    }
    return `http://localhost:${port}`;
  }

  // Production — replace with your deployed URL
  return 'https://api.smartpay.ai';
}

export const Config = {
  API_BASE_URL: resolveApiBaseUrl(),
  /** Request timeout in milliseconds. */
  REQUEST_TIMEOUT: 15_000,
} as const;
