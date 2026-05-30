export const validatePhone = (_, value) => {
  const phoneRegex = /^1[3-9]\d{9}$/
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
  if (value.length < 6) {
    return Promise.reject(new Error('密码长度不能少于6位'))
  }
  if (value.length > 20) {
    return Promise.reject(new Error('密码长度不能超过20位'))
  }
  return Promise.resolve()
}

export const validateName = (_, value) => {
  if (!value) {
    return Promise.reject(new Error('请输入姓名'))
  }
  if (value.length < 2) {
    return Promise.reject(new Error('姓名至少2个字符'))
  }
  if (value.length > 20) {
    return Promise.reject(new Error('姓名不能超过20个字符'))
  }
  return Promise.resolve()
}

export const validateCode = (_, value) => {
  const codeRegex = /^\d{6}$/
  if (!value) {
    return Promise.reject(new Error('请输入验证码'))
  }
  if (!codeRegex.test(value)) {
    return Promise.reject(new Error('验证码为6位数字'))
  }
  return Promise.resolve()
}

export const validateIdCard = (_, value) => {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (!value) {
    return Promise.resolve()
  }
  if (!idCardRegex.test(value)) {
    return Promise.reject(new Error('请输入正确的身份证号'))
  }
  return Promise.resolve()
}

export const validateEmail = (_, value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!value) {
    return Promise.resolve()
  }
  if (!emailRegex.test(value)) {
    return Promise.reject(new Error('请输入正确的邮箱地址'))
  }
  return Promise.resolve()
}
