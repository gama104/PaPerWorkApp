import { useState, useCallback } from 'react';
import { signatureService } from '../services/signatureService';
import { useNotificationHelpers } from '../../../shared/components/ui/NotificationSystem';
import type { TherapySession } from '../types/session.types';

// Interface for signature hook return type (Interface Segregation Principle)
export interface UseSignatureReturn {
  isSigning: boolean;
  signSession: (sessionId: string, signatureData: string) => Promise<boolean>;
  updateSignature: (sessionId: string, signatureData: string) => Promise<boolean>;
}

// Custom hook for signature operations (Single Responsibility Principle)
export const useSignature = (): UseSignatureReturn => {
  const [isSigning, setIsSigning] = useState(false);
  const { showSuccess, showError } = useNotificationHelpers();

  const signSession = useCallback(async (sessionId: string, signatureData: string): Promise<boolean> => {
    if (!sessionId || !signatureData) {
      showError('Invalid Data', 'Session ID and signature data are required.');
      return false;
    }

    setIsSigning(true);
    try {
      await signatureService.signSession(sessionId, signatureData);
      showSuccess('Session Signed', 'The session has been successfully signed.');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError('Signing Failed', errorMessage);
      return false;
    } finally {
      setIsSigning(false);
    }
  }, [showSuccess, showError]);

  const updateSignature = useCallback(async (sessionId: string, signatureData: string): Promise<boolean> => {
    if (!sessionId || !signatureData) {
      showError('Invalid Data', 'Session ID and signature data are required.');
      return false;
    }

    setIsSigning(true);
    try {
      await signatureService.updateSessionSignature(sessionId, signatureData);
      showSuccess('Signature Updated', 'The signature has been successfully updated.');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError('Update Failed', errorMessage);
      return false;
    } finally {
      setIsSigning(false);
    }
  }, [showSuccess, showError]);

  return {
    isSigning,
    signSession,
    updateSignature,
  };
};
