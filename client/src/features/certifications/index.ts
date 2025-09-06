// Certifications Feature Exports
// Main entry point for the certifications feature

// Hooks
export { useCertifications } from './hooks/useCertifications';

// Components
export { CertificationForm } from './components/CertificationForm';
export { CertificationModal } from './components/CertificationModal';
export { CertificationView } from './components/CertificationView';
export { CertificationCard } from './components/CertificationCard';
export { CertificationsList } from './components/CertificationsList';
export { CertificationsFilter } from './components/CertificationsFilter';

// Pages
export { default as CertificationsPage } from './pages/CertificationsPage';

// Services
export { certificationService } from './services/certificationService';

// Types
export type {
  CertificationDocument,
  Patient,
  Therapist,
  TherapySession,
  CertificationStatus,
  ParentSignatureStatus,
  CertificationFormData,
  CreateCertificationRequest,
  UpdateCertificationRequest,
  CertificationsFilter,
  CertificationsResponse,
  CertificationStats,
  CertificationsState,
  CertificationModalProps,
  CertificationFormProps,
  CertificationListProps,
  CertificationCardProps,
  CertificationsFilterProps,
  CertificationsDashboardProps,
  CertificationDetailsProps,
  CertificationApprovalProps,
  CertificationExportOptions,
  CertificationPaginationRequest,
  MonthYearSelectorProps,
  CertificationStatusBadgeProps,
  UseCertificationsOptions,
  UseCertificationsReturn,
} from './types/certification.types';

