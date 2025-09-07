// Industry-standard translation management
// This follows patterns used by companies like Airbnb, Uber, and other international apps

import { Month, TherapyType, CertificationStatus, SignatureStatus } from './enums';

// Translation maps - this is how major apps handle i18n
export const TRANSLATIONS = {
  en: {
    months: {
      [Month.JANUARY]: 'January',
      [Month.FEBRUARY]: 'February',
      [Month.MARCH]: 'March',
      [Month.APRIL]: 'April',
      [Month.MAY]: 'May',
      [Month.JUNE]: 'June',
      [Month.JULY]: 'July',
      [Month.AUGUST]: 'August',
      [Month.SEPTEMBER]: 'September',
      [Month.OCTOBER]: 'October',
      [Month.NOVEMBER]: 'November',
      [Month.DECEMBER]: 'December'
    },
    therapyTypes: {
      [TherapyType.SPEECH_THERAPY]: 'Speech Therapy',
      [TherapyType.OCCUPATIONAL_THERAPY]: 'Occupational Therapy',
      [TherapyType.PHYSICAL_THERAPY]: 'Physical Therapy',
      [TherapyType.BEHAVIORAL_THERAPY]: 'Behavioral Therapy',
      [TherapyType.MUSIC_THERAPY]: 'Music Therapy',
      [TherapyType.ART_THERAPY]: 'Art Therapy'
    },
    certificationStatuses: {
      [CertificationStatus.DRAFT]: 'Draft',
      [CertificationStatus.SUBMITTED]: 'Submitted',
      [CertificationStatus.APPROVED]: 'Approved',
      [CertificationStatus.REJECTED]: 'Rejected'
    },
    signatureStatuses: {
      [SignatureStatus.NOT_REQUIRED]: 'Not Required',
      [SignatureStatus.PENDING]: 'Pending',
      [SignatureStatus.COMPLETED]: 'Completed',
      [SignatureStatus.APPROVED]: 'Approved'
    }
  },
  es: {
    months: {
      [Month.JANUARY]: 'Enero',
      [Month.FEBRUARY]: 'Febrero',
      [Month.MARCH]: 'Marzo',
      [Month.APRIL]: 'Abril',
      [Month.MAY]: 'Mayo',
      [Month.JUNE]: 'Junio',
      [Month.JULY]: 'Julio',
      [Month.AUGUST]: 'Agosto',
      [Month.SEPTEMBER]: 'Septiembre',
      [Month.OCTOBER]: 'Octubre',
      [Month.NOVEMBER]: 'Noviembre',
      [Month.DECEMBER]: 'Diciembre'
    },
    therapyTypes: {
      [TherapyType.SPEECH_THERAPY]: 'Terapia del Habla',
      [TherapyType.OCCUPATIONAL_THERAPY]: 'Terapia Ocupacional',
      [TherapyType.PHYSICAL_THERAPY]: 'Terapia Física',
      [TherapyType.BEHAVIORAL_THERAPY]: 'Terapia Conductual',
      [TherapyType.MUSIC_THERAPY]: 'Terapia Musical',
      [TherapyType.ART_THERAPY]: 'Terapia Artística'
    },
    certificationStatuses: {
      [CertificationStatus.DRAFT]: 'Borrador',
      [CertificationStatus.SUBMITTED]: 'Enviado',
      [CertificationStatus.APPROVED]: 'Aprobado',
      [CertificationStatus.REJECTED]: 'Rechazado'
    },
    signatureStatuses: {
      [SignatureStatus.NOT_REQUIRED]: 'No Requerido',
      [SignatureStatus.PENDING]: 'Pendiente',
      [SignatureStatus.COMPLETED]: 'Completado',
      [SignatureStatus.APPROVED]: 'Aprobado'
    }
  }
} as const;

// Type definitions for better type safety
export type Language = keyof typeof TRANSLATIONS;
export type TranslationKey = keyof typeof TRANSLATIONS.en;

// Industry-standard translation service
export class TranslationService {
  private currentLanguage: Language = 'en';

  constructor(language: Language = 'en') {
    this.currentLanguage = language;
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  // Generic translation method
  translate<T extends TranslationKey>(key: T, value: number): string {
    const translations = TRANSLATIONS[this.currentLanguage][key] as Record<number, string>;
    return translations[value] || `Unknown ${key}`;
  }

  // Specific translation methods for better developer experience
  getMonthName(month: Month): string {
    return this.translate('months', month);
  }

  getTherapyTypeName(type: TherapyType): string {
    return this.translate('therapyTypes', type);
  }

  getCertificationStatusName(status: CertificationStatus): string {
    return this.translate('certificationStatuses', status);
  }

  getSignatureStatusName(status: SignatureStatus): string {
    return this.translate('signatureStatuses', status);
  }

  // Get all options for dropdowns (industry standard pattern)
  getMonthOptions(): Array<{ value: Month; label: string }> {
    return Object.values(Month)
      .filter(v => typeof v === 'number')
      .map(month => ({
        value: month as Month,
        label: this.getMonthName(month as Month)
      }));
  }

  getTherapyTypeOptions(): Array<{ value: TherapyType; label: string }> {
    return Object.values(TherapyType)
      .filter(v => typeof v === 'number')
      .map(type => ({
        value: type as TherapyType,
        label: this.getTherapyTypeName(type as TherapyType)
      }));
  }

  getCertificationStatusOptions(): Array<{ value: CertificationStatus; label: string }> {
    return Object.values(CertificationStatus)
      .filter(v => typeof v === 'number')
      .map(status => ({
        value: status as CertificationStatus,
        label: this.getCertificationStatusName(status as CertificationStatus)
      }));
  }

  getSignatureStatusOptions(): Array<{ value: SignatureStatus; label: string }> {
    return Object.values(SignatureStatus)
      .filter(v => typeof v === 'number')
      .map(status => ({
        value: status as SignatureStatus,
        label: this.getSignatureStatusName(status as SignatureStatus)
      }));
  }
}

// Singleton instance (industry standard pattern)
export const translationService = new TranslationService();

// Convenience functions for common use cases
export const t = translationService;
