import type { CertificationViewState } from "../types/ModalTypes";
import type { CertificationDocument, BackendTherapySession } from "../types";

// Header configuration for different modal states
export interface ModalHeaderConfig {
  title: string;
  subtitle: string;
  showBackButton: boolean;
  backButtonText: string;
}

// Footer configuration for different modal states
export interface ModalFooterConfig {
  buttons: ModalButtonConfig[];
}

export interface ModalButtonConfig {
  text: string;
  type: "primary" | "secondary" | "danger";
  action: string;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Get header configuration based on current view state
 */
export function getModalHeaderConfig(
  viewState: CertificationViewState,
  certification: CertificationDocument | null,
  selectedSession?: BackendTherapySession | null
): ModalHeaderConfig {
  switch (viewState.type) {
    case "certification":
      return {
        title: "Certification Document",
        subtitle: certification
          ? `${certification.patient?.fullName || "Unknown Patient"} • ${certification.month} ${certification.year}`
          : "",
        showBackButton: false,
        backButtonText: "",
      };

    case "sessions-list":
      return {
        title: "Therapy Sessions",
        subtitle: "Manage therapy sessions for this certification",
        showBackButton: true,
        backButtonText: "Back to Details",
      };

    case "session-details":
      return {
        title: "Therapy Session Details",
        subtitle: selectedSession?.sessionDate
          ? new Date(selectedSession.sessionDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Session Details",
        showBackButton: true,
        backButtonText: "Back to Sessions",
      };

    case "add-session":
      return {
        title: "Add Therapy Session",
        subtitle: certification
          ? `Add/Edit session for ${certification.patient?.fullName || "Unknown Patient"}`
          : "",
        showBackButton: true,
        backButtonText: "Back to Sessions",
      };

    case "edit-session":
      return {
        title: "Edit Therapy Session",
        subtitle: certification
          ? `Add/Edit session for ${certification.patient?.fullName || "Unknown Patient"}`
          : "",
        showBackButton: true,
        backButtonText: "Back to Sessions",
      };

    default:
      return {
        title: "Modal",
        subtitle: "",
        showBackButton: false,
        backButtonText: "",
      };
  }
}

/**
 * Get footer configuration based on current view state
 */
export function getModalFooterConfig(
  viewState: CertificationViewState,
  certification: CertificationDocument | null,
  isDownloading = false
): ModalFooterConfig {
  switch (viewState.type) {
    case "certification":
      const buttons: ModalButtonConfig[] = [
        {
          text: isDownloading ? "Generating PDF..." : "Download PDF",
          type: "primary",
          action: "download-pdf",
          disabled: isDownloading,
          loading: isDownloading,
        },
      ];

      // Add View Sessions button if sessions exist
      if (certification?.therapySessions && certification.therapySessions.length > 0) {
        buttons.push({
          text: `View Sessions (${certification.therapySessions.length})`,
          type: "secondary",
          action: "view-sessions",
        });
      }

      // Right side buttons
      buttons.push(
        {
          text: "Delete",
          type: "danger",
          action: "delete-certification",
        },
        {
          text: "Edit",
          type: "primary",
          action: "edit-certification",
        },
        {
          text: "Close",
          type: "secondary",
          action: "close-modal",
        }
      );

      return { buttons };

    case "sessions-list":
      return {
        buttons: [
          {
            text: "Add Session",
            type: "primary",
            action: "add-session",
          },
        ],
      };

    case "add-session":
      return {
        buttons: [
          {
            text: "Create Session",
            type: "primary",
            action: "submit-form",
          },
          {
            text: "Cancel",
            type: "secondary",
            action: "cancel-form",
          },
        ],
      };

    case "edit-session":
      return {
        buttons: [
          {
            text: "Save",
            type: "primary",
            action: "submit-form",
          },
          {
            text: "Delete",
            type: "danger",
            action: "delete-session",
          },
          {
            text: "Cancel",
            type: "secondary",
            action: "cancel-form",
          },
        ],
      };

    case "session-details":
      return {
        buttons: [
          {
            text: "Edit",
            type: "primary",
            action: "edit-session",
          },
        ],
      };

    default:
      return { buttons: [] };
  }
}

