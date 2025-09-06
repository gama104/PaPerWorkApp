// Certification Document interface (matches the C# model)
export interface CertificationDocument {
  id: string;
  patientId: string;
  month: string;
  year: number;
  therapyType: string;
  status: string;
  lastModified: string;
  userId: string;
  therapistId: string;
  notes?: string;
  createdAt: string;
  location?: string;
  fileNumber?: string;
  isPrivate?: boolean;
  hasPrivatePlan?: boolean;
  isProvisionalRemedy?: boolean;
  frequencyPerWeek?: number;
  duration?: number; // Duration in minutes
  registrationNumber?: string;
  referralNumber?: string;
  specialistDate?: string;
  // Navigation properties
  patient?: Patient;
  user?: { id: string; email: string; firstName: string; lastName: string };
  therapist?: { id: string; email: string; firstName: string; lastName: string };
  therapySessions?: BackendTherapySession[];
}

// Backend TherapySession interface (matches the C# model)
export interface BackendTherapySession {
  id: string;
  certificationDocumentId: string;
  sessionDate: string;
  sessionTime?: string;
  location?: string;
  transportationRequired?: boolean;
  parentSignatureStatus?: string;
  notes?: string;
  createdAt: string;
  lastModifiedAt: string;
  therapistId: string;
  // Additional properties that may be returned by the backend
  isCompleted?: boolean;
  durationMinutes?: number;
  certifyingOfficialName?: string;
  updatedAt?: string;
  // Signature fields (flattened for consistency)
  signatureImageData?: string;
  signatureName?: string;
  signatureNotes?: string;
  signatureDate?: string;
}

// Enhanced type definitions for the therapy management system

export interface Patient {
  id: string;
  fullName: string; // Changed from 'name' to 'fullName' to match backend model
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  conditionsTherapyTypes?: string;
  notes?: string;
  createdAt: string;
  lastModifiedAt: string;
  assignedTherapistId?: string;
}

export interface PatientTemplate {
  id: string;
  patientId: string;
  // Top section - reusable monthly
  therapyType: 'Speech Language Therapy' | 'Dysphagia' | 'Oromotor' | 'Psicologica' | 'Ocupacional' | 'Fisica';
  numeroExpediente?: string;
  impedimento?: string;
  edad: number;
  privado: boolean;
  planPrivado: boolean;
  remedioProvisional: boolean;
  frecuencia: number; // 1-5 times per week
  duracion: '30 min' | '45 min' | '60 min';
  numeroRegistro?: string;
  rp: string; // Combined RP number
  createdAt: string;
  lastUsed: string;
}

export interface TherapyPlan {
  id: string;
  patientId: string;
  templateId: string;
  therapistId: string;
  month: number;
  year: number;
  maxSessionsPerWeek: number;
  sessionDuration: '30 min' | '45 min' | '60 min';
  status: 'active' | 'completed' | 'cancelled';
  sessions: TherapySession[];
  statistics: TherapyStatistics;
}

export interface TherapySession {
  id: string;
  planId: string;
  patientId: string;
  therapistId: string;
  fecha: Date;
  startTime: string; // HH:MM format
  endTime: string; // Auto-calculated
  lugar: 'Centro' | 'Virtual' | 'Escuela';
  escuela?: School;
  transportacion: boolean; // Auto-calculated based on rules
  signature?: string; // Base64 signature data
  parentSignature?: 'signature' | 'excusado' | 'ausencia_injustificada' | 'asistió';
  isReposicion: boolean; // For makeup sessions
  originalSessionId?: string; // If this is a makeup session
  conflicts?: ConflictInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  isFavorite: boolean;
  lastUsed: Date;
  frequency: number; // How often used
}

export interface Therapist {
  id: string;
  name: string;
  specialties: string[];
  schedule: TherapistSchedule;
}

export interface TherapistSchedule {
  therapistId: string;
  workingHours: {
    start: string; // "07:00"
    end: string; // "19:00"
  };
  availableSlots: TimeSlot[];
  blockedSlots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
  date: Date;
  isAvailable: boolean;
  sessionId?: string;
}

export interface ConflictInfo {
  type: 'time_overlap' | 'patient_double_booking' | 'therapist_overlap';
  conflictingSessionId: string;
  conflictingTherapist?: string;
  conflictingPatient?: string;
  timeRange: {
    start: string;
    end: string;
  };
  message: string;
}

export interface TherapyStatistics {
  planId: string;
  month: number;
  year: number;
  totalScheduled: number;
  totalCompleted: number;
  totalExcused: number;
  totalUnexcusedAbsences: number;
  sessionsBy30Min: number;
  sessionsBy45Min: number;
  sessionsBy60Min: number;
  sessionsWithTransport: number;
  sessionsWithoutTransport: number;
  reposicionSessions: number;
  lastUpdated: string;
}

export interface MonthlyDocument {
  id: string;
  therapistId: string;
  month: number;
  year: number;
  plans: TherapyPlan[];
  status: 'draft' | 'completed' | 'submitted' | 'archived';
  createdAt: string;
  lastModified: string;
  // Footer information
  observations: string;
  specialistDate: Date;
  specialistName: string;
  specialistSignature: string;
}

// Validation and business rules
export interface ValidationRule {
  type: 'time_conflict' | 'frequency_limit' | 'duration_conflict' | 'transport_auto';
  validate: (session: TherapySession, allSessions: TherapySession[]) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  conflicts: ConflictInfo[];
}

// API response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  errors?: string[];
}

// User roles for future expansion
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'therapist' | 'secretary' | 'admin';
  permissions: Permission[];
  assignedTherapists?: string[]; // For secretaries
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'export')[];
}

// Export formats
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    start: Date;
    end: Date;
  };
  groupBy: 'therapist' | 'patient' | 'month';
  includeStatistics: boolean;
  includeSignatures: boolean;
}
