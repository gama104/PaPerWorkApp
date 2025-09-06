// Certification Service - API Communication Layer
import { tokenService } from '@/features/auth/services/tokenService';
import type {
  CertificationDocument,
  CreateCertificationRequest,
  UpdateCertificationRequest,
  CertificationsFilter,
  CertificationsResponse,
  CertificationStats,
  Patient,
  Therapist,
  CertificationExportOptions
} from '../types/certification.types';

// Lightweight certification response for session creation
export interface CertificationForSessionsResponse {
  id: string;
  month: string;
  year: number;
  patientName: string;
  status: string;
  therapyType: string;
  sessionCount: number;
}

// Lightweight certification response for list display
export interface CertificationListItemResponse {
  id: string;
  patientName: string;
  month: string;
  year: number;
  therapyType: string;
  status: string;
  sessionCount: number;
  createdAt: string;
}

class CertificationService {
  private readonly baseURL = '/api/certifications';
  private readonly patientsURL = '/api/patients';
  private readonly therapistsURL = '/api/User'; // Backend uses singular 'User'

  /**
   * Get certifications with filtering and pagination
   */
  async getCertifications(filter: CertificationsFilter = {}): Promise<CertificationsResponse> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const queryParams = new URLSearchParams();
      
      // Add filter parameters
      if (filter.patientId) queryParams.append('patientId', filter.patientId);
      if (filter.therapistId) queryParams.append('therapistId', filter.therapistId);
      if (filter.month) queryParams.append('month', filter.month.toString());
      if (filter.year) queryParams.append('year', filter.year.toString());
      if (filter.status) queryParams.append('status', filter.status);
      if (filter.search) queryParams.append('search', filter.search);
      if (filter.startDate) queryParams.append('startDate', filter.startDate);
      if (filter.endDate) queryParams.append('endDate', filter.endDate);
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
        throw new Error(data.message || 'Failed to fetch certifications');
      }

      if (data.status === 200 && data.data) {
        return {
          certifications: data.data.items || data.data.certifications || data.data,
          totalCount: data.data.totalCount || data.data.length,
          page: data.data.page || 1,
          pageSize: data.data.pageSize || data.data.length,
          totalPages: data.data.totalPages || 1,
          hasNext: data.data.hasNext || false,
          hasPrevious: data.data.hasPrevious || false,
        };
      }

      throw new Error('Invalid certifications response');
    } catch (error) {
      console.error('Get certifications error:', error);
      throw error;
    }
  }

  /**
   * Get lightweight certifications for session creation
   */
  async getCertificationsForSessions(): Promise<CertificationForSessionsResponse[]> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/for-sessions`, {
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
        throw new Error(data.message || 'Failed to fetch certifications for sessions');
      }

      if (data.status === 200 && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      }

      throw new Error('Invalid certifications for sessions response');
    } catch (error) {
      console.error('Get certifications for sessions error:', error);
      throw error;
    }
  }

  /**
   * Get lightweight certifications for list display
   */
  async getCertificationListItems(filter: {
    search?: string;
    status?: string;
    month?: number;
    year?: number;
  } = {}): Promise<CertificationListItemResponse[]> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const queryParams = new URLSearchParams();
      if (filter.search) queryParams.append('search', filter.search);
      if (filter.status) queryParams.append('status', filter.status);
      if (filter.month) queryParams.append('month', filter.month.toString());
      if (filter.year) queryParams.append('year', filter.year.toString());

      const url = `${this.baseURL}/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
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
        throw new Error(data.message || 'Failed to fetch certification list items');
      }

      if (data.status === 200 && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      }

      throw new Error('Invalid certification list items response');
    } catch (error) {
      console.error('Get certification list items error:', error);
      throw error;
    }
  }

  /**
   * Get certification by ID
   */
  async getCertificationById(id: string): Promise<CertificationDocument> {
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
          throw new Error('Certification not found');
        }
        throw new Error(data.message || 'Failed to fetch certification');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid certification response');
    } catch (error) {
      console.error('Get certification error:', error);
      throw error;
    }
  }

  /**
   * Create new certification
   */
  async createCertification(certificationData: CreateCertificationRequest): Promise<CertificationDocument> {
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
        body: JSON.stringify(certificationData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        throw new Error(data.message || 'Failed to create certification');
      }

      if (data.status === 201 && data.data) {
        return data.data;
      }

      throw new Error('Invalid create certification response');
    } catch (error) {
      console.error('Create certification error:', error);
      throw error;
    }
  }

  /**
   * Update existing certification
   */
  async updateCertification(id: string, certificationData: UpdateCertificationRequest): Promise<CertificationDocument> {
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
        body: JSON.stringify(certificationData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        if (response.status === 404) {
          throw new Error('Certification not found');
        }
        // Log detailed error information for debugging
        console.error('Backend validation error:', data);
        console.error('Validation errors array:', data.errors);
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((error: any, index: number) => {
            console.error(`Validation error ${index + 1}:`, error);
          });
        }
        
        // Handle session conflict errors specifically
        if (data.message && data.message.includes('Session conflicts detected')) {
          throw new Error(data.message);
        }
        
        throw new Error(data.message || data.errors || 'Failed to update certification');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid update certification response');
    } catch (error) {
      console.error('Update certification error:', error);
      throw error;
    }
  }

  /**
   * Delete certification
   */
  async deleteCertification(id: string): Promise<void> {
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
          throw new Error('Certification not found');
        }
        
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete certification');
      }
    } catch (error) {
      console.error('Delete certification error:', error);
      throw error;
    }
  }

  /**
   * Submit certification for approval
   */
  async submitCertification(id: string): Promise<CertificationDocument> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/${id}/submit`, {
        method: 'POST',
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
          throw new Error('Certification not found');
        }
        throw new Error(data.message || 'Failed to submit certification');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid submit certification response');
    } catch (error) {
      console.error('Submit certification error:', error);
      throw error;
    }
  }

  /**
   * Approve certification (admin only)
   */
  async approveCertification(id: string, notes?: string): Promise<CertificationDocument> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        if (response.status === 403) {
          throw new Error('Insufficient permissions');
        }
        if (response.status === 404) {
          throw new Error('Certification not found');
        }
        throw new Error(data.message || 'Failed to approve certification');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid approve certification response');
    } catch (error) {
      console.error('Approve certification error:', error);
      throw error;
    }
  }

  /**
   * Reject certification (admin only)
   */
  async rejectCertification(id: string, reason: string): Promise<CertificationDocument> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ rejectionReason: reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        if (response.status === 403) {
          throw new Error('Insufficient permissions');
        }
        if (response.status === 404) {
          throw new Error('Certification not found');
        }
        throw new Error(data.message || 'Failed to reject certification');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid reject certification response');
    } catch (error) {
      console.error('Reject certification error:', error);
      throw error;
    }
  }

  /**
   * Get certification statistics
   */
  async getCertificationStats(): Promise<CertificationStats> {
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
        throw new Error(data.message || 'Failed to fetch certification statistics');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid certification stats response');
    } catch (error) {
      console.error('Get certification stats error:', error);
      throw error;
    }
  }

  /**
   * Get patients
   */
  async getPatients(): Promise<Patient[]> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(this.patientsURL, {
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
        throw new Error(data.message || 'Failed to fetch patients');
      }

      if (data.status === 200 && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      }

      throw new Error('Invalid patients response');
    } catch (error) {
      console.error('Get patients error:', error);
      throw error;
    }
  }

  /**
   * Get therapists (users with therapist role)
   */
  async getTherapists(): Promise<Therapist[]> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      // For now, just get all users since role filtering isn't implemented yet
      // TODO: Add role filtering when backend supports it
      const response = await fetch(this.therapistsURL, {
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
        throw new Error(data.message || 'Failed to fetch therapists');
      }

      if (data.status === 200 && data.data) {
        const users = Array.isArray(data.data) ? data.data : [data.data];
        // Map user data to therapist format
        return users.map((user: any) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          specialization: user.specialization,
          licenseNumber: user.licenseNumber,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastModifiedAt: user.lastModifiedAt,
        }));
      }

      throw new Error('Invalid therapists response');
    } catch (error) {
      console.error('Get therapists error:', error);
      throw error;
    }
  }

  /**
   * Export certifications
   */
  async exportCertifications(options: CertificationExportOptions): Promise<Blob> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', options.format);
      
      if (options.dateRange) {
        queryParams.append('startDate', options.dateRange.startDate);
        queryParams.append('endDate', options.dateRange.endDate);
      }
      
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      if (options.includeDetails) queryParams.append('includeDetails', 'true');
      if (options.includeSessions) queryParams.append('includeSessions', 'true');

      const response = await fetch(`${this.baseURL}/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        throw new Error('Failed to export certifications');
      }

      return await response.blob();
    } catch (error) {
      console.error('Export certifications error:', error);
      throw error;
    }
  }

  /**
   * Download certification PDF
   */
  async downloadCertificationPDF(id: string): Promise<void> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/${id}/certification-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        throw new Error('Failed to download certification PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certification-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download certification PDF error:', error);
      throw error;
    }
  }
}

// Singleton instance
export const certificationService = new CertificationService();
export default certificationService;
