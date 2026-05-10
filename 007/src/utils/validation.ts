export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: string | number) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateField(
  value: string | number | undefined | null,
  fieldName: string,
  rules: ValidationRule
): string | null {
  const stringValue = value === undefined || value === null ? '' : String(value).trim();
  
  if (rules.required && stringValue === '') {
    return `${fieldName}不能为空`;
  }
  
  if (stringValue === '' && !rules.required) {
    return null;
  }
  
  if (rules.minLength !== undefined && stringValue.length < rules.minLength) {
    return `${fieldName}长度不能少于${rules.minLength}个字符`;
  }
  
  if (rules.maxLength !== undefined && stringValue.length > rules.maxLength) {
    return `${fieldName}长度不能超过${rules.maxLength}个字符`;
  }
  
  const numValue = typeof value === 'number' ? value : parseFloat(stringValue);
  if (rules.min !== undefined && !isNaN(numValue) && numValue < rules.min) {
    return `${fieldName}不能小于${rules.min}`;
  }
  
  if (rules.max !== undefined && !isNaN(numValue) && numValue > rules.max) {
    return `${fieldName}不能大于${rules.max}`;
  }
  
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return `${fieldName}格式不正确`;
  }
  
  if (rules.custom) {
    return rules.custom(stringValue);
  }
  
  return null;
}

export function validateForm<T extends Record<string, string | number | undefined | null>>(
  data: T,
  rules: Record<keyof T, ValidationRule & { label: string }>
): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field as keyof T], fieldRules.label, fieldRules);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }
  
  return { isValid, errors };
}

export const validationPresets = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 20,
    label: '姓名',
  },
  employeeNo: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[A-Za-z0-9]+$/,
    label: '工号',
  },
  positiveNumber: {
    required: true,
    min: 0,
    max: 50,
    custom: (value) => {
      const num = parseFloat(String(value));
      if (isNaN(num)) return '请输入有效数字';
      return null;
    },
    label: '年限',
  },
};
