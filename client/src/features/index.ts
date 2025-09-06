// Main Features Index
// Central export point for all application features

// Auth Feature
export * from './auth';

// Sessions Feature
export * from './sessions';

// Certifications Feature
export * from './certifications';

// Patients Feature
export * from './patients';

// Re-export commonly used types and hooks for convenience
export type { 
  User, 
  UserRole, 
  AuthContextType,
  LoginRequest,
  RegisterRequest 
} from './auth/types/auth.types';

export type {
  TherapySession,
  ParentSignatureStatus,
  SessionsFilter,
  SessionStats
} from './sessions/types/session.types';

export type {
  CertificationDocument,
  CertificationStatus,
  CertificationsFilter,
  CertificationStats,
  Patient as CertificationPatient,
  Therapist as CertificationTherapist
} from './certifications/types/certification.types';

export type {
  Patient,
  Therapist,
  PatientsFilter,
  PatientStats
} from './patients/types/patient.types';

// Re-export main hooks for convenience
export { useAuth } from './auth/hooks/useAuth';
export { useSessions } from './sessions/hooks/useSessions';
export { useCertifications } from './certifications/hooks/useCertifications';
export { usePatients } from './patients/hooks/usePatients';

// Re-export main services for convenience
export { authService } from './auth/services/authService';
export { sessionService } from './sessions/services/sessionService';
export { certificationService } from './certifications/services/certificationService';
export { patientService } from './patients/services/patientService';
