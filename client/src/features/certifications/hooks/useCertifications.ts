// Certifications Hook - State Management for Certifications Feature
import { useState, useEffect, useCallback, useMemo } from 'react';
import { certificationService } from '../services/certificationService';
import type {
  CertificationDocument,
  CreateCertificationRequest,
  UpdateCertificationRequest,
  CertificationsFilter,
  CertificationStats,
  Patient,
  Therapist,
  UseCertificationsOptions,
  UseCertificationsReturn
} from '../types/certification.types';
import { CertificationStatus } from '../types/certification.types';

// Global state to prevent duplicate API calls
let globalCertifications: CertificationDocument[] = [];
let globalStats: CertificationStats | null = null;
let globalPatients: Patient[] = [];
let globalTherapists: Therapist[] = [];
let globalLoading = false;
let globalError: string | null = null;
const globalListeners: Set<() => void> = new Set();

// Function to notify all listeners of state changes
const notifyListeners = () => {
  globalListeners.forEach(listener => listener());
};

const DEFAULT_FILTER: CertificationsFilter = {
  page: 1,
  pageSize: 20,
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

export function useCertifications(options: UseCertificationsOptions = {}): UseCertificationsReturn {
  const { 
    filter: initialFilter = DEFAULT_FILTER,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    includeSessions = false,
    includePatients = true,
    includeTherapists = true,
    loadCertifications: shouldLoadCertifications = true
  } = options;

  // Local state for component-specific data
  const [selectedCertification, setSelectedCertification] = useState<CertificationDocument | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilterState] = useState<CertificationsFilter>(initialFilter);

  // Local state that syncs with global state
  const [certifications, setCertifications] = useState<CertificationDocument[]>(globalCertifications);
  const [stats, setStats] = useState<CertificationStats | null>(globalStats);
  const [patients, setPatients] = useState<Patient[]>(globalPatients);
  const [therapists, setTherapists] = useState<Therapist[]>(globalTherapists);
  const [isLoading, setIsLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(globalError);

  // Function to update local state from global state
  const updateLocalState = useCallback(() => {
    setCertifications(globalCertifications);
    setStats(globalStats);
    setPatients(globalPatients);
    setTherapists(globalTherapists);
    setIsLoading(globalLoading);
    setError(globalError);
  }, []);

  // Subscribe to global state changes
  useEffect(() => {
    globalListeners.add(updateLocalState);
    return () => {
      globalListeners.delete(updateLocalState);
    };
  }, [updateLocalState]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  /**
   * Load certifications from API
   */
  const loadCertifications = useCallback(async (filterOverride?: CertificationsFilter) => {
    const currentFilter = filterOverride || filter;
    
    // Only make API call if not already loading
    if (globalLoading) return;
    
    globalLoading = true;
    globalError = null;
    notifyListeners();

    try {
      const response = await certificationService.getCertifications(currentFilter);
      globalCertifications = response.certifications;
      globalError = null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load certifications';
      globalError = errorMessage;
      console.error('Load certifications error:', err);
    } finally {
      globalLoading = false;
      notifyListeners();
    }
  }, [filter]);

  /**
   * Create new certification
   */
  const createCertification = useCallback(async (data: CreateCertificationRequest): Promise<CertificationDocument> => {
    setIsCreating(true);
    setError(null);

    try {
      const newCertification = await certificationService.createCertification(data);
      setCertifications(prev => [newCertification, ...prev]);
      return newCertification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create certification';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  /**
   * Update existing certification
   */
  const updateCertification = useCallback(async (id: string, data: UpdateCertificationRequest): Promise<CertificationDocument> => {
    setIsUpdating(true);
    setError(null);

    try {
      const updatedCertification = await certificationService.updateCertification(id, data);
      setCertifications(prev => prev.map(cert => 
        cert.id === id ? updatedCertification : cert
      ));
      
      // Update selected certification if it's the one being updated
      if (selectedCertification?.id === id) {
        setSelectedCertification(updatedCertification);
      }
      
      return updatedCertification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update certification';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedCertification]);

  /**
   * Delete certification
   */
  const deleteCertification = useCallback(async (id: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      await certificationService.deleteCertification(id);
      setCertifications(prev => prev.filter(cert => cert.id !== id));
      
      // Clear selected certification if it's the one being deleted
      if (selectedCertification?.id === id) {
        setSelectedCertification(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete certification';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [selectedCertification]);

  /**
   * Submit certification for approval
   */
  const submitCertification = useCallback(async (id: string): Promise<CertificationDocument> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const submittedCertification = await certificationService.submitCertification(id);
      setCertifications(prev => prev.map(cert => 
        cert.id === id ? submittedCertification : cert
      ));
      
      // Update selected certification if it's the one being submitted
      if (selectedCertification?.id === id) {
        setSelectedCertification(submittedCertification);
      }
      
      return submittedCertification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit certification';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCertification]);

  /**
   * Select certification
   */
  const selectCertification = useCallback((certification: CertificationDocument | null) => {
    setSelectedCertification(certification);
  }, []);

  /**
   * Open modal with certification
   */
  const openModal = useCallback((mode: 'view' | 'edit' | 'create', certification?: CertificationDocument) => {
    setModalMode(mode);
    setSelectedCertification(certification || null);
    setIsModalOpen(true);
  }, []);

  /**
   * Close modal
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCertification(null);
    setModalMode('view');
  }, []);

  /**
   * View certification details
   */
  const viewCertification = useCallback((certification: CertificationDocument) => {
    openModal('view', certification);
  }, [openModal]);

  /**
   * Edit certification
   */
  const editCertification = useCallback((certification: CertificationDocument) => {
    openModal('edit', certification);
  }, [openModal]);

  /**
   * Create new certification
   */
  const createNewCertification = useCallback(() => {
    openModal('create');
  }, [openModal]);

  /**
   * Set filter and reload certifications
   */
  const setFilter = useCallback((newFilter: CertificationsFilter) => {
    setFilterState(newFilter);
    loadCertifications(newFilter);
  }, [loadCertifications]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh certifications
   */
  const refreshCertifications = useCallback(() => {
    return loadCertifications();
  }, [loadCertifications]);

  /**
   * Load certification statistics
   */
  const loadStats = useCallback(async () => {
    try {
      const certificationStats = await certificationService.getCertificationStats();
      globalStats = certificationStats;
      notifyListeners();
    } catch (err) {
      console.warn('Failed to load certification stats:', err);
      // Provide default stats on error
      const defaultStats = {
        totalCertifications: 0,
        draftCertifications: 0,
        submittedCertifications: 0,
        approvedCertifications: 0,
        rejectedCertifications: 0,
        thisMonthCertifications: 0,
        thisYearCertifications: 0,
        completionRate: 0,
        averageCertificationsPerMonth: 0
      };
      globalStats = defaultStats;
      notifyListeners();
    }
  }, []);

  /**
   * Load patients
   */
  const loadPatients = useCallback(async () => {
    if (!includePatients) return;
    
    try {
      const patientsData = await certificationService.getPatients();
      setPatients(patientsData);
    } catch (err) {
      console.warn('Failed to load patients:', err);
    }
  }, [includePatients]);

  /**
   * Load therapists
   */
  const loadTherapists = useCallback(async () => {
    if (!includeTherapists) return;
    
    try {
      // Temporarily disabled due to authorization issues
      // TODO: Fix authorization for therapist loading
      console.warn('Therapist loading temporarily disabled due to authorization issues');
      setTherapists([]);
      // const therapistsData = await certificationService.getTherapists();
      // setTherapists(therapistsData);
    } catch (err) {
      console.warn('Failed to load therapists:', err);
    }
  }, [includeTherapists]);

  // Utility functions
  const getCertificationById = useCallback((id: string): CertificationDocument | undefined => {
    return certifications.find(cert => cert.id === id);
  }, [certifications]);

  const getCertificationsByPatient = useCallback((patientId: string): CertificationDocument[] => {
    return certifications.filter(cert => cert.patientId === patientId);
  }, [certifications]);

  const getCertificationsByTherapist = useCallback((therapistId: string): CertificationDocument[] => {
    return certifications.filter(cert => cert.therapistId === therapistId);
  }, [certifications]);

  const getCertificationsByStatus = useCallback((status: CertificationStatus): CertificationDocument[] => {
    return certifications.filter(cert => cert.status === status);
  }, [certifications]);

  const getCurrentMonthCertifications = useCallback((): CertificationDocument[] => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    const currentYear = now.getFullYear();
    
    return certifications.filter(cert => 
      cert.month === currentMonth && cert.year === currentYear
    );
  }, [certifications]);

  const getPendingCertifications = useCallback((): CertificationDocument[] => {
    return certifications.filter(cert => 
      cert.status === CertificationStatus.DRAFT || 
      cert.status === CertificationStatus.SUBMITTED ||
      cert.status === CertificationStatus.UNDER_REVIEW ||
      cert.status === CertificationStatus.REVISION_REQUIRED
    );
  }, [certifications]);

  const getOverdueCertifications = useCallback((): CertificationDocument[] => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Consider certifications overdue if they're for previous months and not approved
    return certifications.filter(cert => {
      const certDate = new Date(cert.year, cert.month - 1); // month is 0-indexed in Date
      const currentDate = new Date(currentYear, currentMonth - 1);
      
      return certDate < currentDate && 
             cert.status !== CertificationStatus.APPROVED;
    });
  }, [certifications]);

  const getPatientById = useCallback((id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id);
  }, [patients]);

  const getTherapistById = useCallback((id: string): Therapist | undefined => {
    return therapists.find(therapist => therapist.id === id);
  }, [therapists]);

  // Load initial data
  useEffect(() => {
    if (shouldLoadCertifications && globalCertifications.length === 0 && !globalLoading) {
      loadCertifications();
    }
    if (!globalStats && !globalLoading) {
      loadStats();
    }
    if (includePatients && globalPatients.length === 0 && !globalLoading) {
      loadPatients();
    }
    if (includeTherapists && globalTherapists.length === 0 && !globalLoading) {
      loadTherapists();
    }
  }, [shouldLoadCertifications, includePatients, includeTherapists, loadCertifications, loadStats, loadPatients, loadTherapists]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshCertifications();
      loadStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshCertifications, loadStats]);

  // Memoized computed values
  const computedStats = useMemo(() => {
    if (stats) return stats;

    // Calculate basic stats from current certifications
    const totalCertifications = certifications.length;
    const draftCertifications = getCertificationsByStatus(CertificationStatus.DRAFT).length;
    const submittedCertifications = getCertificationsByStatus(CertificationStatus.SUBMITTED).length;
    const approvedCertifications = getCertificationsByStatus(CertificationStatus.APPROVED).length;
    const rejectedCertifications = getCertificationsByStatus(CertificationStatus.REJECTED).length;
    const thisMonthCertifications = getCurrentMonthCertifications().length;
    
    const completionRate = totalCertifications > 0 
      ? (approvedCertifications / totalCertifications) * 100 
      : 0;
      
    const totalSessions = certifications.reduce((sum, cert) => sum + (cert.totalSessions || 0), 0);
    const averageSessionsPerCertification = totalCertifications > 0 
      ? totalSessions / totalCertifications 
      : 0;

    return {
      totalCertifications,
      draftCertifications,
      submittedCertifications,
      approvedCertifications,
      rejectedCertifications,
      thisMonthCertifications,
      completionRate,
      averageSessionsPerCertification,
    };
  }, [certifications, stats, getCertificationsByStatus, getCurrentMonthCertifications]);

  return {
    // Data
    certifications,
    selectedCertification,
    stats: computedStats,
    patients,
    therapists,
    
    // State
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting,
    error,
    filter,
    
    // Modal state
    isModalOpen,
    modalMode,
    
    // Actions
    loadCertifications,
    createCertification,
    updateCertification,
    deleteCertification,
    submitCertification,
    selectCertification,
    setFilter,
    clearError,
    refreshCertifications,
    
    // Modal actions
    openModal,
    closeModal,
    viewCertification,
    editCertification,
    createNewCertification,
    
    // Utilities
    getCertificationById,
    getCertificationsByPatient,
    getCertificationsByTherapist,
    getCertificationsByStatus,
    getCurrentMonthCertifications,
    getPendingCertifications,
    getOverdueCertifications,
    
    // Patient & Therapist utilities
    loadPatients,
    loadTherapists,
    getPatientById,
    getTherapistById,
  };
}

export default useCertifications;
