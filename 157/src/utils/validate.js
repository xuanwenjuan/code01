export const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

export const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback()
  } else if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

export const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('密码长度为6-20个字符'))
  } else {
    callback()
  }
}

export const validateRequired = (message = '此项为必填') => {
  return { required: true, message, trigger: 'blur' }
}

export const validateRange = (min, max, message) => {
  return { min, max, message, trigger: 'blur' }
}

export const loginRules = {
  username: [
    validateRequired('请输入用户名或手机号'),
    validateRange(2, 20, '用户名长度为2-20个字符')
  ],
  password: [validateRequired('请输入密码')]
}

export const registerRules = {
  username: [
    validateRequired('请输入用户名'),
    validateRange(2, 20, '用户名长度为2-20个字符')
  ],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  code: [
    validateRequired('请输入验证码'),
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  password: [{ validator: validatePassword, trigger: 'blur' }]
}

export const addressRules = {
  name: [validateRequired('请输入收货人姓名')],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  detail: [
    validateRequired('请输入详细地址'),
    validateRange(5, 100, '详细地址长度为5-100个字符')
  ]
}

export const profileRules = {
  nickname: [
    validateRequired('请输入昵称'),
    validateRange(2, 20, '昵称长度为2-20个字符')
  ],
  email: [{ validator: validateEmail, trigger: 'blur' }]
}
