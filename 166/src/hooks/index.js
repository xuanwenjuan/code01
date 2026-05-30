import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export const usePagination = (data = [], pageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / pageSize)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, currentPage, pageSize])

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)))
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [data.length])

  return {
    currentPage,
    totalPages,
    totalItems: data.length,
    pageSize,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  }
}

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

export const useCountdown = (endTime) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = endTime - Date.now()
    return diff > 0 ? diff : 0
  })

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      const diff = endTime - Date.now()
      if (diff <= 0) {
        setTimeLeft(0)
        clearInterval(timer)
      } else {
        setTimeLeft(diff)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, timeLeft])

  const formatTime = useCallback(() => {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      isExpired: timeLeft <= 0
    }
  }, [timeLeft])

  return {
    timeLeft,
    ...formatTime()
  }
}

export const useLazyLoad = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, ...options }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [options])

  return [ref, isVisible]
}

export const useFormValidation = (initialValues, validators) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback((name, value) => {
    if (validators[name]) {
      return validators[name](value, values)
    }
    return null
  }, [validators, values])

  const validateAll = useCallback(() => {
    const newErrors = {}
    Object.keys(validators).forEach(name => {
      const error = validateField(name, values[name])
      if (error) {
        newErrors[name] = error
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [validators, values, validateField])

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [touched, validateField])

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, values[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [values, validateField])

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true)
    const allTouched = Object.keys(validators).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {})
    setTouched(allTouched)

    const isValid = validateAll()
    if (isValid && onSubmit) {
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setIsSubmitting(false)
    }
    return isValid
  }, [validators, validateAll, values])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    isValid: Object.keys(errors).length === 0
  }
}

export const useToggle = (initialValue = false) => {
  const [state, setState] = useState(initialValue)
  const toggle = useCallback(() => setState(prev => !prev), [])
  const setTrue = useCallback(() => setState(true), [])
  const setFalse = useCallback(() => setState(false), [])
  return [state, { toggle, setTrue, setFalse }]
}

export const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

export const validators = {
  required: (message = '该项为必填项') => (value) => {
    if (value === undefined || value === null || value === '') {
      return message
    }
    if (Array.isArray(value) && value.length === 0) {
      return message
    }
    return null
  },
  phone: (message = '请输入正确的手机号') => (value) => {
    if (!value) return null
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(value) ? null : message
  },
  email: (message = '请输入正确的邮箱') => (value) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : message
  },
  minLength: (min, message = `最少输入${min}个字符`) => (value) => {
    if (!value) return null
    return value.length >= min ? null : message
  },
  maxLength: (max, message = `最多输入${max}个字符`) => (value) => {
    if (!value) return null
    return value.length <= max ? null : message
  },
  password: (message = '密码至少6位，包含字母和数字') => (value) => {
    if (!value) return null
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
    return passwordRegex.test(value) ? null : message
  },
  idCard: (message = '请输入正确的身份证号') => (value) => {
    if (!value) return null
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return idCardRegex.test(value) ? null : message
  },
  number: (message = '请输入有效的数字') => (value) => {
    if (!value) return null
    return isNaN(Number(value)) ? message : null
  },
  positive: (message = '请输入正数') => (value) => {
    if (!value) return null
    return Number(value) > 0 ? null : message
  }
}
