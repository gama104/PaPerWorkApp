// Welcome Modal Hook - Manages welcome modal state after login
import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth';

export function useWelcomeModal() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Show welcome modal after successful login
  useEffect(() => {
    if (isAuthenticated && user && !hasShownWelcome) {
      // Small delay to ensure smooth transition from login
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShownWelcome(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, hasShownWelcome]);

  // Reset welcome state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setHasShownWelcome(false);
      setIsOpen(false);
    }
  }, [isAuthenticated]);

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    closeModal,
    userName: user?.firstName || user?.email || 'User'
  };
}

export default useWelcomeModal;
