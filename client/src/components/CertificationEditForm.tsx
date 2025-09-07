import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../features/auth";
import PatientSearch from "./PatientSearch";
import type { CertificationDocument, Patient } from "../types";

interface CertificationEditFormProps {
  certification: CertificationDocument;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  onFormReady?: (submitForm: (() => void) | null) => void;
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

export default function CertificationEditForm({
  certification,
  onSave,
  onFormReady,
}: CertificationEditFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formReadyRef = useRef(false);
  const [formData, setFormData] = useState<EditFormData>({
    selectedPatient: null,
    month: "",
    year: new Date().getFullYear(),
    therapyType: "",
    status: "draft",
    therapistName: user ? `${user.firstName} ${user.lastName}` : "",
  });

  const months = useMemo(
    () => [
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
    ],
    []
  );

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

  // Initialize form data only once when certification first loads
  const initializationRef = useRef<string | null>(null);

  useEffect(() => {
    if (certification && initializationRef.current !== certification.id) {
      console.log(
        "🔄 Initializing form data for certification ID:",
        certification.id
      );
      console.log("🔄 Certification object:", certification);
      console.log("🔄 Current form data before reset:", formData);

      // Find month value from label or handle numeric month
      let monthValue = "";
      if (certification.month) {
        const monthObj = months.find((m) => m.label === certification.month);
        monthValue = monthObj ? monthObj.value : certification.month;
      }

      // Format specialistDate to yyyy-MM-dd if it exists
      let formattedSpecialistDate = "";
      if (certification.specialistDate) {
        try {
          const date = new Date(certification.specialistDate);
          if (!isNaN(date.getTime())) {
            formattedSpecialistDate = date.toISOString().split("T")[0];
          }
        } catch {
          console.warn(
            "Could not parse specialist date:",
            certification.specialistDate
          );
        }
      }

      setFormData({
        selectedPatient: certification.patient || null,
        month: monthValue,
        year: certification.year || new Date().getFullYear(),
        therapyType: certification.therapyType || "",
        status:
          (certification.status as "draft" | "submitted" | "completed") ||
          "draft",
        fileNumber: certification.fileNumber || "",
        isPrivate: certification.isPrivate || false,
        hasPrivatePlan: certification.hasPrivatePlan || false,
        isProvisionalRemedy: certification.isProvisionalRemedy || false,
        frequencyPerWeek: certification.frequencyPerWeek || undefined,
        duration: certification.duration || undefined,
        registrationNumber: certification.registrationNumber || "",
        location: certification.location || "",
        therapistName: user ? `${user.firstName} ${user.lastName}` : "",
        specialistDate: formattedSpecialistDate,
      });

      initializationRef.current = certification.id;
      console.log(
        "✅ Form data initialized successfully for ID:",
        certification.id
      );
    }
  }, [certification, user, months]);

  // BULLETPROOF: Direct state access function - no closures, no stale data
  const submitForm = async () => {
    // Get the LATEST form data directly from state
    const currentFormData = formData;

    if (!currentFormData.selectedPatient) {
      setError("Please select a patient");
      return;
    }

    if (
      !currentFormData.month ||
      !currentFormData.year ||
      !currentFormData.therapyType
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const monthLabel =
        months.find((m) => m.value === currentFormData.month)?.label ||
        currentFormData.month;

      // Map to backend DTO format (PascalCase as per UpdateCertificationRequest)
      const updateData: Record<string, unknown> = {
        Month: currentFormData.month, // Send integer, not string
        Year: currentFormData.year,
        TherapyType: currentFormData.therapyType,
        Status: currentFormData.status,
        FileNumber: currentFormData.fileNumber || "",
        IsPrivate: currentFormData.isPrivate || false,
        HasPrivatePlan: currentFormData.hasPrivatePlan || false,
        IsProvisionalRemedy: currentFormData.isProvisionalRemedy || false,
        RegistrationNumber: currentFormData.registrationNumber || "",
        Location: currentFormData.location || "",
        SpecialistDate: currentFormData.specialistDate || "",
      };

      // Only include FrequencyPerWeek if it has a value
      if (
        currentFormData.frequencyPerWeek !== undefined &&
        currentFormData.frequencyPerWeek !== null
      ) {
        updateData.FrequencyPerWeek = currentFormData.frequencyPerWeek;
      }

      // Only include Duration if it has a value
      if (
        currentFormData.duration !== undefined &&
        currentFormData.duration !== null
      ) {
        updateData.Duration = currentFormData.duration;
      }

      console.log("💾 CertificationEditForm calling onSave with:", updateData);
      console.log("📊 Individual field values:", {
        frequencyPerWeek: currentFormData.frequencyPerWeek,
        frequencyPerWeekType: typeof currentFormData.frequencyPerWeek,
        duration: currentFormData.duration,
        durationType: typeof currentFormData.duration,
        location: currentFormData.location,
        fileNumber: currentFormData.fileNumber,
        registrationNumber: currentFormData.registrationNumber,
      });
      console.log("📊 Full form data:", currentFormData);
      console.log("🚨 DEBUGGING FREQUENCY VALUE:", {
        formDataFrequency: currentFormData.frequencyPerWeek,
        updateDataFrequency: updateData.FrequencyPerWeek,
        willIncludeInUpdate:
          currentFormData.frequencyPerWeek !== undefined &&
          currentFormData.frequencyPerWeek !== null,
        rawFormDataDump: JSON.stringify(currentFormData, null, 2),
      });

      await onSave(updateData);
      console.log("✅ CertificationEditForm onSave completed");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update certification"
      );
    } finally {
      setLoading(false);
    }
  };

