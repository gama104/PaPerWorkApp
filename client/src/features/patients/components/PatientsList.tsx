// Patients List Component
import React from "react";
import { PatientCard } from "./PatientCard";
import { LoadingSpinner } from "@/shared/components/ui";
import type { PatientListProps } from "../types/patient.types";

export function PatientsList({
  patients,
  isLoading = false,
  onPatientClick,
  className = "",
}: PatientListProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (patients.length === 0) {
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No patients found
        </h3>
        <p className="text-gray-500">
          There are no patients matching your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {patients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onClick={onPatientClick ? () => onPatientClick(patient) : undefined}
          showTherapist={true}
        />
      ))}
    </div>
  );
}

export default PatientsList;
