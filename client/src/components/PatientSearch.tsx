import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "../services/apiClient";
import type { Patient } from "../types";

interface PatientSearchProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
  placeholder?: string;
  className?: string;
}

const PatientSearch: React.FC<PatientSearchProps> = ({
  selectedPatient,
  onPatientSelect,
  placeholder = "Search patients by name...",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search patients when search term changes
  useEffect(() => {
    const searchPatients = async () => {
      if (searchTerm.trim().length < 2) {
        setPatients([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.patients.getAll({
          search: searchTerm.trim(),
        });
        setPatients(response.data || []);
        setIsOpen(true);
      } catch (error) {
        console.error("Error searching patients:", error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setSearchTerm(patient.fullName);
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    onPatientSelect(null);
    setSearchTerm("");
    setPatients([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // If user clears the input, clear the selection
    if (value === "") {
      onPatientSelect(null);
    }
  };

  // Set initial search term if patient is already selected
  useEffect(() => {
    if (selectedPatient && searchTerm === "") {
      setSearchTerm(selectedPatient.fullName);
    }
  }, [selectedPatient, searchTerm]);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
        />

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Clear button */}
        {selectedPatient && !loading && (
          <button
            type="button"
            onClick={handleClearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Selected patient info */}
      {selectedPatient && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {selectedPatient.fullName}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedPatient.email || "No email"} •{" "}
                {selectedPatient.phone || "No phone"}
              </p>
              {selectedPatient.dateOfBirth && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  DOB: {selectedPatient.dateOfBirth}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <svg
                className="w-5 h-5"
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
      )}

      {/* Dropdown with search results */}
      {isOpen && patients.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {patients.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => handlePatientSelect(patient)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {patient.fullName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {patient.email || "No email"} • {patient.phone || "No phone"}
                </p>
                {patient.dateOfBirth && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    DOB: {patient.dateOfBirth}
                  </p>
                )}
                {patient.conditionsTherapyTypes && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Conditions: {patient.conditionsTherapyTypes}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen &&
        searchTerm.length >= 2 &&
        patients.length === 0 &&
        !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No patients found for "{searchTerm}"
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
              You can create a new patient in the Patients section
            </p>
          </div>
        )}
    </div>
  );
};

export default PatientSearch;
