import React from "react";
import { Navigation } from "../shared/components/layout";
import { CertificationsPageSkeleton } from "../shared/components/ui";

const CertificationsLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4">
        <CertificationsPageSkeleton />
      </main>
    </div>
  );
};

export default CertificationsLoading;

