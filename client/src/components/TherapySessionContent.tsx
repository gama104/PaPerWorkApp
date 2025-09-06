import React from "react";
import type { BackendTherapySession } from "../types/TherapyTypes";

interface TherapySessionContentProps {
  session: BackendTherapySession;
}

const TherapySessionContent: React.FC<TherapySessionContentProps> = ({
  session,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
              {new Date(session.sessionDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {session.sessionTime
                ? new Date(
                    `2000-01-01T${session.sessionTime}`
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "Not specified"}
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
          <p>Last updated: {new Date(session.updatedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default TherapySessionContent;

