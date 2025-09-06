import React, { useState, useEffect, useMemo } from "react";
import { usePatients } from "../../patients/hooks/usePatients";
import type { Patient } from "../../patients/types/patient.types";

interface PatientSelectorProps {
  selectedPatientId?: string;
  onPatientChange: (patientId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const PatientSelector: React.FC<PatientSelectorProps> = ({
  selectedPatientId,
  onPatientChange,
  disabled = false,
  placeholder = "Select a patient...",
  className = "",
  error,
}) => {
  const { patients, isLoading, loadPatients } = usePatients({
    filter: {
      page: 1,
      pageSize: 100, // Load more patients for dropdown
      sortBy: "fullName",
      sortDirection: "asc",
      isActive: true,
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;

    const term = searchTerm.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.fullName.toLowerCase().includes(term) ||
        patient.firstName.toLowerCase().includes(term) ||
        patient.lastName.toLowerCase().includes(term) ||
        patient.email?.toLowerCase().includes(term)
    );
  }, [patients, searchTerm]);

  // Get selected patient
  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  const handlePatientSelect = (patient: Patient) => {
    onPatientChange(patient.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
          disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
            : error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={selectedPatient ? "text-gray-900" : "text-gray-500"}>
            {selectedPatient ? selectedPatient.fullName : placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm">Loading patients...</span>
            </div>
          )}

          {/* Patients List */}
          {!isLoading && (
            <div className="max-h-48 overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm
                    ? "No patients found matching your search."
                    : "No patients available."}
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handlePatientSelect(patient)}
                    className={`
                      w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:bg-gray-50 dark:focus:bg-gray-600 focus:outline-none
                      ${
                        selectedPatientId === patient.id
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300"
                          : "text-gray-900 dark:text-gray-100"
                      }
                    `}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{patient.fullName}</span>
                      {patient.email && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {patient.email}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
