export const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (value.length < 3 || value.length > 20) {
    callback(new Error('用户名长度在3-20个字符之间'))
  } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    callback(new Error('用户名只能包含字母、数字和下划线'))
  } else {
    callback()
  }
}

export const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('密码长度在6-20个字符之间'))
  } else {
    callback()
  }
}

export const validatePhone = (rule, value, callback) => {
  const phoneReg = /^1[3-9]\d{9}$/
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

export const validateEmail = (rule, value, callback) => {
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!emailReg.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

export const validateNickname = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入昵称'))
  } else if (value.length < 2 || value.length > 20) {
    callback(new Error('昵称长度在2-20个字符之间'))
  } else {
    callback()
  }
}

export const formatPrice = (price) => {
  return '¥' + Number(price).toFixed(2)
}

export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getOrderStatusText = (status) => {
  const statusMap = {
    pending: '待付款',
    paid: '已付款',
    shipping: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

export const getOrderStatusColor = (status) => {
  const colorMap = {
    pending: '#e6a23c',
    paid: '#409eff',
    shipping: '#909399',
    completed: '#67c23a',
    cancelled: '#f56c6c'
  }
  return colorMap[status] || '#909399'
}
