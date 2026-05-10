export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  message?: string
}

export interface ValidationErrors {
  [key: string]: string
}

export type FormValue = string | number | boolean | undefined | null

export const validateField = (value: FormValue, rules: ValidationRule[]): string => {
  for (const rule of rules) {
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message || '此字段为必填项'
    }

    if (rule.minLength !== undefined && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `最少需要 ${rule.minLength} 个字符`
    }

    if (rule.maxLength !== undefined && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `最多允许 ${rule.maxLength} 个字符`
    }

    if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
      return rule.message || `最小值为 ${rule.min}`
    }

    if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
      return rule.message || `最大值为 ${rule.max}`
    }

    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || '格式不正确'
    }
  }
  return ''
}

export interface ValidationFormData {
  [key: string]: FormValue
}

export const validateForm = (
  formData: ValidationFormData,
  validationRules: Record<string, ValidationRule[]>
): ValidationErrors => {
  const errors: ValidationErrors = {}

  for (const field in validationRules) {
    const error = validateField(formData[field], validationRules[field])
    if (error) {
      errors[field] = error
    }
  }

  return errors
}

export const clearErrors = (errors: ValidationErrors): void => {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
}

export const isFormValid = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length === 0
}