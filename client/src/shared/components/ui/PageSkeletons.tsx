import React from "react";
import { Skeleton } from "./SkeletonLoader";

// Generic page header skeleton
export const PageHeaderSkeleton: React.FC = () => (
  <div className="mb-8">
    <Skeleton height="2.25rem" width="200px" className="mb-2" />
    <Skeleton height="1.25rem" width="350px" />
  </div>
);

// Stats cards skeleton (3 columns)
export const StatsCardsSkeleton3: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
          <Skeleton height="2.5rem" width="2.5rem" className="rounded-lg" />
          <div className="ml-4 flex-1">
            <Skeleton height="1rem" width="100px" className="mb-2" />
            <Skeleton height="1.5rem" width="60px" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Stats cards skeleton (4 columns)
export const StatsCardsSkeleton4: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
          <Skeleton height="2.5rem" width="2.5rem" className="rounded-lg" />
          <div className="ml-4 flex-1">
            <Skeleton height="1rem" width="100px" className="mb-2" />
            <Skeleton height="1.5rem" width="60px" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Data table skeleton
export const DataTableSkeleton: React.FC<{ title?: string }> = ({
  title = "Data Table",
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <Skeleton height="1.5rem" width="120px" />
        <Skeleton height="2.5rem" width="120px" className="rounded-lg" />
      </div>
    </div>
    <div className="p-6">
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          >
            <div className="flex items-center space-x-4">
              <Skeleton height="2rem" width="2rem" />
              <div className="space-y-1">
                <Skeleton height="1rem" width="150px" />
                <Skeleton height="0.875rem" width="100px" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton height="1.5rem" width="60px" />
              <Skeleton height="2rem" width="2rem" />
              <Skeleton height="2rem" width="2rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Patients page skeleton (content only)
export const PatientsPageSkeleton: React.FC = () => (
  <>
    <PageHeaderSkeleton />
    <StatsCardsSkeleton3 />
    <DataTableSkeleton title="All Patients" />
  </>
);

// Certifications page skeleton (content only)
export const CertificationsPageSkeleton: React.FC = () => (
  <>
    <PageHeaderSkeleton />
    <StatsCardsSkeleton4 />
    <DataTableSkeleton title="Certification Documents" />
  </>
);

// Sessions page skeleton (content only) - consistent with other pages
export const SessionsPageSkeleton: React.FC = () => (
  <>
    <PageHeaderSkeleton />

    {/* Add Session Button skeleton */}
    <div className="flex items-center justify-end mb-6">
      <Skeleton height="2.5rem" width="120px" className="rounded-md" />
    </div>

    <StatsCardsSkeleton4 />
    <DataTableSkeleton title="Sessions" />
  </>
);

export default {
  PatientsPageSkeleton,
  CertificationsPageSkeleton,
  SessionsPageSkeleton,
  PageHeaderSkeleton,
  StatsCardsSkeleton3,
  StatsCardsSkeleton4,
  DataTableSkeleton,
};
