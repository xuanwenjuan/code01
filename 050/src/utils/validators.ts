export const validatePhone = (phone: string): boolean => {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

export const validateCreditCode = (code: string): boolean => {
  const reg = /^[0-9A-Z]{18}$/
  return reg.test(code)
}

export const validateEmail = (email: string): boolean => {
  const reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/
  return reg.test(email)
}

export const validatePositiveNumber = (num: number): boolean => {
  return !isNaN(num) && num > 0
}

export const validateRequired = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return true
  return false
}

export const formatCurrency = (value: number, symbol: string = '¥'): string => {
  return `${symbol} ${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
}
