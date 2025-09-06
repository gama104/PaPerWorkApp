import React from "react";
import type { BackendTherapySession } from "../../types/TherapyTypes";
import type { BaseViewProps } from "../../types/ModalTypes";

interface SessionViewProps extends BaseViewProps<BackendTherapySession> {
  onViewSignature?: () => void;
}

export const SessionView: React.FC<SessionViewProps> = ({
  data: session,
  onEdit,
  onDelete,
  onClose,
  onViewSignature,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>No session data available</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  const getSignatureStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const hasSignature =
    session.signatureImageData && session.signatureImageData.length > 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Therapy Session
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(session.sessionDate)} at{" "}
              {formatTime(session.sessionTime)}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSignatureStatusColor(
              session.parentSignatureStatus
            )}`}
          >
            {session.parentSignatureStatus}
          </span>
        </div>
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Session Information
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Date:
              </span>
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                {formatDate(session.sessionDate)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Time:
              </span>
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                {formatTime(session.sessionTime)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Location:
              </span>
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                {session.location || "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Transportation:
              </span>
              <span className="ml-2">
                {session.transportationRequired ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Required
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                    Not Required
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Signature Information
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Status:
              </span>
              <span className="ml-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSignatureStatusColor(
                    session.parentSignatureStatus
                  )}`}
                >
                  {session.parentSignatureStatus}
                </span>
              </span>
            </div>

            {session.signatureDate && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Signed on:
                </span>
                <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(session.signatureDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Notes */}
      {session.notes && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Session Notes
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {session.notes}
            </p>
          </div>
        </div>
      )}

      {/* Signature Display */}
      {hasSignature && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Signature
          </h4>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <img
              src={session.signatureImageData}
              alt="Session signature"
              className="max-w-full h-auto max-h-32 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
