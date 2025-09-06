import React from "react";
import { BaseModal } from "../../../shared/components/ui/BaseModal";
import type { TherapySession } from "../types/session.types";

interface SessionWithDetails extends TherapySession {
  certificationTitle: string;
  patientName: string;
}

interface SessionViewModalProps {
  session: SessionWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (session: TherapySession) => void;
  onDelete?: (sessionId: string) => void;
}

const SessionViewModal: React.FC<SessionViewModalProps> = ({
  session,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!session) return null;

  // Footer configuration
  const footerConfig = {
    buttons: [
      ...(onDelete
        ? [
            {
              label: "Delete",
              variant: "danger" as const,
              onClick: () => onDelete(session.id),
            },
          ]
        : []),
      ...(onEdit
        ? [
            {
              label: "Edit",
              variant: "primary" as const,
              onClick: () => onEdit(session),
            },
          ]
        : []),
      {
        label: "Close",
        variant: "secondary" as const,
        onClick: onClose,
      },
    ],
    buttonAlignment: "right" as const,
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Session Details - ${session.patientName}`}
      footerConfig={footerConfig}
    >
      <div className="space-y-4">
        {/* Session Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Patient
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {session.patientName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Certification
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {session.certificationTitle}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session Date
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {new Date(session.sessionDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session Time
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {session.sessionTime || "Not specified"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {session.location || "Not specified"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transportation Required
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {session.transportationRequired ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {/* Notes */}
        {session.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              {session.notes}
            </p>
          </div>
        )}

        {/* Signature Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Parent Signature Status
          </label>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              session.parentSignatureStatus === "signed"
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
            }`}
          >
            {session.parentSignatureStatus === "signed" ? "Signed" : "Pending"}
          </span>
        </div>
      </div>
    </BaseModal>
  );
};

export default SessionViewModal;
