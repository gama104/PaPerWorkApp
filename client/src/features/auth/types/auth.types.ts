// Auth Feature Types - Security-First Design

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  profileImageUrl?: string;
  specialty?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  signatureData?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  THERAPIST = 'therapist',
  PATIENT = 'patient'
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  specialty?: string;
  licenseNumber?: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;  // ⚠️ In memory only - never persisted
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TokenRefreshResponse {
  token: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Route Protection Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

// Auth Context Types
export interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  refreshToken: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  clearError: () => void;
  
  // Utilities
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  getToken: () => string | null;
}

// Permission Types
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  condition?: (user: User, resource?: any) => boolean;
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[];
  [UserRole.THERAPIST]: Permission[];
  [UserRole.PATIENT]: Permission[];
}