  // Simple form handler for direct form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData((prev) => ({ ...prev, selectedPatient: patient }));
  };

  // Expose form submission function to parent
  useEffect(() => {
    const isFormValid =
      formData.selectedPatient && formData.month && formData.therapyType;

    console.log("🔧 Form ready effect running:", {
      isFormValid,
      hasOnFormReady: !!onFormReady,
      formReadyRef: formReadyRef.current,
      patient: formData.selectedPatient?.fullName,
      month: formData.month,
      therapyType: formData.therapyType,
    });

    if (onFormReady && isFormValid && !formReadyRef.current) {
      console.log("✅ Setting form as ready for the first time");
      formReadyRef.current = true;
      onFormReady(() => {
        console.log("🚀 Form submission function called from parent");
        // Call the bulletproof submitForm directly - no stale closures!
        submitForm();
      });
    } else if (onFormReady && !isFormValid && formReadyRef.current) {
      console.log("❌ Form no longer valid, clearing submission function");
      formReadyRef.current = false;
      onFormReady(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    onFormReady,
    formData.selectedPatient,
    formData.month,
    formData.therapyType,
    // submitForm is intentionally excluded to prevent stale closure issues
  ]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Updating certification...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 h-full">
      <div className="space-y-4 min-h-full">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Patient Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Patient *
                </label>
                {formData.selectedPatient ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {formData.selectedPatient.fullName}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          selectedPatient: null,
                        }))
                      }
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <PatientSearch
                    selectedPatient={formData.selectedPatient}
                    onPatientSelect={(patient) =>
                      patient && handlePatientSelect(patient)
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Certification Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Certification Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month *
                </label>
                <select
                  value={formData.month}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, month: e.target.value }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Select Month</option>
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
                    setFormData((prev) => ({
                      ...prev,
                      year: parseInt(e.target.value),
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
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
                  Therapy Type *
                </label>
                <select
                  value={formData.therapyType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      therapyType: e.target.value,
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Select Therapy Type</option>
                  {therapyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as
                        | "draft"
                        | "submitted"
                        | "completed",
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Duration</option>
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
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File Number
                </label>
                <input
                  type="text"
                  value={formData.fileNumber || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fileNumber: e.target.value,
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter file number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      registrationNumber: e.target.value,
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter registration number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency per Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.frequencyPerWeek || ""}
                  onChange={(e) => {
                    const newValue = e.target.value
                      ? parseInt(e.target.value)
                      : undefined;
                    console.log("🔢 FREQUENCY CHANGE:", {
                      oldValue: formData.frequencyPerWeek,
                      newInputValue: e.target.value,
                      parsedValue: newValue,
                      formDataBefore: formData.frequencyPerWeek,
                    });
                    setFormData((prev) => {
                      const updated = {
                        ...prev,
                        frequencyPerWeek: newValue,
                      };
                      console.log("🔢 FORM STATE UPDATED:", {
                        oldFreq: prev.frequencyPerWeek,
                        newFreq: updated.frequencyPerWeek,
                        fullUpdatedState: updated,
                      });
                      console.log("🔢 Setting form data to:", updated);
                      return updated;
                    });
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="1-7"
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
                    setFormData((prev) => ({
                      ...prev,
                      specialistDate: e.target.value,
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Flags
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPrivate || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPrivate: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Private
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasPrivatePlan || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hasPrivatePlan: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Has Private Plan
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isProvisionalRemedy || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isProvisionalRemedy: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Provisional Remedy
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
