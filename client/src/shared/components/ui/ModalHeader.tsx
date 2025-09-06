import React from "react";
import type { ModalHeaderConfig } from "../../types/ModalTypes";
import { useResponsive } from "../../../hooks/useResponsive";

interface ModalHeaderProps {
  config: ModalHeaderConfig;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  config,
  className = "",
}) => {
  const { isMobile } = useResponsive();
  const {
    title,
    subtitle,
    showBackButton = false,
    onBack,
    showCloseButton = true,
    onClose,
  } = config;

  return (
    <div
      className={`flex-shrink-0 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div
        className={`flex items-center justify-between ${
          isMobile ? "p-4" : "p-6"
        }`}
      >
        <div
          className={`flex items-center ${
            isMobile ? "space-x-2" : "space-x-4"
          }`}
        >
          {showBackButton && (
            <button
              onClick={onBack}
              className={`flex items-center justify-center ${
                isMobile ? "w-10 h-10" : "w-8 h-8"
              } rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              aria-label="Go back"
            >
              <svg
                className={`${
                  isMobile ? "w-6 h-6" : "w-5 h-5"
                } text-gray-600 dark:text-gray-400`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          <div>
            <h2
              className={`${
                isMobile ? "text-lg" : "text-xl"
              } font-semibold text-gray-900 dark:text-gray-100`}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={`${
                  isMobile ? "text-xs" : "text-sm"
                } text-gray-600 dark:text-gray-400 mt-1`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {showCloseButton && (
          <button
            onClick={onClose}
            className={`flex items-center justify-center ${
              isMobile ? "w-10 h-10" : "w-8 h-8"
            } rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            aria-label="Close modal"
          >
            <svg
              className={`${
                isMobile ? "w-6 h-6" : "w-5 h-5"
              } text-gray-600 dark:text-gray-400`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalHeader;
