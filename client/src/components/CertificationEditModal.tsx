import React, { useState, useEffect } from "react";
import { apiClient } from "../services/apiClient";
import PatientSearch from "./PatientSearch";
import CertificationSessionsView from "./CertificationSessionsView";
import { useAuth } from "../features/auth";
import type { CertificationDocument, Patient } from "../types";

interface CertificationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification: CertificationDocument | null;
  onSave: () => void;
  onBackToView: () => void;
}

interface EditFormData {
  selectedPatient: Patient | null;
  month: string;
  year: number;
  therapyType: string;
  status: "draft" | "submitted" | "completed";
  fileNumber?: string;
  isPrivate?: boolean;
  hasPrivatePlan?: boolean;
  isProvisionalRemedy?: boolean;
  frequencyPerWeek?: number;
  duration?: number; // Duration in minutes
  registrationNumber?: string;
  location?: string;
  therapistName?: string;
  specialistDate?: string;
}

const CertificationEditModal: React.FC<CertificationEditModalProps> = ({
  isOpen,
  onClose,
  certification,
  onSave,
  onBackToView,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSessions, setHasSessions] = useState(false);
  const [showSessionsView, setShowSessionsView] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    selectedPatient: null,
    month: "",
    year: new Date().getFullYear(),
    therapyType: "",
    status: "draft",
    therapistName: user ? `${user.firstName} ${user.lastName}` : "",
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
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "60 minutes" },
    { value: 90, label: "90 minutes" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  // Initialize form data when certification changes
  useEffect(() => {
    if (certification) {
      // Check if certification has therapy sessions
      const hasExistingSessions =
        certification.therapySessions &&
        certification.therapySessions.length > 0;
      setHasSessions(hasExistingSessions);

      // Find month value from label or handle numeric month
      console.log(
        "Certification month value:",
        certification.month,
        "Type:",
        typeof certification.month
      );

      let monthValue = "";
      if (typeof certification.month === "number") {
        // Month is stored as number (1-12)
        monthValue = certification.month.toString();
      } else if (typeof certification.month === "string") {
        if (certification.month.match(/^\d+$/)) {
          // Month is stored as string number ("1", "2", etc.)
          monthValue = certification.month;
        } else {
          // Month is stored as label ("January", "February", etc.)
          monthValue =
            months.find((m) => m.label === certification.month)?.value || "";
        }
      }

      console.log("Resolved month value:", monthValue);
      console.log("Certification duration:", certification.duration);
      console.log("Certification patient data:", certification.patient);
      console.log("Patient fullName:", certification.patient?.fullName);

      setFormData({
        selectedPatient: certification.patient,
        month: monthValue,
        year: certification.year,
        therapyType: certification.therapyType,
        status: certification.status as "draft" | "submitted" | "completed",
        fileNumber: certification.fileNumber || "",
        isPrivate: certification.isPrivate || false,
        hasPrivatePlan: certification.hasPrivatePlan || false,
        isProvisionalRemedy: certification.isProvisionalRemedy || false,
        frequencyPerWeek: certification.frequencyPerWeek || undefined,
        duration: certification.duration || "",
        registrationNumber: certification.registrationNumber || "",
        location: certification.location || "",
        therapistName: user ? `${user.firstName} ${user.lastName}` : "",
        specialistDate: certification.specialistDate
          ? new Date(certification.specialistDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [certification, user]);

  // Update therapist name when user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        therapistName: `${user.firstName} ${user.lastName}`,
      }));
    }
  }, [user]);

  // Content switching functions
  const goToMain = () => {
    setShowSessionsView(false);
  };

  // Session management functions

  const handleInputChange = (
    field: keyof EditFormData,
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

    if (!certification) return;

    // Validation
    if (!formData.selectedPatient) {
      setError("Please select a patient");
      return;
    }

    if (!formData.month || !formData.year || !formData.therapyType) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Prepare update data (without patientId - can't change patient during update)
      const updateData = {
        month:
          months.find((m) => m.value === formData.month)?.label ||
          formData.month,
        year: formData.year,
        therapyType: formData.therapyType,
        status: formData.status,
        location: formData.location || null,
        fileNumber: formData.fileNumber || null,
        isPrivate: formData.isPrivate || false,
        hasPrivatePlan: formData.hasPrivatePlan || false,
        isProvisionalRemedy: formData.isProvisionalRemedy || false,
        frequencyPerWeek: formData.frequencyPerWeek || null,
        duration: formData.duration || null,
        registrationNumber: formData.registrationNumber || null,
        specialistDate: formData.specialistDate || null,
      };

      console.log("Updating certification with data:", updateData);
      console.log("Duration value being sent:", formData.duration);

      await api.certifications.update(certification.id, updateData);

      console.log("Certification updated successfully");

      onSave();
    } catch (err) {
      console.error("Error updating certification:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update certification"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !certification) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              {showSessionsView && (
                <button
                  onClick={goToMain}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Back to Form</span>
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {showSessionsView
                    ? "Therapy Sessions"
                    : "Edit Certification Document"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {showSessionsView
                    ? "Manage therapy sessions for this certification"
                    : "Modify certification details"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="m-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
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
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Conditional Content Rendering */}
          {!showSessionsView ? (
            /* Main Form View */
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 pb-0 space-y-6">
                {/* Patient Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Patient Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Patient *{" "}
                      {hasSessions && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          (Cannot change - has sessions)
                        </span>
                      )}
                    </label>
                    {hasSessions ? (
                      <div className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md">
                        {formData.selectedPatient?.fullName ||
                          "No patient selected"}
                      </div>
                    ) : (
                      <PatientSearch
                        selectedPatient={formData.selectedPatient}
                        onPatientSelect={(patient) =>
                          handleInputChange("selectedPatient", patient)
                        }
                        placeholder="Search for a patient by name..."
                      />
                    )}
                  </div>
                </div>

                {/* Certification Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Certification Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Month *{" "}
                        {hasSessions && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            (Cannot change - has sessions)
                          </span>
                        )}
                      </label>
                      <select
                        value={formData.month}
                        onChange={(e) =>
                          handleInputChange("month", e.target.value)
                        }
                        required
                        disabled={hasSessions}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          hasSessions
                            ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        }`}
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
                        Year *{" "}
                        {hasSessions && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            (Cannot change - has sessions)
                          </span>
                        )}
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) =>
                          handleInputChange("year", parseInt(e.target.value))
                        }
                        required
                        disabled={hasSessions}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          hasSessions
                            ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        }`}
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
                            e.target.value as
                              | "draft"
                              | "submitted"
                              | "completed"
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Therapy Details
                  </h3>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-isPrivate"
                        checked={formData.isPrivate || false}
                        onChange={(e) =>
                          handleInputChange("isPrivate", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="edit-isPrivate"
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        Private
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-hasPrivatePlan"
                        checked={formData.hasPrivatePlan || false}
                        onChange={(e) =>
                          handleInputChange("hasPrivatePlan", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="edit-hasPrivatePlan"
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        Has Private Plan
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-isProvisionalRemedy"
                        checked={formData.isProvisionalRemedy || false}
                        onChange={(e) =>
                          handleInputChange(
                            "isProvisionalRemedy",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="edit-isProvisionalRemedy"
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
                        value={formData.duration || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "duration",
                            parseInt(e.target.value) || undefined
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
                        Therapist Name
                      </label>
                      <input
                        type="text"
                        value={formData.therapistName || ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                        placeholder="Auto-populated from current user"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This field is automatically populated with your name
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={formData.registrationNumber || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "registrationNumber",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter registration number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                </div>
              </form>
            </div>
          ) : (
            /* Sessions View */
            certification && (
              <CertificationSessionsView
                certification={certification}
                onViewChange={() => {}} // Not needed for edit modal, but required by interface
              />
            )
          )}
        </div>

        {/* Footer - Always Visible */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this certification?"
                  )
                ) {
                  // TODO: Implement delete functionality
                  console.log("Delete certification:", certification?.id);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onBackToView}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to View
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationEditModal;
