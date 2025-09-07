// Translation utilities for standardized list items
// This file provides functions to convert between integer values and display strings

export const MONTHS = {
  1: 'January',
  2: 'February', 
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December'
} as const;

export const THERAPY_TYPES = {
  1: 'Speech Therapy',
  2: 'Occupational Therapy',
  3: 'Physical Therapy',
  4: 'Behavioral Therapy',
  5: 'Music Therapy',
  6: 'Art Therapy'
} as const;

export const CERTIFICATION_STATUSES = {
  1: 'Draft',
  2: 'Submitted',
  3: 'Approved',
  4: 'Rejected'
} as const;

export const SIGNATURE_STATUSES = {
  0: 'Not Required',
  1: 'Pending',
  2: 'Completed',
  3: 'Approved'
} as const;

// Helper functions to convert between integers and display strings
export const getMonthName = (monthNumber: number): string => {
  return MONTHS[monthNumber as keyof typeof MONTHS] || 'Unknown';
};

export const getMonthNumber = (monthName: string): number => {
  const entry = Object.entries(MONTHS).find(([_, name]) => 
    name.toLowerCase() === monthName.toLowerCase()
  );
  return entry ? parseInt(entry[0]) : 1;
};

export const getTherapyTypeName = (typeNumber: number): string => {
  return THERAPY_TYPES[typeNumber as keyof typeof THERAPY_TYPES] || 'Unknown';
};

export const getTherapyTypeNumber = (typeName: string): number => {
  const entry = Object.entries(THERAPY_TYPES).find(([_, name]) => 
    name.toLowerCase() === typeName.toLowerCase()
  );
  return entry ? parseInt(entry[0]) : 1;
};

export const getCertificationStatusName = (statusNumber: number): string => {
  return CERTIFICATION_STATUSES[statusNumber as keyof typeof CERTIFICATION_STATUSES] || 'Unknown';
};

export const getCertificationStatusNumber = (statusName: string): number => {
  const entry = Object.entries(CERTIFICATION_STATUSES).find(([_, name]) => 
    name.toLowerCase() === statusName.toLowerCase()
  );
  return entry ? parseInt(entry[0]) : 1;
};

export const getSignatureStatusName = (statusNumber: number): string => {
  return SIGNATURE_STATUSES[statusNumber as keyof typeof SIGNATURE_STATUSES] || 'Unknown';
};

export const getSignatureStatusNumber = (statusName: string): number => {
  const entry = Object.entries(SIGNATURE_STATUSES).find(([_, name]) => 
    name.toLowerCase() === statusName.toLowerCase()
  );
  return entry ? parseInt(entry[0]) : 1;
};

// Get all options for dropdowns
export const getMonthOptions = () => 
  Object.entries(MONTHS).map(([value, label]) => ({ value: parseInt(value), label }));

export const getTherapyTypeOptions = () => 
  Object.entries(THERAPY_TYPES).map(([value, label]) => ({ value: parseInt(value), label }));

export const getCertificationStatusOptions = () => 
  Object.entries(CERTIFICATION_STATUSES).map(([value, label]) => ({ value: parseInt(value), label }));

export const getSignatureStatusOptions = () => 
  Object.entries(SIGNATURE_STATUSES).map(([value, label]) => ({ value: parseInt(value), label }));
