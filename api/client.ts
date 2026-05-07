/**
 * API Client Framework
 * 
 * Provides HTTP methods (GET, POST, PUT, DELETE) where parameters are optional.
 * Manages the authentication token for the session and adds it as a Bearer token
 * to every request natively.
 */

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  data?: any;
}

class HttpClient {
  private baseURL: string;
  private token: string | null = null;
  private readonly TOKEN_STORAGE_KEY = 'session_auth_token';

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
    // Attempt to load token from session storage when instantiated
    this.loadToken();
  }

  /**
   * Set the base URL for the API.
   */
  public setBaseURL(url: string) {
    this.baseURL = url;
  }

  /**
   * Saves the token internally and in session storage for the login session.
   * Call this explicitly after a successful login.
   */
  public setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(this.TOKEN_STORAGE_KEY, token);
    }
  }

  /**
   * Loads the token from the session storage.
   */
  private loadToken() {
    if (typeof window !== 'undefined') {
      const storedToken = window.sessionStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (storedToken) {
        this.token = storedToken;
      }
    }
  }

  /**
   * Clears the current token (used for logout).
   */
  public clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(this.TOKEN_STORAGE_KEY);
    }
  }

  // Core request method that intercepts all API calls
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, data, headers, ...customOptions } = options;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Before creating the request, re-check session storage just in case
    // it was modified in another tab or elsewhere
    if (!this.token) {
      this.loadToken();
    }

    // Attach Bearer token to all requests if present
    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...customOptions,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    };

    // Serialize body data if present
    if (data && config.method !== 'GET' && config.method !== 'HEAD') {
      config.body = JSON.stringify(data);
    }

    // Append path parameters to URL
    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Parse JSON from response
      // Handles Empty response bodies gracefully
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseData = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        // You can handle unified error management here (like auth expiration)
        if (response.status === 401) {
          console.warn('Unauthorized request - Token might be invalid or expired.');
          this.clearToken();
        }
        throw new Error(responseData?.message || `HTTP Request Failed: ${response.status} ${response.statusText}`);
      }

      return responseData as T;
    } catch (error) {
      console.error('API Client Error on request:', endpoint, error);
      throw error;
    }
  }

  /**
   * Perform a GET request.
   * @param endpoint The route endpoint
   * @param options Optional RequestOptions
   */
  public get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Perform a POST request.
   * @param endpoint The route endpoint
   * @param data The JSON body to send (optional)
   * @param options Optional RequestOptions
   */
  public post<T = any>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, data, method: 'POST' });
  }

  /**
   * Perform a PUT request.
   * @param endpoint The route endpoint
   * @param data The JSON body to send (optional)
   * @param options Optional RequestOptions
   */
  public put<T = any>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, data, method: 'PUT' });
  }

  /**
   * Perform a DELETE request.
   * @param endpoint The route endpoint
   * @param options Optional RequestOptions
   */
  public delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Exporting a singleton instance to be used everywhere in the code base on demand
export const apiClient = new HttpClient('https://localhost:7016/api/');

// We also export the class itself just in case one needs to instantiate multiple independent clients
export default HttpClient;
