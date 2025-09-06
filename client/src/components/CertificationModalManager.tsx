import React, { useState, useEffect, useCallback } from "react";
import type {
  ViewState,
  ViewHistoryItem,
  ModalHeaderConfig,
  FooterButtonConfig,
  CertificationFormMode,
  SessionFormMode,
} from "../types/CertificationTypes";
import type { CertificationDocument, BackendTherapySession } from "../types";
import { CertificationService } from "../services/certificationService";
import { SessionService } from "../services/sessionService";

// Import existing components (will be refactored later)
import CertificationDetailsView from "./CertificationDetailsView";
import CertificationEditForm from "./CertificationEditForm";
import TherapySessionsList from "./TherapySessionsList";
import TherapySessionFormContent from "./TherapySessionFormContent";
import SessionDetailsView from "./SessionDetailsView";

interface CertificationModalManagerProps {
  certificationId: string;
  onClose: () => void;
  onCertificationUpdated?: (certification: CertificationDocument) => void;
  onSessionCreated?: (session: BackendTherapySession) => void;
  onSessionUpdated?: (session: BackendTherapySession) => void;
  onSessionDeleted?: (sessionId: string) => void;
}

export default function CertificationModalManager({
  certificationId,
  onClose,
  onCertificationUpdated,
  onSessionCreated,
  onSessionUpdated,
  onSessionDeleted,
}: CertificationModalManagerProps) {
  // State management
  const [viewState, setViewState] = useState<ViewState>({
    type: "certificationView",
    certificationId,
  });

  const [history, setHistory] = useState<ViewHistoryItem[]>([
    {
      type: "certificationView",
      certificationId,
      title: "Certification Details",
    },
  ]);

  const [certification, setCertification] =
    useState<CertificationDocument | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<BackendTherapySession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitCertificationForm, setSubmitCertificationForm] = useState<
    (() => void) | null
  >(null);

  // Load certification data
  useEffect(() => {
    loadCertification();
  }, [certificationId]);

  // Reset submit function when view changes
  useEffect(() => {
    if (viewState.type !== "certificationEdit") {
      setSubmitCertificationForm(null);
    }
  }, [viewState.type]);

  const loadCertification = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading certification with ID:", certificationId);
      const data = await CertificationService.getCertification(certificationId);
      console.log("Certification data received:", data);
      setCertification(data);
    } catch (err) {
      console.error("Error loading certification:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load certification"
      );
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const navigateTo = useCallback((newState: ViewState, title: string) => {
    setViewState(newState);
    setHistory((prev) => [
      ...prev,
      {
        type: newState.type,
        certificationId: newState.certificationId,
        sessionId: "sessionId" in newState ? newState.sessionId : undefined,
        title,
      },
    ]);
  }, []);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previousState = newHistory[newHistory.length - 1];
      setHistory(newHistory);

      // Reconstruct the previous view state
      if (previousState.type === "certificationView") {
        setViewState({
          type: "certificationView",
          certificationId: previousState.certificationId,
        });
      } else if (previousState.type === "sessionList") {
        setViewState({
          type: "sessionList",
          certificationId: previousState.certificationId,
        });
      } else if (
        previousState.type === "sessionView" &&
        previousState.sessionId
      ) {
        setViewState({
          type: "sessionView",
          sessionId: previousState.sessionId,
          certificationId: previousState.certificationId,
        });
      }
    }
  }, [history]);

  // View state transitions
  const goToCertificationEdit = useCallback(() => {
    navigateTo(
      { type: "certificationEdit", certificationId },
      "Edit Certification"
    );
  }, [navigateTo]);

  const goToSessionList = useCallback(() => {
    navigateTo({ type: "sessionList", certificationId }, "Therapy Sessions");
  }, [navigateTo, certificationId]);

  const goToSessionCreate = useCallback(() => {
    navigateTo({ type: "sessionCreate", certificationId }, "Add Session");
  }, [navigateTo, certificationId]);

  const goToSessionView = useCallback(
    (session: BackendTherapySession) => {
      setSelectedSession(session);
      navigateTo(
        { type: "sessionView", sessionId: session.id, certificationId },
        "Session Details"
      );
    },
    [navigateTo, certificationId]
  );

  const goToSessionEdit = useCallback(
    (session: BackendTherapySession) => {
      setSelectedSession(session);
      navigateTo(
        { type: "sessionEdit", sessionId: session.id, certificationId },
        "Edit Session"
      );
    },
    [navigateTo, certificationId]
  );

  // Action handlers
  const handleCertificationUpdate = async (data: any) => {
    try {
      setLoading(true);
      const updated = await CertificationService.updateCertification(
        certificationId,
        data
      );
      setCertification(updated);
      onCertificationUpdated?.(updated);

      // Go back to certification view
      navigateTo(
        { type: "certificationView", certificationId },
        "Certification Details"
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update certification"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSave = async (sessionData: any) => {
    try {
      setLoading(true);
      let session: BackendTherapySession;

      if (viewState.type === "sessionCreate") {
        session = await SessionService.createSession(sessionData);
        onSessionCreated?.(session);
        // Go back to session list
        navigateTo(
          { type: "sessionList", certificationId },
          "Therapy Sessions"
        );
      } else if (viewState.type === "sessionEdit" && selectedSession) {
        session = await SessionService.updateSession(
          selectedSession.id,
          sessionData
        );
        onSessionUpdated?.(session);
        // Go back to session view
        navigateTo(
          { type: "sessionView", sessionId: session.id, certificationId },
          "Session Details"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save session");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionDelete = async () => {
    if (!selectedSession) return;

    try {
      setLoading(true);
      await SessionService.deleteSession(selectedSession.id);
      onSessionDeleted?.(selectedSession.id);

      // Go back to session list
      navigateTo({ type: "sessionList", certificationId }, "Therapy Sessions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete session");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      const blob = await CertificationService.downloadPdf(certificationId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certification-${certificationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      setLoading(false);
    }
  };

  // Get current header configuration
  const getHeaderConfig = (): ModalHeaderConfig => {
    const currentHistory = history[history.length - 1];

    switch (viewState.type) {
      case "certificationView":
        return {
          title: "Certification Details",
          subtitle: certification?.patient?.fullName
            ? `for ${certification.patient.fullName}`
            : undefined,
          showBackButton: false,
        };

      case "certificationEdit":
        return {
          title: "Edit Certification",
          subtitle: certification?.patient?.fullName
            ? `for ${certification.patient.fullName}`
            : undefined,
          showBackButton: true,
          onBack: goBack,
        };

      case "sessionList":
        return {
          title: "Therapy Sessions",
          subtitle: "Manage therapy sessions for this certification",
          showBackButton: true,
          onBack: goBack,
        };

      case "sessionCreate":
        return {
          title: "Add Session",
          subtitle: "Create a new therapy session",
          showBackButton: true,
          onBack: goBack,
        };

      case "sessionView":
        return {
          title: "Session Details",
          subtitle: selectedSession
            ? `Session on ${new Date(
                selectedSession.sessionDate
              ).toLocaleDateString()}`
            : undefined,
          showBackButton: true,
          onBack: goBack,
        };

      case "sessionEdit":
        return {
          title: "Edit Session",
          subtitle: selectedSession
            ? `Session on ${new Date(
                selectedSession.sessionDate
              ).toLocaleDateString()}`
            : undefined,
          showBackButton: true,
          onBack: goBack,
        };

      default:
        return {
          title: "Certification",
          showBackButton: false,
        };
    }
  };

  // Get current footer button configuration
  const getFooterConfig = (): FooterButtonConfig => {
    switch (viewState.type) {
      case "certificationView":
        return {
          primary: {
            text: "Edit",
            onClick: goToCertificationEdit,
            variant: "primary",
          },
          secondary: {
            text: "View Sessions",
            onClick: goToSessionList,
            variant: "secondary",
          },
          tertiary: {
            text: "Download PDF",
            onClick: () => handleDownloadPdf(),
            variant: "secondary",
          },
        };

      case "certificationEdit":
        return {
          primary: {
            text: "Save",
            onClick: () => {
              if (submitCertificationForm) {
                submitCertificationForm();
              }
            },
            variant: "success",
            disabled: loading,
          },
          secondary: {
            text: "Cancel",
            onClick: goBack,
            variant: "secondary",
          },
        };

      case "sessionList":
        return {
          primary: {
            text: "Add Session",
            onClick: goToSessionCreate,
            variant: "primary",
          },
        };

      case "sessionCreate":
        return {
          primary: {
            text: "Create Session",
            onClick: () => {
              /* Will be handled by form submission */
            },
            variant: "success",
            disabled: loading,
          },
          secondary: {
            text: "Cancel",
            onClick: goBack,
            variant: "secondary",
          },
        };

      case "sessionView":
        return {
          primary: {
            text: "Edit",
            onClick: () => selectedSession && goToSessionEdit(selectedSession),
            variant: "primary",
          },
        };

      case "sessionEdit":
        return {
          primary: {
            text: "Save",
            onClick: () => {
              /* Will be handled by form submission */
            },
            variant: "success",
            disabled: loading,
          },
          secondary: {
            text: "Delete",
            onClick: handleSessionDelete,
            variant: "danger",
          },
          tertiary: {
            text: "Cancel",
            onClick: goBack,
            variant: "secondary",
          },
        };

      default:
        return {};
    }
  };

  // Render content based on current view state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Error
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {error}
            </p>
            <button
              onClick={loadCertification}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!certification) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Certification not found
            </p>
          </div>
        </div>
      );
    }

    switch (viewState.type) {
      case "certificationView":
        return (
          <CertificationDetailsView
            certification={certification}
            onEdit={goToCertificationEdit}
            onViewSessions={goToSessionList}
          />
        );

      case "certificationEdit":
        return (
          <CertificationEditForm
            certification={certification}
            onSave={handleCertificationUpdate}
            onCancel={goBack}
            onFormReady={setSubmitCertificationForm}
          />
        );

      case "sessionList":
        return (
          <TherapySessionsList
            certification={certification}
            onSessionSelect={goToSessionView}
            onAddSession={goToSessionCreate}
            showFooter={false} // We'll handle footer in the manager
          />
        );

      case "sessionCreate":
        return (
          <TherapySessionFormContent
            certificationId={certificationId}
            editSession={null}
            onSave={handleSessionSave}
          />
        );

      case "sessionView":
        return selectedSession ? (
          <SessionDetailsView session={selectedSession} />
        ) : null;

      case "sessionEdit":
        return selectedSession ? (
          <TherapySessionFormContent
            certificationId={certificationId}
            editSession={selectedSession}
            onSave={handleSessionSave}
          />
        ) : null;

      default:
        return null;
    }
  };

  const headerConfig = getHeaderConfig();
  const footerConfig = getFooterConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              {headerConfig.showBackButton && headerConfig.onBack && (
                <button
                  onClick={headerConfig.onBack}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {headerConfig.title}
                </h2>
                {headerConfig.subtitle && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {headerConfig.subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">{renderContent()}</div>

        {/* Footer */}
        {Object.keys(footerConfig).length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
            <div className="flex justify-center space-x-3">
              {footerConfig.primary && (
                <button
                  onClick={footerConfig.primary.onClick}
                  disabled={footerConfig.primary.disabled}
                  className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    footerConfig.primary.variant === "primary"
                      ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                      : footerConfig.primary.variant === "success"
                      ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                      : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  }`}
                >
                  {footerConfig.primary.text}
                </button>
              )}

              {footerConfig.secondary && (
                <button
                  onClick={footerConfig.secondary.onClick}
                  className={`px-4 py-2 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    footerConfig.secondary.variant === "secondary"
                      ? "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-blue-500"
                      : "text-white bg-red-600 border-red-600 hover:bg-red-700 focus:ring-red-500"
                  }`}
                >
                  {footerConfig.secondary.text}
                </button>
              )}

              {footerConfig.tertiary && (
                <button
                  onClick={footerConfig.tertiary.onClick}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {footerConfig.tertiary.text}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
