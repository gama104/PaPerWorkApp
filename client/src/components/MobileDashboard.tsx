import React from "react";
import { useAuth } from "../features/auth";
import { useSessions } from "../features/sessions";
import { useCertifications } from "../features/certifications";
import { usePatients } from "../features/patients";
import { useResponsive } from "../hooks/useResponsive";

interface MobileDashboardProps {
  className?: string;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  className = "",
}) => {
  const { user } = useAuth();
  const { stats: sessionStats, getTodaySessions } = useSessions();
  const { stats: certificationStats } = useCertifications();
  const { stats: patientStats } = usePatients();
  const { isMobile, isTablet } = useResponsive();

  const todaySessions = getTodaySessions();

  const quickActions = [
    {
      title: "New Session",
      description: "Create a new therapy session",
      href: "/sessions",
      icon: (
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
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
      color: "yellow",
    },
    {
      title: "New Patient",
      description: "Add a new patient",
      href: "/patients",
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      color: "blue",
    },
    {
      title: "New Certification",
      description: "Create a new certification",
      href: "/certifications",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: "green",
    },
    {
      title: "View Reports",
      description: "View session reports",
      href: "/reports",
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      color: "purple",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      yellow:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
      blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
      green:
        "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
      purple:
        "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const stats = [
    {
      title: "Today's Sessions",
      value: todaySessions.length,
      icon: (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "blue",
    },
    {
      title: "Pending Sessions",
      value: sessionStats?.pendingSessions || 0,
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      color: "yellow",
    },
    {
      title: "Total Patients",
      value: patientStats?.totalPatients || 0,
      icon: (
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: "green",
    },
    {
      title: "Certifications",
      value: certificationStats?.totalCertifications || 0,
      icon: (
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
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      color: "purple",
    },
  ];

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${className}`}
    >
      <main
        className={`max-w-7xl mx-auto ${
          isMobile ? "py-2 px-2" : "py-4 px-3 sm:py-6 sm:px-4 lg:px-8"
        }`}
      >
        {/* Header */}
        <div className={`${isMobile ? "mb-4" : "mb-8"}`}>
          <h1
            className={`${
              isMobile ? "text-2xl" : "text-3xl"
            } font-bold text-gray-900 dark:text-white`}
          >
            Dashboard
          </h1>
          <p
            className={`mt-2 ${
              isMobile ? "text-sm" : "text-base"
            } text-gray-600 dark:text-gray-400`}
          >
            Welcome back, {user?.firstName || user?.email}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className={`${isMobile ? "mb-4" : "mb-8"}`}>
          <h2
            className={`${
              isMobile ? "text-lg" : "text-xl"
            } font-semibold text-gray-900 dark:text-white ${
              isMobile ? "mb-3" : "mb-4"
            }`}
          >
            Overview
          </h2>
          <div
            className={`grid gap-4 ${
              isMobile
                ? "grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div
                  className={`flex ${
                    isMobile
                      ? "flex-col items-center text-center"
                      : "items-center"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${getColorClasses(stat.color)} ${
                      isMobile ? "mb-2" : "mr-3"
                    }`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p
                      className={`${
                        isMobile ? "text-xs" : "text-sm"
                      } font-medium text-gray-600 dark:text-gray-400`}
                    >
                      {stat.title}
                    </p>
                    <p
                      className={`${
                        isMobile ? "text-lg" : "text-2xl"
                      } font-bold text-gray-900 dark:text-white`}
                    >
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${isMobile ? "mb-4" : "mb-8"}`}>
          <h2
            className={`${
              isMobile ? "text-lg" : "text-xl"
            } font-semibold text-gray-900 dark:text-white ${
              isMobile ? "mb-3" : "mb-4"
            }`}
          >
            Quick Actions
          </h2>
          <div
            className={`grid gap-4 ${
              isMobile
                ? "grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow ${
                  isMobile ? "p-4" : "p-6"
                } hover:shadow-md transition-shadow cursor-pointer`}
              >
                <div
                  className={`flex ${
                    isMobile
                      ? "flex-col items-center text-center"
                      : "items-center"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${getColorClasses(
                      action.color
                    )} ${isMobile ? "mb-2" : "mr-4"}`}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <h3
                      className={`${
                        isMobile ? "text-sm" : "text-lg"
                      } font-medium text-gray-900 dark:text-white`}
                    >
                      {action.title}
                    </h3>
                    <p
                      className={`${
                        isMobile ? "text-xs" : "text-sm"
                      } text-gray-500 dark:text-gray-400`}
                    >
                      {action.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Today's Sessions */}
        {todaySessions.length > 0 && (
          <div className={`${isMobile ? "mb-4" : "mb-8"}`}>
            <h2
              className={`${
                isMobile ? "text-lg" : "text-xl"
              } font-semibold text-gray-900 dark:text-white ${
                isMobile ? "mb-3" : "mb-4"
              }`}
            >
              Today's Sessions
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4">
                <div className="space-y-3">
                  {todaySessions.slice(0, isMobile ? 3 : 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {session.patientName || "Unknown Patient"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {session.sessionTime} - {session.location}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          session.parentSignatureStatus === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {session.parentSignatureStatus === "completed"
                          ? "Completed"
                          : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
                {todaySessions.length > (isMobile ? 3 : 5) && (
                  <div className="mt-4 text-center">
                    <a
                      href="/sessions"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View all {todaySessions.length} sessions
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
