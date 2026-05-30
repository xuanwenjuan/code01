export const phoneReg = /^1[3-9]\d{9}$/

export const passwordReg = /^[a-zA-Z0-9_]{6,20}$/

export const usernameReg = /^[a-zA-Z0-9_]{4,20}$/

export const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/

export const validatePhone = (rule, value) => {
  if (!value) {
    return Promise.reject('请输入手机号码')
  }
  if (!phoneReg.test(value)) {
    return Promise.reject('请输入正确的手机号码')
  }
  return Promise.resolve()
}

export const validatePassword = (rule, value) => {
  if (!value) {
    return Promise.reject('请输入密码')
  }
  if (!passwordReg.test(value)) {
    return Promise.reject('密码长度6-20位，只能包含字母、数字、下划线')
  }
  return Promise.resolve()
}

export const validateUsername = (rule, value) => {
  if (!value) {
    return Promise.reject('请输入用户名')
  }
  if (!usernameReg.test(value)) {
    return Promise.reject('用户名长度4-20位，只能包含字母、数字、下划线')
  }
  return Promise.resolve()
}

export const validateRequired = (message = '该项为必填项') => (rule, value) => {
  if (value === undefined || value === null || value === '') {
    return Promise.reject(message)
  }
  return Promise.resolve()
}
