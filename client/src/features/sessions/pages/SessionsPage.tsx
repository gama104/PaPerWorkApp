import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSessions } from "../hooks/useSessions";
import { Navigation } from "../../../shared/components/layout";
import { SessionsDashboard } from "../components/SessionsDashboard";
import { SessionModal } from "../components/SessionModal";
import { SessionsPageSkeleton } from "../../../shared/components/ui";
import type { TherapySession } from "../types/session.types";

const SessionsPage: React.FC = () => {
  const { isLoading, error, stats, sessions } = useSessions(); // ✅ Add sessions

  const [searchParams] = useSearchParams();
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(
    null
  );
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Parse URL parameters for initial filters
  const initialFilters = {
    certificationId: searchParams.get("certificationId") || undefined,
    status: searchParams.get("status") || undefined,
    timeRange: searchParams.get("timeRange") || undefined,
    month: searchParams.get("month") || undefined,
    year: searchParams.get("year") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    search: searchParams.get("patientName") || undefined, // Use patientName as initial search value
  };

  const handleSessionClick = (session: TherapySession) => {
    setSelectedSession(session);
    setShowSessionModal(true);
  };

  const handleCloseSessionModal = () => {
    setShowSessionModal(false);
    setSelectedSession(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navigation />
        <main className="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-4 lg:px-8">
          <SessionsPageSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navigation />
        <main className="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-4 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              Error loading sessions: {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-8 flex flex-col min-h-0 py-2 sm:py-4">
        <div className="mb-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Therapy Sessions
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and sign therapy sessions
          </p>
        </div>

        <div className="flex-1 min-h-0">
          <SessionsDashboard
            onSessionClick={handleSessionClick}
            initialFilters={initialFilters}
            stats={stats} // ✅ Pass the stats prop
            sessions={sessions} // ✅ Pass the sessions prop
          />
        </div>

        {/* Session Details Modal */}
        <SessionModal
          isOpen={showSessionModal}
          onClose={handleCloseSessionModal}
          sessionId={selectedSession?.id}
          mode="view"
        />
      </main>
    </div>
  );
};

export default SessionsPage;
