import React from "react";
import type { CertificationDocument } from "../../types/TherapyTypes";
import type { BaseViewProps } from "../../types/ModalTypes";

interface CertificationViewProps extends BaseViewProps<CertificationDocument> {
  // No additional props needed - all actions are handled by the modal footer
}

export const CertificationView: React.FC<CertificationViewProps> = ({
  data: certification,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading certification...
          </p>
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

  if (!certification) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>No certification data available</p>
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

  const formatDuration = (durationMinutes: number | null | undefined) => {
    if (!durationMinutes) return "Not specified";

    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      if (minutes === 0) {
        return `${hours} hour${hours > 1 ? "s" : ""}`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Certification Details
          </h2>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              certification.status
            )}`}
          >
            {certification.status}
          </span>
        </div>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Patient Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Patient Name
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.patient?.fullName || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Patient ID
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.patientId}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Therapy Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Therapy Type
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.therapyType}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Duration
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDuration(certification.duration)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Frequency
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.frequencyPerWeek
                  ? `${certification.frequencyPerWeek} times per week`
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Period Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Month
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {certification.month}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Year
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {certification.year}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certification.location && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.location}
              </p>
            </div>
          )}
          {certification.fileNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                File Number
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.fileNumber}
              </p>
            </div>
          )}
          {certification.registrationNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Registration Number
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.registrationNumber}
              </p>
            </div>
          )}
          {certification.referralNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Referral Number
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.referralNumber}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Flags */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Certification Flags
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                certification.isPrivate
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
              }`}
            >
              {certification.isPrivate ? "Private" : "Public"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                certification.hasPrivatePlan
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
              }`}
            >
              {certification.hasPrivatePlan
                ? "Has Private Plan"
                : "No Private Plan"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                certification.isProvisionalRemedy
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
              }`}
            >
              {certification.isProvisionalRemedy
                ? "Provisional Remedy"
                : "Standard"}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {certification.notes && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Notes
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {certification.notes}
            </p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div>
            <span className="font-medium">Created:</span>{" "}
            {formatDate(certification.createdAt)}
          </div>
          <div>
            <span className="font-medium">Last Modified:</span>{" "}
            {formatDate(certification.lastModified)}
          </div>
        </div>
      </div>
    </div>
  );
};
