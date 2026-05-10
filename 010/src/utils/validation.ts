import type { FormValidationResult } from '../types'

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message?: string
}

export interface ValidationSchema {
  [field: string]: ValidationRule
}

function validateField(value: unknown, rules: ValidationRule, fieldName: string): string | null {
  if (rules.required) {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return `${fieldName}不能为空`
    }
  }

  if (value === undefined || value === null || value === '') {
    return null
  }

  const numValue = typeof value === 'string' ? Number(value) : value

  if (typeof numValue === 'number' && !isNaN(numValue)) {
    if (rules.min !== undefined && numValue < rules.min) {
      return rules.message || `${fieldName}不能小于${rules.min}`
    }
    if (rules.max !== undefined && numValue > rules.max) {
      return rules.message || `${fieldName}不能大于${rules.max}`
    }
  }

  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return rules.message || `${fieldName}长度不能少于${rules.minLength}个字符`
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return rules.message || `${fieldName}长度不能超过${rules.maxLength}个字符`
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || `${fieldName}格式不正确`
    }
  }

  return null
}

export function validateForm<T extends Record<string, unknown>>(
  data: T,
  schema: ValidationSchema,
  fieldLabels: Record<keyof T, string>
): FormValidationResult {
  const errors: Record<string, string> = {}

  for (const field of Object.keys(schema)) {
    const rules = schema[field]
    const label = fieldLabels[field as keyof T] || field
    const error = validateField(data[field], rules, label)
    if (error) {
      errors[field] = error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
