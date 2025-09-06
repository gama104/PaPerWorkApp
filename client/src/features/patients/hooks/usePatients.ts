// Patients Hook - State Management for Patients Feature
import { useState, useEffect, useCallback, useMemo } from 'react';
import { patientService } from '../services/patientService';
import type {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientsFilter,
  PatientStats,
  Therapist,
  UsePatientsOptions,
  UsePatientsReturn
} from '../types/patient.types';

// Global state to prevent duplicate API calls
let globalPatients: Patient[] = [];
let globalStats: PatientStats | null = null;
const globalTherapists: Therapist[] = [];
let globalLoading = false;
let globalError: string | null = null;
const globalListeners: Set<() => void> = new Set();

// Function to notify all listeners of state changes
const notifyListeners = () => {
  globalListeners.forEach(listener => listener());
};

const DEFAULT_FILTER: PatientsFilter = {
  page: 1,
  pageSize: 20,
  sortBy: 'fullName',
  sortDirection: 'asc',
  isActive: true,
};

export function usePatients(options: UsePatientsOptions = {}): UsePatientsReturn {
  const { 
    filter: initialFilter = DEFAULT_FILTER,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    includeTherapists = true
  } = options;

  // Local state for component-specific data
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilterState] = useState<PatientsFilter>(initialFilter);

  // Local state that syncs with global state
  const [patients, setPatients] = useState<Patient[]>(globalPatients);
  const [stats, setStats] = useState<PatientStats | null>(globalStats);
  const [therapists, setTherapists] = useState<Therapist[]>(globalTherapists);
  const [isLoading, setIsLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(globalError);

  // Function to update local state from global state
  const updateLocalState = useCallback(() => {
    setPatients(globalPatients);
    setStats(globalStats);
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

  /**
   * Load patients from API
   */
  const loadPatients = useCallback(async (filterOverride?: PatientsFilter) => {
    const currentFilter = filterOverride || filter;
    
    // Only make API call if not already loading
    if (globalLoading) return;
    
    globalLoading = true;
    globalError = null;
    notifyListeners();

    try {
      const response = await patientService.getPatients(currentFilter);
      globalPatients = response.patients;
      globalError = null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load patients';
      globalError = errorMessage;
      console.error('Load patients error:', err);
    } finally {
      globalLoading = false;
      notifyListeners();
    }
  }, [filter]);

  /**
   * Create new patient
   */
  const createPatient = useCallback(async (data: CreatePatientRequest): Promise<Patient> => {
    setIsCreating(true);
    globalError = null;
    notifyListeners();

    try {
      const newPatient = await patientService.createPatient(data);
      globalPatients = [newPatient, ...globalPatients];
      notifyListeners();
      return newPatient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create patient';
      globalError = errorMessage;
      notifyListeners();
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  /**
   * Update existing patient
   */
  const updatePatient = useCallback(async (id: string, data: UpdatePatientRequest): Promise<Patient> => {
    setIsUpdating(true);
    globalError = null;
    notifyListeners();

    try {
      const updatedPatient = await patientService.updatePatient(id, data);
      globalPatients = globalPatients.map(patient => 
        patient.id === id ? updatedPatient : patient
      );
      
      // Update selected patient if it's the one being updated
      if (selectedPatient?.id === id) {
        setSelectedPatient(updatedPatient);
      }
      
      notifyListeners();
      return updatedPatient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update patient';
      globalError = errorMessage;
      notifyListeners();
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedPatient]);

  /**
   * Delete patient
   */
  const deletePatient = useCallback(async (id: string): Promise<void> => {
    setIsDeleting(true);
    globalError = null;
    notifyListeners();

    try {
      await patientService.deletePatient(id);
      globalPatients = globalPatients.filter(patient => patient.id !== id);
      
      // Clear selected patient if it's the one being deleted
      if (selectedPatient?.id === id) {
        setSelectedPatient(null);
      }
      
      notifyListeners();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete patient';
      globalError = errorMessage;
      notifyListeners();
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [selectedPatient]);

  /**
   * Select patient
   */
  const selectPatient = useCallback((patient: Patient | null) => {
    setSelectedPatient(patient);
  }, []);

  /**
   * Set filter and reload patients
   */
  const setFilter = useCallback((newFilter: PatientsFilter) => {
    setFilterState(newFilter);
    loadPatients(newFilter);
  }, [loadPatients]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    globalError = null;
    notifyListeners();
  }, []);

  /**
   * Refresh patients
   */
  const refreshPatients = useCallback(() => {
    return loadPatients();
  }, [loadPatients]);

  /**
   * Load patient statistics
   */
  const loadStats = useCallback(async () => {
    try {
      // For now, provide default stats since the endpoint doesn't exist yet
      const defaultStats: PatientStats = {
        totalPatients: 0,
        activePatients: 0,
        inactivePatients: 0,
        newPatientsThisMonth: 0,
        patientsWithActiveCertifications: 0,
        averageAge: 0,
        patientsPerTherapist: 0
      };
      globalStats = defaultStats;
      notifyListeners();
      // TODO: Uncomment when stats endpoint is implemented
      // const patientStats = await patientService.getPatientStats();
      // globalStats = patientStats;
      // notifyListeners();
    } catch (err) {
      console.warn('Failed to load patient stats:', err);
    }
  }, []);

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
      // const therapistsData = await patientService.getTherapists();
      // setTherapists(therapistsData);
    } catch (err) {
      console.warn('Failed to load therapists:', err);
    }
  }, [includeTherapists]);

  // Utility functions
  const getPatientById = useCallback((id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id);
  }, [patients]);

  const getPatientsByTherapist = useCallback((therapistId: string): Patient[] => {
    return patients.filter(patient => patient.therapist?.id === therapistId);
  }, [patients]);

  const getActivePatients = useCallback((): Patient[] => {
    // For now, return all patients as active since Patient doesn't have isActive property
    return patients;
  }, [patients]);

  const getInactivePatients = useCallback((): Patient[] => {
    // For now, return empty array since Patient doesn't have isActive property
    return [];
  }, []);

  const getNewPatientsThisMonth = useCallback((): Patient[] => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return patients.filter(patient => {
      const createdDate = new Date(patient.createdAt);
      return createdDate >= thisMonth;
    });
  }, [patients]);

  const getPatientsWithActiveCertifications = useCallback((): Patient[] => {
    return patients.filter(patient => 
      patient.certifications && patient.certifications.length > 0
    );
  }, [patients]);

  const searchPatients = useCallback((query: string): Patient[] => {
    if (!query.trim()) return patients;
    
    const lowercaseQuery = query.toLowerCase();
    return patients.filter(patient =>
      patient.fullName.toLowerCase().includes(lowercaseQuery) ||
      patient.email?.toLowerCase().includes(lowercaseQuery) ||
      patient.phone?.includes(query)
    );
  }, [patients]);

  const getTherapistById = useCallback((id: string): Therapist | undefined => {
    return therapists.find(therapist => therapist.id === id);
  }, [therapists]);

  // Load initial data only if not already loaded
  useEffect(() => {
    if (globalPatients.length === 0 && !globalLoading) {
      loadPatients();
    }
    if (!globalStats && !globalLoading) {
      loadStats();
    }
    if (globalTherapists.length === 0 && !globalLoading) {
      loadTherapists();
    }
  }, [loadPatients, loadStats, loadTherapists]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshPatients();
      loadStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshPatients, loadStats]);

  // Memoized computed values
  const computedStats = useMemo(() => {
    if (stats) return stats;

    // Calculate basic stats from current patients
    const totalPatients = patients.length;
    const activePatients = getActivePatients().length;
    const inactivePatients = getInactivePatients().length;
    const newPatientsThisMonth = getNewPatientsThisMonth().length;
    const patientsWithActiveCertifications = getPatientsWithActiveCertifications().length;
    
    // Calculate average age
    const patientsWithAge = patients.filter(p => p.dateOfBirth);
    const averageAge = patientsWithAge.length > 0
      ? patientsWithAge.reduce((sum, patient) => {
          const age = new Date().getFullYear() - new Date(patient.dateOfBirth!).getFullYear();
          return sum + age;
        }, 0) / patientsWithAge.length
      : 0;

    // Calculate patients per therapist
    const uniqueTherapists = new Set(patients.map(p => p.therapist?.id).filter(Boolean));
    const patientsPerTherapist = uniqueTherapists.size > 0 
      ? totalPatients / uniqueTherapists.size 
      : 0;

    return {
      totalPatients,
      activePatients,
      inactivePatients,
      newPatientsThisMonth,
      patientsWithActiveCertifications,
      averageAge: Math.round(averageAge),
      patientsPerTherapist: Math.round(patientsPerTherapist * 10) / 10,
    };
  }, [patients, stats, getActivePatients, getInactivePatients, getNewPatientsThisMonth, getPatientsWithActiveCertifications]);

  return {
    // Data
    patients,
    selectedPatient,
    stats: computedStats,
    therapists,
    
    // State
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    filter,
    
    // Actions
    loadPatients,
    createPatient,
    updatePatient,
    deletePatient,
    selectPatient,
    setFilter,
    clearError,
    refreshPatients,
    
    // Utilities
    getPatientById,
    getPatientsByTherapist,
    getActivePatients,
    getInactivePatients,
    getNewPatientsThisMonth,
    getPatientsWithActiveCertifications,
    searchPatients,
    
    // Therapist utilities
    loadTherapists,
    getTherapistById,
  };
}

export default usePatients;
