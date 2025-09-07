// API Configuration
export const API_CONFIG = {
  // Development
  BASE_URL: '/api', // Use proxy in development
  
  // Production (update this when deploying)
  // BASE_URL: 'https://your-production-api.com/api',
  
  // Timeout settings
  TIMEOUT: 10000, // 10 seconds
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me'
    },
    CERTIFICATIONS: '/certifications',
    PATIENTS: '/patients',
    SESSIONS: '/sessions',
    REPORTS: '/reports'
  }
}
