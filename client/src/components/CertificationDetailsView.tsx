import React from "react";
import type { CertificationDocument } from "../types";

interface CertificationDetailsViewProps {
  certification: CertificationDocument;
  onEdit: () => void;
  onViewSessions: () => void;
}

export default function CertificationDetailsView({
  certification,
  onEdit,
  onViewSessions,
}: CertificationDetailsViewProps) {
  console.log(
    "CertificationDetailsView: Received certification:",
    certification
  );
  return (
    <div className="flex-1 overflow-y-auto p-2 h-full">
      <div className="space-y-4 min-h-full">
        {/* Patient Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                File Number
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.fileNumber || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Certification Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Certification Details
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
                Status
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    certification.status === "draft"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {certification.status}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Duration (minutes)
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.duration || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.location || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Registration Number
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.registrationNumber || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Referral Number
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {certification.referralNumber || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Flags
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <label className="block font-medium">Created At</label>
              <p>{new Date(certification.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="block font-medium">Last Modified</label>
              <p>{new Date(certification.lastModified).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
