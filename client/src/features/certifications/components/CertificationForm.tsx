import React, { useEffect, useState } from "react";
import type {
  CertificationFormData,
  CertificationFormProps as BaseCertificationFormProps,
  Patient,
} from "../types/certification.types";
import { useForm } from "../../../shared/hooks/useForm";
import PatientSearch from "../../../components/PatientSearch";
import { certificationService } from "../services/certificationService";

interface CertificationFormProps extends BaseCertificationFormProps {
  patients?: Patient[];
  certificationId?: string;
  onPatientSearch?: (query: string) => Promise<Patient[]>;
  therapistName?: string;
  isPatientReadOnly?: boolean;
  error?: string | null;
}

const MONTHS = [
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

// Helper functions to convert between month names and numbers
const monthNameToNumber = (monthName: string): string => {
  const monthMap: { [key: string]: string } = {
    January: "1",
    February: "2",
    March: "3",
    April: "4",
    May: "5",
    June: "6",
    July: "7",
    August: "8",
    September: "9",
    October: "10",
    November: "11",
    December: "12",
  };
  return monthMap[monthName] || "";
};

const monthNumberToName = (monthNumber: string): string => {
  const month = MONTHS.find((m) => m.value === monthNumber);
  return month ? month.label : "";
};

const THERAPY_TYPES = [
  "Speech Language Therapy",
  "Occupational Therapy",
  "Physical Therapy",
  "Behavioral Therapy",
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "completed", label: "Completed" },
];

