// Industry-standard enum definitions for standardized list items
// This follows the pattern used by major applications like GitHub, Stripe, etc.

export enum Month {
  JANUARY = 1,
  FEBRUARY = 2,
  MARCH = 3,
  APRIL = 4,
  MAY = 5,
  JUNE = 6,
  JULY = 7,
  AUGUST = 8,
  SEPTEMBER = 9,
  OCTOBER = 10,
  NOVEMBER = 11,
  DECEMBER = 12
}

export enum TherapyType {
  SPEECH_THERAPY = 1,
  OCCUPATIONAL_THERAPY = 2,
  PHYSICAL_THERAPY = 3,
  BEHAVIORAL_THERAPY = 4,
  MUSIC_THERAPY = 5,
  ART_THERAPY = 6
}

export enum CertificationStatus {
  DRAFT = 1,
  SUBMITTED = 2,
  APPROVED = 3,
  REJECTED = 4
}

export enum SignatureStatus {
  NOT_REQUIRED = 0,
  PENDING = 1,
  COMPLETED = 2,
  APPROVED = 3
}

// Type-safe enum arrays for iteration
export const MONTHS = Object.values(Month).filter(v => typeof v === 'number') as Month[];
export const THERAPY_TYPES = Object.values(TherapyType).filter(v => typeof v === 'number') as TherapyType[];
export const CERTIFICATION_STATUSES = Object.values(CertificationStatus).filter(v => typeof v === 'number') as CertificationStatus[];
export const SIGNATURE_STATUSES = Object.values(SignatureStatus).filter(v => typeof v === 'number') as SignatureStatus[];
