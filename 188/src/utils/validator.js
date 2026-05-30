export const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) {
    callback(new Error('用户名只能包含字母、数字、下划线，4-20位'))
  } else {
    callback()
  }
}

export const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!/^[a-zA-Z0-9_!@#$%^&*]{6,20}$/.test(value)) {
    callback(new Error('密码只能包含字母、数字、特殊字符，6-20位'))
  } else {
    callback()
  }
}

export const validateConfirmPassword = (password) => {
  return (rule, value, callback) => {
    if (!value) {
      callback(new Error('请再次输入密码'))
    } else if (value !== password) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }
}

export const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号码'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

export const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱地址'))
  } else if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

export const validateName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入姓名'))
  } else if (!/^[\u4e00-\u9fa5a-zA-Z\s]{2,20}$/.test(value)) {
    callback(new Error('姓名只能包含中文或英文，2-20位'))
  } else {
    callback()
  }
}

export const validateIdCard = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入身份证号'))
  } else if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value)) {
    callback(new Error('请输入正确的身份证号'))
  } else {
    callback()
  }
}

export const validateBankCard = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入银行卡号'))
  } else if (!/^\d{16,19}$/.test(value)) {
    callback(new Error('请输入正确的银行卡号'))
  } else {
    callback()
  }
}

export const validateZipCode = (rule, value, callback) => {
  if (value && !/^\d{6}$/.test(value)) {
    callback(new Error('请输入正确的邮政编码'))
  } else {
    callback()
  }
}

export const validateUrl = (rule, value, callback) => {
  if (value && !/^https?:\/\/.+/.test(value)) {
    callback(new Error('请输入正确的URL地址'))
  } else {
    callback()
  }
}

export const validateNumber = (min, max) => {
  return (rule, value, callback) => {
    if (value === '' || value === null || value === undefined) {
      callback(new Error('请输入数字'))
      return
    }
    const num = Number(value)
    if (isNaN(num)) {
      callback(new Error('请输入有效的数字'))
    } else if (min !== undefined && num < min) {
      callback(new Error(`数字不能小于${min}`))
    } else if (max !== undefined && num > max) {
      callback(new Error(`数字不能大于${max}`))
    } else {
      callback()
    }
  }
}

export const validateRequired = (message) => {
  return (rule, value, callback) => {
    if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
      callback(new Error(message || '该项为必填项'))
    } else {
      callback()
    }
  }
}

export const validateMinLength = (min, message) => {
  return (rule, value, callback) => {
    if (value && value.length < min) {
      callback(new Error(message || `最少输入${min}个字符`))
    } else {
      callback()
    }
  }
}

export const validateMaxLength = (max, message) => {
  return (rule, value, callback) => {
    if (value && value.length > max) {
      callback(new Error(message || `最多输入${max}个字符`))
    } else {
      callback()
    }
  }
}
