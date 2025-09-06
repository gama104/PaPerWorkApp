import type { ModalState, ModalActions } from '../types/ModalTypes';

export class ModalService {
  private static instance: ModalService;
  private modalActions: ModalActions | null = null;

  private constructor() {}

  static getInstance(): ModalService {
    if (!ModalService.instance) {
      ModalService.instance = new ModalService();
    }
    return ModalService.instance;
  }

  // Register modal actions (called by useModal hook)
  registerActions(actions: ModalActions): void {
    this.modalActions = actions;
  }

  // Navigation methods
  openCertificationView(id: string): void {
    if (this.modalActions) {
      this.modalActions.openCertificationView(id);
    } else {
      console.warn('ModalService: Actions not registered');
    }
  }

  openCertificationEdit(id: string): void {
    if (this.modalActions) {
      this.modalActions.openCertificationEdit(id);
    } else {
      console.warn('ModalService: Actions not registered');
    }
  }

  openSessionList(certificationId: string): void {
    if (this.modalActions) {
      this.modalActions.openSessionList(certificationId);
    } else {
      console.warn('ModalService: Actions not registered');
    }
  }

  openSessionView(id: string): void {
    if (this.modalActions) {
      this.modalActions.openSessionView(id);
    } else {
      console.warn('ModalService: Actions not registered');
    }
  }

  openSessionEdit(id: string): void {
    if (this.modalActions) {
      this.modalActions.openSessionEdit(id);
    } else {
      console.warn('ModalService: Actions not registered');
    }
  }

  openSessionCreate(certificationId: string): void {
    if (this.modalActions) {
      this.modalActions.openSessionCreate(certificationId);
    } else {
      console.warn('ModalService: Actions not registered');
    }
  }

  close(): void {
    if (this.modalActions) {
      this.modalActions.close();
    } else {
      console.warn('ModalService: Actions not registered');
    }
  }

  goBack(): void {
    if (this.modalActions) {
      this.modalActions.goBack();
    } else {
      console.warn('ModalService: Actions not registered');
    }
  }

  // Helper methods for common navigation patterns
  navigateToEditFromView(currentState: ModalState): void {
    if (currentState.type === 'certification-view') {
      this.openCertificationEdit(currentState.certificationId);
    } else if (currentState.type === 'session-view') {
      this.openSessionEdit(currentState.sessionId);
    }
  }

  navigateToViewFromEdit(currentState: ModalState): void {
    if (currentState.type === 'certification-edit') {
      this.openCertificationView(currentState.certificationId);
    } else if (currentState.type === 'session-edit') {
      this.openSessionView(currentState.sessionId);
    }
  }

  navigateToSessionsFromCertification(currentState: ModalState): void {
    if (currentState.type === 'certification-view' || currentState.type === 'certification-edit') {
      this.openSessionList(currentState.certificationId);
    }
  }

  navigateToCertificationFromSessions(currentState: ModalState): void {
    if (currentState.type === 'session-list' || currentState.type === 'session-create') {
      this.openCertificationView(currentState.certificationId);
    }
  }
}

// Export singleton instance
export const modalService = ModalService.getInstance();
