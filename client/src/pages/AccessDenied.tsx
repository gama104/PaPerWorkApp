import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth";
import { Navigation } from "../shared/components/layout/Navigation";

const AccessDenied: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine the context based on the current location
  const getContextInfo = () => {
    const path = location.pathname;

    if (path.includes("/user-management")) {
      return {
        title: "Access Denied",
        message: "Admin privileges required to access user management.",
        resource: "User Management",
        requiredRole: "Admin",
      };
    }

    if (path.includes("/patients")) {
      return {
        title: "Access Denied",
        message: "You don't have permission to access patient management.",
        resource: "Patient Management",
        requiredRole: "Admin or Therapist",
      };
    }

    if (path.includes("/certifications")) {
      return {
        title: "Access Denied",
        message:
          "You don't have permission to access certification management.",
        resource: "Certification Management",
        requiredRole: "Admin or Therapist",
      };
    }

    return {
      title: "Access Denied",
      message: "You don't have permission to access this resource.",
      resource: "This Resource",
      requiredRole: "Unknown",
    };
  };

  const contextInfo = getContextInfo();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* Error Icon */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-10 w-10 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Error Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {contextInfo.title}
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
              {contextInfo.message}
            </p>

            {/* Resource Information */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Resource:
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                {contextInfo.resource}
              </span>
            </div>

            {/* User Role Info */}
            {user && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Your Current Role:
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  {user.role}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Required: {contextInfo.requiredRole}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleGoBack}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <svg
                  className="w-4 h-4 mr-2 inline"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Go Back
              </button>

              <button
                onClick={handleGoHome}
                className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <svg
                  className="w-4 h-4 mr-2 inline"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go to Dashboard
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-2">
                If you believe you should have access to this resource, please
                contact your administrator.
              </p>
              <p>
                You may need to log in with an account that has the appropriate
                permissions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccessDenied;
