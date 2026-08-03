/**
 * Authentication Service
 * 
 * Manages the auth token in browser sessionStorage.
 * - Saves the token on successful login
 * - Provides the token for every outgoing API request via apiClient
 * - Redirects to the login page if no token is found in the session
 * 
 * Also provides centralised HTTP helper methods (post, get) so callers
 * only need to pass the controller/action path, e.g. "scans/CreateScan",
 * instead of the full URL. The base URL is read from VITE_API_BASE_URL.
 */

import { apiClient } from '../api/client';

import { User } from '../types';

const TOKEN_KEY = 'session_auth_token';
const USER_KEY = 'session_user_profile';
const DEFAULT_TENANT_ID = '98ef6dfe-e0d8-4aee-913f-18908c52eeaf';

// ──────────────────────────── Token Management ────────────────────────────

/**
 * Save token to sessionStorage and sync it with apiClient.
 */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }
  apiClient.setToken(token);
}

/**
 * Retrieve the current token from sessionStorage.
 * Returns null if not present.
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }
  return null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const [, payload] = token.split('.');
  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(window.atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getStringClaim(payload: Record<string, unknown>, claimNames: string[]): string {
  for (const claimName of claimNames) {
    const claimValue = payload[claimName];

    if (typeof claimValue === 'string' && claimValue) {
      return claimValue;
    }

    if (Array.isArray(claimValue)) {
      const stringValue = claimValue.find((value): value is string => typeof value === 'string' && !!value);
      if (stringValue) {
        return stringValue;
      }
    }
  }

  return '';
}

export function getTokenPayload(): Record<string, unknown> | null {
  const token = getToken();
  if (!token || typeof window === 'undefined') {
    return null;
  }

  return decodeJwtPayload(token);
}

export function getTenantIdFromToken(): string {
  const payload = getTokenPayload();
  if (!payload) {
    return DEFAULT_TENANT_ID;
  }

  const tenantId = getStringClaim(payload, [
    'tenantId',
    'TenantId',
    'tenant_id',
    'tid',
    'http://schemas.microsoft.com/identity/claims/tenantid',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/tenantid',
    'http://schemas.pii-scanner.com/claims/tenantid',
  ]);

  return tenantId || DEFAULT_TENANT_ID;
}

export function getRoleFromToken(): string {
  const payload = getTokenPayload();
  if (!payload) {
    return '';
  }

  return getStringClaim(payload, [
    'role',
    'Role',
    'roles',
    'Roles',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role',
  ]);
}

export function normalizeRole(role?: string | null): string {
  return (role ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-');
}

export function getCurrentUserRole(): string {
  return getUser()?.role || getRoleFromToken();
}

export function isSuperAdmin(): boolean {
  const role = normalizeRole(getCurrentUserRole());
  return role === 'super-admin' || role === 'superadmin';
}

export function isPlainUser(): boolean {
  const role = normalizeRole(getCurrentUserRole());
  return role === 'user';
}

/**
 * Check whether a valid token exists in the session.
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Clear the token from sessionStorage and apiClient (logout).
 */
export function clearToken(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(TOKEN_KEY);
  }
  apiClient.clearToken();
  clearUser();
}

/**
 * Restore token into apiClient on app startup.
 * Call this once when the app initialises so that the apiClient
 * picks up any existing session token for subsequent requests.
 */
export function restoreSession(): void {
  const token = getToken();
  if (token) {
    apiClient.setToken(token);
  }
}

export function saveUser(user: User): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearUser(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(USER_KEY);
  }
}

// ──────────────────────────── Centralised HTTP Methods ────────────────────────────

/**
 * Centralised POST request.
 * @param path   Controller/action path, e.g. "scans/CreateScan"
 * @param data   Request body (any model)
 * @returns      Parsed response data
 * 
 * @example
 * await post('scans/CreateScan', scanRequest);
 * await post('auth/login', { username, password });
 */
export async function post<T = any>(path: string, data?: any): Promise<T> {
  return apiClient.post<T>(path, data);
}

/**
 * Centralised GET request.
 * @param path   Controller/action path, e.g. "scans/GetAll"
 * @param params Optional query string parameters
 * @returns      Parsed response data
 * 
 * @example
 * const scans = await get('scans/GetAll');
 * const scan  = await get('scans/GetById', { id: '123' });
 */
export async function get<T = any>(path: string, params?: Record<string, string>): Promise<T> {
  return apiClient.get<T>(path, params ? { params } : undefined);
}

/**
 * Centralised PUT request.
 * @param path   Controller/action path, e.g. "scans/UpdateScan"
 * @param data   Request body (any model)
 * @returns      Parsed response data
 */
export async function put<T = any>(path: string, data?: any): Promise<T> {
  return apiClient.put<T>(path, data);
}

/**
 * Centralised PATCH request.
 * @param path   Controller/action path, e.g. "subscription/tenant/{tenantId}"
 * @param data   Request body (any model)
 * @returns      Parsed response data
 */
export async function patch<T = any>(path: string, data?: any): Promise<T> {
  return apiClient.patch<T>(path, data);
}

/**
 * Centralised DELETE request.
 * @param path   Controller/action path, e.g. "scans/DeleteScan"
 * @returns      Parsed response data
 */
export async function del<T = any>(path: string): Promise<T> {
  return apiClient.delete<T>(path);
}
