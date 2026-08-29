// Centralized authenticated API client for GlobalHealth.
// Attaches the session token to every request, normalizes 401/session-expiry
// handling, and never leaks private data on error.

const TOKEN_STORAGE_KEY = 'globalhealth_auth_token';
const SESSION_STORAGE_KEY = 'globalhealth_user_session';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeSession(token: string, user: unknown) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // storage may be unavailable; fail silently
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export class AuthError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  // When false, the request is made without an Authorization header.
  auth?: boolean;
}

// Authenticated fetch. Throws AuthError with friendly messages on 401/403.
export async function apiFetch<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getStoredToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new AuthError(
      'Network connection failed. Please check your internet connection and try again.',
      'NETWORK_ERROR',
      0
    );
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (res.status === 401) {
    const code = data?.code || 'AUTH_REQUIRED';
    const message =
      code === 'SESSION_EXPIRED'
        ? 'Your session has expired. Please sign in again.'
        : 'Please sign in to access this feature.';
    // If the user *was* signed in and the token is now invalid, surface the
    // secure session-expired experience and drop the stale session locally.
    if (auth && getStoredToken()) {
      clearStoredSession();
      try {
        window.dispatchEvent(
          new CustomEvent('globalhealth:unauthorized', { detail: { reason: code === 'SESSION_EXPIRED' ? 'expired' : 'unauthorized' } })
        );
      } catch {
        // ignore
      }
    }
    throw new AuthError(message, code, 401);
  }
  if (res.status === 403) {
    throw new AuthError("You do not have permission to access this information.", 'FORBIDDEN', 403);
  }
  if (res.status === 404) {
    throw new AuthError('This healthcare record could not be found.', 'NOT_FOUND', 404);
  }
  if (!res.ok) {
    throw new AuthError(data?.error || 'Something went wrong. Please try again.', 'ERROR', res.status);
  }
  return data as T;
}
