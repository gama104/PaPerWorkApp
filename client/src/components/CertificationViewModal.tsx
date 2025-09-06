import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CertificationSessionsView from "./CertificationSessionsView";
import TherapySessionContent from "./TherapySessionContent";
import TherapySessionFormContent from "./TherapySessionFormContent";
import CertificationEditForm from "./CertificationEditForm";
import type { CertificationDocument, BackendTherapySession } from "../types";
import type {
  CertificationViewState,
  NavigationHistory,
} from "../types/ModalTypes";
import { useResponsive } from "../hooks/useResponsive";

import CertificationService from "../services/certificationService";
import TherapySessionService from "../services/therapySessionService";

interface CertificationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification?: CertificationDocument | null;
  certificationId?: string;
  onDelete: (id: string) => void;
}

const CertificationViewModal: React.FC<CertificationViewModalProps> = ({
  isOpen,
  onClose,
  certification: propCertification,
  certificationId,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [isDownloading, setIsDownloading] = useState(false);
  const [certification, setCertification] =
    useState<CertificationDocument | null>(propCertification || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State machine for modal views
  const [viewState, setViewState] = useState<CertificationViewState>({
    type: "certification",
    certificationId: propCertification?.id || certificationId || "",
  });

  // Navigation history for back button
  const [history, setHistory] = useState<NavigationHistory>({
    stack: [],
  });

  // Session data state
  const [selectedSession, setSelectedSession] =
    useState<BackendTherapySession | null>(null);
  const [editingSession, setEditingSession] =
    useState<BackendTherapySession | null>(null);

  // Certification edit state
  const [submitCertificationForm, setSubmitCertificationForm] = useState<
    (() => void) | null
  >(null);

  // Load certification data if not provided as prop
  useEffect(() => {
    const loadCertification = async () => {
      if (!propCertification && certificationId && isOpen) {
        try {
          setLoading(true);
          setError(null);
          console.log("🔄 Loading certification with ID:", certificationId);
          const certData = await CertificationService.getCertification(
            certificationId
          );
          setCertification(certData);
          console.log("✅ Certification loaded:", certData);
        } catch (err) {
          console.error("❌ Error loading certification:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load certification"
          );
        } finally {
          setLoading(false);
        }
      }
    };

    loadCertification();
  }, [propCertification, certificationId, isOpen]);

  // Navigation helper functions
  const navigateToView = (newState: CertificationViewState) => {
    // Add current state to history stack
    setHistory((prev) => ({
      previous: viewState,
      stack: [...prev.stack, viewState],
    }));

    // Update view state
    setViewState(newState);
    console.log("🔄 Navigated to:", newState.type);
  };

  const goBack = () => {
    if (history.previous) {
      setViewState(history.previous);
      setHistory((prev) => ({
        previous: prev.stack[prev.stack.length - 2] || undefined,
        stack: prev.stack.slice(0, -1),
      }));
      console.log("⬅️ Navigated back to:", history.previous.type);
    }
  };

  // Content navigation functions
  const goToSessions = () => {
    if (!certification) return;

    // Navigate to sessions page with certification filter
    const searchParams = new URLSearchParams();
    searchParams.set("certificationId", certification.id);
    navigate(`/sessions?${searchParams.toString()}`);

    // Close the modal
    onClose();
  };

  const goToSessionDetails = (session: BackendTherapySession) => {
    if (!certification) return;
    setSelectedSession(session);
    navigateToView({
      type: "session-details",
      sessionId: session.id,
      certificationId: certification.id,
    });
  };

  const goToAddSession = () => {
    if (!certification) return;
    setEditingSession(null);
    navigateToView({
      type: "add-session",
      certificationId: certification.id,
    });
  };

  const goToEditSession = (session: BackendTherapySession) => {
    if (!certification) return;
    setEditingSession(session);
    navigateToView({
      type: "edit-session",
      sessionId: session.id,
      certificationId: certification.id,
    });
  };

  const goToEditCertification = () => {
    if (!certification) return;
    navigateToView({
      type: "certification-edit",
      certificationId: certification.id,
    });
  };

  // Handle certification update
  const handleCertificationUpdate = async (
    updateData: Record<string, unknown>
  ) => {
    if (!certification) return;

    try {
      console.log("🔄 Updating certification...", updateData);
      const updatedCertification =
        await CertificationService.updateCertification(
          certification.id,
          updateData
        );

      console.log(
        "✅ Certification updated successfully:",
        updatedCertification
      );

      // Always reload fresh data from server to ensure we have the latest
      console.log("🔄 Reloading certification data to ensure freshness...");
      const refreshedCertification =
        await CertificationService.getCertification(certification.id);
      setCertification(refreshedCertification);
      console.log("✅ Certification data refreshed:", refreshedCertification);

      // Show success message
      setSuccessMessage("Certification updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

      // Navigate back to certification view
      navigateToView({
        type: "certification",
        certificationId: certification.id,
      });
    } catch (err) {
      console.error("❌ Error updating certification:", err);
      setError(
        `Failed to update certification: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );

      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteSession = async () => {
    if (!editingSession || !certification) return;

    if (
      window.confirm("Are you sure you want to delete this therapy session?")
    ) {
      try {
        await TherapySessionService.deleteSession(editingSession.id);
        console.log("🗑️ Session deleted:", editingSession.id);

        // Navigate back to sessions list
        navigateToView({
          type: "sessions-list",
          certificationId: certification.id,
        });
        setEditingSession(null);
      } catch (error) {
        console.error("Error deleting session:", error);
        alert("Failed to delete session. Please try again.");
      }
    }
  };

  if (!isOpen || !certification) return null;

  const handleDelete = () => {
    onDelete(certification.id);
  };

  const handleDownloadPdf = async () => {
    if (!certification || isDownloading) return;

    setIsDownloading(true);
    try {
      const blob = await CertificationService.generatePdf(certification.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Create filename
      const patientName =
        certification.patient?.fullName?.replace(/\s+/g, "_") || "Unknown";
      link.download = `Certification_${patientName}_${certification.month}_${certification.year}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        isMobile ? "p-0" : "p-4"
      }`}
    >
      <div
        className={`bg-white dark:bg-gray-800 ${
          isMobile
            ? "w-full h-full max-w-none max-h-none rounded-none"
            : "rounded-lg max-w-4xl w-full h-[90vh]"
        } overflow-hidden flex flex-col`}
      >
        {/* Header - Fixed */}
        <div
          className={`border-b border-gray-200 dark:border-gray-700 ${
            isMobile ? "p-4" : "p-6"
          } flex-shrink-0`}
        >
          <div className="flex justify-between items-start">
            <div
              className={`flex items-center ${
                isMobile ? "space-x-2" : "space-x-4"
              }`}
            >
              {viewState.type !== "certification" && (
                <button
                  onClick={goBack}
                  className={`flex items-center ${
                    isMobile ? "space-x-1" : "space-x-2"
                  } text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium`}
                >
                  <svg
                    className={`${isMobile ? "w-6 h-6" : "w-5 h-5"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span className={isMobile ? "text-sm" : "text-base"}>
                    {viewState.type === "session-details"
                      ? "Back to Sessions"
                      : viewState.type === "add-session" ||
                        viewState.type === "edit-session"
                      ? "Back to Sessions"
                      : "Back to Details"}
                  </span>
                </button>
              )}
              <div>
                <h2
                  className={`${
                    isMobile ? "text-xl" : "text-2xl"
                  } font-bold text-gray-900 dark:text-gray-100`}
                >
                  {viewState.type === "session-details"
                    ? "Therapy Session Details"
                    : viewState.type === "sessions-list"
                    ? "Therapy Sessions"
                    : viewState.type === "add-session"
                    ? "Add Therapy Session"
                    : viewState.type === "edit-session"
                    ? "Edit Therapy Session"
                    : viewState.type === "certification-edit"
                    ? "Edit Certification"
                    : "Certification Document"}
                </h2>
                <p
                  className={`${
                    isMobile ? "text-sm" : "text-base"
                  } text-gray-600 dark:text-gray-400 mt-1`}
                >
                  {viewState.type === "session-details"
                    ? selectedSession?.sessionDate
                      ? new Date(
                          selectedSession.sessionDate
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Session Details"
                    : viewState.type === "sessions-list"
                    ? "Manage therapy sessions for this certification"
                    : viewState.type === "add-session" ||
                      viewState.type === "edit-session"
                    ? `Add/Edit session for ${
                        certification.patient?.fullName || "Unknown Patient"
                      }`
                    : viewState.type === "certification-edit"
                    ? `Edit certification for ${
                        certification.patient?.fullName || "Unknown Patient"
                      }`
                    : `${
                        certification.patient?.fullName || "Unknown Patient"
                      } • ${certification.month} ${certification.year}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${
                isMobile ? "w-10 h-10" : "w-8 h-8"
              } flex items-center justify-center`}
            >
              <svg
                className={`${isMobile ? "w-6 h-6" : "w-5 h-5"}`}
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

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mx-6 mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Conditional Content Rendering */}
        {loading ? (
          /* Loading State */
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Loading certification...
              </p>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Error Loading Certification
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {error}
              </p>
            </div>
          </div>
        ) : !certification ? (
          /* No Data State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No certification data available.
              </p>
            </div>
          </div>
        ) : viewState.type === "certification" ? (
          /* Main Details View */
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6 h-full">
              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Patient Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {certification.patient?.fullName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {certification.patient?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {certification.patient?.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date of Birth
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {certification.patient?.dateOfBirth || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certification Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Certification Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Month & Year
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {certification.month} {certification.year}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          certification.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : certification.status === "draft"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        }`}
                      >
                        {certification.status.charAt(0).toUpperCase() +
                          certification.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        File Number
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {certification.fileNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Therapy Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Therapy Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {certification.location || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Frequency per Week
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {certification.frequencyPerWeek || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duration
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {certification.duration || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Therapist Name
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {certification.therapist
                        ? `${certification.therapist.firstName} ${certification.therapist.lastName}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Registration Number
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {certification.registrationNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Specialist Date
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {certification.specialistDate
                        ? new Date(
                            certification.specialistDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={certification.isPrivate || false}
                      disabled
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Private
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={certification.hasPrivatePlan || false}
                      disabled
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Has Private Plan
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={certification.isProvisionalRemedy || false}
                      disabled
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Provisional Remedy
                    </label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {certification.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Notes
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {certification.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    <label className="block font-medium">Created At</label>
                    <p>{new Date(certification.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block font-medium">Last Modified</label>
                    <p>
                      {new Date(certification.lastModified).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : viewState.type === "sessions-list" ? (
          /* Sessions List View */
          certification && (
            <CertificationSessionsView
              certification={certification}
              onViewChange={(view, session) => {
                console.log("🔄 onViewChange called with:", {
                  view,
                  sessionId: session?.id,
                });
                if (view === "session-details" && session) {
                  console.log(
                    "🎯 Calling goToSessionDetails for session:",
                    session.id
                  );
                  goToSessionDetails(session);
                } else {
                  // Handle view change from CertificationSessionsView
                  console.log("📝 Setting view to:", view);
                  if (session) {
                    setSelectedSession(session);
                  }
                }
              }}
            />
          )
        ) : viewState.type === "session-details" && selectedSession ? (
          /* Session Details View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Use the reusable TherapySessionContent component - no internal header */}
            <TherapySessionContent session={selectedSession} />
          </div>
        ) : viewState.type === "add-session" ||
          viewState.type === "edit-session" ? (
          /* Add/Edit Session Form View */
          <div className="flex-1 flex flex-col overflow-hidden">
            <TherapySessionFormContent
              certificationId={certification.id}
              editSession={
                viewState.type === "edit-session" ? editingSession : null
              }
              mode={viewState.type === "edit-session" ? "edit" : "create"}
              onSave={(session) => {
                console.log("✅ Session saved:", session.id);
                if (viewState.type === "add-session") {
                  // Go back to sessions list after creating
                  navigateToView({
                    type: "sessions-list",
                    certificationId: certification.id,
                  });
                } else {
                  // Go back to session details after editing
                  setSelectedSession(session);
                  navigateToView({
                    type: "session-details",
                    sessionId: session.id,
                    certificationId: certification.id,
                  });
                }
                setEditingSession(null);
              }}
              onSuccess={() => {
                // Already handled in onSave callback above
              }}
              onCancel={() => {
                // Navigate back based on current state
                if (viewState.type === "add-session") {
                  navigateToView({
                    type: "sessions-list",
                    certificationId: certification.id,
                  });
                } else if (
                  viewState.type === "edit-session" &&
                  selectedSession
                ) {
                  navigateToView({
                    type: "session-details",
                    sessionId: selectedSession.id,
                    certificationId: certification.id,
                  });
                }
                setEditingSession(null);
              }}
            />
          </div>
        ) : viewState.type === "certification-edit" ? (
          /* Certification Edit View */
          <CertificationEditForm
            certification={certification}
            onSave={handleCertificationUpdate}
            onCancel={() => {
              navigateToView({
                type: "certification",
                certificationId: certification.id,
              });
            }}
            onFormReady={(submitFn) => {
              console.log(
                "🔧 Form ready callback received:",
                submitFn ? "function provided" : "null"
              );
              setSubmitCertificationForm(() => submitFn);
            }}
          />
        ) : null}

        {/* Dynamic Footer - Adapts to current content */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
          {viewState.type === "certification" && (
            /* Certification Details Footer */
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>

                {/* View Sessions Button - Only show when sessions exist */}
                {certification.therapySessions &&
                  certification.therapySessions.length > 0 && (
                    <button
                      type="button"
                      onClick={goToSessions}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 inline-flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      View Sessions ({certification.therapySessions.length})
                    </button>
                  )}
              </div>
              <div
                className={`flex ${
                  isMobile ? "flex-col space-y-2" : "space-x-3"
                }`}
              >
                <button
                  onClick={handleDelete}
                  className={`${
                    isMobile
                      ? "w-full px-6 py-3 text-base"
                      : "px-4 py-2 text-sm"
                  } font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                  Delete
                </button>
                <button
                  onClick={goToEditCertification}
                  className={`${
                    isMobile
                      ? "w-full px-6 py-3 text-base"
                      : "px-4 py-2 text-sm"
                  } font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  Edit
                </button>
                <button
                  onClick={onClose}
                  className={`${
                    isMobile
                      ? "w-full px-6 py-3 text-base"
                      : "px-4 py-2 text-sm"
                  } font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {viewState.type === "sessions-list" && (
            /* Sessions List Footer - Just Add Session button */
            <div className="flex justify-center">
              <button
                onClick={goToAddSession}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Add Session</span>
              </button>
            </div>
          )}

          {viewState.type === "add-session" && (
            /* Add Session Footer - Show Create and Cancel buttons */
            <div className="flex justify-center space-x-3">
              <button
                type="submit"
                form="therapy-session-form"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create Session
              </button>
              <button
                onClick={() => {
                  navigateToView({
                    type: "sessions-list",
                    certificationId: certification.id,
                  });
                  setEditingSession(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          )}

          {viewState.type === "edit-session" && (
            /* Edit Session Footer - Show Save, Delete, and Cancel buttons immediately */
            <div className="flex justify-center space-x-3">
              <button
                type="submit"
                form="therapy-session-form"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save
              </button>
              <button
                onClick={handleDeleteSession}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  if (selectedSession) {
                    navigateToView({
                      type: "session-details",
                      sessionId: selectedSession.id,
                      certificationId: certification.id,
                    });
                  }
                  setEditingSession(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          )}

          {viewState.type === "session-details" && (
            /* Session Details Footer - Show Edit button only */
            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (selectedSession) {
                    goToEditSession(selectedSession);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit
              </button>
            </div>
          )}

          {viewState.type === "certification-edit" && (
            /* Certification Edit Footer - Show Save and Cancel buttons */
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => {
                  if (submitCertificationForm) {
                    submitCertificationForm();
                  }
                }}
                disabled={!submitCertificationForm}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={() => {
                  navigateToView({
                    type: "certification",
                    certificationId: certification.id,
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationViewModal;
