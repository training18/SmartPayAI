/**
 * Centralized route paths.
 *
 * Reference these constants everywhere instead of inlining string paths —
 * a single rename here ripples safely across the codebase.
 */

export const ROUTES = {
  auth: {
    signIn: '/(auth)/sign-in',
  },
  personal: {
    cards: '/(personal)',
    addCard: '/(personal)/add-card',
    editCard: (id: string) => `/(personal)/edit-card?id=${id}` as const,
    transactions: '/(personal)/transactions',
    transactionDetail: (id: string) => `/(personal)/transactions/${id}` as const,
  },
  merchant: {
    dashboard: '/(merchant)',
  },
} as const;

type StaticRouteValues<T> = Extract<T[keyof T], string>;

export type RoutePath =
  | StaticRouteValues<typeof ROUTES.auth>
  | StaticRouteValues<typeof ROUTES.personal>
  | StaticRouteValues<typeof ROUTES.merchant>;
