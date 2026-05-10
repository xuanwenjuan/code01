import { FormError, ValidationRule } from '../types';

export function validateFields(rules: ValidationRule[]): FormError[] {
  const errors: FormError[] = [];

  for (const rule of rules) {
    const { field, value, rules: fieldRules } = rule;

    if (fieldRules.required) {
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors.push({ field, message: `${field}不能为空` });
        continue;
      }
    }

    if (value !== undefined && value !== null && value !== '') {
      if (fieldRules.minLength && typeof value === 'string' && value.length < fieldRules.minLength) {
        errors.push({ field, message: `${field}长度不能少于${fieldRules.minLength}个字符` });
      }

      if (fieldRules.maxLength && typeof value === 'string' && value.length > fieldRules.maxLength) {
        errors.push({ field, message: `${field}长度不能超过${fieldRules.maxLength}个字符` });
      }

      if (fieldRules.min !== undefined && typeof value === 'number' && value < fieldRules.min) {
        errors.push({ field, message: `${field}不能小于${fieldRules.min}` });
      }

      if (fieldRules.max !== undefined && typeof value === 'number' && value > fieldRules.max) {
        errors.push({ field, message: `${field}不能大于${fieldRules.max}` });
      }

      if (fieldRules.pattern && typeof value === 'string' && !fieldRules.pattern.test(value)) {
        errors.push({ field, message: `${field}格式不正确` });
      }

      if (fieldRules.custom) {
        const customError = fieldRules.custom(value);
        if (customError) {
          errors.push({ field, message: customError });
        }
      }
    }
  }

  return errors;
}

export function getFieldError(errors: FormError[], field: string): string | null {
  const error = errors.find((e) => e.field === field);
  return error ? error.message : null;
}

export const validators = {
  required: (field: string, value: unknown): string | null => {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return `${field}不能为空`;
    }
    return null;
  },

  positiveNumber: (field: string, value: number): string | null => {
    if (value <= 0) {
      return `${field}必须大于0`;
    }
    return null;
  },

  nonNegativeNumber: (field: string, value: number): string | null => {
    if (value < 0) {
      return `${field}不能小于0`;
    }
    return null;
  },

  year: (value: number): string | null => {
    const currentYear = new Date().getFullYear();
    if (value < 1990 || value > currentYear + 1) {
      return `请输入有效的年份（1990-${currentYear + 1}）`;
    }
    return null;
  },

  maxLength: (field: string, value: string, max: number): string | null => {
    if (value.length > max) {
      return `${field}不能超过${max}个字符`;
    }
    return null;
  }
};
