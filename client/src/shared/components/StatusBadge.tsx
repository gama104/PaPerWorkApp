// Industry-standard status badge component
// This follows patterns used by GitHub, Linear, Notion, etc.

import React from "react";
import { CertificationStatus, SignatureStatus } from "../constants/enums";
import {
  useCertificationStatusTranslation,
  useSignatureStatusTranslation,
} from "../hooks/useTranslation";

interface StatusBadgeProps {
  status: CertificationStatus | SignatureStatus;
  type: "certification" | "signature";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Industry-standard status badge with proper styling and accessibility
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  size = "md",
  className = "",
}) => {
  const { getCertificationStatusName } = useCertificationStatusTranslation();
  const { getSignatureStatusName } = useSignatureStatusTranslation();

  const getStatusName = () => {
    if (type === "certification") {
      return getCertificationStatusName(status as CertificationStatus);
    }
    return getSignatureStatusName(status as SignatureStatus);
  };

  const getStatusColor = () => {
    const statusMap = {
      [CertificationStatus.DRAFT]:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      [CertificationStatus.SUBMITTED]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      [CertificationStatus.APPROVED]:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      [CertificationStatus.REJECTED]:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      [SignatureStatus.NOT_REQUIRED]:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      [SignatureStatus.PENDING]:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      [SignatureStatus.COMPLETED]:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      [SignatureStatus.APPROVED]:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };

    return (
      statusMap[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  const getSizeClasses = () => {
    const sizeMap = {
      sm: "px-2 py-1 text-xs",
      md: "px-2.5 py-0.5 text-sm",
      lg: "px-3 py-1 text-base",
    };
    return sizeMap[size];
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${getSizeClasses()}
        ${getStatusColor()}
        ${className}
      `}
      role="status"
      aria-label={`Status: ${getStatusName()}`}
    >
      {getStatusName()}
    </span>
  );
};
