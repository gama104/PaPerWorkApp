import React, { useState, useMemo } from "react";
import type { CertificationDocument } from "../types/certification.types";
import { format } from "date-fns";
import { MobileOptimizedTable } from "../../../components/MobileOptimizedTable";
import { useResponsive } from "../../../hooks/useResponsive";

interface CertificationsListTableProps {
  certifications: CertificationDocument[];
  onCertificationClick: (certification: CertificationDocument) => void;
}

interface CertificationsFilter {
  search: string;
  status: "all" | "draft" | "submitted" | "approved" | "rejected";
  month: string;
  year: string;
}

export const CertificationsListTable: React.FC<
  CertificationsListTableProps
> = ({ certifications, onCertificationClick }) => {
  const { isMobile } = useResponsive();
  const [filter, setFilter] = useState<CertificationsFilter>({
    search: "",
    status: "all",
    month: "",
    year: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 5 : 10;

  // Filter and sort certifications
  const filteredAndSortedCertifications = useMemo(() => {
    const filtered = certifications.filter((certification) => {
      const matchesSearch =
        !filter.search ||
        (certification.patientName &&
          certification.patientName
            .toLowerCase()
            .includes(filter.search.toLowerCase())) ||
        (certification.therapyType &&
          certification.therapyType
            .toLowerCase()
            .includes(filter.search.toLowerCase()));

      const matchesStatus = (() => {
        if (filter.status === "all") return true;
        return certification.status.toLowerCase() === filter.status;
      })();

      const matchesMonth =
        !filter.month || certification.month?.toString() === filter.month;

      const matchesYear =
        !filter.year || certification.year?.toString() === filter.year;

      return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    });

    return filtered;
  }, [certifications, filter]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedCertifications.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCertifications = filteredAndSortedCertifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleFilterChange = (
    key: keyof CertificationsFilter,
    value: string
  ) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        label: "Draft",
      },
      submitted: {
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        label: "Submitted",
      },
      approved: {
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        label: "Approved",
      },
      rejected: {
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        label: "Rejected",
      },
      under_review: {
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        label: "Under Review",
      },
      revision_required: {
        className:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        label: "Revision Required",
      },
    };

    const config =
      statusConfig[status.toLowerCase() as keyof typeof statusConfig] ||
      statusConfig.draft;

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const getMonthName = (month: string | number) => {
    // If it's already a full month name, return it
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

    // If it's a numeric string, convert it
    const monthNumber = parseInt(monthStr);
    if (!isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
      return monthNames[monthNumber - 1];
    }

    return "Unknown";
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow">
      {/* Filters Section */}
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <div
          className={`grid gap-4 ${
            isMobile
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
          }`}
        >
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search certifications..."
              value={filter.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Month
            </label>
            <select
              value={filter.month}
              onChange={(e) => handleFilterChange("month", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMonthName(i + 1)}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year
            </label>
            <select
              value={filter.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Years</option>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter({
                  search: "",
                  status: "all",
                  month: "",
                  year: "",
                });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <MobileOptimizedTable
          data={paginatedCertifications}
          columns={[
            {
              key: "patientName",
              label: "Patient",
              render: (_, certification: CertificationDocument) => (
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {certification.patientName || "Unknown Patient"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {certification.therapyType || "N/A"}
                  </div>
                </div>
              ),
            },
            {
              key: "month",
              label: "Period",
              render: (_, certification: CertificationDocument) => (
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {getMonthName(certification.month)} {certification.year}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {certification.sessionCount || 0} sessions
                  </div>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (value: string) => getStatusBadge(value),
            },
            {
              key: "createdAt",
              label: "Created",
              render: (value: string) => (
                <div className="text-gray-900 dark:text-white">
                  {format(new Date(value), "MMM dd, yyyy")}
                </div>
              ),
              hideOnMobile: true,
            },
          ]}
          onRowClick={onCertificationClick}
          keyExtractor={(certification) => certification.id}
          emptyMessage="No certifications found"
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to{" "}
              {Math.min(
                startIndex + itemsPerPage,
                filteredAndSortedCertifications.length
              )}{" "}
              of {filteredAndSortedCertifications.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
