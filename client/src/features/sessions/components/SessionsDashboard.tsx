import React, { useState, useEffect } from "react";
import { sessionService } from "../services/sessionService";
import { SessionsList } from "./SessionsList";
import { CertificationSelectionModal } from "./CertificationSelectionModal";

import SessionViewModal from "./SessionViewModal";
import SignatureModal from "../../../components/SignatureModal";
import { useSignature } from "../hooks/useSignature";
import type { TherapySession } from "../types/session.types";
import type { CertificationDocument } from "../../certifications/types/certification.types";
import type { SessionStats } from "../types/session.types";

interface SessionsDashboardProps {
  onSessionClick: (session: TherapySession) => void;
  initialFilters?: {
    certificationId?: string;
    status?: string;
    timeRange?: string;
    month?: string;
    year?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
  stats?: SessionStats | null;
  sessions?: TherapySession[];
}

interface SessionWithDetails extends TherapySession {
  certificationTitle: string;
  patientName: string;
}

export const SessionsDashboard: React.FC<SessionsDashboardProps> = ({
  stats,
  sessions: propSessions,
  initialFilters,
}) => {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCertificationSelectionOpen, setIsCertificationSelectionOpen] =
    useState(false);

  const [selectedSession, setSelectedSession] =
    useState<SessionWithDetails | null>(null);
  const [isSessionViewModalOpen, setIsSessionViewModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [sessionToSign, setSessionToSign] = useState<SessionWithDetails | null>(
    null
  );

  // Signature functionality
  const { signSession } = useSignature();

  // Load sessions data - use prop sessions if available, otherwise load from API
  useEffect(() => {
    if (propSessions) {
      // Use sessions from props (even if empty array)
      const sessionsWithDetails: SessionWithDetails[] = propSessions.map(
        (session) => ({
          ...session,
          certificationTitle:
            session.certificationDocumentTitle || "Unknown Certification",
          patientName: session.patientName || "Unknown Patient",
        })
      );

      // Sort sessions by date (newest first)
      sessionsWithDetails.sort(
        (a, b) =>
          new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
      );
      setSessions(sessionsWithDetails);
      setIsLoading(false);
      setError(null);
    } else {
      // Only load from API if no sessions provided at all
      loadSessionsData();
    }
  }, [propSessions]);

  const loadSessionsData = async (): Promise<SessionWithDetails[]> => {
    try {
      setIsLoading(true);
      setError(null);

      // Single API call for sessions with all needed data
      const sessionsResponse = await sessionService.getSessions();

      // Extract sessions data
      const sessionsData = sessionsResponse.sessions || [];

      // Transform to SessionWithDetails format
      const sessionsWithDetails: SessionWithDetails[] = sessionsData.map(
        (session) => ({
          ...session,
          certificationTitle:
            session.certificationDocumentTitle || "Unknown Certification",
          patientName: session.patientName || "Unknown Patient",
        })
      );

      // Sort sessions by date (newest first)
      sessionsWithDetails.sort(
        (a, b) =>
          new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
      );
      setSessions(sessionsWithDetails);
      return sessionsWithDetails;
    } catch (error) {
      console.error("Error loading sessions data:", error);
      setError("Failed to load sessions data");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSession = () => {
    setIsCertificationSelectionOpen(true);
  };

  const handleSelectCertification = (certification: CertificationDocument) => {
    // Create a new session object with certification data pre-filled
    const newSession: SessionWithDetails = {
      id: "", // Will be set when created
      certificationDocumentId: certification.id,
      sessionDate: new Date().toISOString().split("T")[0], // Today's date
      sessionTime: "",
      endTime: "",
      location: "",
      transportationRequired: false,
      notes: "",
      signatureImageData: "",
      signatureName: "",
      signatureNotes: "",
      signatureDate: undefined,
      parentSignatureStatus: "pending",
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      createdBy: "",
      lastModifiedBy: "",
      therapistId: "",
      certificationTitle: `${certification.month} ${certification.year} - Therapy`,
      patientName: certification.patient?.fullName || "Unknown Patient",
    };

    setSelectedSession(newSession);
    setIsCertificationSelectionOpen(false);
    setIsSessionViewModalOpen(true);
  };

  const handleSessionClick = (session: SessionWithDetails) => {
    setSelectedSession(session);
    setIsSessionViewModalOpen(true);
  };

  const handleSignatureClick = (session: SessionWithDetails) => {
    setSessionToSign(session);
    setIsSignatureModalOpen(true);
  };

  const handleSessionViewModalClose = () => {
    setIsSessionViewModalOpen(false);
    setSelectedSession(null);
  };

  const handleSignatureModalClose = () => {
    setIsSignatureModalOpen(false);
    setSessionToSign(null);
  };

  const handleSignatureAccept = async (signatureData: string) => {
    if (!sessionToSign) return;

    const success = await signSession(sessionToSign.id, signatureData);
    if (success) {
      // Reload sessions to show updated signature status
      await loadSessionsData();
      handleSignatureModalClose();
    }
  };

  const handleSessionEdit = (session: SessionWithDetails) => {
    // This is now handled by the SessionViewModal's inline editing
    console.log("Edit session:", session);
  };

  const handleSessionDelete = async (sessionId: string) => {
    try {
      await sessionService.deleteSession(sessionId);
      // Reload sessions after deletion
      loadSessionsData();
      handleSessionViewModalClose();
    } catch (error) {
      console.error("Failed to delete session:", error);
      // You could show an error message here
    }
  };

  const handleSessionSave = async (
    sessionId: string,
    updatedSession: Partial<TherapySession>
  ) => {
    try {
      // Check if this is a new session (empty ID) or an update
      if (!sessionId || sessionId === "") {
        // Create new session
        const createRequest = {
          certificationDocumentId:
            updatedSession.certificationDocumentId ||
            selectedSession?.certificationDocumentId ||
            "",
          sessionDate:
            updatedSession.sessionDate ||
            new Date().toISOString().split("T")[0],
          sessionTime: updatedSession.sessionTime || "",
          endTime: updatedSession.endTime || "",
          location: updatedSession.location || "",
          transportationRequired:
            updatedSession.transportationRequired || false,
          parentSignatureStatus: "pending" as const,
          notes: updatedSession.notes || "",
        };

        console.log(
          "Create request payload:",
          JSON.stringify(createRequest, null, 2)
        );

        await sessionService.createSession(createRequest);

        // Reload sessions after creation
        await loadSessionsData();

        // Close the modal
        setIsSessionViewModalOpen(false);
        setSelectedSession(null);

        return;
      }

      // Update existing session
      const updateRequest = {
        id: sessionId,
        sessionDate: updatedSession.sessionDate
          ? new Date(updatedSession.sessionDate)
          : undefined,
        sessionTime: updatedSession.sessionTime, // Send as string - backend will convert
        endTime: updatedSession.endTime, // Send as string - backend will convert
        location: updatedSession.location,
        transportationRequired: updatedSession.transportationRequired,
        notes: updatedSession.notes,
        // Include signature fields if they exist
        signatureImageData: updatedSession.signatureImageData,
        signatureName: updatedSession.signatureName,
        signatureNotes: updatedSession.signatureNotes,
        parentSignatureStatus: updatedSession.parentSignatureStatus,
      };

      // Debug: Log the request payload
      console.log(
        "Update request payload:",
        JSON.stringify(updateRequest, null, 2)
      );
      console.log("Updated session data:", updatedSession);

      await sessionService.updateSession(sessionId, updateRequest);
      // Reload sessions after update and get the fresh data
      const updatedSessions = await loadSessionsData();

      // Update the selected session with fresh data from the reloaded sessions
      if (selectedSession) {
        const updatedSession = updatedSessions.find((s) => s.id === sessionId);
        if (updatedSession) {
          setSelectedSession(updatedSession);
        }
      }
    } catch (error) {
      console.error("Failed to save session:", error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  // Add loading state for stats
  if (!stats) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">
            Loading session statistics...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col min-h-0">
      {/* Fixed Header with Stats and Add Button */}
      <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {/* Stats Cards */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Total Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats?.totalSessions || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <svg
                    className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats?.pendingSessions || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Completed Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats?.completedSessions || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* This Month Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    This Month
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats?.thisMonthSessions || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Header with Title and Add Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Therapy Sessions
            </h2>
            <button
              onClick={handleAddSession}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Session
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area - Only the table content scrolls */}
      <div className="flex-1 min-h-0">
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mx-6 mt-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Loading sessions...
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="pb-8">
              <SessionsList
                sessions={sessions}
                onSessionClick={handleSessionClick}
                onSignatureClick={handleSignatureClick}
                initialFilters={initialFilters}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CertificationSelectionModal
        isOpen={isCertificationSelectionOpen}
        onClose={() => setIsCertificationSelectionOpen(false)}
        onSelectCertification={handleSelectCertification}
      />

      <SessionViewModal
        session={selectedSession}
        isOpen={isSessionViewModalOpen}
        onClose={handleSessionViewModalClose}
        onEdit={handleSessionEdit}
        onDelete={handleSessionDelete}
        onSave={handleSessionSave}
      />

      {/* Signature Modal for signing sessions from the list */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={handleSignatureModalClose}
        onAccept={handleSignatureAccept}
        title={
          sessionToSign
            ? `Sign Session - ${sessionToSign.patientName}`
            : "Sign Session"
        }
        initialSignature={sessionToSign?.signatureImageData || ""}
      />
    </div>
  );
};
