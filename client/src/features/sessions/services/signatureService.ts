import { sessionService } from './sessionService';
import type { TherapySession } from '../types/session.types';

// Interface for signature operations (Interface Segregation Principle)
export interface ISignatureService {
  signSession(sessionId: string, signatureData: string): Promise<void>;
  updateSessionSignature(sessionId: string, signatureData: string): Promise<TherapySession>;
}

// Signature service implementation (Single Responsibility Principle)
class SignatureService implements ISignatureService {
  /**
   * Signs a session with the provided signature data
   * @param sessionId - The ID of the session to sign
   * @param signatureData - Base64 encoded signature image data
   */
  async signSession(sessionId: string, signatureData: string): Promise<void> {
    try {
      // Only update signature-related fields to avoid overwriting other session data
      const updateRequest = {
        id: sessionId,
        signatureImageData: signatureData,
        parentSignatureStatus: "completed" as const,
      };

      await sessionService.updateSession(sessionId, updateRequest);
    } catch (error) {
      console.error('Failed to sign session:', error);
      throw new Error('Failed to sign session. Please try again.');
    }
  }

  /**
   * Updates a session's signature
   * @param sessionId - The ID of the session to update
   * @param signatureData - Base64 encoded signature image data
   * @returns Updated session data
   */
  async updateSessionSignature(sessionId: string, signatureData: string): Promise<TherapySession> {
    try {
      // Only update signature-related fields to avoid overwriting other session data
      const updateRequest = {
        id: sessionId,
        signatureImageData: signatureData,
        parentSignatureStatus: "completed" as const,
      };

      const updatedSession = await sessionService.updateSession(sessionId, updateRequest);
      return updatedSession;
    } catch (error) {
      console.error('Failed to update session signature:', error);
      throw new Error('Failed to update signature. Please try again.');
    }
  }
}

// Export singleton instance (Dependency Inversion Principle)
export const signatureService = new SignatureService();
