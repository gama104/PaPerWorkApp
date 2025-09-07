// Sessions Feature Exports
// Main entry point for the sessions feature

// Hooks
export { useSessions } from './hooks/useSessions';

// Components
export { SessionsDashboard } from './components/SessionsDashboard';
export { SessionForm } from './components/SessionForm';
export { SessionList } from './components/SessionList';
export { SessionsList } from './components/SessionsList';
export { SessionModal } from './components/SessionModal';
export { SessionView } from './components/SessionView';
export { SessionsFilter } from './components/SessionsFilter';
export { LargeSignatureModal } from './components/LargeSignatureModal';
export { CertificationSelectionModal } from './components/CertificationSelectionModal';

// Pages
export { default as SessionsPage } from './pages/SessionsPage';

// Services
export { sessionService } from './services/sessionService';

// Types
export type {
  TherapySession,
  ParentSignatureStatus,
  SessionFormData,
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionsFilter,
  SessionsResponse,
  SessionStats,
  SessionsState,
  SessionModalProps,
  SessionFormProps,
  SessionListProps,
  SessionCardProps,
  SessionsFilterProps,
  SessionsDashboardProps,
  SignatureData,
  SignatureModalProps,
  UseSessionsOptions,
  UseSessionsReturn,
} from './types/session.types';


