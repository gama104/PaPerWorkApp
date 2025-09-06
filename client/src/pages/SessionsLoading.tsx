import React from "react";
import { Navigation } from "../shared/components/layout";
import { SessionsPageSkeleton } from "../shared/components/ui";

const SessionsLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-4 lg:px-8">
        <SessionsPageSkeleton />
      </main>
    </div>
  );
};

export default SessionsLoading;

