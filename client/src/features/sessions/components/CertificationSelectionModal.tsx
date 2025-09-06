import React, { useState, useEffect, useMemo } from "react";
import { BaseModal } from "../../../shared/components/ui/BaseModal";
import { LoadingSpinner } from "../../../shared/components/ui/LoadingSpinner";
import {
  certificationService,
  type CertificationForSessionsResponse,
} from "../../certifications/services/certificationService";
import type { CertificationDocument } from "../../certifications/types/certification.types";

interface CertificationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCertification: (certification: CertificationDocument) => void;
}

// We'll use the lightweight response directly

interface CertificationFilters {
  search: string;
  month: string;
  year: string;
}

/**
 * CertificationSelectionModal - Handles certification selection for session creation
 * Follows Single Responsibility Principle by focusing only on certification selection
 */
export const CertificationSelectionModal: React.FC<
  CertificationSelectionModalProps
> = ({ isOpen, onClose, onSelectCertification }) => {
  const [certifications, setCertifications] = useState<
    CertificationForSessionsResponse[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CertificationFilters>({
    search: "",
    month: "",
    year: "",
  });

  // Load certifications and patients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const certificationsData =
        await certificationService.getCertificationsForSessions();
      setCertifications(certificationsData);
    } catch (err) {
      console.error("Failed to load certifications:", err);
      setError("Failed to load certifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort certifications based on filters
  const filteredAndSortedCertifications = useMemo(() => {
    let filtered = certifications.filter((cert) => {
      // Search filter (patient name, therapy type)
      const matchesSearch =
        !filters.search ||
        cert.patientName
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        cert.therapyType?.toLowerCase().includes(filters.search.toLowerCase());

      // Month filter - handle both numeric and string month values
      const matchesMonth =
        !filters.month ||
        (() => {
          const filterMonth = filters.month.toLowerCase();
          const certMonth = cert.month?.toLowerCase() || "";

          // Direct match
          if (certMonth === filterMonth) return true;

          // Handle numeric month conversion
          const monthNumberMap: { [key: string]: string } = {
            "1": "january",
            "2": "february",
            "3": "march",
            "4": "april",
            "5": "may",
            "6": "june",
            "7": "july",
            "8": "august",
            "9": "september",
            "10": "october",
            "11": "november",
            "12": "december",
          };

          // If certification month is numeric, convert it
          if (monthNumberMap[cert.month || ""]) {
            return monthNumberMap[cert.month || ""] === filterMonth;
          }

          return false;
        })();

      // Year filter
      const matchesYear =
        !filters.year || cert.year?.toString().includes(filters.year);

      return matchesSearch && matchesMonth && matchesYear;
    });

    // Sort by latest date (year desc, month desc, then by created date desc)
    return filtered.sort((a, b) => {
      // First sort by year (descending)
      if (a.year !== b.year) {
        return (b.year || 0) - (a.year || 0);
      }

      // Then by month (descending) - convert month names to numbers for proper sorting
      const monthOrder: { [key: string]: number } = {
        january: 1,
        february: 2,
        march: 3,
        april: 4,
        may: 5,
        june: 6,
        july: 7,
        august: 8,
        september: 9,
        october: 10,
        november: 11,
        december: 12,
      };

      const aMonthNum = monthOrder[a.month?.toLowerCase() || ""] || 0;
      const bMonthNum = monthOrder[b.month?.toLowerCase() || ""] || 0;

      if (aMonthNum !== bMonthNum) {
        return bMonthNum - aMonthNum;
      }

      // Finally by patient name (ascending)
      return a.patientName.localeCompare(b.patientName);
    });
  }, [certifications, filters]);

  const handleSelectCertification = (
    certification: CertificationForSessionsResponse
  ) => {
    // Convert to CertificationDocument format for the parent component
    const certificationDoc: CertificationDocument = {
      id: certification.id,
      patientId: "", // Not available in lightweight response
      therapistId: "", // Not available in lightweight response
      month: parseInt(certification.month) || 0,
      year: certification.year,
      totalSessions: 0, // Not available in lightweight response
      completedSessions: 0, // Not available in lightweight response
      status: certification.status as any,
      createdAt: new Date().toISOString(),
      patient: {
        id: "",
        fullName: certification.patientName,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    };

    onSelectCertification(certificationDoc);
    onClose();
  };

  const handleFilterChange = (
    key: keyof CertificationFilters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      month: "",
      year: "",
    });
  };

  // Get unique values for dropdowns

  const uniqueMonths = useMemo(() => {
    // Return all 12 months for proper filtering
    const allMonths = [
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
    return allMonths;
  }, []);

  const uniqueYears = useMemo(() => {
    const years = certifications
      .map((cert) => cert.year)
      .filter((year): year is number => !!year);
    return Array.from(new Set(years)).sort((a, b) => b - a); // Descending order
  }, [certifications]);

  const getHeaderConfig = () => ({
    title: "Select Certification",
    subtitle: "Choose a certification document to create a new session",
  });

  const getFooterConfig = () => ({
    buttons: [
      {
        text: "Cancel",
        variant: "secondary" as const,
        onClick: onClose,
      },
    ],
  });

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={getHeaderConfig().title}
      subtitle={getHeaderConfig().subtitle}
      headerConfig={getHeaderConfig()}
      footerConfig={getFooterConfig()}
      contentClassName="max-h-[80vh] overflow-y-auto"
    >
      <div className="p-6">
        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div>
            <label
              htmlFor="certification-search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Search Certifications
            </label>
            <input
              id="certification-search"
              type="text"
              placeholder="Search by patient name, file number, or therapy type..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Month Filter */}
            <div>
              <label
                htmlFor="month-filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Filter by Month
              </label>
              <select
                id="month-filter"
                value={filters.month}
                onChange={(e) => handleFilterChange("month", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Months</option>
                {uniqueMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label
                htmlFor="year-filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Filter by Year
              </label>
              <select
                id="year-filter"
                value={filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Loading certifications...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
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
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certifications List */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {filteredAndSortedCertifications.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No certifications found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {filters.search || filters.month || filters.year
                    ? "Try adjusting your search terms or filters."
                    : "No certifications are available."}
                </p>
              </div>
            ) : (
              filteredAndSortedCertifications.map((certification) => (
                <div
                  key={certification.id}
                  onClick={() => handleSelectCertification(certification)}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-blue-600 dark:text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {certification.patientName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {certification.month} {certification.year} •{" "}
                            {certification.therapyType || "Therapy"}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Status: {certification.status}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
};
