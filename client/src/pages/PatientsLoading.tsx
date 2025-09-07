import React from "react";
import { Navigation } from "../shared/components/layout";
import { PatientsPageSkeleton } from "../shared/components/ui";

const PatientsLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4">
        <PatientsPageSkeleton />
      </main>
    </div>
  );
};

export default PatientsLoading;


