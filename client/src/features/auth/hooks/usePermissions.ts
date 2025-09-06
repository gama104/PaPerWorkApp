// Permission Management Hook
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User, Permission } from '../types/auth.types';
import { UserRole } from '../types/auth.types';

// Define role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'patients:create',
    'patients:read',
    'patients:update',
    'patients:delete',
    'sessions:create',
    'sessions:read',
    'sessions:update',
    'sessions:delete',
    'certifications:create',
    'certifications:read',
    'certifications:update',
    'certifications:delete',
    'reports:read',
    'settings:update',
  ],
  [UserRole.THERAPIST]: [
    'patients:read',
    'patients:update',
    'sessions:create',
    'sessions:read',
    'sessions:update',
    'sessions:delete',
    'certifications:create',
    'certifications:read',
    'certifications:update',
    'certifications:delete',
    'profile:update',
  ],
  [UserRole.PATIENT]: [
    'sessions:read',
    'certifications:read',
    'profile:update',
  ],
};

export function usePermissions() {
  const { user, hasRole, hasAnyRole } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  const canManageUsers = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  const canManagePatients = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.THERAPIST]);
  };

  const canManageSessions = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.THERAPIST]);
  };

  const canViewReports = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  const canAccessOwnData = (resourceUserId?: string): boolean => {
    if (!user || !resourceUserId) return false;
    return user.id === resourceUserId || hasRole(UserRole.ADMIN);
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageUsers,
    canManagePatients,
    canManageSessions,
    canViewReports,
    canAccessOwnData,
  };
}

export default usePermissions;
