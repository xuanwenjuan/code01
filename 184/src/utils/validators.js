export const validators = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度为4-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, message: '密码包含非法字符', trigger: 'blur' }
  ],
  
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度为2-20个字符', trigger: 'blur' }
  ],
  
  address: [
    { required: true, message: '请输入收货地址', trigger: 'blur' },
    { min: 10, max: 200, message: '地址长度为10-200个字符', trigger: 'blur' }
  ],
  
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', message: '请输入数字', trigger: 'blur' },
    { min: 1, message: '数量不能小于1', trigger: 'blur' }
  ]
}

export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateUsername(username) {
  return /^[a-zA-Z0-9_]{4,20}$/.test(username)
}
