// Enhanced Auth Service with Security Best Practices
import { tokenService } from './tokenService';
import { apiClient } from '@/services/apiClient';
import type { 
  LoginRequest, 
  RegisterRequest, 
  User,
  ChangePasswordRequest 
} from '../types/auth.types';

class AuthService {
  private readonly baseURL = '/api/Auth';

  /**
   * Login with credentials
   * ✅ SECURE: Refresh token handled by backend in HTTP-only cookie
   */
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    try {
      // Send only the fields the backend expects
      const loginData = {
        email: credentials.email,
        password: credentials.password
      };

      console.log('🔍 DEBUG: Sending login data:', loginData);

      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ SECURE: Allow HTTP-only cookies
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        console.error('Backend response:', data);
        
        // Handle validation errors specifically
        if (response.status === 400 && data.errors) {
          console.error('Validation errors:', data.errors);
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => {
              const messageStr = Array.isArray(messages) ? messages.join(', ') : String(messages);
              return `${field}: ${messageStr}`;
            })
            .join('; ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        
        throw new Error(data.message || data.title || `Login failed (${response.status})`);
      }

      if (data.status === 200 && data.data) {
        const { user, token } = data.data;
        
        // ✅ SECURE: Store access token in memory only
        // ✅ INDUSTRY STANDARD: Refresh token automatically handled by HTTP-only cookie
        tokenService.setAccessToken(token, 900); // 15 minutes (industry standard)
        
        return { user, token };
      }

      throw new Error('Invalid login response');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.status === 201 && data.data) {
        const { user, token } = data.data;
        
        // ✅ SECURE: Store access token in memory only
        // ✅ INDUSTRY STANDARD: Refresh token automatically handled by HTTP-only cookie
        tokenService.setAccessToken(token, 900); // 15 minutes (industry standard)
        
        return { user, token };
      }

      throw new Error('Invalid registration response');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * ✅ SECURE: Clears both access token and refresh cookie
   */
  async logout(): Promise<void> {
    try {
      // Call backend to clear refresh token cookie
      await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        credentials: 'include', // ✅ SECURE: Send refresh cookie to be cleared
        headers: {
          'Authorization': `Bearer ${tokenService.getAccessToken()}`,
        },
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
      // Continue with local cleanup even if backend call fails
    } finally {
      // ✅ SECURE: Always clear local token
      tokenService.logout();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        throw new Error(data.message || 'Failed to get user profile');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid user profile response');
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      if (data.status !== 200) {
        throw new Error('Password change failed');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset request failed');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Validate token and get user info
   * ✅ SECURE: Always validates with backend
   */
  async validateToken(): Promise<User | null> {
    console.log('AuthService: Validating token');
    let token = tokenService.getAccessToken();
    
    if (!token) {
      console.log('AuthService: No access token, attempting refresh');
      token = await tokenService.getValidToken();
      if (!token) {
        console.log('AuthService: No valid token available after refresh');
        return null;
      }
    }

    try {
      console.log('AuthService: Getting current user');
      const user = await this.getCurrentUser();
      console.log('AuthService: User validated successfully');
      return user;
    } catch (error) {
      console.warn('Token validation failed:', error);
      tokenService.logout();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenService.getAccessToken() !== null;
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    return tokenService.getAccessToken();
  }

  /**
   * Make authenticated request with automatic token refresh
   * ✅ SECURE: Handles token refresh automatically
   */
  async authenticatedRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    // Remove /api/ prefix if present since ApiClient handles it
    const endpoint = url.startsWith('/api/') ? url.substring(5) : url;
    
    // Determine the HTTP method from options
    const method = options.method || 'GET';
    
    let result;
    
    switch (method.toUpperCase()) {
      case 'GET':
        result = await apiClient.get<T>(endpoint);
        break;
      case 'POST':
        result = await apiClient.post<T>(endpoint, options.body ? JSON.parse(options.body as string) : {});
        break;
      case 'PUT':
        result = await apiClient.put<T>(endpoint, options.body ? JSON.parse(options.body as string) : {});
        break;
      case 'DELETE':
        result = await apiClient.delete(endpoint);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    
    if (!result.success) {
      throw new Error(`Request failed: ${result.error?.status || 'Unknown error'}`);
    }
    
    return result.data as T;
  }
}

// Singleton instance
export const authService = new AuthService();
export default authService;
