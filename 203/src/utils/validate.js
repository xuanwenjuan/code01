export const validateUsername = (username) => {
  if (!username) return '请输入用户名'
  if (username.length < 3) return '用户名至少3个字符'
  if (username.length > 20) return '用户名不能超过20个字符'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return '用户名只能包含字母、数字和下划线'
  return null
}

export const validatePassword = (password) => {
  if (!password) return '请输入密码'
  if (password.length < 6) return '密码至少6个字符'
  if (password.length > 20) return '密码不能超过20个字符'
  if (!/(?=.*[a-z])/.test(password)) return '密码需包含小写字母'
  if (!/(?=.*[A-Z])/.test(password) && !/(?=.*\d)/.test(password)) return '密码需包含数字或大写字母'
  return null
}

export const validateEmail = (email) => {
  if (!email) return '请输入邮箱'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return '请输入有效的邮箱地址'
  return null
}

export const validatePhone = (phone) => {
  if (!phone) return '请输入手机号'
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) return '请输入有效的手机号'
  return null
}

export const validateName = (name) => {
  if (!name) return '请输入姓名'
  if (name.length < 2) return '姓名至少2个字符'
  if (name.length > 10) return '姓名不能超过10个字符'
  return null
}

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return '请确认密码'
  if (password !== confirmPassword) return '两次输入的密码不一致'
  return null
}
