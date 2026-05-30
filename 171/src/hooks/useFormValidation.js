import { useState, useCallback } from 'react'

export const phoneRegex = /^1[3-9]\d{9}$/
export const passwordRegex = /^.{6,20}$/
export const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/

export function useFormValidation(initialValues = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateField = useCallback((name, value, rules) => {
    if (!rules) return null

    if (rules.required && !value) {
      return rules.message || '此字段为必填项'
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.message || '格式不正确'
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return rules.message || `最少需要${rules.minLength}个字符`
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return rules.message || `最多允许${rules.maxLength}个字符`
    }

    if (rules.validator && typeof rules.validator === 'function') {
      return rules.validator(value, values)
    }

    return null
  }, [values])

  const handleChange = useCallback((name, value, rules) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    
    if (touched[name] && rules) {
      const error = validateField(name, value, rules)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }, [touched, validateField])

  const handleBlur = useCallback((name, rules) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    
    if (rules) {
      const error = validateField(name, values[name], rules)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }, [values, validateField])

  const validateAll = useCallback((validationRules) => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name], validationRules[name])
      if (error) {
        newErrors[name] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {}))

    return isValid
  }, [values, validateField])

  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setValues,
  }
}
