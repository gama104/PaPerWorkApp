// Certifications List Component
import React from "react";
import { CertificationCard } from "./CertificationCard";
import { LoadingSpinner } from "@/shared/components/ui";
import type { CertificationListProps } from "../types/certification.types";

export function CertificationsList({
  certifications,
  isLoading = false,
  onCertificationClick,
  onEditCertification,
  onDeleteCertification,
  onSubmitCertification,
  showPatientName = true,
  showTherapistName = false,
  className = "",
}: CertificationListProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (certifications.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
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
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No certifications found
        </h3>
        <p className="text-gray-500">
          There are no certifications matching your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {certifications.map((certification) => (
        <CertificationCard
          key={certification.id}
          certification={certification}
          onClick={
            onCertificationClick
              ? () => onCertificationClick(certification)
              : undefined
          }
          onEdit={
            onEditCertification
              ? () => onEditCertification(certification)
              : undefined
          }
          onDelete={
            onDeleteCertification
              ? () => onDeleteCertification(certification.id)
              : undefined
          }
          onSubmit={
            onSubmitCertification
              ? () => onSubmitCertification(certification.id)
              : undefined
          }
          onViewSessions={
            onCertificationClick
              ? () => onCertificationClick(certification)
              : undefined
          }
          showPatientName={showPatientName}
          showTherapistName={showTherapistName}
        />
      ))}
    </div>
  );
}

export default CertificationsList;


