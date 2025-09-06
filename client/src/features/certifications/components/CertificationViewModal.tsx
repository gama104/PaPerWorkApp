import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BaseModal } from "../../../shared/components/ui/BaseModal";
import { useResponsive } from "../../../hooks/useResponsive";
import { certificationService } from "../services/certificationService";
import { ScheduleForm } from "./ScheduleForm";
import { PatientSelector } from "./PatientSelector";
import type {
  CertificationDocument,
  ScheduleRequest,
  CertificationStatus,
} from "../types/certification.types";

interface CertificationViewModalProps {
  certification: CertificationDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (certification: CertificationDocument) => void;
  onDelete?: (certificationId: string) => void;
  onSave?: (
    certificationId: string | null,
    updatedCertification: Partial<CertificationDocument>
  ) => Promise<void>;
  mode?: "view" | "edit" | "create";
}

export const CertificationViewModal: React.FC<CertificationViewModalProps> = ({
  certification,
  isOpen,
  onClose,

  onDelete,
  onSave,
  mode = "view",
}) => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(
    mode === "edit" || mode === "create"
  );
  const [editedCertification, setEditedCertification] = useState<
    Partial<CertificationDocument>
  >({});
  const [editedSchedules, setEditedSchedules] = useState<ScheduleRequest[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Helper function to convert month name to number for form
  const getMonthNumberFromName = (monthName: string) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const index = monthNames.findIndex(
      (name) => name.toLowerCase() === monthName.toLowerCase()
    );
    return index >= 0 ? (index + 1).toString() : "1";
  };

  // Check if this is a new certification (creation mode)
  const isCreating = mode === "create";

  // Initialize edited certification when certification changes
  useEffect(() => {
    if (isCreating) {
      // For create mode, start with empty form
      setEditedCertification({
        patientId: "",
        therapyType: "",
        status: "draft" as CertificationStatus, // Type assertion for draft status
        duration: 30, // Default duration
        frequencyPerWeek: 1, // Default frequency
        month: (new Date().getMonth() + 1).toString(), // Current month as string
        year: new Date().getFullYear(), // Current year
        fileNumber: "",
        registrationNumber: "",
        referralNumber: "",
        location: "",
        isPrivate: false,
        hasPrivatePlan: false,
        isProvisionalRemedy: false,
        specialistDate: undefined,
        notes: "",
      });
      setEditedSchedules([]);
    } else if (certification) {
      // For edit/view mode, use existing certification data
      setEditedCertification({
        patientId: certification.patientId,
        therapyType: certification.therapyType,
        status: certification.status,
        duration: certification.duration,
        frequencyPerWeek: certification.frequencyPerWeek,
        month: getMonthNumberFromName(certification.month), // Convert to number for form
        year: certification.year,
        fileNumber: certification.fileNumber,
        registrationNumber: certification.registrationNumber,
        referralNumber: certification.referralNumber,
        location: certification.location,
        isPrivate: certification.isPrivate,
        hasPrivatePlan: certification.hasPrivatePlan,
        isProvisionalRemedy: certification.isProvisionalRemedy,
        specialistDate: certification.specialistDate,
        notes: certification.notes,
      });

      // Initialize schedules
      if (certification.schedules && certification.schedules.length > 0) {
        setEditedSchedules(
          certification.schedules.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            location: s.location || "",
          }))
        );
      } else {
        setEditedSchedules([]);
      }
    }
  }, [certification, isCreating]);

  if (!isOpen || (!certification && !isCreating)) return null;

  // Check if there are pending sessions (sessions that haven't been completed)
  const hasPendingSessions = () => {
    if (!certification?.sessions) return false;
    return certification.sessions.some(
      (session) =>
        !session.parentSignatureStatus ||
        session.parentSignatureStatus !== "signed"
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getMonthName = (month: string | number) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthStr = month.toString().toLowerCase();

    // Check if it's already a full month name
    const fullMonthName = monthNames.find(
      (name) => name.toLowerCase() === monthStr
    );

    if (fullMonthName) {
      return fullMonthName;
    }

    // Convert number to month name
    const monthNumber = parseInt(monthStr);
    if (!isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
      return monthNames[monthNumber - 1];
    }

    return "Unknown";
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

  const handleDelete = () => {
    if (
      certification &&
      window.confirm("Are you sure you want to delete this certification?")
    ) {
      onDelete?.(certification.id);
      onClose();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setValidationErrors({});
    setSuccessMessage("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValidationErrors({});
    setSuccessMessage("");

    if (isCreating) {
      // For create mode, reset to empty form
      setEditedCertification({
        patientId: "",
        therapyType: "",
        status: "draft" as CertificationStatus, // Type assertion for draft status
        duration: 30,
        frequencyPerWeek: 1,
        month: (new Date().getMonth() + 1).toString(), // Current month as string
        year: new Date().getFullYear(),
        fileNumber: "",
        registrationNumber: "",
        referralNumber: "",
        location: "",
        isPrivate: false,
        hasPrivatePlan: false,
        isProvisionalRemedy: false,
        specialistDate: undefined,
        notes: "",
      });
      setEditedSchedules([]);
    } else if (certification) {
      // For edit mode, reset to original values
      setEditedCertification({
        patientId: certification.patientId,
        therapyType: certification.therapyType,
        status: certification.status,
        duration: certification.duration,
        frequencyPerWeek: certification.frequencyPerWeek,
        month: getMonthNumberFromName(certification.month), // Convert to number for form
        year: certification.year,
        fileNumber: certification.fileNumber,
        registrationNumber: certification.registrationNumber,
        referralNumber: certification.referralNumber,
        location: certification.location,
        isPrivate: certification.isPrivate,
        hasPrivatePlan: certification.hasPrivatePlan,
        isProvisionalRemedy: certification.isProvisionalRemedy,
        specialistDate: certification.specialistDate,
        notes: certification.notes,
      });

      // Reset schedules to original values
      if (certification.schedules && certification.schedules.length > 0) {
        setEditedSchedules(
          certification.schedules.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            location: s.location || "",
          }))
        );
      } else {
        setEditedSchedules([]);
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!editedCertification.patientId) {
      errors.patientId = "Patient is required";
    }
    if (!editedCertification.therapyType) {
      errors.therapyType = "Therapy type is required";
    }
    if (!editedCertification.duration || editedCertification.duration <= 0) {
      errors.duration = "Duration must be greater than 0";
    }
    if (
      !editedCertification.frequencyPerWeek ||
      editedCertification.frequencyPerWeek <= 0
    ) {
      errors.frequencyPerWeek = "Frequency must be greater than 0";
    }
    if (!editedCertification.month) {
      errors.month = "Month is required";
    }
    if (
      !editedCertification.year ||
      editedCertification.year < 2020 ||
      editedCertification.year > 2030
    ) {
      errors.year = "Year must be between 2020 and 2030";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!onSave) return;

    // In create mode, we don't have a certification yet
    if (!isCreating && !certification) return;

    // Clear previous messages
    setValidationErrors({});
    setSuccessMessage("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Include schedules in the save operation
      // Convert schedules to match backend format
      const formattedSchedules = editedSchedules.map((schedule) => ({
        dayOfWeek: schedule.dayOfWeek,
        startTime:
          schedule.startTime.includes(":") &&
          schedule.startTime.split(":").length === 3
            ? schedule.startTime
            : `${schedule.startTime}:00`, // Ensure HH:mm:ss format
        location: schedule.location || null,
      }));

      // Convert month number to month name if needed
      const getMonthNameFromNumber = (month: string | number) => {
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const monthNum = typeof month === "string" ? parseInt(month) : month;
        return monthNames[monthNum - 1] || month.toString();
      };

      const monthToSend = editedCertification.month
        ? getMonthNameFromNumber(editedCertification.month)
        : getMonthNameFromNumber(certification?.month || "");

      const updatedCertification = {
        ...editedCertification,
        // Ensure month is sent as month name (backend expects full month name)
        month: monthToSend,
        // Ensure status is sent as string
        status: editedCertification.status || certification?.status || "draft",
        // Only include schedules if they exist
        ...(formattedSchedules.length > 0 && { schedules: formattedSchedules }),
      } as Partial<CertificationDocument>; // Type assertion needed due to schedule type mismatch

      // Debug: Log the data being sent
      console.log(
        "Sending certification data:",
        JSON.stringify(updatedCertification, null, 2)
      );
      console.log("Schedules data:", formattedSchedules);
      console.log("Complete certification object:", updatedCertification);

      if (isCreating) {
        // For create mode, pass null as the ID and the full certification data
        await onSave(null, updatedCertification);
        setSuccessMessage("Certification created successfully!");
      } else {
        // For edit mode, pass the existing certification ID
        await onSave(certification!.id, updatedCertification);
        setSuccessMessage("Certification saved successfully!");
      }
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Failed to save certification:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save certification. Please try again.";

      // Check if it's a session conflict error
      if (errorMessage.includes("Session conflicts detected")) {
        setValidationErrors({
          schedules: errorMessage,
        });
      } else {
        setValidationErrors({
          general: errorMessage,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewSessions = () => {
    if (certification?.id) {
      const searchParams = new URLSearchParams();
      searchParams.set("certificationId", certification.id);
      searchParams.set("month", certification.month.toString());
      searchParams.set("year", certification.year.toString());

      // Set patient name as search parameter for the general search field
      if (certification.patient?.fullName || certification.patientName) {
        searchParams.set(
          "patientName",
          certification.patient?.fullName || certification.patientName || ""
        );
      }

      // Set date range filters based on month and year
      const month = parseInt(certification.month.toString());
      const year = certification.year;

      if (month && year) {
        // Create start date (first day of the month)
        const startDate = new Date(year, month - 1, 1);
        // Create end date (last day of the month)
        const endDate = new Date(year, month, 0);

        searchParams.set("startDate", startDate.toISOString().split("T")[0]);
        searchParams.set("endDate", endDate.toISOString().split("T")[0]);
      }

      navigate(`/sessions?${searchParams.toString()}`);
      onClose();
    }
  };

  const handleDownloadPDF = async () => {
    if (!certification?.id) return;

    try {
      await certificationService.downloadCertificationPDF(certification.id);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      setValidationErrors({
        general: "Failed to download PDF. Please try again.",
      });
    }
  };

  const handleFieldChange = (
    field: string,
    value: string | number | boolean | null
  ) => {
    setEditedCertification((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper function to render form fields
  const renderField = (
    _label: string,
    field: string,
    type: "text" | "number" | "checkbox" | "textarea" | "select" = "text",
    placeholder?: string,
    options?: { value: string; label: string }[]
  ) => {
    const value =
      isEditing || isCreating
        ? editedCertification[field as keyof CertificationDocument]
        : certification?.[field as keyof CertificationDocument];

    const hasError = validationErrors[field as string];

    if (isEditing || isCreating) {
      switch (type) {
        case "number":
          return (
            <div>
              <input
                type="number"
                value={(value as number) || ""}
                onChange={(e) =>
                  handleFieldChange(field, parseInt(e.target.value) || 0)
                }
                placeholder={placeholder}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                  hasError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {hasError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {hasError}
                </p>
              )}
            </div>
          );
        case "checkbox":
          return (
            <div className="mt-1">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={(value as boolean) || false}
                  onChange={(e) => handleFieldChange(field, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {value ? "Yes" : "No"}
                </span>
              </label>
            </div>
          );
        case "textarea":
          return (
            <div>
              <textarea
                value={(value as string) || ""}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                placeholder={placeholder}
                rows={3}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                  hasError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {hasError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {hasError}
                </p>
              )}
            </div>
          );
        case "select":
          return (
            <div>
              <select
                value={(value as string | number) || ""}
                onChange={(e) => {
                  // For duration field, convert to number, otherwise keep as string
                  const newValue =
                    field === "duration"
                      ? parseInt(e.target.value) || 0
                      : e.target.value;
                  handleFieldChange(field, newValue);
                }}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                  hasError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                }`}
              >
                <option value="">Select an option</option>
                {options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {hasError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {hasError}
                </p>
              )}
            </div>
          );
        default:
          return (
            <div>
              <input
                type="text"
                value={(value as string) || ""}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                placeholder={placeholder}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                  hasError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {hasError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {hasError}
                </p>
              )}
            </div>
          );
      }
    } else {
      // View mode
      switch (type) {
        case "checkbox":
          return (
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {(value as boolean) ? "Yes" : "No"}
            </p>
          );
        case "textarea":
          return (
            <div className="mt-1 bg-gray-50 dark:bg-gray-800 rounded-md p-3">
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {(value as string) || "No notes"}
              </p>
            </div>
          );
        default:
          // Special handling for month field to show month name in view mode
          if (field === "month") {
            return (
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {getMonthName(value as string | number) || "Not specified"}
              </p>
            );
          }
          return (
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {(value as string | number) || "Not specified"}
            </p>
          );
      }
    }
  };

  // Footer configuration
  const footerConfig = {
    buttons: isCreating
      ? [
          {
            label: "Cancel",
            variant: "secondary" as const,
            onClick: onClose,
            disabled: isSaving,
          },
          {
            label: isSaving ? "Creating..." : "Create",
            variant: "primary" as const,
            onClick: handleSave,
            loading: isSaving,
            disabled: isSaving,
          },
        ]
      : isEditing
      ? [
          ...(onDelete
            ? [
                {
                  label: "Delete",
                  variant: "danger" as const,
                  onClick: handleDelete,
                  disabled: isSaving,
                },
              ]
            : []),
          {
            label: "Cancel",
            variant: "secondary" as const,
            onClick: handleCancel,
            disabled: isSaving,
          },
          {
            label: isSaving ? "Saving..." : "Save",
            variant: "primary" as const,
            onClick: handleSave,
            loading: isSaving,
            disabled: isSaving,
          },
        ]
      : [
          {
            label: "Edit",
            variant: "primary" as const,
            onClick: handleEdit,
          },
          {
            label: "View Sessions",
            variant: "secondary" as const,
            onClick: handleViewSessions,
          },
          {
            label: "Download PDF",
            variant: "secondary" as const,
            onClick: handleDownloadPDF,
          },
          {
            label: "Close",
            variant: "secondary" as const,
            onClick: onClose,
          },
        ],
    buttonAlignment: "right" as const,
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? "Create Certification" : "Certification Details"}
      subtitle={
        isCreating
          ? "Create a new certification"
          : `${certification?.therapyType} - ${getMonthName(
              certification?.month || ""
            )} ${certification?.year}`
      }
      footerConfig={footerConfig}
      contentClassName=""
    >
      <div className={`${isMobile ? "p-4" : "p-6"}`}>
        {/* Top Section - Read-only Header Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Certification Period */}
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">
                Certification Period
              </span>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                {isCreating
                  ? "Select month and year"
                  : `${getMonthName(certification?.month || "")} ${
                      certification?.year
                    }`}
              </p>
            </div>

            {/* Status */}
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">
                Status
              </span>
              <div className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    certification?.status || "draft"
                  )}`}
                >
                  {certification?.status || "draft"}
                </span>
              </div>
            </div>

            {/* Patient Info */}
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">
                Patient
              </span>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                {isCreating
                  ? "Select a patient"
                  : certification?.patient?.fullName ||
                    certification?.patientName ||
                    "Unknown Patient"}
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* General Error Message */}
        {validationErrors.general && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
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
                <p className="text-sm text-red-800 dark:text-red-200">
                  {validationErrors.general}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Section - Editable Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {isCreating
              ? "Certification Details"
              : isEditing
              ? "Edit Certification Details"
              : "Certification Information"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Therapy Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Therapy Type *
              </label>
              {renderField(
                "Therapy Type",
                "therapyType",
                "select",
                "Select therapy type",
                [
                  {
                    value: "Speech Language Therapy",
                    label: "Speech Language Therapy",
                  },
                  {
                    value: "Occupational Therapy",
                    label: "Occupational Therapy",
                  },
                  { value: "Physical Therapy", label: "Physical Therapy" },
                  { value: "Behavioral Therapy", label: "Behavioral Therapy" },
                ]
              )}
            </div>

            {/* Patient Selection - Only show in create mode or edit mode with no pending sessions */}
            {(isCreating || (isEditing && !hasPendingSessions())) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Patient *
                </label>
                <PatientSelector
                  selectedPatientId={
                    editedCertification.patientId ||
                    (certification?.patientId ?? "")
                  }
                  onPatientChange={(patientId) =>
                    handleFieldChange("patientId", patientId)
                  }
                  disabled={isEditing && hasPendingSessions()}
                  placeholder="Select a patient..."
                  error={validationErrors.patientId}
                />
                {isEditing && hasPendingSessions() && (
                  <p className="mt-1 text-sm text-amber-600">
                    Cannot change patient - there are pending sessions for this
                    certification.
                  </p>
                )}
              </div>
            )}

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (minutes) *
              </label>
              {renderField(
                "Duration",
                "duration",
                "select",
                "Select duration",
                [
                  { value: "15", label: "15 minutes" },
                  { value: "30", label: "30 minutes" },
                  { value: "45", label: "45 minutes" },
                  { value: "60", label: "60 minutes" },
                ]
              )}
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency (per week) *
              </label>
              {renderField(
                "Frequency",
                "frequencyPerWeek",
                "number",
                "Enter frequency per week"
              )}
            </div>

            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Month *
              </label>
              {renderField("Month", "month", "select", "Select month", [
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
              ])}
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year *
              </label>
              {renderField("Year", "year", "number", "Enter year")}
            </div>

            {/* File Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                File Number
              </label>
              {renderField(
                "File Number",
                "fileNumber",
                "text",
                "Enter file number"
              )}
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Registration Number
              </label>
              {renderField(
                "Registration Number",
                "registrationNumber",
                "text",
                "Enter registration number"
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              {renderField(
                "Location",
                "location",
                "select",
                "Select location",
                [
                  { value: "Clinic", label: "Clinic" },
                  { value: "Home", label: "Home" },
                  { value: "School", label: "School" },
                  { value: "Virtual", label: "Virtual" },
                ]
              )}
            </div>
          </div>

          {/* Certification Flags */}
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
              Certification Flags
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Private
                </label>
                {renderField("Private", "isPrivate", "checkbox")}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Has Private Plan
                </label>
                {renderField("Has Private Plan", "hasPrivatePlan", "checkbox")}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Provisional Remedy
                </label>
                {renderField(
                  "Provisional Remedy",
                  "isProvisionalRemedy",
                  "checkbox"
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            {renderField(
              "Notes",
              "notes",
              "textarea",
              "Enter certification notes..."
            )}
          </div>

          {/* Schedules Section */}
          <div>
            <ScheduleForm
              schedules={certification?.schedules || []}
              onSchedulesChange={setEditedSchedules}
              isEditing={isEditing || isCreating}
              disabled={isSaving}
              error={validationErrors.schedules}
            />
          </div>
        </div>

        {/* Metadata - Only show in view mode */}
        {!isEditing && !isCreating && certification && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {formatDate(certification.createdAt)}
              </div>
              <div>
                <span className="font-medium">Last Modified:</span>{" "}
                {certification.lastModifiedAt
                  ? formatDate(certification.lastModifiedAt)
                  : "Not available"}
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};
