/**
 * Spacing / radius / typography scales.
 *
 * The Spacing scale follows an 8-pt grid (with a 4-pt half-step) — common
 * for fintech UIs and friendly with native default touch targets.
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const Typography = {
  display: { fontSize: 32, fontWeight: '700' as const },
  title: { fontSize: 24, fontWeight: '700' as const },
  heading: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 1 },
} as const;
