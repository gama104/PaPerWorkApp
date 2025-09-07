// App Module Exports
// Central export point for app-level configuration and routing

// This file can be used to export app-level configurations,
// routing setup, store configuration, etc.

// For now, we'll keep it simple and just export a placeholder
// that can be expanded as the app grows

export const APP_CONFIG = {
  name: 'PaPerWork',
  version: '2.0.0',
  description: 'Therapy Session Management System',
  features: {
    auth: true,
    sessions: true,
    certifications: true,
    patients: true,
    reporting: true,
  },
  api: {
    baseUrl: process.env.REACT_APP_API_URL || '/api',
    timeout: 30000,
  },
  ui: {
    theme: 'light',
    animations: true,
    notifications: true,
  },
} as const;

// Export types for app configuration
export type AppConfig = typeof APP_CONFIG;
export type AppFeatures = keyof typeof APP_CONFIG.features;


