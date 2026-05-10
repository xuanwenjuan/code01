import type { ValidationRule, FormValidationResult } from '@/types'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function now(): string {
  return formatDate()
}

export function validateForm(data: Record<string, unknown>, rules: ValidationRule[]): FormValidationResult {
  const errors: Record<string, string> = {}

  for (const rule of rules) {
    const value = data[rule.field]
    const fieldValue = value as string | number | undefined
    const hasError = (message: string) => {
      if (!errors[rule.field]) {
        errors[rule.field] = message
      }
    }

    if (rule.required && (fieldValue === undefined || fieldValue === null || fieldValue === '' ||
        (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
      hasError(rule.message)
      continue
    }

    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      if (rule.minLength && typeof fieldValue === 'string' && fieldValue.trim().length < rule.minLength) {
        hasError(rule.message)
        continue
      }

      if (rule.maxLength && typeof fieldValue === 'string' && fieldValue.trim().length > rule.maxLength) {
        hasError(rule.message)
        continue
      }

      if (rule.min !== undefined && typeof fieldValue === 'number' && fieldValue < rule.min) {
        hasError(rule.message)
        continue
      }

      if (rule.max !== undefined && typeof fieldValue === 'number' && fieldValue > rule.max) {
        hasError(rule.message)
        continue
      }

      if (rule.pattern && typeof fieldValue === 'string' && !rule.pattern.test(fieldValue)) {
        hasError(rule.message)
        continue
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}
