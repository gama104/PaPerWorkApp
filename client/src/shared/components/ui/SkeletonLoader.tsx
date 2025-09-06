import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = '100%', 
  height = '1rem' 
}) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{ width, height }}
    />
  );
};

interface DashboardSkeletonProps {
  className?: string;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton height="2rem" width="200px" />
        <Skeleton height="1.25rem" width="300px" />
      </div>

      {/* Quick Actions Skeleton */}
      <div className="space-y-4">
        <Skeleton height="1.5rem" width="150px" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Skeleton height="1.25rem" width="120px" className="mb-2" />
              <Skeleton height="1rem" width="80px" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="space-y-4">
        <Skeleton height="1.5rem" width="100px" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Skeleton height="1.25rem" width="100px" />
                <Skeleton height="1.5rem" width="1.5rem" />
              </div>
              <Skeleton height="2rem" width="60px" className="mb-2" />
              <Skeleton height="1rem" width="120px" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton height="1.25rem" width="150px" />
              <Skeleton height="1rem" width="60px" />
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Skeleton height="2rem" width="2rem" />
                    <div className="space-y-1">
                      <Skeleton height="1rem" width="120px" />
                      <Skeleton height="0.75rem" width="80px" />
                    </div>
                  </div>
                  <Skeleton height="1rem" width="60px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
