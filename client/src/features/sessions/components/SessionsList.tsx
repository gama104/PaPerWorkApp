import React, { useState, useMemo } from "react";
import type { TherapySession } from "../types/session.types";
import { ParentSignatureStatus as StatusConstants } from "../types/session.types";
import { format } from "date-fns";
import { MobileOptimizedTable } from "../../../components/MobileOptimizedTable";
import { useResponsive } from "../../../hooks/useResponsive";

interface SessionWithDetails extends TherapySession {
  certificationTitle: string;
  patientName: string;
}

interface SessionsListProps {
  sessions: SessionWithDetails[];
  onSessionClick: (session: SessionWithDetails) => void;
  onSignatureClick: (session: SessionWithDetails) => void;
  initialFilters?: {
    certificationId?: string;
    status?: string;
    timeRange?: string;
    month?: string;
    year?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
}

interface SessionsFilter {
  search: string;
  status: "all" | "pending" | "completed";
  certificationId: string;
  dateRange: "all" | "today" | "week" | "month";
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  onSessionClick,
  onSignatureClick,
  initialFilters,
}) => {
  const { isMobile } = useResponsive();
  const [filter, setFilter] = useState<SessionsFilter>({
    search: initialFilters?.search || "",
    status:
      (initialFilters?.status as "all" | "pending" | "completed") || "all",
    certificationId: initialFilters?.certificationId || "",
    dateRange:
      (initialFilters?.timeRange as "all" | "today" | "week" | "month") ||
      "all",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 5 : 10;

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    const filtered = sessions.filter((session) => {
      const matchesSearch =
        !filter.search ||
        (session.patientName &&
          session.patientName
            .toLowerCase()
            .includes(filter.search.toLowerCase())) ||
        (session.certificationDocumentTitle &&
          session.certificationDocumentTitle
            .toLowerCase()
            .includes(filter.search.toLowerCase())) ||
        (session.notes &&
          session.notes.toLowerCase().includes(filter.search.toLowerCase())) ||
        (session.location &&
          session.location
            .toLowerCase()
            .includes(filter.search.toLowerCase())) ||
        (session.therapistName &&
          session.therapistName
            .toLowerCase()
            .includes(filter.search.toLowerCase()));

      const matchesStatus =
        filter.status === "all" ||
        session.parentSignatureStatus === filter.status;

      const matchesCertification =
        !filter.certificationId ||
        session.certificationDocumentId === filter.certificationId;

      const matchesDateRange =
        filter.dateRange === "all" ||
        (() => {
          const sessionDate = new Date(session.sessionDate);
          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );

          switch (filter.dateRange) {
            case "today": {
              return sessionDate >= today;
            }
            case "week": {
              const weekAgo = new Date(
                today.getTime() - 7 * 24 * 60 * 60 * 1000
              );
              return sessionDate >= weekAgo;
            }
            case "month": {
              const monthAgo = new Date(
                today.getTime() - 30 * 24 * 60 * 60 * 1000
              );
              return sessionDate >= monthAgo;
            }
            default:
              return true;
          }
        })();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCertification &&
        matchesDateRange
      );
    });

    return filtered;
  }, [sessions, filter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSessions = filteredAndSortedSessions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleFilterChange = (key: keyof SessionsFilter, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
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
              placeholder="Search sessions..."
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
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <select
              value={filter.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter({
                  search: "",
                  status: "all",
                  certificationId: "",
                  dateRange: "all",
                });
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-
            {Math.min(
              startIndex + itemsPerPage,
              filteredAndSortedSessions.length
            )}{" "}
            of {filteredAndSortedSessions.length} sessions
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="p-4 md:p-6">
        <MobileOptimizedTable<SessionWithDetails>
          data={paginatedSessions}
          columns={[
            {
              key: "sessionDate",
              label: "Date & Time",
              render: (value: string, session: SessionWithDetails) => (
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(value), "MMM dd, yyyy")}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {session.sessionTime} - {session.endTime}
                  </div>
                </div>
              ),
            },
            {
              key: "patientName",
              label: "Patient",
              render: (value: string) => (
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {value}
                  </div>
                </div>
              ),
            },
            {
              key: "certificationDocumentTitle",
              label: "Certification",
              render: (value: string, session: SessionWithDetails) => (
                <div>
                  <div className="text-gray-900 dark:text-white">{value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {session.fileNumber}
                  </div>
                </div>
              ),
              hideOnMobile: true,
            },
            {
              key: "location",
              label: "Location",
              render: (value: string) => value || "N/A",
              hideOnMobile: true,
            },
            {
              key: "parentSignatureStatus",
              label: "Status",
              render: (value: string) => (
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    value === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {value === "completed" ? "Completed" : "Pending"}
                </span>
              ),
            },
            {
              key: "id" as keyof SessionWithDetails,
              label: "Actions",
              render: (_, session: SessionWithDetails) => {
                // Check if session is already signed
                const isSigned =
                  session.parentSignatureStatus === StatusConstants.SIGNED ||
                  session.parentSignatureStatus === StatusConstants.COMPLETED ||
                  session.parentSignatureStatus === StatusConstants.APPROVED ||
                  (session.signatureImageData &&
                    session.signatureImageData.trim() !== "");

                return (
                  <div className="flex justify-center">
                    {!isSigned ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSignatureClick(session);
                        }}
                        className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Sign
                      </button>
                    ) : (
                      <span className="px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-md dark:bg-green-900 dark:text-green-200">
                        Signed
                      </span>
                    )}
                  </div>
                );
              },
            },
          ]}
          onRowClick={onSessionClick}
          keyExtractor={(session) => session.id}
          emptyMessage="No sessions found"
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 md:px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div
            className={`flex items-center ${
              isMobile ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Next
              </button>
            </div>

            {!isMobile && (
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
