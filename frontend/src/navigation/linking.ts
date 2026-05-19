/**
 * Deep-link configuration.
 *
 * Expo Router derives its linking config from the `app/` filesystem, but we
 * still publish the canonical scheme and prefix list here so that:
 *   • feature modules can compose absolute URLs without hard-coding
 *     `smartpayai://`
 *   • integration tests / share-sheet flows have one place to import from
 *
 * Keep this file framework-agnostic — no React Navigation types should leak
 * across this boundary.
 */

export const LINKING_PREFIXES = ['smartpayai://', 'https://smartpay.ai'] as const;

/**
 * Builds an absolute deep-link URL for a given in-app path.
 *
 * @example buildDeepLink('/transactions') -> 'smartpayai:///transactions'
 */
export function buildDeepLink(path: string, prefix: string = LINKING_PREFIXES[0]): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${prefix}${normalized}`;
}
