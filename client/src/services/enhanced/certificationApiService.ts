import { apiClient } from '../apiClient';
import { 
  ApiService, 
  ApiResult, 
  CertificationPaginationRequest,
  PagedApiResponse,
  ApiResponse
} from '../../types/api';
import { CertificationDocument } from '../../types/certification';

/**
 * Enhanced certification API service using industry-standard patterns
 */
export class CertificationApiService implements ApiService<
  CertificationDocument, 
  Partial<CertificationDocument>, 
  Partial<CertificationDocument>,
  CertificationPaginationRequest
> {
  private readonly endpoint = 'certifications';

  /**
   * Get all certifications with pagination and filtering
   */
  async getAll(params?: CertificationPaginationRequest): Promise<PagedApiResponse<CertificationDocument>> {
    const result = await apiClient.getPaginated<CertificationDocument>(this.endpoint, params);
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch certifications');
    }

    return {
      status: 200,
      message: 'Certifications retrieved successfully',
      requestId: '',
      timestamp: new Date().toISOString(),
      data: result.data || [],
      pagination: result.pagination!
    };
  }

  /**
   * Get certification by ID
   */
  async getById(id: string): Promise<ApiResponse<CertificationDocument>> {
    const result = await apiClient.get<CertificationDocument>(`${this.endpoint}/${id}`);
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch certification');
    }

    return {
      status: 200,
      message: 'Certification retrieved successfully',
      requestId: '',
      timestamp: new Date().toISOString(),
      data: result.data!
    };
  }

  /**
   * Create new certification
   */
  async create(data: Partial<CertificationDocument>): Promise<ApiResponse<CertificationDocument>> {
    const result = await apiClient.post<CertificationDocument>(this.endpoint, data);
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to create certification');
    }

    return {
      status: 201,
      message: 'Certification created successfully',
      requestId: '',
      timestamp: new Date().toISOString(),
      data: result.data!
    };
  }

  /**
   * Update existing certification
   */
  async update(id: string, data: Partial<CertificationDocument>): Promise<ApiResponse<CertificationDocument>> {
    const result = await apiClient.put<CertificationDocument>(`${this.endpoint}/${id}`, data);
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to update certification');
    }

    return {
      status: 200,
      message: 'Certification updated successfully',
      requestId: '',
      timestamp: new Date().toISOString(),
      data: result.data!
    };
  }

  /**
   * Delete certification
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const result = await apiClient.delete(`${this.endpoint}/${id}`);
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to delete certification');
    }

    return {
      status: 200,
      message: 'Certification deleted successfully',
      requestId: '',
      timestamp: new Date().toISOString(),
      data: undefined
    };
  }

  /**
   * Get certifications with advanced filtering
   */
  async getFiltered(filters: {
    month?: string;
    year?: number;
    status?: string;
    therapyType?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<ApiResult<CertificationDocument[]>> {
    return await apiClient.getPaginated<CertificationDocument>(this.endpoint, filters);
  }

  /**
   * Get certification statistics
   */
  async getStats(): Promise<ApiResult<{
    total: number;
    byStatus: Record<string, number>;
    byTherapyType: Record<string, number>;
    recentCount: number;
  }>> {
    return await apiClient.get<any>(`${this.endpoint}/stats`);
  }
}

// Export singleton instance
export const certificationApiService = new CertificationApiService();


