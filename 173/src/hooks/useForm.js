import { useState, useCallback } from 'react'

export const useForm = (initialValues = {}, rules = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const validate = useCallback((fieldName, value) => {
    const fieldRules = rules[fieldName]
    if (!fieldRules) return true

    for (const rule of fieldRules) {
      if (rule.required && !value) {
        return rule.message || `${fieldName}不能为空`
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || `${fieldName}格式不正确`
      }
      if (rule.min && value.length < rule.min) {
        return rule.message || `${fieldName}长度不能少于${rule.min}位`
      }
      if (rule.max && value.length > rule.max) {
        return rule.message || `${fieldName}长度不能超过${rule.max}位`
      }
    }
    return null
  }, [rules])

  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
    const error = validate(fieldName, value)
    setErrors(prev => ({ ...prev, [fieldName]: error }))
  }, [validate])

  const validateAll = useCallback(() => {
    const newErrors = {}
    let isValid = true
    for (const fieldName in rules) {
      const error = validate(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    }
    setErrors(newErrors)
    return isValid
  }, [values, rules, validate])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  return {
    values,
    errors,
    handleChange,
    validateAll,
    resetForm,
    setValues
  }
}
