import { tokenService } from '../features/auth/services/tokenService';
import type { 
  ApiResponse,
  ApiErrorResponse, 
  PagedApiResponse, 
  ApiResult
} from '../shared/types/api';

/**
 * Industry-standard API client with automatic response handling
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic GET request with automatic response unwrapping
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResult<T>> {
    try {
      const url = this.buildUrl(endpoint, params);
      const token = await tokenService.getValidToken();
      
      if (!token) {
        throw new Error('No valid token available');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try to refresh
          const refreshedToken = await tokenService.getValidToken();
          if (refreshedToken) {
            // Retry with refreshed token
            const retryResponse = await fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${refreshedToken}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });

            if (!retryResponse.ok) {
              throw new Error(`Request failed: ${retryResponse.status}`);
            }

            const retryData = await retryResponse.json();
            return this.handleResponse(retryData);
          }
        }
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.handleResponse(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generic GET request for paginated data
   */
  async getPaginated<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResult<T[]>> {
    try {
      const url = this.buildUrl(endpoint, params);
      const token = await tokenService.getValidToken();
      
      if (!token) {
        throw new Error('No valid token available');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try to refresh
          const refreshedToken = await tokenService.getValidToken();
          if (refreshedToken) {
            // Retry with refreshed token
            const retryResponse = await fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${refreshedToken}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });

            if (!retryResponse.ok) {
              throw new Error(`Request failed: ${retryResponse.status}`);
            }

            const retryData = await retryResponse.json();
            return this.handlePaginatedResponse(retryData);
          }
        }
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.handlePaginatedResponse(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generic POST request
   */
  async post<T>(endpoint: string, data: any): Promise<ApiResult<T>> {
    try {
      const url = this.buildUrl(endpoint);
      const token = await tokenService.getValidToken();
      
      if (!token) {
        throw new Error('No valid token available');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try to refresh
          const refreshedToken = await tokenService.getValidToken();
          if (refreshedToken) {
            // Retry with refreshed token
            const retryResponse = await fetch(url, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${refreshedToken}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(data)
            });

            if (!retryResponse.ok) {
              throw new Error(`Request failed: ${retryResponse.status}`);
            }

            const retryData = await retryResponse.json();
            return this.handleResponse(retryData);
          }
        }
        throw new Error(`Request failed: ${response.status}`);
      }

      const responseData = await response.json();
      return this.handleResponse(responseData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put<T>(endpoint: string, data: any): Promise<ApiResult<T>> {
    try {
      const url = this.buildUrl(endpoint);
      const token = await tokenService.getValidToken();
      
      if (!token) {
        throw new Error('No valid token available');
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try to refresh
          const refreshedToken = await tokenService.getValidToken();
          if (refreshedToken) {
            // Retry with refreshed token
            const retryResponse = await fetch(url, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${refreshedToken}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(data)
            });

            if (!retryResponse.ok) {
              throw new Error(`Request failed: ${retryResponse.status}`);
            }

            const retryData = await retryResponse.json();
            return this.handleResponse(retryData);
          }
        }
        throw new Error(`Request failed: ${response.status}`);
      }

      const responseData = await response.json();
      return this.handleResponse(responseData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete(endpoint: string): Promise<ApiResult<void>> {
    try {
      const url = this.buildUrl(endpoint);
      const token = await tokenService.getValidToken();
      
      if (!token) {
        throw new Error('No valid token available');
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try to refresh
          const refreshedToken = await tokenService.getValidToken();
          if (refreshedToken) {
            // Retry with refreshed token
            const retryResponse = await fetch(url, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${refreshedToken}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            });

            if (!retryResponse.ok) {
              throw new Error(`Request failed: ${retryResponse.status}`);
            }

            const retryData = await retryResponse.json();
            return this.handleResponse(retryData);
          }
        }
        throw new Error(`Request failed: ${response.status}`);
      }

      const responseData = await response.json();
      return this.handleResponse(responseData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handles successful API responses
   */
  private handleResponse<T>(response: any): ApiResult<T> {
    // Check if it's a standard API response
    if (this.isApiResponse(response)) {
      return {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        error: response.status >= 400 ? response as unknown as ApiErrorResponse : undefined
      };
    }

    // Handle direct data responses (legacy)
    return {
      success: true,
      data: response as T
    };
  }

  /**
   * Handles paginated response data
   */
  private handlePaginatedResponse<T>(response: any): ApiResult<T[]> {
    if (this.isPagedResponse(response)) {
      return {
        success: true,
        data: response.data,
        pagination: response.pagination
      };
    }
    
    // Handle legacy direct array responses
    if (Array.isArray(response)) {
      return {
        success: true,
        data: response as T[],
        pagination: {
          page: 1,
          pageSize: response.length,
          totalItems: response.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      };
    }

    // Handle wrapped array responses
    if (this.isApiResponse(response) && Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data as unknown as T[],
        pagination: {
          page: 1,
          pageSize: response.data.length,
          totalItems: response.data.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      };
    }

    throw new Error('Invalid paginated response structure');
  }

  /**
   * Handles API errors
   */
  private handleError<T>(error: any): ApiResult<T> {
    console.error('API Error:', error);

    // Check if it's a structured API error response
    if (error && typeof error === 'object' && 'status' in error && 'errorCode' in error) {
      return {
        success: false,
        error: error as ApiErrorResponse
      };
    }

    // Handle network or other errors
    return {
      success: false,
      error: {
        status: 500,
        message: error?.message || 'An unexpected error occurred',
        errorCode: 'NETWORK_ERROR',
        errors: [],
        requestId: '',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Builds URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}/${endpoint}`;
    
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Type guard for API response
   */
  private isApiResponse(response: any): response is ApiResponse<any> {
    return response && 
           typeof response === 'object' && 
           'status' in response && 
           'message' in response &&
           'data' in response;
  }

  /**
   * Type guard for paged API response
   */
  private isPagedResponse<T>(response: any): response is PagedApiResponse<T> {
    return this.isApiResponse(response) && 
           'data' in response && 
           'pagination' in response &&
           Array.isArray(response.data);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
