export const validateUsername = (rule, value) => {
  if (!value) {
    return Promise.reject('请输入用户名')
  }
  if (value.length < 3 || value.length > 20) {
    return Promise.reject('用户名长度应为3-20个字符')
  }
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    return Promise.reject('用户名只能包含字母、数字和下划线')
  }
  return Promise.resolve()
}

export const validatePassword = (rule, value) => {
  if (!value) {
    return Promise.reject('请输入密码')
  }
  if (value.length < 6 || value.length > 20) {
    return Promise.reject('密码长度应为6-20个字符')
  }
  return Promise.resolve()
}

export const validateEmail = (rule, value) => {
  if (!value) {
    return Promise.resolve()
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return Promise.reject('请输入有效的邮箱地址')
  }
  return Promise.resolve()
}

export const validatePhone = (rule, value) => {
  if (!value) {
    return Promise.resolve()
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(value)) {
    return Promise.reject('请输入有效的手机号码')
  }
  return Promise.resolve()
}

export const validateRequired = (message = '此项为必填项') => ({
  required: true,
  message
})

export const getCategoryTagClass = (category) => {
  const classMap = {
    qimin: 'tag-qimin',
    baijian: 'tag-baijian',
    wenchuang: 'tag-wenchuang'
  }
  return classMap[category] || ''
}

export const getCategoryLabel = (category) => {
  const labelMap = {
    qimin: '器皿类',
    baijian: '摆件类',
    wenchuang: '文创类'
  }
  return labelMap[category] || category
}

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
