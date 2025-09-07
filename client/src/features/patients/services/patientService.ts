// Patient Service - API Communication Layer
import { tokenService } from '@/features/auth/services/tokenService';
import { authService } from '@/features/auth/services/authService';
import type {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientsFilter,
  PatientsResponse,
  PatientStats,
  Therapist,
  PatientExportOptions
} from '../types/patient.types';

class PatientService {
  private readonly baseURL = '/api/patients';
  private readonly therapistsURL = '/api/User'; // Backend uses singular 'User'

  /**
   * Get patients with filtering and pagination
   */
  async getPatients(filter: PatientsFilter = {}): Promise<PatientsResponse> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const queryParams = new URLSearchParams();
      
      // Add filter parameters
      if (filter.search) queryParams.append('search', filter.search);
      if (filter.therapistId) queryParams.append('therapistId', filter.therapistId);
      if (filter.isActive !== undefined) queryParams.append('isActive', filter.isActive.toString());
      if (filter.city) queryParams.append('city', filter.city);
      if (filter.state) queryParams.append('state', filter.state);
      if (filter.ageRange?.min) queryParams.append('minAge', filter.ageRange.min.toString());
      if (filter.ageRange?.max) queryParams.append('maxAge', filter.ageRange.max.toString());
      if (filter.hasActiveCertifications !== undefined) queryParams.append('hasActiveCertifications', filter.hasActiveCertifications.toString());
      if (filter.lastSessionAfter) queryParams.append('lastSessionAfter', filter.lastSessionAfter);
      if (filter.lastSessionBefore) queryParams.append('lastSessionBefore', filter.lastSessionBefore);
      if (filter.page) queryParams.append('page', filter.page.toString());
      if (filter.pageSize) queryParams.append('pageSize', filter.pageSize.toString());
      if (filter.sortBy) queryParams.append('sortBy', filter.sortBy);
      if (filter.sortDirection) queryParams.append('sortDirection', filter.sortDirection);

      const url = queryParams.toString() ? `${this.baseURL}?${queryParams}` : this.baseURL;
      
      const data = await authService.authenticatedRequest(url);
      
      console.log('PatientService: Raw response data:', data);

      // The authenticatedRequest returns the unwrapped data, so we need to check for the actual data structure
      if (data && (data.items || data.patients || Array.isArray(data))) {
        const patients = data.items || data.patients || data;
        return {
          patients: patients,
          totalCount: data.totalCount || data.pagination?.totalItems || patients.length,
          page: data.page || data.pagination?.page || 1,
          pageSize: data.pageSize || data.pagination?.pageSize || patients.length,
          totalPages: data.totalPages || data.pagination?.totalPages || 1,
          hasNext: data.hasNext || data.pagination?.hasNext || false,
          hasPrevious: data.hasPrevious || data.pagination?.hasPrevious || false,
        };
      }

      throw new Error('Invalid patients response');
    } catch (error) {
      console.error('Get patients error:', error);
      throw error;
    }
  }

  /**
   * Get patient by ID
   */
  async getPatientById(id: string): Promise<Patient> {
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
          throw new Error('Patient not found');
        }
        throw new Error(data.message || 'Failed to fetch patient');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid patient response');
    } catch (error) {
      console.error('Get patient error:', error);
      throw error;
    }
  }

  /**
   * Create new patient
   */
  async createPatient(patientData: CreatePatientRequest): Promise<Patient> {
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
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        throw new Error(data.message || 'Failed to create patient');
      }

      if (data.status === 201 && data.data) {
        return data.data;
      }

      throw new Error('Invalid create patient response');
    } catch (error) {
      console.error('Create patient error:', error);
      throw error;
    }
  }

  /**
   * Update existing patient
   */
  async updatePatient(id: string, patientData: UpdatePatientRequest): Promise<Patient> {
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
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout();
          throw new Error('Session expired');
        }
        if (response.status === 404) {
          throw new Error('Patient not found');
        }
        throw new Error(data.message || 'Failed to update patient');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid update patient response');
    } catch (error) {
      console.error('Update patient error:', error);
      throw error;
    }
  }

  /**
   * Delete patient
   */
  async deletePatient(id: string): Promise<void> {
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
          throw new Error('Patient not found');
        }
        
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Delete patient error:', error);
      throw error;
    }
  }

  /**
   * Search patients
   */
  async searchPatients(query: string, limit: number = 10): Promise<Patient[]> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
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
        throw new Error(data.message || 'Failed to search patients');
      }

      if (data.status === 200 && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      }

      throw new Error('Invalid search patients response');
    } catch (error) {
      console.error('Search patients error:', error);
      throw error;
    }
  }

  /**
   * Get patient statistics
   */
  async getPatientStats(): Promise<PatientStats> {
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
        throw new Error(data.message || 'Failed to fetch patient statistics');
      }

      if (data.status === 200 && data.data) {
        return data.data;
      }

      throw new Error('Invalid patient stats response');
    } catch (error) {
      console.error('Get patient stats error:', error);
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
        return users.map(user => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          specialization: user.specialization,
          licenseNumber: user.licenseNumber,
          isActive: user.isActive,
        }));
      }

      throw new Error('Invalid therapists response');
    } catch (error) {
      console.error('Get therapists error:', error);
      throw error;
    }
  }

  /**
   * Export patients
   */
  async exportPatients(options: PatientExportOptions): Promise<Blob> {
    const token = await tokenService.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', options.format);
      
      if (options.includeInactive) queryParams.append('includeInactive', 'true');
      if (options.includeMedicalInfo) queryParams.append('includeMedicalInfo', 'true');
      if (options.includeEmergencyContacts) queryParams.append('includeEmergencyContacts', 'true');
      
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
        throw new Error('Failed to export patients');
      }

      return await response.blob();
    } catch (error) {
      console.error('Export patients error:', error);
      throw error;
    }
  }
}

// Singleton instance
export const patientService = new PatientService();
export default patientService;
