import { api } from './api';
import type { Patient } from '../types/TherapyTypes';

export class PatientService {
  static async getPatients(): Promise<Patient[]> {
    try {
      const response = await api.patients.getAll();
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('🔍 Unexpected patients response:', response);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      throw error;
    }
  }

  static async searchPatients(query: string): Promise<Patient[]> {
    try {
      const response = await api.patients.getAll({ search: query });
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('🔍 Unexpected search patients response:', response);
        return [];
      }
    } catch (error) {
      console.error('Failed to search patients:', error);
      throw error;
    }
  }

  static async getPatient(id: string): Promise<Patient> {
    try {
      const response = await api.patients.getById(id);
      
      // Handle different response structures
      if (response && typeof response === 'object' && 'id' in response) {
        return response as Patient;
      } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
        return response.data;
      } else {
        console.warn('🔍 Unexpected patient response:', response);
        throw new Error('Invalid patient data received');
      }
    } catch (error) {
      console.error('Failed to fetch patient:', error);
      throw error;
    }
  }
}
