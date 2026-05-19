/**
 * API response types.
 *
 * The backend wraps every successful response in a `{ data, meta }` envelope
 * via the global `TransformInterceptor`. These types model that shape so
 * the API client can unwrap transparently.
 */

/** Standard API success envelope. */
export interface ApiEnvelope<T> {
  data: T;
  meta: {
    timestamp: string;
  };
}

/** Standard API error shape from the backend `AllExceptionsFilter`. */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}

/** Backend user role enum values. */
export type BackendUserRole = 'PERSONAL' | 'MERCHANT';

/** Backend card type enum values. */
export type BackendCardType = 'CREDIT' | 'DEBIT' | 'PREPAID';

/** Backend reward type enum values. */
export type BackendRewardType = 'CASHBACK' | 'POINTS' | 'MILES' | 'DISCOUNT' | 'INSTALLMENT' | 'NONE';

/** Backend transaction status enum values. */
export type BackendTransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED';

/** Backend virtual card status enum values. */
export type BackendVirtualCardStatus = 'ACTIVE' | 'FROZEN' | 'EXPIRED';
