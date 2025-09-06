import { useState, useEffect } from 'react';

export interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  breakpoint: keyof BreakpointConfig | 'xs';
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useResponsive = (customBreakpoints?: Partial<BreakpointConfig>) => {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
        screenWidth: 1024,
        screenHeight: 768,
        breakpoint: 'lg',
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width < breakpoints.md,
      isTablet: width >= breakpoints.md && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
      isLargeDesktop: width >= breakpoints.xl,
      screenWidth: width,
      screenHeight: height,
      breakpoint: getBreakpoint(width, breakpoints),
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setResponsiveState({
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        isLargeDesktop: width >= breakpoints.xl,
        screenWidth: width,
        screenHeight: height,
        breakpoint: getBreakpoint(width, breakpoints),
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoints]);

  return responsiveState;
};

function getBreakpoint(width: number, breakpoints: BreakpointConfig): keyof BreakpointConfig | 'xs' {
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  if (width < breakpoints['2xl']) return 'xl';
  return '2xl';
}

// Utility functions for responsive design
export const useResponsiveUtils = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return {
    // Container classes
    getContainerClass: () => {
      if (isMobile) return 'px-4 py-2';
      if (isTablet) return 'px-6 py-4';
      return 'px-8 py-6';
    },
    
    // Grid classes
    getGridClass: (cols: { mobile: number; tablet: number; desktop: number }) => {
      return `grid grid-cols-${cols.mobile} md:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop} gap-4`;
    },
    
    // Text sizes
    getTextSize: (size: 'sm' | 'base' | 'lg' | 'xl') => {
      if (isMobile) {
        switch (size) {
          case 'sm': return 'text-xs';
          case 'base': return 'text-sm';
          case 'lg': return 'text-base';
          case 'xl': return 'text-lg';
        }
      }
      return `text-${size}`;
    },
    
    // Button sizes
    getButtonSize: () => {
      if (isMobile) return 'px-3 py-2 text-sm';
      return 'px-4 py-2 text-base';
    },
    
    // Modal sizes
    getModalSize: () => {
      if (isMobile) return 'w-full h-full max-w-none max-h-none rounded-none';
      if (isTablet) return 'w-11/12 max-w-2xl max-h-[90vh] rounded-lg';
      return 'w-3/4 max-w-4xl max-h-[90vh] rounded-lg';
    },
  };
};
