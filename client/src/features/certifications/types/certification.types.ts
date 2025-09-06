// Certification Feature Types - Comprehensive Type System
// Updated to match backend CertificationResponse

export interface CertificationDocument {
  id: string;
  patientId: string;
  patientName: string; // Added to match backend response
  therapistId: string;
  therapistName: string; // Added to match backend response
  month: string; // Changed from number to string to match backend
  year: number;
  therapyType: string; // Added to match backend response
  sessionCount: number; // Added to match backend response
  totalSessions: number;
  completedSessions: number;
  status: CertificationStatus;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  lastModifiedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  
  // Additional fields from backend response
  location?: string;
  fileNumber?: string;
  isPrivate?: boolean;
  hasPrivatePlan?: boolean;
  isProvisionalRemedy?: boolean;
  frequencyPerWeek?: number;
  duration?: number;
  registrationNumber?: string;
  referralNumber?: string;
  specialistDate?: string;
  
  // Related entities
  patient?: Patient;
  therapist?: Therapist;
  sessions?: TherapySession[];
  schedules?: Schedule[];
}

export interface Schedule {
  id?: string;
  certificationDocumentId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // Time in HH:mm format
  location?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  lastModifiedAt?: string;
}

export interface ScheduleRequest {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // Time in HH:mm format
  location?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt?: string;
}

export interface Therapist {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt?: string;
}

export interface TherapySession {
  id: string;
  certificationDocumentId: string;
  sessionDate: string;
  sessionTime: string;
  endTime?: string;
  location: string;
  transportationRequired: boolean;
  parentSignatureStatus: ParentSignatureStatus;
  notes?: string;
  therapistId: string;
  signatureImageData?: string;
  signatureName?: string;
  signatureNotes?: string;
  signatureDate?: string;
}

export enum CertificationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUIRED = 'revision_required'
}

export enum ParentSignatureStatus {
  PENDING = 'pending',
  SIGNED = 'signed',
  NOT_REQUIRED = 'not_required',
  REFUSED = 'refused'
}

export interface CertificationFormData {
  patientId: string;
  month: number;
  year: number;
  totalSessions: number;
  notes?: string;
}

export interface CreateCertificationRequest {
  patientId: string;
  month: string; // Backend expects month name
  year: number;
  therapyType: string;
  status?: CertificationStatus;
  duration?: number;
  frequencyPerWeek?: number;
  location?: string;
  fileNumber?: string;
  registrationNumber?: string;
  referralNumber?: string;
  specialistDate?: string;
  notes?: string;
  isPrivate?: boolean;
  hasPrivatePlan?: boolean;
  isProvisionalRemedy?: boolean;
  schedules?: ScheduleRequest[];
}

export interface UpdateCertificationRequest extends Partial<CertificationFormData> {
  id: string;
  status?: CertificationStatus;
  rejectionReason?: string;
}

export interface CertificationsFilter {
  patientId?: string;
  therapistId?: string;
  month?: number;
  year?: number;
  status?: CertificationStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'month' | 'year' | 'patientName' | 'status' | 'totalSessions';
  sortDirection?: 'asc' | 'desc';
}

