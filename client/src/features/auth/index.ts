// Auth Feature Exports
// Main entry point for the auth feature

// Context & Hooks
export { AuthProvider, useAuth } from './context/AuthContext';
export { usePermissions } from './hooks/usePermissions';

// Components
export { PrivateRoute, AdminRoute, TherapistRoute, PatientRoute } from './components/PrivateRoute';
export { LoginForm } from './components/LoginForm';

// Services
export { authService } from './services/authService';
export { tokenService } from './services/tokenService';

// Types
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthState,
  AuthContextType,
  ProtectedRouteProps,
  Permission,
  ChangePasswordRequest,
  PasswordResetRequest,
} from './types/auth.types';

// Enums (need to be exported as values, not types)
export { UserRole } from './types/auth.types';
