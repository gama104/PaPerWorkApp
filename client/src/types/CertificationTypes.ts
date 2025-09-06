// Certification Modal State Machine Types
export type ViewState =
  | { type: "certificationView"; certificationId: string }
  | { type: "certificationEdit"; certificationId: string }
  | { type: "sessionList"; certificationId: string }
  | { type: "sessionView"; sessionId: string; certificationId: string }
  | { type: "sessionEdit"; sessionId: string; certificationId: string }
  | { type: "sessionCreate"; certificationId: string };

// History stack for back navigation
export interface ViewHistoryItem {
  type: ViewState["type"];
  certificationId: string;
  sessionId?: string;
  title: string;
}

// Modal header configuration
export interface ModalHeaderConfig {
  title: string;
  subtitle?: string;
  showBackButton: boolean;
  onBack?: () => void;
}

// Footer button configuration
export interface FooterButtonConfig {
  primary?: {
    text: string;
    onClick: () => void;
    variant: "primary" | "success" | "danger";
    disabled?: boolean;
  };
  secondary?: {
    text: string;
    onClick: () => void;
    variant: "secondary" | "danger";
  };
  tertiary?: {
    text: string;
    onClick: () => void;
    variant: "secondary";
  };
}

// Certification form modes
export type CertificationFormMode = "create" | "edit";

// Session form modes  
export type SessionFormMode = "create" | "edit";

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
