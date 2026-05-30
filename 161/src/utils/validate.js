export const validatePhone = (phone) => {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

export const validatePassword = (password) => {
  return password && password.length >= 6 && password.length <= 20
}

export const validateIdCard = (idCard) => {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

export const validateEmail = (email) => {
  const reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/
  return reg.test(email)
}

export const validateNotEmpty = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== ''
}

export const validateLength = (value, min, max) => {
  const len = value ? value.toString().length : 0
  return len >= min && len <= max
}
