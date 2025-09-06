import React from "react";
import type { BackendTherapySession } from "../types/TherapyTypes";
import { useResponsive } from "../hooks/useResponsive";

interface TherapySessionViewModalProps {
  session: BackendTherapySession | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (session: BackendTherapySession) => void;
  onDelete: (sessionId: string) => void;
}

const TherapySessionViewModal: React.FC<TherapySessionViewModalProps> = ({
  session,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { isMobile } = useResponsive();

  if (!isOpen || !session) return null;

  // Debug: Log the session data to see what we're receiving
  console.log("TherapySessionViewModal - Session data:", session);
  console.log("TherapySessionViewModal - Signature data:", {
    signatureImageData: session.signatureImageData,
    signatureName: session.signatureName,
    signatureNotes: session.signatureNotes,
    signatureDate: session.signatureDate,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "Not specified";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      onDelete(session.id);
      onClose();
    }
  };

  const handleEdit = () => {
    onEdit(session);
    onClose();
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
            : "rounded-lg max-w-2xl w-full max-h-[90vh]"
        } overflow-y-auto`}
      >
        {/* Header */}
        <div
          className={`border-b border-gray-200 dark:border-gray-700 ${
            isMobile ? "p-4" : "p-6"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2
                className={`${
                  isMobile ? "text-xl" : "text-2xl"
                } font-bold text-gray-900 dark:text-gray-100`}
              >
                Therapy Session Details
              </h2>
              <p
                className={`${
                  isMobile ? "text-sm" : "text-base"
                } text-gray-600 dark:text-gray-400 mt-1`}
              >
                {formatDate(session.sessionDate)}
              </p>
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

        {/* Session Details */}
        <div className={`${isMobile ? "p-4" : "p-6"} space-y-6`}>
          {/* Status Badge */}
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                session.isCompleted
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              }`}
            >
              {session.isCompleted ? "Completed" : "In Progress"}
            </span>
            {session.transportationRequired && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                Transportation Required
              </span>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Session Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {formatDate(session.sessionDate)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {formatTime(session.sessionTime)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {session.location || "Not specified"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {session.durationMinutes
                    ? `${session.durationMinutes} minutes`
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Administrative Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Signature Status
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {session.parentSignatureStatus
                    ? session.parentSignatureStatus.charAt(0).toUpperCase() +
                      session.parentSignatureStatus.slice(1).replace("_", " ")
                    : "Not specified"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Certifying Official
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {session.certifyingOfficialName || "Not specified"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transportation Required
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {session.transportationRequired ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {session.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Session Notes
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {session.notes}
                </p>
              </div>
            </div>
          )}

          {/* Signature Display */}
          {(session.signatureImageData ||
            session.signatureName ||
            session.signatureNotes) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Signature Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 space-y-3">
                {session.signatureImageData && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Signature Image
                    </label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800">
                      <img
                        src={session.signatureImageData}
                        alt="Session Signature"
                        className="max-w-full h-auto max-h-32 object-contain"
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    </div>
                  </div>
                )}

                {session.signatureName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Signed By
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {session.signatureName}
                    </p>
                  </div>
                )}

                {session.signatureNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Signature Notes
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {session.signatureNotes}
                    </p>
                  </div>
                )}

                {session.signatureDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Signed At
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(session.signatureDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p>Session ID: {session.id}</p>
            {session.createdAt && (
              <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
            )}
            {session.updatedAt && (
              <p>
                Last updated: {new Date(session.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`border-t border-gray-200 dark:border-gray-700 ${
            isMobile ? "p-4" : "p-6"
          }`}
        >
          <div
            className={`flex ${
              isMobile ? "flex-col space-y-2" : "justify-end space-x-3"
            }`}
          >
            <button
              onClick={handleDelete}
              className={`${
                isMobile ? "w-full px-6 py-3 text-base" : "px-4 py-2 text-sm"
              } font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            >
              Delete
            </button>
            <button
              onClick={handleEdit}
              className={`${
                isMobile ? "w-full px-6 py-3 text-base" : "px-4 py-2 text-sm"
              } font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className={`${
                isMobile ? "w-full px-6 py-3 text-base" : "px-4 py-2 text-sm"
              } font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapySessionViewModal;
