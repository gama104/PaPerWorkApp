// Patient Feature Types - Comprehensive Type System

export interface Patient {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  conditionsTherapyTypes?: string;
  notes?: string;
  assignedTherapistId?: string;
  assignedTherapistName?: string;
  createdAt: string;
  lastModifiedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  
  // Related entities
  therapist?: Therapist;
  certifications?: CertificationDocument[];
  sessions?: TherapySession[];
}

export interface Therapist {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  isActive: boolean;
}

export interface CertificationDocument {
  id: string;
  patientId: string;
  month: number;
  year: number;
  totalSessions: number;
  completedSessions: number;
  status: string;
}

export interface TherapySession {
  id: string;
  certificationDocumentId: string;
  patientId: string;
  sessionDate: string;
  sessionTime: string;
  location: string;
  parentSignatureStatus: string;
}

export interface PatientFormData {
  fullName: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  medicalNotes?: string;
  allergies?: string;
  medications?: string;
  diagnosis?: string;
  isActive?: boolean;
}

export interface CreatePatientRequest extends PatientFormData {}

export interface UpdatePatientRequest extends Partial<PatientFormData> {
  id: string;
}

export interface PatientsFilter {
  search?: string;
  therapistId?: string;
  isActive?: boolean;
  city?: string;
  state?: string;
  ageRange?: {
    min?: number;
    max?: number;
  };
  hasActiveCertifications?: boolean;
  lastSessionAfter?: string;
  lastSessionBefore?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'fullName' | 'createdAt' | 'lastModifiedAt' | 'dateOfBirth' | 'city';
  sortDirection?: 'asc' | 'desc';
}

export interface PatientsResponse {
  patients: Patient[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PatientStats {
  totalPatients: number;
  activePatients: number;
  inactivePatients: number;
  newPatientsThisMonth: number;
  patientsWithActiveCertifications: number;
  averageAge: number;
  patientsPerTherapist: number;
}

// UI State Types
export interface PatientsState {
  patients: Patient[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  filter: PatientsFilter;
  stats: PatientStats | null;
}

// Modal Types
export interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  mode: 'create' | 'edit' | 'view';
  onSave?: (patientData: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  onEdit?: () => void;
}

// Form Types
export interface PatientFormProps {
  initialData?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

// List Types
export interface PatientListProps {
  patients: Patient[];
  isLoading?: boolean;
  onPatientClick?: (patient: Patient) => void;
  className?: string;
}

// Card Types
export interface PatientCardProps {
  patient: Patient;
  onClick?: () => void;
  showTherapist?: boolean;
  className?: string;
}

// Filter Types
export interface PatientsFilterProps {
  filter: PatientsFilter;
  onFilterChange: (filter: PatientsFilter) => void;
  onReset: () => void;
  isLoading?: boolean;
  therapists?: Therapist[];
}

// Dashboard Types
export interface PatientsDashboardProps {
  className?: string;
}

// Details Types
export interface PatientDetailsProps {
  patient: Patient;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewCertifications?: () => void;
  onViewSessions?: () => void;
  className?: string;
}

// Search Types
export interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  excludePatients?: string[];
  placeholder?: string;
  className?: string;
}

// Hook Types
export interface UsePatientsOptions {
  filter?: PatientsFilter;
  autoRefresh?: boolean;
  refreshInterval?: number;
  includeCertifications?: boolean;
  includeSessions?: boolean;
  includeTherapists?: boolean;
}

export interface UsePatientsReturn {
  // Data
  patients: Patient[];
  selectedPatient: Patient | null;
  stats: PatientStats | null;
  therapists: Therapist[];
  
  // State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  filter: PatientsFilter;
  
  // Actions
  loadPatients: (filter?: PatientsFilter) => Promise<void>;
  createPatient: (data: CreatePatientRequest) => Promise<Patient>;
  updatePatient: (id: string, data: UpdatePatientRequest) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;
  selectPatient: (patient: Patient | null) => void;
  setFilter: (filter: PatientsFilter) => void;
  clearError: () => void;
  refreshPatients: () => Promise<void>;
  
  // Utilities
  getPatientById: (id: string) => Patient | undefined;
  getPatientsByTherapist: (therapistId: string) => Patient[];
  getActivePatients: () => Patient[];
  getInactivePatients: () => Patient[];
  getNewPatientsThisMonth: () => Patient[];
  getPatientsWithActiveCertifications: () => Patient[];
  searchPatients: (query: string) => Patient[];
  
  // Therapist utilities
  loadTherapists: () => Promise<void>;
  getTherapistById: (id: string) => Therapist | undefined;
}

// Age calculation utility type
export interface PatientAge {
  years: number;
  months: number;
  days: number;
}

// Emergency contact types
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  isActive: boolean;
}

// Medical information types
export interface MedicalInfo {
  allergies?: string[];
  medications?: string[];
  diagnosis?: string[];
  notes?: string;
  lastUpdated?: string;
}

// Export Types
export interface PatientExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeInactive?: boolean;
  includeMedicalInfo?: boolean;
  includeEmergencyContacts?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: PatientsFilter;
}

// Pagination Types
export interface PatientPaginationRequest {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
}

// Status badge types
export interface PatientStatusBadgeProps {
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

