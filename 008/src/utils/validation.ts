import type { ValidationRule } from '@/types'

export function validateField(value: unknown, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (rule.required) {
      if (
        value === '' ||
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return rule.message || '此字段为必填项'
      }
    }

    if (value === null || value === undefined || value === '') continue

    if (typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        return rule.message || `长度不能少于${rule.minLength}个字符`
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return rule.message || `长度不能超过${rule.maxLength}个字符`
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || '格式不正确'
      }
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        return rule.message || '请输入有效数字'
      }
      if (rule.min !== undefined && value < rule.min) {
        return rule.message || `不能小于${rule.min}`
      }
      if (rule.max !== undefined && value > rule.max) {
        return rule.message || `不能大于${rule.max}`
      }
    }

    if (rule.validator) {
      const result = rule.validator(value)
      if (result !== null) {
        return result
      }
    }
  }
  return null
}

export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface FieldToValidate {
  name: string
  value: unknown
  rules: ValidationRule[]
}

export function validateForm(fields: FieldToValidate[]): FormValidationResult {
  const errors: Record<string, string> = {}
  fields.forEach(field => {
    const error = validateField(field.value, field.rules)
    if (error) {
      errors[field.name] = error
    }
  })
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function isEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function isPhone(phone: string): boolean {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone)
}

export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && Number.isFinite(value)
}

export function isNonNegativeNumber(value: number): boolean {
  return typeof value === 'number' && value >= 0 && Number.isFinite(value)
}

export function isInteger(value: number): boolean {
  return Number.isInteger(value)
}

export function isPositiveInteger(value: number): boolean {
  return isInteger(value) && value > 0
}

export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

export function isFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

export function isPastDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export const commonRules = {
  required: (message = '此字段为必填项'): ValidationRule => ({
    required: true,
    message
  }),
  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `长度不能少于${min}个字符`
  }),
  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `长度不能超过${max}个字符`
  }),
  min: (min: number, message?: string): ValidationRule => ({
    min,
    message: message || `不能小于${min}`
  }),
  max: (max: number, message?: string): ValidationRule => ({
    max,
    message: message || `不能大于${max}`
  }),
  pattern: (pattern: RegExp, message = '格式不正确'): ValidationRule => ({
    pattern,
    message
  }),
  positiveNumber: (message = '请输入正数'): ValidationRule => ({
    validator: (val) => {
      if (typeof val !== 'number' || !isPositiveNumber(val)) {
        return message
      }
      return null
    }
  }),
  nonNegativeNumber: (message = '请输入非负数'): ValidationRule => ({
    validator: (val) => {
      if (typeof val !== 'number' || !isNonNegativeNumber(val)) {
        return message
      }
      return null
    }
  }),
  positiveInteger: (message = '请输入正整数'): ValidationRule => ({
    validator: (val) => {
      if (typeof val !== 'number' || !isPositiveInteger(val)) {
        return message
      }
      return null
    }
  }),
  name: (): ValidationRule[] => [
    { required: true, message: '名称不能为空' },
    { minLength: 2, message: '名称至少2个字符' },
    { maxLength: 50, message: '名称不能超过50个字符' }
  ],
  origin: (): ValidationRule[] => [
    { required: true, message: '产地不能为空' },
    { minLength: 2, message: '产地至少2个字符' },
    { maxLength: 50, message: '产地不能超过50个字符' }
  ],
  operator: (): ValidationRule[] => [
    { required: true, message: '经办人不能为空' },
    { minLength: 2, message: '经办人姓名至少2个字符' },
    { maxLength: 20, message: '经办人姓名不能超过20个字符' }
  ],
  quantity: (min: number = 1, max?: number): ValidationRule[] => {
    const rules: ValidationRule[] = [
      { required: true, message: '数量不能为空' },
      { min, message: `数量不能小于${min}` }
    ]
    if (max !== undefined) {
      rules.push({ max, message: `数量不能超过${max}` })
    }
    return rules
  },
  year: (): ValidationRule[] => [
    { required: true, message: '年份不能为空' },
    { min: 2000, message: '年份不能早于2000年' },
    { max: 2100, message: '年份不能晚于2100年' }
  ],
  shelfLife: (): ValidationRule[] => [
    { required: true, message: '保质期不能为空' },
    { min: 1, message: '保质期至少1天' },
    { max: 3650, message: '保质期不能超过10年（3650天）' }
  ]
}
