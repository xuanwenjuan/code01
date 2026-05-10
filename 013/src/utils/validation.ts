import type { FormValidationRule, FormErrors } from '@/types'

export function validateField(value: unknown, rules: FormValidationRule[]): string {
  for (const rule of rules) {
    if (rule.required) {
      if (value === undefined || value === null || value === '') {
        return rule.message
      }
    }
    
    if (rule.min !== undefined) {
      if (typeof value === 'string' && value.length < rule.min) {
        return rule.message
      }
      if (typeof value === 'number' && value < rule.min) {
        return rule.message
      }
    }
    
    if (rule.max !== undefined) {
      if (typeof value === 'string' && value.length > rule.max) {
        return rule.message
      }
      if (typeof value === 'number' && value > rule.max) {
        return rule.message
      }
    }
    
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        return rule.message
      }
    }
    
    if (rule.validator) {
      const result = rule.validator(value)
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message
      }
    }
  }
  return ''
}

export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, FormValidationRule[]>
): FormErrors {
  const errors: FormErrors = {}
  
  for (const key in rules) {
    const fieldRules = rules[key]
    const value = data[key]
    const error = validateField(value, fieldRules)
    if (error) {
      errors[key] = error
    }
  }
  
  return errors
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0
}

export const commonRules = {
  required: (message: string = '此项为必填项'): FormValidationRule => ({
    required: true,
    message
  }),
  minLength: (min: number, message?: string): FormValidationRule => ({
    min,
    message: message || `最少需要 ${min} 个字符`
  }),
  maxLength: (max: number, message?: string): FormValidationRule => ({
    max,
    message: message || `最多允许 ${max} 个字符`
  }),
  minValue: (min: number, message?: string): FormValidationRule => ({
    min,
    message: message || `数值不能小于 ${min}`
  }),
  maxValue: (max: number, message?: string): FormValidationRule => ({
    max,
    message: message || `数值不能大于 ${max}`
  }),
  pattern: (pattern: RegExp, message: string): FormValidationRule => ({
    pattern,
    message
  })
}
