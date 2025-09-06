// Secure Private Route Component with Role-Based Access
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ProtectedRouteProps } from "../types/auth.types";
import { UserRole } from "../types/auth.types";
import DashboardLoading from "../../../pages/DashboardLoading";
import PatientsLoading from "../../../pages/PatientsLoading";
import CertificationsLoading from "../../../pages/CertificationsLoading";
import SessionsLoading from "../../../pages/SessionsLoading";

/**
 * Private Route Component with Role-Based Access Control
 * ✅ SECURE: Validates authentication and authorization
 */
export function PrivateRoute({
  children,
  requiredRoles = [],
  requireAuth = true,
  fallback = null,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // ✅ INDUSTRY STANDARD: Show skeleton loading while checking authentication
  // Maintains exact same layout structure with skeleton content
  if (isLoading) {
    // Determine which skeleton to show based on the route
    const pathname = location.pathname;

    if (pathname === "/dashboard" || pathname === "/") {
      return <DashboardLoading />;
    }

    if (pathname === "/patients") {
      return <PatientsLoading />;
    }

    if (pathname === "/certifications") {
      return <CertificationsLoading />;
    }

    if (pathname === "/sessions") {
      return <SessionsLoading />;
    }

    // For other routes, show dashboard skeleton as fallback
    return <DashboardLoading />;
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role-based authorization
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      // User doesn't have required role
      return fallback || <Navigate to="/access-denied" replace />;
    }
  }

  // All checks passed - render children
  return <>{children}</>;
}

/**
 * Admin Only Route
 * ✅ SECURE: Restricts access to admin users only
 */
export function AdminRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, "requiredRoles">) {
  return (
    <PrivateRoute requiredRoles={[UserRole.ADMIN]} {...props}>
      {children}
    </PrivateRoute>
  );
}

/**
 * Therapist Route (Admin + Therapist)
 * ✅ SECURE: Allows admin and therapist access
 */
export function TherapistRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, "requiredRoles">) {
  return (
    <PrivateRoute
      requiredRoles={[UserRole.ADMIN, UserRole.THERAPIST]}
      {...props}
    >
      {children}
    </PrivateRoute>
  );
}

/**
 * Patient Route (Patient only)
 * ✅ SECURE: Restricts access to patient users
 */
export function PatientRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, "requiredRoles">) {
  return (
    <PrivateRoute requiredRoles={[UserRole.PATIENT]} {...props}>
      {children}
    </PrivateRoute>
  );
}

export default PrivateRoute;
