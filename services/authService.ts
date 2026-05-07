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

const TOKEN_KEY = 'session_auth_token';
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://localhost:7016/api';

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

// ──────────────────────────── Centralised HTTP Methods ────────────────────────────

/**
 * Build the full API URL from a controller/action path.
 * @example buildUrl('scans/CreateScan') => 'https://localhost:7016/api/scans/CreateScan'
 */
function buildUrl(path: string): string {
  // Strip leading slash if caller accidentally includes one
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/${cleanPath}`;
}

/**
 * Centralised POST request.
 * @param path   Controller/action path, e.g. "scans/CreateScan"
 * @param data   Request body (any model)
 * @returns      Parsed response data
 * 
 * @example
 * await post('scans/CreateScan', scanRequest);
 * await post('Users/login', { username, password });
 */
export async function post<T = any>(path: string, data?: any): Promise<T> {
  return apiClient.post<T>(buildUrl(path), data);
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
  return apiClient.get<T>(buildUrl(path), params ? { params } : undefined);
}

/**
 * Centralised PUT request.
 * @param path   Controller/action path, e.g. "scans/UpdateScan"
 * @param data   Request body (any model)
 * @returns      Parsed response data
 */
export async function put<T = any>(path: string, data?: any): Promise<T> {
  return apiClient.put<T>(buildUrl(path), data);
}

/**
 * Centralised DELETE request.
 * @param path   Controller/action path, e.g. "scans/DeleteScan"
 * @returns      Parsed response data
 */
export async function del<T = any>(path: string): Promise<T> {
  return apiClient.delete<T>(buildUrl(path));
}
