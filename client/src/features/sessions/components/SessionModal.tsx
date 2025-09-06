import React, { useEffect, useState } from "react";
import { BaseModal } from "../../../shared/components/ui/BaseModal";
import { SessionView } from "./SessionView";
import { SessionForm } from "./SessionForm";
import { SessionList } from "./SessionList";
import { useModal, useApi } from "../../../shared/hooks";
import type { TherapySession } from "../types/session.types";
import type { SessionFormData } from "../../../shared/types/ModalTypes";
import { sessionService } from "../services/sessionService";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificationId?: string;
  sessionId?: string;
  mode?: "list" | "view" | "edit" | "create";
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  certificationId,
  sessionId,
  mode = "list",
}) => {
  const { state, actions } = useModal();
  const { loading, error, success, execute, clearMessages } = useApi();

  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [currentSession, setCurrentSession] =
    useState<TherapySession | null>(null);
  const [currentMode, setCurrentMode] = useState<
    "list" | "view" | "edit" | "create"
  >(mode);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load sessions for the certification
  useEffect(() => {
    if (
      isOpen &&
      certificationId &&
      (currentMode === "list" || currentMode === "create")
    ) {
      loadSessions();
    }
  }, [isOpen, certificationId, currentMode]);

  // Load specific session
  useEffect(() => {
    if (
      isOpen &&
      sessionId &&
      (currentMode === "view" || currentMode === "edit") &&
      !currentSession // Only load if we don't already have session data
    ) {
      loadSession();
    }
  }, [isOpen, sessionId, currentMode]);

  const loadSessions = async () => {
    if (!certificationId) return;

    setIsLoadingData(true);
    try {
      const data = await TherapySessionService.getSessionsByCertification(
        certificationId
      );
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadSession = async () => {
    const idToLoad = currentSession?.id || sessionId;
    if (!idToLoad) return;

    setIsLoadingData(true);
    try {
      const data = await TherapySessionService.getSession(idToLoad);
      setCurrentSession(data);
    } catch (err) {
      console.error("Failed to load session:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Handle mode changes
  const handleViewSession = (session: BackendTherapySession) => {
    setCurrentSession(session);
    setCurrentMode("view");
  };

  const handleEditSession = () => {
    setCurrentMode("edit");
  };

  const handleCreateSession = () => {
    setCurrentMode("create");
  };

  const handleBackToList = () => {
    setCurrentSession(null);
    setCurrentMode("list");
  };

  const handleCancel = () => {
    if (currentMode === "create") {
      handleBackToList();
    } else if (currentMode === "edit") {
      setCurrentMode("view");
    }
  };

  const handleDeleteSession = async () => {
    if (!currentSession?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this session? This action cannot be undone."
    );
    if (!confirmed) return;

    await execute(
      () => TherapySessionService.deleteSession(currentSession.id),
      {
        successMessage: "Session deleted successfully",
        onSuccess: () => {
          handleBackToList();
          loadSessions(); // Refresh the list
        },
      }
    );
  };

  const handleSaveSession = async (formData: SessionFormData) => {
    if (currentMode === "create") {
      await execute(() => TherapySessionService.createSession(formData), {
        successMessage: "Session created successfully",
        onSuccess: (newSession) => {
          setCurrentSession(newSession);
          setCurrentMode("view");
          loadSessions(); // Refresh the list
        },
      });
    } else if (currentMode === "edit" && currentSession?.id) {
      await execute(
        () => TherapySessionService.updateSession(currentSession.id, formData),
        {
          successMessage: "Session updated successfully",
          onSuccess: async () => {
            // Reload session data to ensure we have the latest
            await loadSession();
            setCurrentMode("view");
            loadSessions(); // Refresh the list
          },
        }
      );
    }
  };

  // Get header configuration
  const getHeaderConfig = () => {
    switch (currentMode) {
      case "create":
        return {
          title: "Create New Session",
          subtitle: "Add a new therapy session",
          showBackButton: true,
          onBack: handleBackToList,
          showCloseButton: true,
        };
      case "edit":
        return {
          title: "Edit Session",
          subtitle: "Modify the session details",
          showBackButton: true,
          onBack: () => setCurrentMode("view"),
          showCloseButton: true,
        };
      case "view":
        return {
          title: "Session Details",
          subtitle: currentSession
            ? `${new Date(
                currentSession.sessionDate
              ).toLocaleDateString()} at ${new Date(
                `2000-01-01T${currentSession.sessionTime}`
              ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "",
          showBackButton: true,
          onBack: handleBackToList,
          showCloseButton: true,
        };
      default:
        return {
          title: "Therapy Sessions",
          subtitle: "Manage therapy sessions for this certification",
          showBackButton: true,
          onBack: onClose,
          showCloseButton: true,
        };
    }
  };

  // Get footer configuration
  const getFooterConfig = () => {
    switch (currentMode) {
      case "create":
        return {
          buttons: [
            {
              label: "Cancel",
              variant: "secondary" as const,
              onClick: handleCancel,
            },
            {
              label: "Create",
              variant: "primary" as const,
              onClick: () => {
                // Form submission is handled by the form component
                const form = document.getElementById(
                  "session-form"
                ) as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              },
              loading: loading,
              type: "submit" as const,
            },
          ],
        };
      case "edit":
        return {
          buttons: [
            {
              label: "Delete",
              variant: "danger" as const,
              onClick: handleDeleteSession,
            },
            {
              label: "Cancel",
              variant: "secondary" as const,
              onClick: handleCancel,
            },
            {
              label: "Save",
              variant: "primary" as const,
              onClick: () => {
                // Form submission is handled by the form component
                const form = document.getElementById(
                  "session-form"
                ) as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              },
              loading: loading,
              type: "submit" as const,
            },
          ],
          buttonAlignment: "space-between",
        };
      case "view":
        return {
          buttons: [
            {
              label: "Edit",
              variant: "primary" as const,
              onClick: handleEditSession,
            },
          ],
        };
      default:
        return {
          buttons: [],
        };
    }
  };

  // Render content based on mode
  const renderContent = () => {
    if (isLoadingData) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    switch (currentMode) {
      case "create":
        if (!certificationId) {
          return (
            <div className="p-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>No certification ID provided</p>
              </div>
            </div>
          );
        }
        return (
          <SessionForm
            key={`create-${certificationId}`}
            data={undefined}
            onSubmit={handleSaveSession}
            onCancel={handleCancel}
            isLoading={loading}
            error={error}
            mode="create"
            certificationDocumentId={certificationId}
          />
        );
      case "edit":
        if (!currentSession) {
          return (
            <div className="p-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>No session data available for editing</p>
              </div>
            </div>
          );
        }
        // Convert date from ISO format to yyyy-MM-dd for HTML date input
        const formatDateForInput = (isoDate: string) => {
          return isoDate.split("T")[0]; // Extract just the date part
        };

        // Convert time from 24-hour format to HH:mm format for HTML time input
        const formatTimeForInput = (time24: string) => {
          // Remove seconds if present (e.g., "16:30:00" -> "16:30")
          const [hours, minutes] = time24.split(":");
          return `${hours}:${minutes}`;
        };

        const formData = {
          certificationDocumentId: currentSession.certificationDocumentId,
          sessionDate: formatDateForInput(currentSession.sessionDate),
          sessionTime: formatTimeForInput(currentSession.sessionTime),
          location: currentSession.location,
          transportationRequired: currentSession.transportationRequired,
          parentSignatureStatus: currentSession.parentSignatureStatus,
          signatureImageData: currentSession.signatureImageData || "",
          notes: currentSession.notes || "",
        };

        return (
          <SessionForm
            key={`edit-${currentSession.id}`}
            data={formData}
            onSubmit={handleSaveSession}
            onCancel={handleCancel}
            isLoading={loading}
            error={error}
            mode="edit"
            certificationDocumentId={currentSession.certificationDocumentId}
          />
        );
      case "view":
        return (
          <SessionView
            data={currentSession}
            onEdit={handleEditSession}
            onDelete={handleDeleteSession}
            onClose={onClose}
            isLoading={isLoadingData}
            error={error}
          />
        );
      default:
        return (
          <SessionList
            sessions={sessions}
            onSessionClick={handleViewSession}
            onAddSession={handleCreateSession}
            isLoading={isLoadingData}
            error={error}
          />
        );
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={getHeaderConfig().title}
      subtitle={getHeaderConfig().subtitle}
      headerConfig={getHeaderConfig()}
      footerConfig={getFooterConfig()}
      isLoading={isLoadingData}
      error={error}
      success={success}
      contentClassName="max-h-[80vh] overflow-y-auto"
    >
      {renderContent()}
    </BaseModal>
  );
};
