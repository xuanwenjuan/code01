export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidIdCard(idCard: string): boolean {
  const reg = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  return reg.test(idCard)
}

export function isValidMoney(amount: number): boolean {
  return Number.isFinite(amount) && amount >= 0
}

export function isValidPositiveInteger(num: number): boolean {
  return Number.isInteger(num) && num > 0
}

export function isValidName(name: string): boolean {
  const reg = /^[\u4e00-\u9fa5a-zA-Z·]{2,20}$/
  return reg.test(name)
}

export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export function validatePhone(rule: unknown, value: string, callback: (error?: Error) => void): void {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!isValidPhone(value)) {
    callback(new Error('手机号格式不正确'))
  } else {
    callback()
  }
}

export function validateName(rule: unknown, value: string, callback: (error?: Error) => void): void {
  if (!value) {
    callback(new Error('请输入姓名'))
  } else if (!isValidName(value)) {
    callback(new Error('姓名格式不正确，应为2-20位中英文'))
  } else {
    callback()
  }
}

export function validateMoney(rule: unknown, value: number, callback: (error?: Error) => void): void {
  if (value === undefined || value === null) {
    callback(new Error('请输入金额'))
  } else if (!isValidMoney(value)) {
    callback(new Error('金额必须为非负数'))
  } else {
    callback()
  }
}
