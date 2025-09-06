import { useState, useCallback, useRef } from 'react';
import type { BaseFormProps } from '../types/ModalTypes';

export const useForm = <T extends Record<string, any>>(initialData: T) => {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const initialDataRef = useRef<T>(initialData);

  // Update a single field
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData(prev => {
      const updated = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(initialDataRef.current));
      return updated;
    });
    
    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<T>) => {
    setData(prev => {
      const updated = { ...prev, ...updates };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(initialDataRef.current));
      return updated;
    });
  }, []);

  // Reset form to initial data
  const reset = useCallback(() => {
    setData(initialDataRef.current);
    setErrors({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, []);

  // Set form data (useful for loading existing data)
  const setFormData = useCallback((newData: T) => {
    setData(newData);
    initialDataRef.current = newData;
    setIsDirty(false);
    setErrors({});
  }, []);

  // Basic validation
  const validate = useCallback((validationRules?: Record<keyof T, (value: any) => string | null>) => {
    const newErrors: Record<string, string> = {};
    
    if (validationRules) {
      Object.entries(validationRules).forEach(([field, validator]) => {
        const error = validator(data[field as keyof T]);
        if (error) {
          newErrors[field] = error;
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  // Submit form
  const submit = useCallback(async (
    onSubmit: (data: T) => Promise<void>,
    validationRules?: Record<keyof T, (value: any) => string | null>
  ) => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Validate if rules provided
      if (validationRules && !validate(validationRules)) {
        return false;
      }

      await onSubmit(data);
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'An error occurred while submitting the form'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validate]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = isDirty && !isSubmitting;

  return {
    data,
    errors,
    isSubmitting,
    isDirty,
    hasUnsavedChanges,
    updateField,
    updateFields,
    reset,
    setFormData,
    validate,
    submit
  };
};

export default useForm;
