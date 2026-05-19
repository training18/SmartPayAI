/**
 * Axios-based API client with JWT auth interceptors.
 *
 * Features:
 * - Auto-attaches Bearer token on every request
 * - Unwraps the backend `{ data, meta }` envelope transparently
 * - Silent token refresh on 401 with request queue to avoid thundering herd
 * - Logs out user when refresh token is also expired
 *
 * Architecture note: the client is a singleton. Services import `apiClient`
 * and call standard axios methods. The interceptor layer is invisible to
 * service code — they receive unwrapped data directly.
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { Config } from '@/src/config';
import { STORAGE_KEYS } from '@/src/constants';
import { getItem, setItem } from './storage.service';

// ── Singleton client ────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach access token ────────────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getItem(STORAGE_KEYS.accessToken);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: unwrap envelope + handle 401 ──────────────────────

/**
 * Tracks whether a token refresh is in-flight so we can queue
 * concurrent 401'd requests instead of firing N refresh calls.
 */
let isRefreshing = false;
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null) {
  for (const entry of failedQueue) {
    if (error) {
      entry.reject(error);
    } else {
      entry.resolve(token!);
    }
  }
  failedQueue = [];
}

/**
 * Force-logout when refresh fails.
 * Clears tokens from storage; the auth store will detect the missing
 * session on next hydration and redirect to the auth screen.
 */
async function forceLogout() {
  await setItem(STORAGE_KEYS.accessToken, null);
  await setItem(STORAGE_KEYS.refreshToken, null);
  await setItem(STORAGE_KEYS.session, null);

  // Dynamic import to avoid circular dependency with auth store
  const { useAuthStore } = await import('@/src/store/auth.store');
  useAuthStore.getState().clearSession();
}

apiClient.interceptors.response.use(
  // ── Success: unwrap the { data, meta } envelope ─────────────────────────
  (response: AxiosResponse) => {
    // The backend wraps in { data, meta }. If the shape matches, unwrap.
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'meta' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },

  // ── Error: handle 401 with silent refresh ───────────────────────────────
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh for 401 errors that haven't been retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry auth endpoints (login, register, refresh)
    const url = originalRequest.url ?? '';
    if (url.includes('/auth/')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another refresh is in-flight — queue this request
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getItem(STORAGE_KEYS.refreshToken);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call refresh endpoint directly (not through intercepted client)
      const { data: refreshResponse } = await axios.post(
        `${Config.API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      // The refresh response is also wrapped in { data, meta }
      const tokens = refreshResponse.data ?? refreshResponse;
      const newAccessToken: string = tokens.accessToken;
      const newRefreshToken: string = tokens.refreshToken;

      // Persist new tokens
      await setItem(STORAGE_KEYS.accessToken, newAccessToken);
      await setItem(STORAGE_KEYS.refreshToken, newRefreshToken);

      // Update session in storage
      const sessionRaw = await getItem(STORAGE_KEYS.session);
      if (sessionRaw) {
        try {
          const session = JSON.parse(sessionRaw);
          session.accessToken = newAccessToken;
          session.refreshToken = newRefreshToken;
          await setItem(STORAGE_KEYS.session, JSON.stringify(session));
        } catch {
          // Session parse failed — will be fixed on next hydration
        }
      }

      // Process queued requests with new token
      processQueue(null, newAccessToken);

      // Retry original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { apiClient };
