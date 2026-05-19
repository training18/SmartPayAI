/**
 * Brand color palette extracted from the existing screen designs.
 *
 * Keep additions namespaced (semantic name -> hex). UI components should
 * pull from this module rather than hard-coding hex values so the design
 * system remains coherent.
 */

export const Palette = {
  background: '#0A0E1A',
  surface: '#1d2022',
  surfaceHigh: '#272A2D',
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.1)',
  primary: '#3D5AFE',
  primarySoft: '#BBC3FF',
  secondary: '#05E777',
  secondarySoft: '#7DFFA2',
  textPrimary: '#E0E3E6',
  textSecondary: '#C5C5D9',
  outline: '#444656',
  danger: '#FF5C7A',
} as const;

export type PaletteColor = keyof typeof Palette;
