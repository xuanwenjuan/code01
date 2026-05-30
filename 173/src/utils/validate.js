export const REGEX = {
  phone: /^1[3-9]\d{9}$/,
  password: /^[a-zA-Z0-9_]{6,20}$/,
  username: /^[a-zA-Z0-9_]{4,20}$/,
  name: /^[\u4e00-\u9fa5]{2,10}$/,
  idCard: /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
  address: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_]{5,100}$/
}

export const validatePhone = (phone) => REGEX.phone.test(phone)
export const validatePassword = (password) => REGEX.password.test(password)
export const validateUsername = (username) => REGEX.username.test(username)
export const validateName = (name) => REGEX.name.test(name)
