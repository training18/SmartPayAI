/**
 * Typed asset references.
 *
 * Static image assets remain in `/assets` (root) because the Expo config
 * plugin paths (icon, splash, adaptiveIcon) resolve from there. Re-export
 * them through this module so feature code never reaches across the
 * project root with relative paths.
 */

export const Images = {
  icon: require('../../assets/images/icon.png'),
  splash: require('../../assets/images/splash-icon.png'),
  reactLogo: require('../../assets/images/react-logo.png'),
} as const;
