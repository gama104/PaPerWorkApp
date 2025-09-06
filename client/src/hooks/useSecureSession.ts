// Industry-Standard Secure Session Management Hook
// Based on OWASP guidelines and industry best practices
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../features/auth';

interface SecureSessionConfig {
  idleTimeout?: number; // Idle timeout in ms (default: 15 minutes)
  absoluteTimeout?: number; // Absolute timeout in ms (default: 24 hours)
  warningTime?: number; // Warning before logout in ms (default: 2 minutes)
  checkInterval?: number; // Check interval in ms (default: 30 seconds)
}

const DEFAULT_CONFIG: Required<SecureSessionConfig> = {
  idleTimeout: 15 * 60 * 1000, // 15 minutes (OWASP recommended)
  absoluteTimeout: 24 * 60 * 60 * 1000, // 24 hours (OWASP recommended)
  warningTime: 2 * 60 * 1000, // 2 minutes warning
  checkInterval: 30 * 1000, // Check every 30 seconds
};

// Activity tracking events (industry standard)
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove', 
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'keydown',
  'focus',
  'blur'
] as const;

export function useSecureSession(config: SecureSessionConfig = {}) {
  const { logout, isAuthenticated } = useAuth();
  const configRef = useRef({ ...DEFAULT_CONFIG, ...config });
  const lastActivityRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTimeLeft, setModalTimeLeft] = useState(0);

  // Update config when it changes
  useEffect(() => {
    configRef.current = { ...DEFAULT_CONFIG, ...config };
  }, [config]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (!isAuthenticated) return;
    
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    
    // Close modal if open
    setIsModalOpen(false);
    
    // Clear existing timeouts
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (warningTimeoutIdRef.current) {
      clearTimeout(warningTimeoutIdRef.current);
      warningTimeoutIdRef.current = null;
    }

    // Set new warning timeout
    warningTimeoutIdRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        showWarningModal();
      }
    }, configRef.current.idleTimeout - configRef.current.warningTime);

    // Set new logout timeout
    timeoutIdRef.current = setTimeout(() => {
      handleLogout('idle_timeout');
    }, configRef.current.idleTimeout);
  }, [isAuthenticated]);

  // Show warning modal
  const showWarningModal = useCallback(() => {
    const remainingTime = Math.ceil(configRef.current.warningTime / 1000);
    setModalTimeLeft(remainingTime);
    setIsModalOpen(true);
  }, []);

  // Handle extend session
  const handleExtendSession = useCallback(() => {
    setIsModalOpen(false);
    handleActivity();
  }, [handleActivity]);

  // Handle logout from modal
  const handleModalLogout = useCallback(() => {
    setIsModalOpen(false);
    handleLogout('user_requested');
  }, []);

  // Handle logout
  const handleLogout = useCallback(async (reason: string) => {
    try {
      console.log(`Session logout: ${reason}`);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout]);

  // Check session validity
  const checkSession = useCallback(() => {
    if (!isAuthenticated) return;

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    const timeSinceSessionStart = now - sessionStartRef.current;

    // Check absolute timeout (24 hours)
    if (timeSinceSessionStart >= configRef.current.absoluteTimeout) {
      handleLogout('absolute_timeout');
      return;
    }

    // Check idle timeout
    if (timeSinceLastActivity >= configRef.current.idleTimeout) {
      handleLogout('idle_timeout');
      return;
    }

    // Check if warning should be shown
    if (timeSinceLastActivity >= (configRef.current.idleTimeout - configRef.current.warningTime) && !warningShownRef.current) {
      warningShownRef.current = true;
      showWarningModal();
    }
  }, [isAuthenticated, handleLogout, showWarningModal]);

  // Set up session management
  useEffect(() => {
    if (!isAuthenticated) {
      // Reset session state when not authenticated
      lastActivityRef.current = Date.now();
      sessionStartRef.current = Date.now();
      warningShownRef.current = false;
      return;
    }

    // Reset session start time on authentication
    sessionStartRef.current = Date.now();
    lastActivityRef.current = Date.now();

    // Add activity event listeners
    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Set up periodic session check
    intervalIdRef.current = setInterval(checkSession, configRef.current.checkInterval);

    // Initial activity setup
    handleActivity();

    // Cleanup
    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (warningTimeoutIdRef.current) {
        clearTimeout(warningTimeoutIdRef.current);
      }
    };
  }, [isAuthenticated, handleActivity, checkSession]);

  // Manual session extension
  const extendSession = useCallback(() => {
    if (isAuthenticated) {
      handleActivity();
    }
  }, [isAuthenticated, handleActivity]);

  return {
    extendSession,
    // Modal props for the component
    isModalOpen,
    modalTimeLeft,
    onExtendSession: handleExtendSession,
    onLogout: handleModalLogout,
  };
}

export default useSecureSession;
