import React, { useState } from "react";
import type { Schedule, ScheduleRequest } from "../types/certification.types";

interface ScheduleFormProps {
  schedules: Schedule[];
  onSchedulesChange: (schedules: ScheduleRequest[]) => void;
  isEditing?: boolean;
  disabled?: boolean;
  error?: string;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  schedules,
  onSchedulesChange,
  isEditing = false,
  disabled = false,
  error,
}) => {
  const [localSchedules, setLocalSchedules] = useState<ScheduleRequest[]>(
    schedules.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      location: s.location || "",
    }))
  );

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleScheduleChange = (
    index: number,
    field: keyof ScheduleRequest,
    value: string | number
  ) => {
    const updatedSchedules = [...localSchedules];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      [field]: value,
    };
    setLocalSchedules(updatedSchedules);
    onSchedulesChange(updatedSchedules);
  };

  const addSchedule = () => {
    const newSchedule: ScheduleRequest = {
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      location: "",
    };
    const updatedSchedules = [...localSchedules, newSchedule];
    setLocalSchedules(updatedSchedules);
    onSchedulesChange(updatedSchedules);
  };

  const removeSchedule = (index: number) => {
    const updatedSchedules = localSchedules.filter((_, i) => i !== index);
    setLocalSchedules(updatedSchedules);
    onSchedulesChange(updatedSchedules);
  };

  if (!isEditing && localSchedules.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        No schedules configured for this certification.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
          Therapy Schedules
        </h4>
        {isEditing && !disabled && (
          <button
            type="button"
            onClick={addSchedule}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Schedule
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
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

      {localSchedules.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No schedules added yet. Click "Add Schedule" to create therapy
          schedules.
        </div>
      ) : (
        <div className="space-y-3">
          {localSchedules.map((schedule, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Day of Week */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Day of Week
                  </label>
                  {isEditing && !disabled ? (
                    <select
                      value={schedule.dayOfWeek}
                      onChange={(e) =>
                        handleScheduleChange(
                          index,
                          "dayOfWeek",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {dayNames.map((day, dayIndex) => (
                        <option key={dayIndex} value={dayIndex}>
                          {day}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {dayNames[schedule.dayOfWeek]}
                    </p>
                  )}
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  {isEditing && !disabled ? (
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) =>
                        handleScheduleChange(index, "startTime", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {schedule.startTime}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  {isEditing && !disabled ? (
                    <select
                      value={schedule.location || ""}
                      onChange={(e) =>
                        handleScheduleChange(index, "location", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select location</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Home">Home</option>
                      <option value="School">School</option>
                      <option value="Virtual">Virtual</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {schedule.location || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              {isEditing && !disabled && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeSchedule(index)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Text */}
      {isEditing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tip:</strong> Schedules define when therapy sessions
                occur during the month. Sessions will be automatically created
                based on these schedules for the certification period.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
