// App Content Component - Contains the main app content with welcome modal
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserRole } from "../features/auth/types/auth.types";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import { CertificationsPage } from "../features/certifications";
import { SessionsPage } from "../features/sessions";
import PatientsPage from "../features/patients/pages/PatientsPage";
import InviteCreate from "../pages/InviteCreate";
import InviteReset from "../pages/InviteReset";
import UserManagement from "../pages/UserManagement";
import UserProfile from "../components/UserProfile";
import { PrivateRoute } from "../features/auth/components/PrivateRoute";
import AccessDenied from "../pages/AccessDenied";
import { ErrorBoundary } from "../shared/components/feedback";
import { SecureSessionManager } from "./SecureSessionManager";
import WelcomeModal from "./WelcomeModal";
import { useWelcomeModal } from "../hooks/useWelcomeModal";

const AppContent: React.FC = () => {
  const { isOpen, closeModal, userName } = useWelcomeModal();

  return (
    <SecureSessionManager>
      <Router>
        <ErrorBoundary>
          <div className="App h-full">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/invite/create" element={<InviteCreate />} />
              <Route path="/invite/reset" element={<InviteReset />} />
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/certifications"
                element={
                  <PrivateRoute
                    requiredRoles={[UserRole.ADMIN, UserRole.THERAPIST]}
                  >
                    <CertificationsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sessions"
                element={
                  <PrivateRoute
                    requiredRoles={[UserRole.ADMIN, UserRole.THERAPIST]}
                  >
                    <SessionsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patients"
                element={
                  <PrivateRoute
                    requiredRoles={[UserRole.ADMIN, UserRole.THERAPIST]}
                  >
                    <PatientsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user-management"
                element={
                  <PrivateRoute requiredRoles={[UserRole.ADMIN]}>
                    <UserManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </ErrorBoundary>
      </Router>
      <WelcomeModal isOpen={isOpen} onClose={closeModal} userName={userName} />
    </SecureSessionManager>
  );
};

export default AppContent;
