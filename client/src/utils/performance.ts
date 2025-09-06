// Performance Utilities
// Tools for measuring and optimizing application performance
import React from 'react';

/**
 * Performance measurement utility
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements: Map<string, number> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start measuring performance for a given operation
   */
  start(label: string): void {
    if (!this.isEnabled) return;
    this.measurements.set(label, performance.now());
  }

  /**
   * End measurement and log the result
   */
  end(label: string): number {
    if (!this.isEnabled) return 0;
    
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`No start time found for performance measurement: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(label);
    
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Measure an async operation
   */
  async measure<T>(label: string, operation: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) return operation();
    
    this.start(label);
    try {
      const result = await operation();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * Measure a synchronous operation
   */
  measureSync<T>(label: string, operation: () => T): T {
    if (!this.isEnabled) return operation();
    
    this.start(label);
    try {
      const result = operation();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

/**
 * Web Vitals measurement
 */
export const measureWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('🎯 LCP:', entry.startTime);
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // LCP not supported
  }

  // First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'first-input') {
        const fid = (entry as any).processingStart - entry.startTime;
        console.log('⚡ FID:', fid);
      }
    }
  });

  try {
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    // FID not supported
  }

  // Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    console.log('📏 CLS:', clsValue);
  });

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // CLS not supported
  }
};

/**
 * Memory usage monitoring
 */
export const measureMemoryUsage = () => {
  if (typeof window === 'undefined' || !(performance as any).memory) return;

  const memory = (performance as any).memory;
  console.log('🧠 Memory Usage:', {
    used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
    total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
    limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`,
  });
};

/**
 * Bundle size analysis helper
 */
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return;

  // Analyze loaded resources
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const scripts = resources.filter(r => r.name.endsWith('.js'));
  const styles = resources.filter(r => r.name.endsWith('.css'));

  const totalScriptSize = scripts.reduce((sum, script) => sum + (script.transferSize || 0), 0);
  const totalStyleSize = styles.reduce((sum, style) => sum + (style.transferSize || 0), 0);

  console.log('📦 Bundle Analysis:', {
    scripts: {
      count: scripts.length,
      size: `${Math.round(totalScriptSize / 1024)} KB`,
    },
    styles: {
      count: styles.length,
      size: `${Math.round(totalStyleSize / 1024)} KB`,
    },
    total: `${Math.round((totalScriptSize + totalStyleSize) / 1024)} KB`,
  });
};

/**
 * React component performance wrapper
 */
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
) => {
  const WrappedComponent = (props: P) => {
    const monitor = PerformanceMonitor.getInstance();
    const componentName = displayName || Component.displayName || Component.name || 'Anonymous';

    React.useEffect(() => {
      monitor.start(`${componentName} mount`);
      return () => {
        monitor.end(`${componentName} unmount`);
      };
    }, [monitor, componentName]);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${displayName || Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Hook for measuring render performance
 */
export const useRenderPerformance = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current += 1;
    const label = `${componentName} render #${renderCount.current}`;
    monitor.start(label);
    
    // End measurement on next tick
    setTimeout(() => monitor.end(label), 0);
  });

  return {
    renderCount: renderCount.current,
    measureOperation: (label: string, operation: () => void) => {
      monitor.measureSync(`${componentName} - ${label}`, operation);
    },
  };
};

/**
 * Debounce utility for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): T => {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(null, args);
    };

    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(null, args);
  }) as T;
};

/**
 * Throttle utility for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

/**
 * Lazy loading utility
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={fallback ? React.createElement(fallback) : <div>Loading...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

/**
 * Memoization utility with performance monitoring
 */
export const createMemoizedSelector = <TInput, TOutput>(
  selector: (input: TInput) => TOutput,
  equalityFn?: (a: TInput, b: TInput) => boolean
) => {
  let lastInput: TInput;
  let lastOutput: TOutput;
  let hitCount = 0;
  let missCount = 0;

  const memoizedSelector = (input: TInput): TOutput => {
    const isEqual = equalityFn ? equalityFn(lastInput, input) : lastInput === input;
    
    if (lastInput !== undefined && isEqual) {
      hitCount++;
      return lastOutput;
    }

    missCount++;
    lastInput = input;
    lastOutput = selector(input);
    
    if (process.env.NODE_ENV === 'development') {
      const total = hitCount + missCount;
      if (total % 100 === 0) {
        console.log(`📊 Selector cache stats: ${hitCount}/${total} hits (${Math.round(hitCount / total * 100)}%)`);
      }
    }
    
    return lastOutput;
  };

  memoizedSelector.clearCache = () => {
    lastInput = undefined as any;
    lastOutput = undefined as any;
    hitCount = 0;
    missCount = 0;
  };

  return memoizedSelector;
};

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