export interface CertificationsResponse {
  certifications: CertificationDocument[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CertificationStats {
  totalCertifications: number;
  draftCertifications: number;
  submittedCertifications: number;
  approvedCertifications: number;
  rejectedCertifications: number;
  thisMonthCertifications: number;
  thisYearCertifications: number;
  completionRate: number;
  averageCertificationsPerMonth: number;
}

// UI State Types
export interface CertificationsState {
  certifications: CertificationDocument[];
  selectedCertification: CertificationDocument | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  error: string | null;
  filter: CertificationsFilter;
  stats: CertificationStats | null;
}

// Modal Types
export interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification?: CertificationDocument | null;
  mode: 'create' | 'edit' | 'view';
  onSave?: (certification: CertificationDocument) => void;
  onDelete?: (certificationId: string) => void;
  onSubmit?: (certificationId: string) => void;
}

// Form Types
export interface CertificationFormProps {
  initialData?: Partial<CertificationFormData>;
  onSubmit: (data: CertificationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

// List Types
export interface CertificationListProps {
  certifications: CertificationDocument[];
  isLoading?: boolean;
  onCertificationClick?: (certification: CertificationDocument) => void;
  onEditCertification?: (certification: CertificationDocument) => void;
  onDeleteCertification?: (certificationId: string) => void;
  onSubmitCertification?: (certificationId: string) => void;
  showPatientName?: boolean;
  showTherapistName?: boolean;
  className?: string;
}

// Card Types
export interface CertificationCardProps {
  certification: CertificationDocument;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  onViewSessions?: () => void;
  showPatientName?: boolean;
  showTherapistName?: boolean;
  className?: string;
}

// Filter Types
export interface CertificationsFilterProps {
  filter: CertificationsFilter;
  onFilterChange: (filter: CertificationsFilter) => void;
  onReset: () => void;
  isLoading?: boolean;
  patients?: Patient[];
  therapists?: Therapist[];
}

// Dashboard Types
export interface CertificationsDashboardProps {
  className?: string;
}

// Details Types
export interface CertificationDetailsProps {
  certification: CertificationDocument;
  onEdit?: () => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  onViewSessions?: () => void;
  className?: string;
}

// Hook Types
export interface UseCertificationsOptions {
  filter?: CertificationsFilter;
  autoRefresh?: boolean;
  refreshInterval?: number;
  includeSessions?: boolean;
  includePatients?: boolean;
  includeTherapists?: boolean;
  loadCertifications?: boolean;
}

export interface UseCertificationsReturn {
  // Data
  certifications: CertificationDocument[];
  selectedCertification: CertificationDocument | null;
  stats: CertificationStats | null;
  patients: Patient[];
  therapists: Therapist[];
  
  // State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  error: string | null;
  filter: CertificationsFilter;
  
  // Modal state
  isModalOpen: boolean;
  modalMode: 'view' | 'edit' | 'create';
  
  // Actions
  loadCertifications: (filter?: CertificationsFilter) => Promise<void>;
  createCertification: (data: CreateCertificationRequest) => Promise<CertificationDocument>;
  updateCertification: (id: string, data: UpdateCertificationRequest) => Promise<CertificationDocument>;
  deleteCertification: (id: string) => Promise<void>;
  submitCertification: (id: string) => Promise<CertificationDocument>;
  selectCertification: (certification: CertificationDocument | null) => void;
  setFilter: (filter: CertificationsFilter) => void;
  clearError: () => void;
  refreshCertifications: () => Promise<void>;
  
  // Modal actions
  openModal: (mode: 'view' | 'edit' | 'create', certification?: CertificationDocument) => void;
  closeModal: () => void;
  viewCertification: (certification: CertificationDocument) => void;
  editCertification: (certification: CertificationDocument) => void;
  createNewCertification: () => void;
  
  // Utilities
  getCertificationById: (id: string) => CertificationDocument | undefined;
  getCertificationsByPatient: (patientId: string) => CertificationDocument[];
  getCertificationsByTherapist: (therapistId: string) => CertificationDocument[];
  getCertificationsByStatus: (status: CertificationStatus) => CertificationDocument[];
  getCurrentMonthCertifications: () => CertificationDocument[];
  getPendingCertifications: () => CertificationDocument[];
  getOverdueCertifications: () => CertificationDocument[];
  
  // Patient & Therapist utilities
  loadPatients: () => Promise<void>;
  loadTherapists: () => Promise<void>;
  getPatientById: (id: string) => Patient | undefined;
  getTherapistById: (id: string) => Therapist | undefined;
}

// Approval Types (for admin features)
export interface CertificationApprovalProps {
  certification: CertificationDocument;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onRequestRevision: (id: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

// Export Types
export interface CertificationExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: CertificationsFilter;
  includeDetails?: boolean;
  includeSessions?: boolean;
}

// Pagination Types
export interface CertificationPaginationRequest {
  page: number;
  pageSize: number;
  month?: number;
  year?: number;
  search?: string;
}

// Month/Year selector types
export interface MonthYearSelectorProps {
  selectedMonth?: number;
  selectedYear?: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  className?: string;
}

// Status badge types
export interface CertificationStatusBadgeProps {
  status: CertificationStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
