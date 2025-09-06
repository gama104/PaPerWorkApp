// Optimized State Management Hook
// Performance-focused state management utilities

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { debounce, throttle } from '../utils/performance';

/**
 * Optimized state hook with built-in performance optimizations
 */
export function useOptimizedState<T>(
  initialState: T | (() => T),
  options: {
    debounceMs?: number;
    throttleMs?: number;
    equalityFn?: (prev: T, next: T) => boolean;
  } = {}
) {
  const { debounceMs, throttleMs, equalityFn } = options;
  const [state, setState] = useState(initialState);
  const previousState = useRef<T>(state);

  // Custom equality check
  const shouldUpdate = useCallback((newState: T) => {
    if (equalityFn) {
      return !equalityFn(previousState.current, newState);
    }
    return previousState.current !== newState;
  }, [equalityFn]);

  // Optimized setter
  const optimizedSetState = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prevState)
        : newState;
      
      if (shouldUpdate(nextState)) {
        previousState.current = nextState;
        return nextState;
      }
      
      return prevState;
    });
  }, [shouldUpdate]);

  // Apply debouncing if specified
  const debouncedSetState = useMemo(() => {
    if (debounceMs) {
      return debounce(optimizedSetState, debounceMs);
    }
    return optimizedSetState;
  }, [optimizedSetState, debounceMs]);

  // Apply throttling if specified
  const finalSetState = useMemo(() => {
    if (throttleMs) {
      return throttle(debouncedSetState, throttleMs);
    }
    return debouncedSetState;
  }, [debouncedSetState, throttleMs]);

  return [state, finalSetState] as const;
}

/**
 * Hook for managing form state with optimizations
 */
export function useOptimizedForm<T extends Record<string, any>>(
  initialValues: T,
  options: {
    validateOnChange?: boolean;
    debounceValidation?: number;
    validator?: (values: T) => Record<string, string>;
  } = {}
) {
  const { validateOnChange = false, debounceValidation = 300, validator } = options;
  
  const [values, setValues] = useOptimizedState(initialValues, {
    equalityFn: (prev, next) => JSON.stringify(prev) === JSON.stringify(next),
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Debounced validation
  const debouncedValidate = useMemo(() => {
    if (!validator) return null;
    
    return debounce((vals: T) => {
      const validationErrors = validator(vals);
      setErrors(validationErrors);
    }, debounceValidation);
  }, [validator, debounceValidation]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange && debouncedValidate) {
      const newValues = { ...values, [field]: value };
      debouncedValidate(newValues);
    }
  }, [setValues, values, validateOnChange, debouncedValidate]);

  const setTouchedField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [setValues, initialValues]);

  const validate = useCallback(() => {
    if (!validator) return true;
    
    const validationErrors = validator(values);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [validator, values]);

  return {
    values,
    errors,
    touched,
    setValue,
    setTouchedField,
    resetForm,
    validate,
    isValid: Object.keys(errors).length === 0,
  };
}

/**
 * Hook for optimized list management
 */
export function useOptimizedList<T>(
  initialItems: T[],
  options: {
    keyExtractor?: (item: T, index: number) => string;
    equalityFn?: (a: T, b: T) => boolean;
  } = {}
) {
  const { keyExtractor = (_, index) => index.toString(), equalityFn } = options;
  
  const [items, setItems] = useOptimizedState(initialItems, {
    equalityFn: equalityFn ? (prev, next) => {
      if (prev.length !== next.length) return false;
      return prev.every((item, index) => equalityFn(item, next[index]));
    } : undefined,
  });

  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, [setItems]);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, [setItems]);

  const updateItem = useCallback((index: number, updatedItem: T) => {
    setItems(prev => prev.map((item, i) => i === index ? updatedItem : item));
  }, [setItems]);

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  }, [setItems]);

  const clearItems = useCallback(() => {
    setItems([]);
  }, [setItems]);

  // Memoized derived values
  const itemsWithKeys = useMemo(() => {
    return items.map((item, index) => ({
      key: keyExtractor(item, index),
      item,
      index,
    }));
  }, [items, keyExtractor]);

  return {
    items,
    itemsWithKeys,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    clearItems,
    count: items.length,
  };
}

/**
 * Hook for optimized search functionality
 */
export function useOptimizedSearch<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  options: {
    debounceMs?: number;
    minQueryLength?: number;
  } = {}
) {
  const { debounceMs = 300, minQueryLength = 1 } = options;
  const [query, setQuery] = useOptimizedState('');
  const [filteredItems, setFilteredItems] = useOptimizedState<T[]>([]);

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    return debounce((searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setFilteredItems([]);
        return;
      }

      const results = items.filter(item => searchFn(item, searchQuery));
      setFilteredItems(results);
    }, debounceMs);
  }, [items, searchFn, debounceMs, minQueryLength, setFilteredItems]);

  // Update search when query changes
  React.useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilteredItems([]);
  }, [setQuery, setFilteredItems]);

  return {
    query,
    setQuery,
    filteredItems,
    clearSearch,
    isSearching: query.length >= minQueryLength,
  };
}

/**
 * Hook for optimized pagination
 */
export function useOptimizedPagination<T>(
  items: T[],
  options: {
    pageSize?: number;
    initialPage?: number;
  } = {}
) {
  const { pageSize = 10, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useOptimizedState(initialPage);

  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const currentItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  const goToPage = useCallback((page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clampedPage);
  }, [setCurrentPage, totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [goToPage, currentPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [goToPage, currentPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    itemsPerPage: pageSize,
    totalItems: items.length,
  };
}
