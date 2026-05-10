import type { FormError, CategoryFormData, ProductFormData, StockOperationFormData } from '../types'

export interface ValidationRule<T = unknown> {
  required?: boolean
  requiredMessage?: string
  min?: number
  max?: number
  minMessage?: string
  maxMessage?: string
  pattern?: RegExp
  patternMessage?: string
  custom?: (value: T) => string | null
}

export interface ValidationRules {
  [key: string]: ValidationRule<unknown>
}

export function validate<T>(value: T, rule: ValidationRule<T>): string | null {
  if (rule.required && (value === undefined || value === null || value === '')) {
    return rule.requiredMessage || '该项为必填项'
  }
  
  if (value !== undefined && value !== null && value !== '') {
    if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
      return rule.minMessage || `不能小于${rule.min}`
    }
    
    if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
      return rule.maxMessage || `不能大于${rule.max}`
    }
    
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.patternMessage || '格式不正确'
    }
    
    if (rule.custom) {
      const result = rule.custom(value)
      if (result) return result
    }
  }
  
  return null
}

export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: ValidationRules
): FormError {
  const errors: FormError = {}
  
  Object.keys(rules).forEach(key => {
    const error = validate(data[key], rules[key] as ValidationRule<unknown>)
    if (error) {
      errors[key] = error
    }
  })
  
  return errors
}

export const categoryValidationRules: ValidationRules = {
  name: {
    required: true,
    requiredMessage: '请输入分类名称',
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{1,20}$/,
    patternMessage: '分类名称只能包含中文、英文、数字，长度1-20位'
  } as ValidationRule<string>,
  description: {
    custom: (value: string) => {
      if (value && value.length > 200) {
        return '描述不能超过200个字符'
      }
      return null
    }
  } as ValidationRule<string>
}

export const productValidationRules: ValidationRules = {
  name: {
    required: true,
    requiredMessage: '请输入用品名称',
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s]{1,50}$/,
    patternMessage: '用品名称只能包含中文、英文、数字、空格，长度1-50位'
  } as ValidationRule<string>,
  brand: {
    required: true,
    requiredMessage: '请输入品牌名称',
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s]{1,30}$/,
    patternMessage: '品牌名称只能包含中文、英文、数字、空格，长度1-30位'
  } as ValidationRule<string>,
  categoryId: {
    required: true,
    requiredMessage: '请选择分类'
  } as ValidationRule<string>,
  stockYear: {
    required: true,
    requiredMessage: '请输入入库年份',
    min: 2000,
    max: 2100,
    minMessage: '入库年份不能早于2000年',
    maxMessage: '入库年份不能晚于2100年'
  } as ValidationRule<number>,
  stockQuantity: {
    required: true,
    requiredMessage: '请输入库存数量',
    min: 0,
    max: 999999,
    minMessage: '库存数量不能小于0',
    maxMessage: '库存数量不能超过999999'
  } as ValidationRule<number>,
  applicableMonths: {
    required: true,
    requiredMessage: '请输入适用月龄',
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\-\s]{1,30}$/,
    patternMessage: '适用月龄格式不正确，例如：0-6个月'
  } as ValidationRule<string>,
  securityLevel: {
    required: true,
    requiredMessage: '请选择安全等级'
  } as ValidationRule<string>,
  shelfLifeDays: {
    required: true,
    requiredMessage: '请输入保质期天数',
    min: 1,
    max: 36500,
    minMessage: '保质期不能小于1天',
    maxMessage: '保质期不能超过100年'
  } as ValidationRule<number>,
  productionDate: {
    required: true,
    requiredMessage: '请选择生产日期'
  } as ValidationRule<string>
}

export const stockOperationValidationRules: ValidationRules = {
  quantity: {
    required: true,
    requiredMessage: '请输入操作数量',
    min: 1,
    max: 999999,
    minMessage: '操作数量不能小于1',
    maxMessage: '操作数量不能超过999999'
  } as ValidationRule<number>,
  remark: {
    custom: (value: string) => {
      if (value && value.length > 200) {
        return '备注不能超过200个字符'
      }
      return null
    }
  } as ValidationRule<string>
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date > today
}

export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

export function parseIntSafe(value: string | number | null | undefined, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue
  }
  const parsed = typeof value === 'number' ? value : parseInt(value, 10)
  return isValidNumber(parsed) ? parsed : defaultValue
}

export function parseFloatSafe(value: string | number | null | undefined, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue
  }
  const parsed = typeof value === 'number' ? value : parseFloat(value)
  return isValidNumber(parsed) ? parsed : defaultValue
}
