import React, { useState, useEffect, useRef } from "react";
import { BaseModal } from "../../../shared/components/ui/BaseModal";
import SignaturePad, { type SignaturePadRef } from "../../../components/SignaturePad";
import { sessionService } from "../services/sessionService";
import { useApi } from "../../../shared/hooks/useApi";
import type { TherapySession } from "../types/session.types";

interface LargeSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TherapySession | null;
}

/**
 * LargeSignatureModal - Handles all signature-related UI actions and state management
 * Follows Single Responsibility Principle by managing signature UI interactions
 */
export const LargeSignatureModal: React.FC<LargeSignatureModalProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  const { loading, error, success, execute } = useApi();
  const signaturePadRef = useRef<SignaturePadRef>(null);

  // State management following clean architecture principles
  const [originalSignature, setOriginalSignature] = useState<string>("");
  const [currentSignature, setCurrentSignature] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize signature data when session changes
  useEffect(() => {
    if (session) {
      const sessionSignature = session.signatureImageData || "";
      setOriginalSignature(sessionSignature);
      setCurrentSignature(sessionSignature);
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } else {
      setOriginalSignature("");
      setCurrentSignature("");
      setIsEditing(false);
      setHasUnsavedChanges(false);
    }
  }, [session]);

  // Handle signature changes from the signature pad
  const handleSignatureChange = (signature: string) => {
    setCurrentSignature(signature);
    setHasUnsavedChanges(signature !== originalSignature);
  };

  // Start editing mode
  const handleEditSignature = () => {
    setIsEditing(true);
    setHasUnsavedChanges(false);
  };

  // Clear the current signature
  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setCurrentSignature("");
    setHasUnsavedChanges(true);
  };

  // Accept and save the signature
  const handleAcceptSignature = async () => {
    if (!session) return;

    const signatureToSave =
      currentSignature || signaturePadRef.current?.getSignatureData() || "";

    await execute(
      async () => {
        const updatedSession = await TherapySessionService.updateSession(
          session.id,
          {
            certificationDocumentId: session.certificationDocumentId,
            sessionDate: session.sessionDate,
            sessionTime: session.sessionTime || "00:00:00",
            location: session.location || "",
            transportationRequired: session.transportationRequired || false,
            notes: session.notes || "",
            signatureImageData: signatureToSave,
            parentSignatureStatus: "completed",
          }
        );

        // Update the session object with new data
        Object.assign(session, updatedSession);

        return updatedSession;
      },
      {
        successMessage: "Signature saved successfully",
        onSuccess: () => {
          setOriginalSignature(signatureToSave);
          setCurrentSignature(signatureToSave);
          setIsEditing(false);
          setHasUnsavedChanges(false);
        },
      }
    );
  };

  // Cancel editing and revert to original signature
  const handleCancel = () => {
    setCurrentSignature(originalSignature);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  // Close modal and reset state
  const handleClose = () => {
    setCurrentSignature(originalSignature);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    onClose();
  };

  const getHeaderConfig = () => ({
    title: "Digital Signature",
    subtitle: "",
  });

  const getFooterConfig = () => {
    if (isEditing) {
      return {
        buttons: [
          {
            label: "Clear",
            variant: "secondary" as const,
            onClick: handleClearSignature,
          },
          {
            label: "Cancel",
            variant: "secondary" as const,
            onClick: handleCancel,
          },
          {
            label: "Accept & Save",
            variant: "primary" as const,
            onClick: handleAcceptSignature,
            loading: loading,
            disabled: !hasUnsavedChanges,
          },
        ],
        buttonAlignment: "space-between" as const,
      };
    } else {
      return {
        buttons: [
          {
            label: "Close",
            variant: "secondary" as const,
            onClick: handleClose,
          },
          {
            label: "Edit",
            variant: "primary" as const,
            onClick: handleEditSignature,
          },
        ],
      };
    }
  };

  if (!session) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={getHeaderConfig().title}
      subtitle={getHeaderConfig().subtitle}
      headerConfig={getHeaderConfig()}
      footerConfig={getFooterConfig()}
      isLoading={loading}
      error={error}
      success={success}
      contentClassName="max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        {isEditing ? (
          // Signature Pad for editing - clean, minimal layout
          <div className="bg-gray-50 dark:bg-gray-800 ">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Sign Here
            </h3>
            <SignaturePad
              ref={signaturePadRef}
              onSignatureChange={handleSignatureChange}
              initialSignature={currentSignature}
              className="w-full"
            />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              Use your finger or stylus to sign in the box above
            </p>
          </div>
        ) : (
          // Read-only signature display
          <div className="bg-white dark:bg-gray-800">
            {currentSignature ? (
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Current Signature
                </h3>
                <img
                  src={currentSignature}
                  alt="Current signature"
                  className="max-w-full h-auto max-h-64 mx-auto border border-gray-200 dark:border-gray-700 rounded"
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No signature yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Click "Edit" to add a signature
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
};
