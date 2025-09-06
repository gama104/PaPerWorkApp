// Sessions Hook - State Management for Sessions Feature
import { useState, useEffect, useCallback, useMemo } from 'react';
import { sessionService } from '../services/sessionService';
import type {
  TherapySession,
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionsFilter,
  SessionStats,
  UseSessionsOptions,
  UseSessionsReturn
} from '../types/session.types';
import { ParentSignatureStatus } from '../types/session.types';

// Global state to prevent duplicate API calls
let globalSessions: TherapySession[] = [];
let globalStats: SessionStats | null = null;
let globalLoading = false;
let globalError: string | null = null;
const globalListeners: Set<() => void> = new Set();

// Function to notify all listeners of state changes
const notifyListeners = () => {
  globalListeners.forEach(listener => listener());
};

const DEFAULT_FILTER: SessionsFilter = {
  page: 1,
  pageSize: 20,
  sortBy: 'sessionDate',
  sortDirection: 'desc',
};

export function useSessions(options: UseSessionsOptions = {}): UseSessionsReturn {
  const { 
    filter: initialFilter = DEFAULT_FILTER,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  // Local state for component-specific data
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilterState] = useState<SessionsFilter>(initialFilter);

  // Local state that syncs with global state
  const [sessions, setSessions] = useState<TherapySession[]>(globalSessions);
  const [stats, setStats] = useState<SessionStats | null>(globalStats);
  const [isLoading, setIsLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(globalError);

  // Function to update local state from global state
  const updateLocalState = useCallback(() => {
    setSessions(globalSessions);
    setStats(globalStats);
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
   * Load sessions from API
   */
  const loadSessions = useCallback(async (filterOverride?: SessionsFilter) => {
    const currentFilter = filterOverride || filter;
    
    // Only make API call if not already loading
    if (globalLoading) return;
    
    globalLoading = true;
    globalError = null;
    notifyListeners();

    try {
      const response = await sessionService.getSessions(currentFilter);
      globalSessions = response.sessions || [];
      globalError = null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sessions';
      globalError = errorMessage;
      console.error('Load sessions error:', err);
    } finally {
      globalLoading = false;
      notifyListeners();
    }
  }, [filter]);

  /**
   * Create new session
   */
  const createSession = useCallback(async (data: CreateSessionRequest): Promise<TherapySession> => {
    setIsCreating(true);
    globalError = null;
    notifyListeners();

    try {
      const newSession = await sessionService.createSession(data);
      globalSessions = [newSession, ...globalSessions];
      notifyListeners();
      return newSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      globalError = errorMessage;
      notifyListeners();
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  /**
   * Update existing session
   */
  const updateSession = useCallback(async (id: string, data: UpdateSessionRequest): Promise<TherapySession> => {
    setIsUpdating(true);
    globalError = null;
    notifyListeners();

    try {
      const updatedSession = await sessionService.updateSession(id, data);
      globalSessions = globalSessions.map(session => 
        session.id === id ? updatedSession : session
      );
      
      // Update selected session if it's the one being updated
      if (selectedSession?.id === id) {
        setSelectedSession(updatedSession);
      }
      
      notifyListeners();
      return updatedSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      globalError = errorMessage;
      notifyListeners();
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedSession]);

  /**
   * Delete session
   */
  const deleteSession = useCallback(async (id: string): Promise<void> => {
    setIsDeleting(true);
    globalError = null;
    notifyListeners();

    try {
      await sessionService.deleteSession(id);
      globalSessions = globalSessions.filter(session => session.id !== id);
      
      // Clear selected session if it's the one being deleted
      if (selectedSession?.id === id) {
        setSelectedSession(null);
      }
      
      notifyListeners();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      globalError = errorMessage;
      notifyListeners();
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [selectedSession]);

  /**
   * Select session
   */
  const selectSession = useCallback((session: TherapySession | null) => {
    setSelectedSession(session);
  }, []);

  /**
   * Set filter and reload sessions
   */
  const setFilter = useCallback((newFilter: SessionsFilter) => {
    setFilterState(newFilter);
    loadSessions(newFilter);
  }, [loadSessions]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    globalError = null;
    notifyListeners();
  }, []);

  /**
   * Refresh sessions
   */
  const refreshSessions = useCallback(() => {
    return loadSessions();
  }, [loadSessions]);

  /**
   * Load session statistics
   */
  const loadStats = useCallback(async () => {
    try {
      const sessionStats = await sessionService.getSessionStats();
      globalStats = sessionStats;
      notifyListeners();
    } catch (err) {
      console.warn('Failed to load session stats:', err);
      // Fallback to computed stats from sessions data
      globalStats = null; // Will use computed stats from useMemo
      notifyListeners();
    }
  }, []);

  // Utility functions
  const getSessionById = useCallback((id: string): TherapySession | undefined => {
    return sessions.find(session => session.id === id);
  }, [sessions]);

  const getSessionsByDate = useCallback((date: string): TherapySession[] => {
    return sessions.filter(session => session.sessionDate === date);
  }, [sessions]);

  const getSessionsByPatient = useCallback((patientName: string): TherapySession[] => {
    return sessions.filter(session => 
      session.patientName?.toLowerCase().includes(patientName.toLowerCase())
    );
  }, [sessions]);

  const getTodaySessions = useCallback((): TherapySession[] => {
    const today = new Date().toISOString().split('T')[0];
    return getSessionsByDate(today);
  }, [getSessionsByDate]);

  const getUpcomingSessions = useCallback((): TherapySession[] => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.sessionDate);
      return sessionDate >= today || session.sessionDate === todayStr;
    }).sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
  }, [sessions]);

  // Load initial data only if not already loaded
  useEffect(() => {
    if (globalSessions.length === 0 && !globalLoading) {
      loadSessions();
    }
    if (!globalStats && !globalLoading) {
      loadStats();
    }
  }, [loadSessions, loadStats]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshSessions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshSessions]);

  // Memoized computed values
  const computedStats = useMemo(() => {
    if (stats) return stats;

    // Calculate basic stats from current sessions
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => 
      s.parentSignatureStatus === ParentSignatureStatus.SIGNED
    ).length;
    const pendingSessions = sessions.filter(s => 
      s.parentSignatureStatus === ParentSignatureStatus.PENDING
    ).length;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekSessions = sessions.filter(s => 
      new Date(s.sessionDate) >= weekAgo
    ).length;

    const thisMonthSessions = sessions.filter(s => 
      new Date(s.sessionDate) >= monthAgo
    ).length;

    return {
      totalSessions,
      completedSessions,
      pendingSessions,
      thisWeekSessions,
      thisMonthSessions,
      averageSessionsPerWeek: thisWeekSessions,
    };
  }, [sessions, stats]);

  return {
    // Data
    sessions,
    selectedSession,
    stats: computedStats,
    
    // State
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    filter,
    
    // Actions
    loadSessions,
    createSession,
    updateSession,
    deleteSession,
    selectSession,
    setFilter,
    clearError,
    refreshSessions,
    
    // Utilities
    getSessionById,
    getSessionsByDate,
    getSessionsByPatient,
    getTodaySessions,
    getUpcomingSessions,
  };
}

export default useSessions;
