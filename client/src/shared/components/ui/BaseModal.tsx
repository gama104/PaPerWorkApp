import React, { useEffect } from "react";
import type { BaseModalProps } from "../../types/ModalTypes";
import { ModalHeader } from "./ModalHeader";
import { ModalFooter } from "./ModalFooter";
import { LoadingSpinner } from "./LoadingSpinner";
import { useResponsive } from "../../../hooks/useResponsive";

interface BaseModalExtendedProps extends BaseModalProps {
  headerConfig?: {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    onBack?: () => void;
    showCloseButton?: boolean;
  };
  footerConfig?: {
    buttons: Array<{
      label: string;
      variant: "primary" | "secondary" | "danger" | "ghost";
      onClick: () => void;
      disabled?: boolean;
      loading?: boolean;
      type?: "button" | "submit";
    }>;
  };
  isLoading?: boolean;
  loadingText?: string;
  error?: string | null;
  success?: string | null;
  showHeader?: boolean;
  showFooter?: boolean;
  contentClassName?: string;
}

export const BaseModal: React.FC<BaseModalExtendedProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className = "",
  headerConfig,
  footerConfig,
  isLoading = false,
  loadingText = "Loading...",
  error = null,
  success = null,
  showHeader = true,
  showFooter = true,
  contentClassName = "",
}) => {
  const { isMobile, isTablet } = useResponsive();
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={`flex min-h-full items-center justify-center ${
          isMobile ? "p-0" : "p-4"
        }`}
      >
        <div
          className={`
            relative bg-white dark:bg-gray-800 shadow-xl flex flex-col
            transform transition-all
            ${
              isMobile
                ? "w-full h-full max-w-none max-h-none rounded-none"
                : isTablet
                ? "w-11/12 max-w-2xl max-h-[90vh] rounded-lg"
                : "w-full max-w-4xl max-h-[90vh] rounded-lg"
            }
            ${className}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          {showHeader && (
            <ModalHeader
              config={{
                title: headerConfig?.title || title,
                subtitle: headerConfig?.subtitle || subtitle,
                showBackButton: headerConfig?.showBackButton || false,
                onBack: headerConfig?.onBack,
                showCloseButton: headerConfig?.showCloseButton !== false,
                onClose: onClose,
              }}
            />
          )}

          {/* Content Area */}
          <div className={`flex-1 overflow-y-auto ${contentClassName}`}>
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner size="lg" text={loadingText} />
              </div>
            )}

            {/* Error Message */}
            {error && !isLoading && (
              <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && !isLoading && (
              <div className="mx-6 mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {success}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            {!isLoading && (
              <div className={`${isMobile ? "p-4" : "p-6"}`}>{children}</div>
            )}
          </div>

          {/* Footer */}
          {showFooter && footerConfig && <ModalFooter config={footerConfig} />}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;
