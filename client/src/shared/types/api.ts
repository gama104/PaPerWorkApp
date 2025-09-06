// Industry-standard API response types that match the backend structure

/**
 * Base API response structure
 */
export interface BaseApiResponse {
  status: number;
  message: string;
  requestId: string;
  timestamp: string;
}

/**
 * Generic success response with data
 */
export interface ApiResponse<T> extends BaseApiResponse {
  data: T;
  meta?: Record<string, any>;
}

/**
 * Error detail for validation errors
 */
export interface ErrorDetail {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Error response structure
 */
export interface ApiErrorResponse extends BaseApiResponse {
  errorCode: string;
  errors: ErrorDetail[];
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Paginated response structure
 */
export interface PagedApiResponse<T> extends BaseApiResponse {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Pagination request parameters
 */
export interface PaginationRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Certification-specific pagination request
 */
export interface CertificationPaginationRequest extends PaginationRequest {
  month?: string;
  year?: number;
  status?: string;
}

/**
 * Patient-specific pagination request
 */
export interface PatientPaginationRequest extends PaginationRequest {
  therapistId?: string;
  minAge?: number;
  maxAge?: number;
}

/**
 * Therapy session-specific pagination request
 */
export interface TherapySessionPaginationRequest extends PaginationRequest {
  certificationId?: string;
  startDate?: string;
  endDate?: string;
  signatureStatus?: string;
}

/**
 * API Client response handler result
 */
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
  pagination?: PaginationMeta;
}

/**
 * Loading state for API calls
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Generic API service interface
 */
export interface ApiService<T, TCreate, TUpdate, TPagination extends PaginationRequest> {
  getAll(params?: TPagination): Promise<PagedApiResponse<T>>;
  getById(id: string): Promise<ApiResponse<T>>;
  create(data: TCreate): Promise<ApiResponse<T>>;
  update(id: string, data: TUpdate): Promise<ApiResponse<T>>;
  delete(id: string): Promise<ApiResponse<void>>;
}
