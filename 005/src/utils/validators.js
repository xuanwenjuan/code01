export const validators = {
  required: (value, message = '此项为必填') => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      return message
    }
    return null
  },

  minLength: (value, min, message) => {
    if (value && value.length < min) {
      return message || `最少需要${min}个字符`
    }
    return null
  },

  maxLength: (value, max, message) => {
    if (value && value.length > max) {
      return message || `最多允许${max}个字符`
    }
    return null
  },

  min: (value, min, message) => {
    if (value !== '' && value !== null && value !== undefined) {
      const num = Number(value)
      if (num < min) {
        return message || `最小值为${min}`
      }
    }
    return null
  },

  max: (value, max, message) => {
    if (value !== '' && value !== null && value !== undefined) {
      const num = Number(value)
      if (num > max) {
        return message || `最大值为${max}`
      }
    }
    return null
  },

  number: (value, message = '请输入有效的数字') => {
    if (value === '' || value === null || value === undefined) return null
    if (isNaN(Number(value))) {
      return message
    }
    return null
  },

  integer: (value, message = '请输入整数') => {
    if (value === '' || value === null || value === undefined) return null
    const num = Number(value)
    if (isNaN(num) || !Number.isInteger(num)) {
      return message
    }
    return null
  },

  pattern: (value, regex, message = '格式不正确') => {
    if (value && !regex.test(value)) {
      return message
    }
    return null
  }
}

export const validateForm = (formData, rules) => {
  const errors = {}
  let isValid = true

  for (const field in rules) {
    const fieldRules = rules[field]
    const value = formData[field]

    for (const rule of fieldRules) {
      const error = rule.validate(value, formData)
      if (error) {
        errors[field] = error
        isValid = false
        break
      }
    }
  }

  return { isValid, errors }
}

export const createRule = (type, ...params) => {
  switch (type) {
    case 'required':
      return { validate: (v) => validators.required(v, params[0]) }
    case 'minLength':
      return { validate: (v) => validators.minLength(v, params[0], params[1]) }
    case 'maxLength':
      return { validate: (v) => validators.maxLength(v, params[0], params[1]) }
    case 'min':
      return { validate: (v) => validators.min(v, params[0], params[1]) }
    case 'max':
      return { validate: (v) => validators.max(v, params[0], params[1]) }
    case 'number':
      return { validate: (v) => validators.number(v, params[0]) }
    case 'integer':
      return { validate: (v) => validators.integer(v, params[0]) }
    case 'pattern':
      return { validate: (v) => validators.pattern(v, params[0], params[1]) }
    default:
      return { validate: () => null }
  }
}