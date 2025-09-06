import React from "react";
import type { BackendTherapySession, CertificationDocument } from "../types";

interface CertificationSessionsViewProps {
  certification: CertificationDocument;
  onViewChange: (
    view: "sessions-list" | "session-details",
    session?: BackendTherapySession
  ) => void;
}

const CertificationSessionsView: React.FC<CertificationSessionsViewProps> = ({
  certification,
  onViewChange,
}) => {
  // Notify parent of initial view
  React.useEffect(() => {
    onViewChange("sessions-list");
  }, [onViewChange]);

  const handleSessionClick = (session: BackendTherapySession) => {
    // Just notify the parent - don't manage internal state
    onViewChange("session-details", session);
  };

  // Sessions List View
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {(certification.therapySessions || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No sessions yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding your first therapy session.
              </p>
            </div>
          ) : (
            (certification.therapySessions || []).map(
              (session: BackendTherapySession) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {new Date(session.sessionDate).toLocaleDateString()}
                        </span>
                        {session.sessionTime && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            at {session.sessionTime}
                          </span>
                        )}
                      </div>
                      {session.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          Location: {session.location}
                        </p>
                      )}
                      {session.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {session.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-gray-400 dark:text-gray-500">
                      <svg
                        className="w-5 h-5"
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
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationSessionsView;
