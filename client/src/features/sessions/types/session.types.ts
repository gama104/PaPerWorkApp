// Session Feature Types - Comprehensive Type System

export interface TherapySession {
  id: string;
  certificationDocumentId: string;
  certificationDocumentTitle?: string;
  patientName?: string;
  sessionDate: string;
  sessionTime: string;
  endTime?: string;
  location: string;
  transportationRequired: boolean;
  parentSignatureStatus: ParentSignatureStatus;
  notes?: string;
  therapistId: string;
  therapistName?: string;
  signatureImageData?: string;
  signatureName?: string;
  signatureNotes?: string;
  signatureDate?: string;
  createdAt: string;
  lastModifiedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  // Additional fields from backend
  patientId?: string;
  certificationStatus?: string;
  fileNumber?: string;
  certificationLocation?: string;
}

export const ParentSignatureStatus = {
  PENDING: 'pending',
  SIGNED: 'signed',
  COMPLETED: 'completed',
  APPROVED: 'approved',
  NOT_REQUIRED: 'not_required',
  REFUSED: 'refused'
} as const;

export type ParentSignatureStatus = typeof ParentSignatureStatus[keyof typeof ParentSignatureStatus];

export interface SessionFormData {
  certificationDocumentId: string;
  sessionDate: string;
  sessionTime: string;
  endTime?: string;
  location: string;
  transportationRequired: boolean;
  parentSignatureStatus: ParentSignatureStatus;
  notes?: string;
  signatureImageData?: string;
  signatureName?: string;
  signatureNotes?: string;
}

export type CreateSessionRequest = SessionFormData;

export interface UpdateSessionRequest {
  id: string;
  sessionDate?: Date; // Date object
  sessionTime?: string; // Time format "HH:MM"
  endTime?: string; // Time format "HH:MM"
  location?: string;
  transportationRequired?: boolean;
  notes?: string;
  parentSignatureStatus?: ParentSignatureStatus;
  // Signature fields
  signatureImageData?: string;
  signatureName?: string;
  signatureNotes?: string;
}

export interface SessionsFilter {
  certificationId?: string;
  startDate?: string;
  endDate?: string;
  therapistId?: string;
  patientName?: string;
  location?: string;
  signatureStatus?: ParentSignatureStatus;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'sessionDate' | 'patientName' | 'location' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

export interface SessionsResponse {
  sessions: TherapySession[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  thisWeekSessions: number;
  thisMonthSessions: number;
  averageSessionsPerWeek: number;
}

// UI State Types
export interface SessionsState {
  sessions: TherapySession[];
  selectedSession: TherapySession | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  filter: SessionsFilter;
  stats: SessionStats | null;
}

// Modal Types
export interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: TherapySession | null;
  mode: 'create' | 'edit' | 'view';
  onSave?: (session: TherapySession) => void;
  onDelete?: (sessionId: string) => void;
}

// Form Types
export interface SessionFormProps {
  initialData?: Partial<SessionFormData>;
  onSubmit: (data: SessionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

// List Types
export interface SessionListProps {
  sessions: TherapySession[];
  isLoading?: boolean;
  onSessionClick?: (session: TherapySession) => void;
  onEditSession?: (session: TherapySession) => void;
  onDeleteSession?: (sessionId: string) => void;
  showPatientName?: boolean;
  showCertification?: boolean;
  className?: string;
}

// Card Types
export interface SessionCardProps {
  session: TherapySession;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showPatientName?: boolean;
  showCertification?: boolean;
  className?: string;
}

// Filter Types
export interface SessionsFilterProps {
  filter: SessionsFilter;
  onFilterChange: (filter: SessionsFilter) => void;
  onReset: () => void;
  isLoading?: boolean;
}

// Dashboard Types
export interface SessionsDashboardProps {
  className?: string;
}

// Signature Types
export interface SignatureData {
  imageData: string;
  name: string;
  notes?: string;
  date: string;
}

export interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: SignatureData) => void;
  existingSignature?: SignatureData;
  sessionId?: string;
}

// Hook Types
export interface UseSessionsOptions {
  filter?: SessionsFilter;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseSessionsReturn {
  // Data
  sessions: TherapySession[];
  selectedSession: TherapySession | null;
  stats: SessionStats | null;
  
  // State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  filter: SessionsFilter;
  
  // Actions
  loadSessions: (filter?: SessionsFilter) => Promise<void>;
  createSession: (data: CreateSessionRequest) => Promise<TherapySession>;
  updateSession: (id: string, data: UpdateSessionRequest) => Promise<TherapySession>;
  deleteSession: (id: string) => Promise<void>;
  selectSession: (session: TherapySession | null) => void;
  setFilter: (filter: SessionsFilter) => void;
  clearError: () => void;
  refreshSessions: () => Promise<void>;
  
  // Utilities
  getSessionById: (id: string) => TherapySession | undefined;
  getSessionsByDate: (date: string) => TherapySession[];
  getSessionsByPatient: (patientName: string) => TherapySession[];
  getTodaySessions: () => TherapySession[];
  getUpcomingSessions: () => TherapySession[];
}
