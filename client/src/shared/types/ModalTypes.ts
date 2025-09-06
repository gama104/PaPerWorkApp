import type { CertificationDocument, BackendTherapySession } from './TherapyTypes';

// Modal State Machine Types
export type ModalState = 
  | { type: 'closed' }
  | { type: 'certification-view'; certificationId: string }
  | { type: 'certification-edit'; certificationId: string }
  | { type: 'session-list'; certificationId: string }
  | { type: 'session-view'; sessionId: string }
  | { type: 'session-edit'; sessionId: string }
  | { type: 'session-create'; certificationId: string };

// Base Modal Props
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

// Modal Header Configuration
export interface ModalHeaderConfig {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}

// Modal Footer Configuration
export interface ModalFooterConfig {
  buttons: FooterButtonConfig[];
  className?: string;
  buttonAlignment?: 'left' | 'center' | 'right' | 'space-between';
}

export interface FooterButtonConfig {
  label: string;
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
}

// Form Props
export interface BaseFormProps<T> {
  data?: T;
  onSubmit: (data: T) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

// View Props
export interface BaseViewProps<T> {
  data: T | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
}

// Modal Navigation Actions
export interface ModalActions {
  openCertificationView: (id: string) => void;
  openCertificationEdit: (id: string) => void;
  openSessionList: (certificationId: string) => void;
  openSessionView: (id: string) => void;
  openSessionEdit: (id: string) => void;
  openSessionCreate: (certificationId: string) => void;
  close: () => void;
  goBack: () => void;
}

// Modal Context
export interface ModalContextType {
  state: ModalState;
  actions: ModalActions;
  history: ModalState[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Form Data Types
export interface CertificationFormData {
  patientId: string;
  month: string;
  year: number;
  therapyType: string;
  status: 'draft' | 'submitted' | 'completed';
  fileNumber?: string;
  isPrivate?: boolean;
  hasPrivatePlan?: boolean;
  isProvisionalRemedy?: boolean;
  frequencyPerWeek?: number;
  duration?: number;
  registrationNumber?: string;
  location?: string;
  specialistDate?: string;
  schedules?: Array<{
    dayOfWeek: number;
    startTime: string;
    location?: string;
  }>;
}

export interface SessionFormData {
  certificationDocumentId: string;
  sessionDate: string;
  sessionTime: string;
  location: string;
  transportationRequired: boolean;
  parentSignatureStatus: 'pending' | 'completed';
  signatureImageData?: string;
  notes?: string;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

// Navigation History
export interface NavigationHistory {
  push: (state: ModalState) => void;
  pop: () => ModalState | null;
  clear: () => void;
  canGoBack: () => boolean;
}