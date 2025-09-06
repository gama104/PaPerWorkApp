import React from "react";
import type { BackendTherapySession } from "../types";

interface SessionDetailsViewProps {
  session: BackendTherapySession;
}

export default function SessionDetailsView({
  session,
}: SessionDetailsViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Session Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Session Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Session Date
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {new Date(session.sessionDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Session Time
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {session.sessionTime || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {session.location || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Duration (minutes)
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {session.durationMinutes || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Administrative Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Administrative Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Transportation Required
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.transportationRequired
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {session.transportationRequired ? "Yes" : "No"}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Parent Signature Status
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.parentSignatureStatus === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : session.parentSignatureStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}
                >
                  {session.parentSignatureStatus?.replace("_", " ") || "N/A"}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Certifying Official
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {session.certifyingOfficialName || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Signature Information */}
        {session.signatureImageData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Signature
            </h3>
            <div className="space-y-4">
              <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-white dark:bg-gray-800">
                <img
                  src={session.signatureImageData}
                  alt="Session Signature"
                  className="max-w-full max-h-32 object-contain"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Signed By
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {session.signatureName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Signature Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {session.signatureDate
                      ? new Date(session.signatureDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              {session.signatureNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Signature Notes
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {session.signatureNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {session.notes && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Session Notes
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {session.notes}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <label className="block font-medium">Created At</label>
              <p>{new Date(session.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="block font-medium">Last Modified</label>
              <p>{new Date(session.lastModifiedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

