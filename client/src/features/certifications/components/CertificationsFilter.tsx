// Certifications Filter Component
import React from "react";
import type { CertificationsFilterProps } from "../types/certification.types";
import { CertificationStatus } from "../types/certification.types";

export function CertificationsFilter({
  filter,
  onFilterChange,
  onReset,
  isLoading = false,
  patients = [],
  therapists = [],
}: CertificationsFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const statusOptions = [
    { value: CertificationStatus.DRAFT, label: "Draft" },
    { value: CertificationStatus.SUBMITTED, label: "Submitted" },
    { value: CertificationStatus.UNDER_REVIEW, label: "Under Review" },
    { value: CertificationStatus.APPROVED, label: "Approved" },
    { value: CertificationStatus.REJECTED, label: "Rejected" },
    {
      value: CertificationStatus.REVISION_REQUIRED,
      label: "Revision Required",
    },
  ];

  const handleFilterChange = (key: keyof typeof filter, value: any) => {
    onFilterChange({
      ...filter,
      [key]: value || undefined,
      page: 1, // Reset to first page when filtering
    });
  };

  const hasActiveFilters = Boolean(
    filter.search ||
      filter.patientId ||
      filter.therapistId ||
      filter.month ||
      filter.year ||
      filter.status ||
      filter.startDate ||
      filter.endDate
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Filter Certifications
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            disabled={isLoading}
            className="text-sm text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search
          </label>
          <input
            type="text"
            id="search"
            value={filter.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Search certifications..."
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Patient */}
        <div>
          <label
            htmlFor="patient"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Patient
          </label>
          <select
            id="patient"
            value={filter.patientId || ""}
            onChange={(e) => handleFilterChange("patientId", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">All Patients</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Therapist */}
        <div>
          <label
            htmlFor="therapist"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Therapist
          </label>
          <select
            id="therapist"
            value={filter.therapistId || ""}
            onChange={(e) => handleFilterChange("therapistId", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">All Therapists</option>
            {therapists.map((therapist) => (
              <option key={therapist.id} value={therapist.id}>
                {therapist.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div>
          <label
            htmlFor="month"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Month
          </label>
          <select
            id="month"
            value={filter.month || ""}
            onChange={(e) =>
              handleFilterChange(
                "month",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">All Months</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Year
          </label>
          <select
            id="year"
            value={filter.year || ""}
            onChange={(e) =>
              handleFilterChange(
                "year",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            value={filter.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={filter.startDate || ""}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={filter.endDate || ""}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Sort Options */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="sortBy"
              className="text-sm font-medium text-gray-700"
            >
              Sort by:
            </label>
            <select
              id="sortBy"
              value={filter.sortBy || "createdAt"}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              disabled={isLoading}
              className="px-3 py-1 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="createdAt">Created Date</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="status">Status</option>
              <option value="totalSessions">Total Sessions</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="sortDirection"
              className="text-sm font-medium text-gray-700"
            >
              Order:
            </label>
            <select
              id="sortDirection"
              value={filter.sortDirection || "desc"}
              onChange={(e) =>
                handleFilterChange("sortDirection", e.target.value)
              }
              disabled={isLoading}
              className="px-3 py-1 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificationsFilter;


