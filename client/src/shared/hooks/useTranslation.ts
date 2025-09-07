// Industry-standard React hook for translations
// This follows patterns used by react-i18next, next-i18next, and other major libraries

import { useState, useEffect, useCallback } from 'react';
import { translationService, type Language } from '../constants/translations';

// Custom hook for translations (industry standard pattern)
export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from localStorage or browser settings
    const saved = localStorage.getItem('app-language');
    if (saved && (saved === 'en' || saved === 'es')) {
      return saved as Language;
    }
    
    // Fallback to browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'es' ? 'es' : 'en';
  });

  // Update translation service when language changes
  useEffect(() => {
    translationService.setLanguage(language);
    localStorage.setItem('app-language', language);
  }, [language]);

  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
  }, []);

  return {
    language,
    changeLanguage,
    t: translationService
  };
};

// Hook for specific translation categories (more specific, better performance)
export const useMonthTranslation = () => {
  const { t } = useTranslation();
  return {
    getMonthName: t.getMonthName.bind(t),
    getMonthOptions: t.getMonthOptions.bind(t)
  };
};

export const useTherapyTypeTranslation = () => {
  const { t } = useTranslation();
  return {
    getTherapyTypeName: t.getTherapyTypeName.bind(t),
    getTherapyTypeOptions: t.getTherapyTypeOptions.bind(t)
  };
};

export const useCertificationStatusTranslation = () => {
  const { t } = useTranslation();
  return {
    getCertificationStatusName: t.getCertificationStatusName.bind(t),
    getCertificationStatusOptions: t.getCertificationStatusOptions.bind(t)
  };
};

export const useSignatureStatusTranslation = () => {
  const { t } = useTranslation();
  return {
    getSignatureStatusName: t.getSignatureStatusName.bind(t),
    getSignatureStatusOptions: t.getSignatureStatusOptions.bind(t)
  };
};
