import React from "react";
import type {
  ModalFooterConfig,
  FooterButtonConfig,
} from "../../types/ModalTypes";
import { useResponsive } from "../../../hooks/useResponsive";

interface ModalFooterProps {
  config: ModalFooterConfig;
  className?: string;
}

const getButtonStyles = (
  variant: FooterButtonConfig["variant"],
  disabled: boolean,
  loading: boolean,
  isMobile: boolean
) => {
  const baseStyles = `${
    isMobile ? "px-6 py-3 text-base" : "px-4 py-2 text-sm"
  } rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;

  if (loading) {
    return `${baseStyles} bg-gray-400 text-white cursor-not-allowed`;
  }

  switch (variant) {
    case "primary":
      return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 ${
        disabled ? "bg-gray-400 hover:bg-gray-400" : ""
      }`;
    case "secondary":
      return `${baseStyles} bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 ${
        disabled
          ? "bg-gray-100 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800"
          : ""
      }`;
    case "danger":
      return `${baseStyles} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 ${
        disabled ? "bg-gray-400 hover:bg-gray-400" : ""
      }`;
    case "ghost":
      return `${baseStyles} text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-700 ${
        disabled ? "text-gray-400 hover:bg-transparent dark:text-gray-600" : ""
      }`;
    default:
      return baseStyles;
  }
};

export const ModalFooter: React.FC<ModalFooterProps> = ({
  config,
  className = "",
}) => {
  const { isMobile } = useResponsive();
  const { buttons, buttonAlignment = "right" } = config;

  if (buttons.length === 0) {
    return null;
  }

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case "left":
        return "justify-start";
      case "center":
        return "justify-center";
      case "space-between":
        return "justify-between";
      case "right":
      default:
        return "justify-end";
    }
  };

  return (
    <div
      className={`flex-shrink-0 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div
        className={`flex ${getAlignmentClass(buttonAlignment)} ${
          isMobile ? "space-x-2" : "space-x-3"
        } ${isMobile ? "p-4" : "p-6"}`}
      >
        {buttons.map((button, index) => (
          <button
            key={index}
            type={button.type || "button"}
            onClick={button.onClick}
            disabled={button.disabled || button.loading}
            className={getButtonStyles(
              button.variant,
              button.disabled || false,
              button.loading || false,
              isMobile
            )}
          >
            {button.loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </div>
            ) : (
              button.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModalFooter;
