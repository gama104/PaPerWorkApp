import { useState, useCallback, useRef } from 'react';
import type { ModalState, ModalActions, NavigationHistory } from '../types/ModalTypes';

export const useModal = () => {
  const [state, setState] = useState<ModalState>({ type: 'closed' });
  const historyRef = useRef<ModalState[]>([]);

  // Navigation History Implementation
  const navigationHistory: NavigationHistory = {
    push: useCallback((newState: ModalState) => {
      if (state.type !== 'closed') {
        historyRef.current.push(state);
      }
      setState(newState);
    }, [state]),

    pop: useCallback(() => {
      const previousState = historyRef.current.pop();
      if (previousState) {
        setState(previousState);
        return previousState;
      }
      return null;
    }, []),

    clear: useCallback(() => {
      historyRef.current = [];
    }, []),

    canGoBack: useCallback(() => {
      return historyRef.current.length > 0;
    }, [])
  };

  // Modal Actions
  const actions: ModalActions = {
    openCertificationView: useCallback((id: string) => {
      console.log('🔄 Opening certification view:', id);
      navigationHistory.push({ type: 'certification-view', certificationId: id });
    }, [navigationHistory]),

    openCertificationEdit: useCallback((id: string) => {
      console.log('🔄 Opening certification edit:', id);
      navigationHistory.push({ type: 'certification-edit', certificationId: id });
    }, [navigationHistory]),

    openSessionList: useCallback((certificationId: string) => {
      console.log('🔄 Opening session list for certification:', certificationId);
      navigationHistory.push({ type: 'session-list', certificationId });
    }, [navigationHistory]),

    openSessionView: useCallback((id: string) => {
      console.log('🔄 Opening session view:', id);
      navigationHistory.push({ type: 'session-view', sessionId: id });
    }, [navigationHistory]),

    openSessionEdit: useCallback((id: string) => {
      console.log('🔄 Opening session edit:', id);
      navigationHistory.push({ type: 'session-edit', sessionId: id });
    }, [navigationHistory]),

    openSessionCreate: useCallback((certificationId: string) => {
      console.log('🔄 Opening session create for certification:', certificationId);
      navigationHistory.push({ type: 'session-create', certificationId });
    }, [navigationHistory]),

    close: useCallback(() => {
      console.log('🔄 Closing modal');
      navigationHistory.clear();
      setState({ type: 'closed' });
    }, [navigationHistory]),

    goBack: useCallback(() => {
      console.log('🔄 Going back in modal history');
      const previousState = navigationHistory.pop();
      if (!previousState) {
        // If no history, close the modal
        setState({ type: 'closed' });
      }
    }, [navigationHistory])
  };

  // Helper functions
  const isOpen = state.type !== 'closed';
  const isCertificationView = state.type === 'certification-view';
  const isCertificationEdit = state.type === 'certification-edit';
  const isSessionList = state.type === 'session-list';
  const isSessionView = state.type === 'session-view';
  const isSessionEdit = state.type === 'session-edit';
  const isSessionCreate = state.type === 'session-create';

  // Get current IDs
  const getCurrentCertificationId = (): string | null => {
    if (state.type === 'certification-view' || state.type === 'certification-edit') {
      return state.certificationId;
    }
    if (state.type === 'session-list' || state.type === 'session-create') {
      return state.certificationId;
    }
    return null;
  };

  const getCurrentSessionId = (): string | null => {
    if (state.type === 'session-view' || state.type === 'session-edit') {
      return state.sessionId;
    }
    return null;
  };

  return {
    state,
    actions,
    navigationHistory,
    isOpen,
    isCertificationView,
    isCertificationEdit,
    isSessionList,
    isSessionView,
    isSessionEdit,
    isSessionCreate,
    getCurrentCertificationId,
    getCurrentSessionId,
    canGoBack: navigationHistory.canGoBack()
  };
};

export default useModal;
