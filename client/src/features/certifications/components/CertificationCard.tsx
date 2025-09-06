// Certification Card Component
import React from "react";
import { format } from "date-fns";
import type { CertificationCardProps } from "../types/certification.types";
import { CertificationStatus } from "../types/certification.types";

export function CertificationCard({
  certification,
  onClick,
  onEdit,
  onDelete,
  onSubmit,
  onViewSessions,
  showPatientName = true,
  showTherapistName = false,
  className = "",
}: CertificationCardProps) {
  const getStatusColor = (status: CertificationStatus) => {
    switch (status) {
      case CertificationStatus.DRAFT:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600";
      case CertificationStatus.SUBMITTED:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700";
      case CertificationStatus.UNDER_REVIEW:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
      case CertificationStatus.APPROVED:
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700";
      case CertificationStatus.REJECTED:
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700";
      case CertificationStatus.REVISION_REQUIRED:
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    }
  };

  const formatStatus = (status: CertificationStatus) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const completionPercentage =
    certification.totalSessions > 0
      ? Math.round(
          (certification.completedSessions / certification.totalSessions) * 100
        )
      : 0;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {certification.month}/{certification.year}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                certification.status
              )}`}
            >
              {formatStatus(certification.status)}
            </span>
          </div>

          {showPatientName && certification.patient && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Patient: {certification.patient.fullName}
            </p>
          )}

          {showTherapistName && certification.therapist && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Therapist: {certification.therapist.fullName}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-4">
          {onViewSessions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewSessions();
              }}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="View Sessions"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
              title="Edit"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}

          {onSubmit && certification.status === CertificationStatus.DRAFT && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSubmit();
              }}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
              title="Submit for Approval"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Delete"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Sessions Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sessions Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {certification.completedSessions}/{certification.totalSessions} (
            {completionPercentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          Created: {format(new Date(certification.createdAt), "MMM dd, yyyy")}
        </span>
        {certification.submittedAt && (
          <span>
            Submitted:{" "}
            {format(new Date(certification.submittedAt), "MMM dd, yyyy")}
          </span>
        )}
      </div>

      {/* Notes */}
      {certification.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {certification.notes}
          </p>
        </div>
      )}

      {/* Rejection Reason */}
      {certification.status === CertificationStatus.REJECTED &&
        certification.rejectionReason && (
          <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
              Rejection Reason:
            </p>
            <p className="text-sm text-red-700 dark:text-red-400">
              {certification.rejectionReason}
            </p>
          </div>
        )}
    </div>
  );
}

export default CertificationCard;
