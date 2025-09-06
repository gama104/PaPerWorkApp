import React, { useState, useEffect } from "react";
import { apiClient } from "../services/apiClient";
import TherapySessionForm from "./TherapySessionForm";
import TherapySessionViewModal from "./TherapySessionViewModal";
import type { BackendTherapySession } from "../types/TherapyTypes";

interface TherapySessionsListProps {
  certificationId: string;
  isVisible: boolean;
  editable?: boolean;
}

const TherapySessionsList: React.FC<TherapySessionsListProps> = ({
  certificationId,
  isVisible,
  editable = false,
}) => {
  const [sessions, setSessions] = useState<BackendTherapySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddSessionForm, setShowAddSessionForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<BackendTherapySession | null>(null);
  const [editingSession, setEditingSession] =
    useState<BackendTherapySession | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchSessions = async () => {
    if (!isVisible || !certificationId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.therapySessions.getByCertification(
        certificationId
      );
      setSessions(response.data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load therapy sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [certificationId, isVisible]);

  const handleSessionCreated = (newSession: BackendTherapySession) => {
    setSessions((prev) => [newSession, ...prev]);
    setShowAddSessionForm(false);
  };

  const handleSessionUpdated = (updatedSession: BackendTherapySession) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === updatedSession.id ? updatedSession : session
      )
    );

    // Also update the selectedSession if it's the same session being viewed
    setSelectedSession((prev) =>
      prev?.id === updatedSession.id ? updatedSession : prev
    );

    setShowEditForm(false);
    setEditingSession(null);
  };

  const handleRowClick = (session: BackendTherapySession) => {
    setSelectedSession(session);
    setShowViewModal(true);
  };

  const handleEditSession = (session: BackendTherapySession) => {
    setEditingSession(session);
    setShowEditForm(true);
    setShowViewModal(false);
  };

  const handleViewModalClose = () => {
    setShowViewModal(false);
    setSelectedSession(null);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      await api.therapySessions.delete(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error("Error deleting session:", err);
      alert("Failed to delete session");
    }
  };

  const toggleSessionCompleted = async (session: BackendTherapySession) => {
    try {
      const response = await api.therapySessions.update(session.id, {
        isCompleted: !session.isCompleted,
      });

      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? response.data : s))
      );
    } catch (err) {
      console.error("Error updating session:", err);
      alert("Failed to update session status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Therapy Sessions ({sessions.length})
        </h3>
        {editable && (
          <button
            onClick={() => setShowAddSessionForm(true)}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Session
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading sessions...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {!loading && !error && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
              <p className="text-gray-600 dark:text-gray-400">
                No therapy sessions recorded yet.
              </p>
              {editable && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Click "Add Session" to record your first therapy session.
                </p>
              )}
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleRowClick(session)}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(session.sessionDate)}
                      </h4>
                      {session.sessionTime && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          at {formatTime(session.sessionTime)}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          session.isCompleted
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {session.isCompleted ? "Completed" : "In Progress"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      {session.location && (
                        <div>
                          <span className="font-medium">Location:</span>{" "}
                          {session.location}
                        </div>
                      )}
                      {session.durationMinutes && (
                        <div>
                          <span className="font-medium">Duration:</span>{" "}
                          {session.durationMinutes} min
                        </div>
                      )}
                      {session.parentSignatureStatus && (
                        <div>
                          <span className="font-medium">Signature:</span>{" "}
                          {session.parentSignatureStatus}
                        </div>
                      )}
                    </div>

                    {session.transportationRequired && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                          Transportation Required
                        </span>
                      </div>
                    )}

                    {session.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Notes:</span>{" "}
                          {session.notes}
                        </p>
                      </div>
                    )}

                    {session.certifyingOfficialName && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        Certified by: {session.certifyingOfficialName}
                      </div>
                    )}
                  </div>

                  {/* Visual indicator for clickable row */}
                  <div className="flex items-center ml-4">
                    <svg
                      className="w-5 h-5 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Session Form Modal */}
      {showAddSessionForm && (
        <TherapySessionForm
          certificationId={certificationId}
          onSessionCreated={handleSessionCreated}
          onClose={() => setShowAddSessionForm(false)}
        />
      )}

      {/* Edit Session Form Modal */}
      {showEditForm && editingSession && (
        <TherapySessionForm
          certificationId={certificationId}
          onSessionCreated={handleSessionCreated}
          onSessionUpdated={handleSessionUpdated}
          onClose={() => {
            setShowEditForm(false);
            setEditingSession(null);
          }}
          editSession={editingSession}
        />
      )}

      {/* View Session Modal */}
      <TherapySessionViewModal
        session={selectedSession}
        isOpen={showViewModal}
        onClose={handleViewModalClose}
        onEdit={handleEditSession}
        onDelete={handleDeleteSession}
      />
    </div>
  );
};

export default TherapySessionsList;
