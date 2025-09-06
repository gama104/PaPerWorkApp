// Session Service - API Communication Layer
import { tokenService } from '@/features/auth/services/tokenService';
import type {
  TherapySession,
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionsFilter,
  SessionsResponse,
  SessionStats
} from '../types/session.types';

class SessionService {
  private readonly baseURL = '/api/TherapySessions';

  /**
   * Get sessions with filtering and pagination
   */
  async getSessions(filter: SessionsFilter = {}): Promise<SessionsResponse> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const queryParams = new URLSearchParams();
      
      // Add filter parameters
      if (filter.certificationId) queryParams.append('certificationId', filter.certificationId);
      if (filter.startDate) queryParams.append('startDate', filter.startDate);
      if (filter.endDate) queryParams.append('endDate', filter.endDate);
      if (filter.therapistId) queryParams.append('therapistId', filter.therapistId);
      if (filter.patientName) queryParams.append('patientName', filter.patientName);
      if (filter.location) queryParams.append('location', filter.location);
      if (filter.signatureStatus) queryParams.append('signatureStatus', filter.signatureStatus);
      if (filter.search) queryParams.append('search', filter.search);
      if (filter.page) queryParams.append('page', filter.page.toString());
      if (filter.pageSize) queryParams.append('pageSize', filter.pageSize.toString());
      if (filter.sortBy) queryParams.append('sortBy', filter.sortBy);
      if (filter.sortDirection) queryParams.append('sortDirection', filter.sortDirection);

      const url = queryParams.toString() ? `${this.baseURL}?${queryParams}` : this.baseURL;
      
      const response = await fetch(url, {
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
        throw new Error(data.message || 'Failed to fetch sessions');
      }

      if (data.status === 200 && data.data) {
        return {
          sessions: data.data,
          totalCount: data.pagination?.totalItems || data.data.length,
          page: data.pagination?.page || 1,
          pageSize: data.pagination?.pageSize || data.data.length,
          totalPages: data.pagination?.totalPages || 1,
          hasNext: data.pagination?.hasNext || false,
          hasPrevious: data.pagination?.hasPrevious || false,
        };
      }

      throw new Error('Invalid sessions response');
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  }

  /**
   * Get recent sessions
   */
  async getRecentSessions(count: number = 10): Promise<TherapySession[]> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/recent?count=${count}`, {
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
        throw new Error(data.message || 'Failed to fetch recent sessions');
      }

      if (data.status === 200 && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      }

      throw new Error('Invalid recent sessions response');
    } catch (error) {
      console.error('Get recent sessions error:', error);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  async getSessionById(id: string): Promise<TherapySession> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
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
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        throw new Error(data.message || 'Failed to fetch session');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid session response');
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }

  /**
   * Create new session
   */
  async createSession(sessionData: CreateSessionRequest): Promise<TherapySession> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(sessionData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        throw new Error(data.message || 'Failed to create session');
      }

      if (data.status === 201 && data.data) {
        return data.data;
      }

      throw new Error('Invalid create session response');
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  /**
   * Update existing session
   */
  async updateSession(id: string, sessionData: UpdateSessionRequest): Promise<TherapySession> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(sessionData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        throw new Error(data.message || 'Failed to update session');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid update session response');
    } catch (error) {
      console.error('Update session error:', error);
      throw error;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(id: string): Promise<void> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Delete session error:', error);
      throw error;
    }
  }

  /**
   * Get sessions by certification ID
   */
  async getSessionsByCertification(certificationId: string): Promise<TherapySession[]> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/certification/${certificationId}`, {
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
        throw new Error(data.message || 'Failed to fetch sessions for certification');
      }

      if (data.status === 200 && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      }

      throw new Error('Invalid certification sessions response');
    } catch (error) {
      console.error('Get sessions by certification error:', error);
      throw error;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<SessionStats> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/stats`, {
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
        throw new Error(data.message || 'Failed to fetch session statistics');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid session stats response');
    } catch (error) {
      console.error('Get session stats error:', error);
      throw error;
    }
  }
}

// Singleton instance
export const sessionService = new SessionService();
export default sessionService;
