// Secure Token Management Service
// ⚠️ SECURITY: Access tokens stored in memory only, never in localStorage

class TokenService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  /**
   * Set access token in memory only
   * ✅ SECURE: Never persisted to localStorage or sessionStorage
   */
  setAccessToken(token: string, expiresIn: number): void {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);
  }

  /**
   * Get current access token
   * ✅ SECURE: Only from memory
   */
  getAccessToken(): string | null {
    if (this.isTokenExpired()) {
      this.clearAccessToken();
      return null;
    }
    return this.accessToken;
  }

  /**
   * Clear access token from memory
   * ✅ SECURE: Complete cleanup
   */
  clearAccessToken(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if token is expired
   * ✅ SECURE: 2-minute buffer for network delays (industry standard)
   */
  isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    return Date.now() > (this.tokenExpiry - 2 * 60 * 1000); // 2 min buffer
  }

  /**
   * Check if token needs refresh soon
   * ✅ SECURE: Proactive refresh 5 minutes before expiry (industry standard)
   */
  shouldRefreshToken(): boolean {
    if (!this.tokenExpiry) return false;
    return Date.now() > (this.tokenExpiry - 5 * 60 * 1000); // 5 min buffer
  }

  /**
   * Get token with automatic refresh
   * ✅ SECURE: Handles concurrent refresh requests
   */
  async getValidToken(): Promise<string | null> {
    const currentToken = this.getAccessToken();
    
    if (currentToken && !this.shouldRefreshToken()) {
      return currentToken;
    }

    // Handle concurrent refresh requests
    if (this.refreshPromise) {
      await this.refreshPromise;
      return this.getAccessToken();
    }

    // Trigger token refresh
    this.refreshPromise = this.refreshAccessToken();
    const refreshSuccess = await this.refreshPromise;
    this.refreshPromise = null;

    return refreshSuccess ? this.getAccessToken() : null;
  }

  /**
   * Refresh access token using HTTP-only refresh cookie
   * ✅ INDUSTRY STANDARD: Refresh token handled automatically by HTTP-only cookies
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/Auth/refresh', {
        method: 'POST',
        credentials: 'include', // ✅ SECURE: Send HTTP-only refresh cookie automatically
        headers: {
          'Content-Type': 'application/json',
        },
        // ✅ INDUSTRY STANDARD: No body needed - refresh token comes from HTTP-only cookie
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Refresh token expired or invalid
          this.clearAccessToken();
          // Trigger logout
          window.dispatchEvent(new CustomEvent('auth:logout'));
          return false;
        }
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      if (data.status === 200 && data.data?.token) {
        this.setAccessToken(data.data.token, 3600); // 1 hour default
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAccessToken();
      // Clear invalid refresh token cookie by triggering logout
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return false;
    }
  }

  /**
   * Decode JWT payload (client-side only for UI purposes)
   * ⚠️ SECURITY: Never trust client-side JWT data for authorization
   */
  decodeToken(token?: string): Record<string, unknown> | null {
    const tokenToUse = token || this.accessToken;
    if (!tokenToUse) return null;

    try {
      const payload = tokenToUse.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.warn('Invalid JWT token:', error);
      return null;
    }
  }

  /**
   * Get user info from token (UI purposes only)
   * ⚠️ SECURITY: Never trust for authorization decisions
   */
  getUserFromToken(): Record<string, unknown> | null {
    const payload = this.decodeToken();
    if (!payload) return null;

    return {
      id: payload.sub || payload.nameid,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      exp: payload.exp,
    };
  }

  /**
   * Complete logout - clear all tokens
   * ✅ SECURE: Complete cleanup
   */
  logout(): void {
    this.clearAccessToken();
    this.refreshPromise = null;
  }
}

// Singleton instance
export const tokenService = new TokenService();
export default tokenService;