export const CertificationForm: React.FC<CertificationFormProps> = ({
  data: initialData,
  onSubmit,
  error = null,
  patients = [],
  certificationId,
  mode,
  therapistName = "",
  isPatientReadOnly = false,
}) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Schedule rows for inline editing
  const [scheduleRows, setScheduleRows] = useState<
    Array<{
      dayOfWeek: number;
      startTime: string;
      location?: string;
    }>
  >([]);

  const {
    data: formData,
    errors,
    updateField,
    setFormData,
    submit,
  } = useForm<CertificationFormData>(
    initialData
      ? {
          ...initialData,
          month: monthNameToNumber(initialData.month), // Convert month name to number
          specialistDate: initialData.specialistDate
            ? initialData.specialistDate.split("T")[0] // Convert datetime to date only
            : "",
        }
      : {
          patientId: "",
          month: "",
          year: new Date().getFullYear(),
          therapyType: "",
          status: "draft",
          fileNumber: "",
          isPrivate: false,
          hasPrivatePlan: false,
          isProvisionalRemedy: false,
          frequencyPerWeek: undefined,
          duration: 30,
          registrationNumber: "",
          specialistDate: "",
        }
  );

  // Debug logging
  console.log("🔄 CertificationForm - initialData:", initialData);
  console.log("🔄 CertificationForm - initialData.month:", initialData?.month);
  console.log(
    "🔄 CertificationForm - converted month:",
    initialData ? monthNameToNumber(initialData.month) : "N/A"
  );
  console.log("🔄 CertificationForm - formData.month:", formData.month);
  console.log("🔄 CertificationForm - mode:", mode);

  // Initialize patient selection when initialData changes
  useEffect(() => {
    if (initialData?.patientId) {
      const patient = patients.find((p) => p.id === initialData.patientId);
      if (patient) {
        setSelectedPatient(patient);
      }
    }
  }, [initialData?.patientId, patients]);

  // Load existing schedules when editing (only once)
  const [schedulesLoaded, setSchedulesLoaded] = useState(false);

  useEffect(() => {
    const loadSchedules = async () => {
      if (certificationId && mode === "edit" && !schedulesLoaded) {
        try {
          console.log(
            "🔄 Loading schedules for certification:",
            certificationId
          );
          const schedules = await certificationService.getSchedules(
            certificationId
          );
          console.log("✅ Loaded schedules:", schedules);

          // Handle case where schedules might be undefined or null
          if (schedules && Array.isArray(schedules) && schedules.length > 0) {
            const scheduleRows = schedules.map((schedule) => ({
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime.substring(0, 5), // Convert "HH:MM:SS" to "HH:MM" for HTML time input
              location: schedule.location || "Clinic",
            }));
            console.log(
              "🔄 Schedule time conversion (loading):",
              schedules.map((s) => ({
                original: s.startTime,
                converted: s.startTime.substring(0, 5),
              }))
            );
            setScheduleRows(scheduleRows);
          } else {
            console.log(
              "📝 No schedules found or invalid response format - keeping existing schedule rows"
            );
            // Don't clear existing schedule rows if API returns undefined
            // This prevents user-added schedules from being cleared
          }
          setSchedulesLoaded(true);
        } catch (error) {
          console.error("❌ Failed to load schedules:", error);
          // Don't break the form if schedules fail to load
          // Don't clear existing schedule rows on error
          console.log("📝 Keeping existing schedule rows due to error");
          setSchedulesLoaded(true);
        }
      }
    };

    loadSchedules();
  }, [certificationId, mode, schedulesLoaded]);

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    updateField("patientId", patient.id);
  };

  // Schedule row management functions
  const addScheduleRow = () => {
    // Find available days (not already used)
    const usedDays = scheduleRows.map((row) => row.dayOfWeek);
    const availableDays = [0, 1, 2, 3, 4, 5, 6].filter(
      (day) => !usedDays.includes(day)
    );

    if (availableDays.length === 0) {
      alert(
        "All days of the week are already scheduled. Please remove a schedule first."
      );
      return;
    }

    setScheduleRows([
      ...scheduleRows,
      {
        dayOfWeek: availableDays[0], // Use first available day
        startTime: "09:00",
        location: "Clinic",
      },
    ]);
  };

  const updateScheduleRow = (
    index: number,
    field: string,
    value: string | number
  ) => {
    // If updating dayOfWeek, check for duplicates
    if (field === "dayOfWeek") {
      const usedDays = scheduleRows
        .map((row, i) => (i !== index ? row.dayOfWeek : null))
        .filter((day) => day !== null);

      if (usedDays.includes(value as number)) {
        alert("This day is already scheduled. Please choose a different day.");
        return;
      }
    }

    const updatedRows = [...scheduleRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setScheduleRows(updatedRows);
  };

  const removeScheduleRow = (index: number) => {
    const updatedRows = scheduleRows.filter((_, i) => i !== index);
    setScheduleRows(updatedRows);
  };

  // Validation rules
  const validationRules = {
    patientId: (value: string) => (!value ? "Please select a patient" : null),
    month: (value: string) => (!value ? "Please select a month" : null),
    year: (value: number) =>
      !value || value < 2020 || value > 2030
        ? "Please enter a valid year"
        : null,
    therapyType: (value: string) =>
      !value ? "Please select a therapy type" : null,
    status: (value: string) => (!value ? "Please select a status" : null),
    fileNumber: (value: string) =>
      !value ? "Please enter a file number" : null,
    isPrivate: () => null,
    hasPrivatePlan: () => null,
    isProvisionalRemedy: () => null,
    frequencyPerWeek: (value: number | undefined) =>
      value !== undefined && (value < 1 || value > 7)
        ? "Frequency must be between 1 and 7"
        : null,
    duration: (value: number | undefined) =>
      value !== undefined && (value < 15 || value > 180)
        ? "Duration must be between 15 and 180 minutes"
        : null,
    registrationNumber: (value: string) =>
      !value ? "Please enter a registration number" : null,
    location: () => null,
    specialistDate: (value: string) =>
      !value ? "Please enter a specialist date" : null,
    notes: () => null,
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log("🔄 CertificationForm - handleSubmit called");
    console.log("🔄 CertificationForm - Current form data:", formData);
    console.log("🔄 CertificationForm - Current schedule rows:", scheduleRows);

    const success = await submit(async (data) => {
      // Include schedules in the form data and convert month number back to name
      const formDataWithSchedules = {
        ...data,
        month: monthNumberToName(data.month), // Convert month number back to name
        schedules:
          scheduleRows.length > 0
            ? scheduleRows.map((schedule) => ({
                ...schedule,
                startTime: schedule.startTime + ":00", // Convert "HH:MM" to "HH:MM:SS" for TimeSpan
              }))
            : undefined,
      };

      console.log(
        "🔄 CertificationForm - Calling onSubmit with data:",
        formDataWithSchedules
      );
      console.log(
        "🔄 CertificationForm - Schedule time conversion:",
        scheduleRows.map((s) => ({
          original: s.startTime,
          converted: s.startTime + ":00",
        }))
      );
      await onSubmit(formDataWithSchedules);
    }, validationRules);

    if (success) {
      // Form submitted successfully
      console.log("✅ Certification form submitted successfully");
    } else {
      console.log("❌ Certification form submission failed");
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <form
      id="certification-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Patient Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Patient *
        </label>
        {isPatientReadOnly && selectedPatient ? (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {selectedPatient.fullName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              DOB: {selectedPatient.dateOfBirth}
            </p>
          </div>
        ) : (
          <PatientSearch
            selectedPatient={selectedPatient}
            onPatientSelect={(patient) =>
              patient && handlePatientSelect(patient)
            }
            placeholder="Search for a patient..."
          />
        )}
        {errors.patientId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.patientId}
          </p>
        )}
      </div>

      {/* Therapist Name (Read-only) */}
      {therapistName && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Therapist Name
          </label>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {therapistName}
            </p>
          </div>
        </div>
      )}

      {/* Month and Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Month *
          </label>
          <select
            value={formData.month}
            onChange={(e) => updateField("month", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
              errors.month
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <option value="">Select month</option>
            {MONTHS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          {errors.month && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.month}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Year *
          </label>
          <select
            value={formData.year}
            onChange={(e) => updateField("year", parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
              errors.year
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.year && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.year}
            </p>
          )}
        </div>
      </div>

      {/* Therapy Type, Duration and Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Therapy Type *
          </label>
          <select
            value={formData.therapyType}
            onChange={(e) => updateField("therapyType", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
              errors.therapyType
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <option value="">Select therapy type</option>
            {THERAPY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.therapyType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.therapyType}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Duration *
          </label>
          <select
            value={formData.duration}
            onChange={(e) => updateField("duration", parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
              errors.duration
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <option value="">Select duration</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
          </select>
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.duration}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status *
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              updateField(
                "status",
                e.target.value as "draft" | "submitted" | "completed"
              )
            }
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
              errors.status
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.status}
            </p>
          )}
        </div>
      </div>

      {/* Therapy Schedule Management */}
      {
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Therapy Schedule
            </label>
            <button
              type="button"
              onClick={addScheduleRow}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Add Schedule
            </button>
          </div>

          {scheduleRows.length > 0 ? (
            <div className="space-y-3">
              {scheduleRows.map((schedule, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Day of Week */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Day *
                      </label>
                      <select
                        value={schedule.dayOfWeek}
                        onChange={(e) =>
                          updateScheduleRow(
                            index,
                            "dayOfWeek",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                        <option value={7}>Sunday</option>
                      </select>
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) =>
                          updateScheduleRow(index, "startTime", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <select
                        value={schedule.location || ""}
                        onChange={(e) =>
                          updateScheduleRow(index, "location", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        <option value="">Select location</option>
                        <option value="Clinic">Clinic</option>
                        <option value="School">School</option>
                        <option value="Virtual">Virtual</option>
                        <option value="Home">Home</option>
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeScheduleRow(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <svg
                className="mx-auto h-8 w-8 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">No therapy schedules added yet</p>
              <p className="text-xs">
                Click "Add Schedule" to set up weekly therapy times
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Sessions will be created automatically for the selected month
              </p>
            </div>
          )}
        </div>
      }

      {/* File Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          File Number
        </label>
        <input
          type="text"
          value={formData.fileNumber || ""}
          onChange={(e) => updateField("fileNumber", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          placeholder="e.g., 000000"
        />
      </div>

      {/* Registration Number and Specialist Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Registration Number
          </label>
          <input
            type="text"
            value={formData.registrationNumber || ""}
            onChange={(e) => updateField("registrationNumber", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="e.g., 000000000000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Specialist Date
          </label>
          <input
            type="date"
            value={formData.specialistDate || ""}
            onChange={(e) => updateField("specialistDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPrivate"
            checked={formData.isPrivate || false}
            onChange={(e) => updateField("isPrivate", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <label
            htmlFor="isPrivate"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Private
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="hasPrivatePlan"
            checked={formData.hasPrivatePlan || false}
            onChange={(e) => updateField("hasPrivatePlan", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <label
            htmlFor="hasPrivatePlan"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
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
              updateField("isProvisionalRemedy", e.target.checked)
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <label
            htmlFor="isProvisionalRemedy"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Provisional Remedy
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
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
      )}

      {/* Submit Error */}
      {errors.submit && (
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
              <p className="text-sm text-red-800 dark:text-red-200">
                {errors.submit}
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
