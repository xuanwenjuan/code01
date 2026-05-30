import { useState } from 'react'

export const validationRules = {
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号码'
  },
  password: {
    pattern: /^[a-zA-Z0-9_]{6,20}$/,
    message: '密码必须是6-20位字母、数字或下划线'
  },
  username: {
    pattern: /^[a-zA-Z0-9_]{4,20}$/,
    message: '用户名必须是4-20位字母、数字或下划线'
  },
  name: {
    pattern: /^[\u4e00-\u9fa5a-zA-Z]{2,20}$/,
    message: '姓名必须是2-20位中文或英文字符'
  },
  address: {
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_]{5,100}$/,
    message: '请输入详细地址（5-100个字符）'
  },
  required: (message = '此项为必填项') => ({
    validator: (_, value) => {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        return Promise.reject(new Error(message))
      }
      return Promise.resolve()
    }
  }),
  pattern: (regex, message) => ({
    validator: (_, value) => {
      if (!value || regex.test(value)) {
        return Promise.resolve()
      }
      return Promise.reject(new Error(message))
    }
  })
}

export function useFormValidation(initialValues = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, values[name])
  }

  const validateField = (name, value) => {
    const rules = validationRules[name]
    if (rules) {
      if (rules.pattern && !rules.pattern.test(value)) {
        setErrors((prev) => ({ ...prev, [name]: rules.message }))
        return false
      }
    }
    setErrors((prev) => ({ ...prev, [name]: '' }))
    return true
  }

  const validateAll = () => {
    const newErrors = {}
    let isValid = true
    Object.keys(values).forEach((key) => {
      const rules = validationRules[key]
      if (rules) {
        if (rules.pattern && !rules.pattern.test(values[key])) {
          newErrors[key] = rules.message
          isValid = false
        }
      }
    })
    setErrors(newErrors)
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    return isValid
  }

  const resetForm = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    resetForm,
    setValues
  }
}
