import { ValidationRule } from '../types';

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export interface ValidationErrors<T> {
  [K in keyof T]?: string;
}

export const validateField = <T>(
  value: T,
  rules?: ValidationRule<T>
): string | null => {
  if (!rules) return null;

  const isEmpty = value === undefined || value === null || value === '' || 
    (Array.isArray(value) && value.length === 0);

  if (rules.required && isEmpty) {
    return rules.requiredMessage || '此字段为必填项';
  }

  if (isEmpty) return null;

  if (rules.min !== undefined) {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    if (!isNaN(numValue) && numValue < rules.min) {
      return rules.minMessage || `不能小于 ${rules.min}`;
    }
  }

  if (rules.max !== undefined) {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    if (!isNaN(numValue) && numValue > rules.max) {
      return rules.maxMessage || `不能大于 ${rules.max}`;
    }
  }

  if (rules.pattern && typeof value === 'string') {
    if (!rules.pattern.test(value)) {
      return rules.patternMessage || '格式不正确';
    }
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = <T extends object>(
  values: T,
  rules: ValidationRules<T>
): ValidationErrors<T> => {
  const errors: ValidationErrors<T> = {};

  (Object.keys(rules) as Array<keyof T>).forEach((field) => {
    const error = validateField(values[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

export const hasErrors = <T>(errors: ValidationErrors<T>): boolean => {
  return Object.keys(errors).length > 0;
};

export const parseInteger = (value: string): number | null => {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? null : num;
};

export const parseDecimal = (value: string, decimals: number = 2): number | null => {
  const trimmed = value.trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  const num = parseFloat(trimmed);
  if (isNaN(num)) return null;
  return Number(num.toFixed(decimals));
};

export const safeIntegerAdd = (a: number, b: number): number => {
  return Math.floor(a) + Math.floor(b);
};

export const safeIntegerSubtract = (a: number, b: number): number => {
  return Math.floor(a) - Math.floor(b);
};
