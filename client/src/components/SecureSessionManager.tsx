// Industry-Standard Secure Session Manager
// Implements OWASP guidelines and industry best practices
import React from "react";
import { useAuth } from "../features/auth";
import { useSecureSession } from "../hooks/useSecureSession";
import { SessionTimeoutModal } from "./SessionTimeoutModal";

interface SecureSessionManagerProps {
  children: React.ReactNode;
}

export const SecureSessionManager: React.FC<SecureSessionManagerProps> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();

  // Industry-standard session configuration
  // For development: shorter timeouts for easier testing
  // For production: use OWASP recommended values
  const isDevelopment = process.env.NODE_ENV === "development";

  const sessionConfig = {
    idleTimeout: isDevelopment ? 2 * 60 * 1000 : 15 * 60 * 1000, // 2 min dev, 15 min prod
    absoluteTimeout: 24 * 60 * 60 * 1000, // 24 hours (OWASP recommended)
    warningTime: isDevelopment ? 30 * 1000 : 2 * 60 * 1000, // 30 sec dev, 2 min prod
    checkInterval: 10 * 1000, // Check every 10 seconds
  };

  // Initialize secure session management only when authenticated
  const { isModalOpen, modalTimeLeft, onExtendSession, onLogout } =
    useSecureSession(isAuthenticated ? sessionConfig : {});

  return (
    <>
      {children}
      <SessionTimeoutModal
        isOpen={isModalOpen}
        remainingTime={modalTimeLeft}
        onExtendSession={onExtendSession}
        onLogout={onLogout}
      />
    </>
  );
};

export default SecureSessionManager;
