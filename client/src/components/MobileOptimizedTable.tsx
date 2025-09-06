import React from "react";
import { useResponsive } from "../hooks/useResponsive";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface MobileOptimizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  keyExtractor: (item: T) => string | number;
}

export function MobileOptimizedTable<T>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  className = "",
  keyExtractor,
}: MobileOptimizedTableProps<T>) {
  const { isMobile, isTablet } = useResponsive();

  // Filter columns based on screen size
  const visibleColumns = columns.filter((column) => {
    if (isMobile && column.hideOnMobile) return false;
    if (isTablet && column.hideOnTablet) return false;
    return true;
  });

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 h-16 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">{emptyMessage}</div>
      </div>
    );
  }

  // Mobile view - Card layout
  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onRowClick?.(item)}
          >
            <div className="space-y-2">
              {visibleColumns.map((column) => {
                const value = item[column.key];
                const renderedValue = column.render
                  ? column.render(value, item)
                  : String(value || "");

                return (
                  <div
                    key={String(column.key)}
                    className="flex justify-between items-start"
                  >
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                      {column.label}:
                    </span>
                    <span
                      className={`text-sm text-gray-900 dark:text-white text-right flex-1 ml-2 ${
                        column.className || ""
                      }`}
                    >
                      {renderedValue}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Tablet/Desktop view - Table layout with fixed header and scrollable body
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Fixed Header */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {visibleColumns.map((column, index) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                    index === 0
                      ? "w-1/4"
                      : index === 1
                      ? "w-1/4"
                      : index === 2
                      ? "w-1/6"
                      : index === 3
                      ? "w-1/6"
                      : index === 4
                      ? "w-1/6"
                      : "w-1/6"
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body */}
      <div className="overflow-x-auto overflow-y-auto max-h-96">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => onRowClick?.(item)}
              >
                {visibleColumns.map((column, index) => {
                  const value = item[column.key];
                  const renderedValue = column.render
                    ? column.render(value, item)
                    : String(value || "");

                  return (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${
                        column.className || ""
                      } ${
                        index === 0
                          ? "w-1/4"
                          : index === 1
                          ? "w-1/4"
                          : index === 2
                          ? "w-1/6"
                          : index === 3
                          ? "w-1/6"
                          : index === 4
                          ? "w-1/6"
                          : "w-1/6"
                      }`}
                    >
                      {renderedValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Specialized components for common use cases
export function SessionsTable({ sessions, onSessionClick, ...props }: any) {
  const columns = [
    {
      key: "sessionDate" as const,
      label: "Date & Time",
      render: (value: string, session: any) => (
        <div>
          <div className="font-medium">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-gray-500 text-xs">{session.sessionTime}</div>
        </div>
      ),
    },
    {
      key: "patientName" as const,
      label: "Patient",
      render: (value: string, session: any) => (
        <div>
          <div className="font-medium">{value}</div>
        </div>
      ),
    },
    {
      key: "location" as const,
      label: "Location",
      hideOnMobile: true,
    },
    {
      key: "parentSignatureStatus" as const,
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
  ];

  return (
    <MobileOptimizedTable
      data={sessions}
      columns={columns}
      onRowClick={onSessionClick}
      keyExtractor={(session) => session.id}
      {...props}
    />
  );
}

export function CertificationsTable({
  certifications,
  onCertificationClick,
  ...props
}: any) {
  const columns = [
    {
      key: "patientName" as const,
      label: "Patient",
      render: (value: string, cert: any) => (
        <div>
          <div className="font-medium">{value}</div>
        </div>
      ),
    },
    {
      key: "month" as const,
      label: "Month",
      render: (value: string, cert: any) => `${value} ${cert.year}`,
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value === "completed"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "sessionCount" as const,
      label: "Sessions",
      hideOnMobile: true,
      render: (value: number) => `${value || 0} sessions`,
    },
  ];

  return (
    <MobileOptimizedTable
      data={certifications}
      columns={columns}
      onRowClick={onCertificationClick}
      keyExtractor={(cert) => cert.id}
      {...props}
    />
  );
}
