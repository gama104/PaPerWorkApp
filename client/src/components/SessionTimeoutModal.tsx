// Session Timeout Modal - Consistent with application design
import React, { useEffect, useState } from "react";
import { BaseModal } from "../shared/components/ui/BaseModal";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  remainingTime: number; // in seconds
  onExtendSession: () => void;
  onLogout: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  remainingTime,
  onExtendSession,
  onLogout,
}) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  // Update countdown timer
  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(remainingTime);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto logout when time expires
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, remainingTime, onLogout]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Footer configuration
  const footerConfig = {
    buttons: [
      {
        label: "Logout Now",
        variant: "secondary" as const,
        onClick: onLogout,
      },
      {
        label: "Stay Logged In",
        variant: "primary" as const,
        onClick: onExtendSession,
      },
    ],
    buttonAlignment: "right" as const,
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing by clicking outside
      title="Session Timeout Warning"
      footerConfig={footerConfig}
      size="md"
    >
      <div className="text-center py-6">
        {/* Warning Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
          <svg
            className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
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

        {/* Main Message */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Your session is about to expire
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          You have been inactive for a while. For security reasons, you will be
          automatically logged out.
        </p>

        {/* Countdown Timer */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <div className="text-2xl font-mono font-bold text-red-600 dark:text-red-400">
            {formatTime(timeLeft)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Time remaining
          </div>

          {/* Progress Bar */}
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${(timeLeft / remainingTime) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Action Instructions */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click <strong>"Stay Logged In"</strong> to extend your session, or{" "}
          <strong>"Logout Now"</strong> to end your session immediately.
        </p>
      </div>
    </BaseModal>
  );
};

export default SessionTimeoutModal;
