export const phoneRegex = /^1[3-9]\d{9}$/
export const passwordRegex = /^.{6,20}$/
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
export const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/

export const validatePhone = (_, value) => {
  if (!value) {
    return Promise.reject(new Error('请输入手机号'))
  }
  if (!phoneRegex.test(value)) {
    return Promise.reject(new Error('请输入正确的手机号'))
  }
  return Promise.resolve()
}

export const validatePassword = (_, value) => {
  if (!value) {
    return Promise.reject(new Error('请输入密码'))
  }
  if (!passwordRegex.test(value)) {
    return Promise.reject(new Error('密码长度为6-20位'))
  }
  return Promise.resolve()
}

export const validateConfirmPassword = (getFieldValue) => (_, value) => {
  if (!value) {
    return Promise.reject(new Error('请确认密码'))
  }
  if (value !== getFieldValue('password')) {
    return Promise.reject(new Error('两次输入的密码不一致'))
  }
  return Promise.resolve()
}

export const validateName = (_, value) => {
  if (!value) {
    return Promise.reject(new Error('请输入姓名'))
  }
  if (!nameRegex.test(value)) {
    return Promise.reject(new Error('姓名只能包含中文、英文和数字，长度2-20位'))
  }
  return Promise.resolve()
}

export const validateEmail = (_, value) => {
  if (value && !emailRegex.test(value)) {
    return Promise.reject(new Error('请输入正确的邮箱地址'))
  }
  return Promise.resolve()
}

export const validateRequired = (message = '此项为必填项') => (_, value) => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return Promise.reject(new Error(message))
  }
  return Promise.resolve()
}
