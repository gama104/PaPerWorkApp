import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import PatientSearch from "./PatientSearch";
import type { Patient } from "../types";

interface CertificationFormData {
  // Patient selection (using search)
  selectedPatient: Patient | null;

  // Certification details
  month: string;
  year: number;
  therapyType: string;
  status: "draft" | "submitted" | "completed";

  // Form details
  fileNumber?: string;
  isPrivate?: boolean;
  hasPrivatePlan?: boolean;
  isProvisionalRemedy?: boolean;
  frequencyPerWeek?: number;
  durationMinutes?: number;
  registrationNumber?: string;
  location?: string;
  notes?: string;
  specialistDate?: string;
}

interface CertificationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
  hideButtons?: boolean;
}

const CertificationForm: React.FC<CertificationFormProps> = ({
  onSuccess,
  onCancel,
  isModal = false,
  hideButtons = false,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CertificationFormData>({
    selectedPatient: null,
    month: "",
    year: new Date().getFullYear(),
    therapyType: "",
    status: "draft",
    frequencyPerWeek: 1,
    durationMinutes: 60,
    location: "Centro",
  });

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const therapyTypes = [
    "Speech Language Therapy",
    "Occupational Therapy",
    "Physical Therapy",
    "Behavioral Therapy",
    "Other",
  ];

  const durations = [
    { label: "30 minutes", value: 30 },
    { label: "45 minutes", value: 45 },
    { label: "60 minutes", value: 60 },
    { label: "90 minutes", value: 90 },
    { label: "120 minutes", value: 120 },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const handleInputChange = (
    field: keyof CertificationFormData,
    value: string | number | boolean | Patient | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.selectedPatient) {
      setError("Please select a patient");
      return;
    }

    if (!formData.month || !formData.year || !formData.therapyType) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Prepare the certification data
      const certificationData = {
        patientId: formData.selectedPatient.id,
        month: formData.month,
        year: formData.year,
        therapyType: formData.therapyType,
        status: formData.status,
        fileNumber: formData.fileNumber,
        isPrivate: formData.isPrivate,
        hasPrivatePlan: formData.hasPrivatePlan,
        isProvisionalRemedy: formData.isProvisionalRemedy,
        frequencyPerWeek: formData.frequencyPerWeek,
        durationMinutes: formData.durationMinutes,
        registrationNumber: formData.registrationNumber,
        location: formData.location,
        notes: formData.notes,
        specialistDate: formData.specialistDate,
      };

      const response = await api.certifications.create(certificationData);

      if (response.status === 201) {
        // Success - either navigate or call callback
        if (isModal && onSuccess) {
          onSuccess();
        } else {
          navigate("/certifications");
        }
      } else {
        setError(response.message || "Failed to create certification");
      }
    } catch (err) {
      console.error("Error creating certification:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create certification"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={isModal ? "" : "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}
    >
      {!isModal && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            New Certification Document
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new therapy certification document for a patient
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div
        className={
          isModal
            ? ""
            : "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        }
      >
        <form
          id="certification-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Informational Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Therapist Information
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    Your name will automatically appear in the generated PDF as
                    the certifying therapist.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Selection */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Patient Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Patient *
              </label>
              <PatientSearch
                selectedPatient={formData.selectedPatient}
                onPatientSelect={(patient) =>
                  handleInputChange("selectedPatient", patient)
                }
                placeholder="Search for a patient by name..."
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Can't find the patient?{" "}
                <a
                  href="/patients"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Create a new patient
                </a>{" "}
                first.
              </p>
            </div>
          </div>

          {/* Certification Details */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Certification Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month *
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => handleInputChange("month", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select month</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) =>
                    handleInputChange("year", parseInt(e.target.value))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleInputChange(
                      "status",
                      e.target.value as "draft" | "submitted" | "completed"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Therapy Type *
                </label>
                <select
                  value={formData.therapyType}
                  onChange={(e) =>
                    handleInputChange("therapyType", e.target.value)
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select therapy type</option>
                  {therapyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File Number
                </label>
                <input
                  type="text"
                  value={formData.fileNumber || ""}
                  onChange={(e) =>
                    handleInputChange("fileNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter file number"
                />
              </div>
            </div>
          </div>

          {/* Therapy Details */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Therapy Details
            </h3>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate || false}
                  onChange={(e) =>
                    handleInputChange("isPrivate", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPrivate"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Private
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasPrivatePlan"
                  checked={formData.hasPrivatePlan || false}
                  onChange={(e) =>
                    handleInputChange("hasPrivatePlan", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="hasPrivatePlan"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Has Private Plan
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isProvisionalRemedy"
                  checked={formData.isProvisionalRemedy || false}
                  onChange={(e) =>
                    handleInputChange("isProvisionalRemedy", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isProvisionalRemedy"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Provisional Remedy
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency per Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.frequencyPerWeek || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "frequencyPerWeek",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1-7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <select
                  value={formData.durationMinutes || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "durationMinutes",
                      parseInt(e.target.value) || 30
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select duration</option>
                  {durations.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <select
                  value={formData.location || ""}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select location</option>
                  <option value="Centro">Centro</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Escuela">Escuela</option>
                  <option value="Home">Home</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Additional Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber || ""}
                  onChange={(e) =>
                    handleInputChange("registrationNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter registration number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specialist Date
                </label>
                <input
                  type="date"
                  value={formData.specialistDate || ""}
                  onChange={(e) =>
                    handleInputChange("specialistDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any additional notes..."
              />
            </div>
          </div>

          {/* Form Actions */}
          {!hideButtons && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  if (isModal && onCancel) {
                    onCancel();
                  } else {
                    navigate("/certifications");
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Certification"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CertificationForm;
