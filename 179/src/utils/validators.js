export const validators = {
  username: {
    pattern: /^[a-zA-Z0-9_]{4,20}$/,
    message: '用户名只能包含字母、数字和下划线，长度4-20位'
  },
  nickname: {
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/,
    message: '昵称只能包含中文、字母、数字和下划线，长度2-20位'
  },
  email: {
    pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
    message: '请输入有效的邮箱地址'
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号'
  },
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/,
    message: '密码需包含大小写字母和数字，长度6-20位'
  },
  simplePassword: {
    pattern: /^.{6,20}$/,
    message: '密码长度6-20位'
  }
}

export const createValidator = (config, required = true) => {
  return (rule, value, callback) => {
    if (required && !value) {
      callback(new Error(config.requiredMessage || '请输入内容'))
    } else if (value && config.pattern && !config.pattern.test(value)) {
      callback(new Error(config.message))
    } else {
      callback()
    }
  }
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatPrice = (price) => {
  return `¥${Number(price).toFixed(2)}`
}

export const orderStatusMap = {
  pending: { text: '待付款', type: 'warning' },
  paid: { text: '待发货', type: 'primary' },
  shipped: { text: '待收货', type: 'success' },
  completed: { text: '已完成', type: 'info' },
  cancelled: { text: '已取消', type: 'danger' }
}

export const afterSaleStatusMap = {
  pending: { text: '待处理', type: 'warning' },
  processing: { text: '处理中', type: 'primary' },
  completed: { text: '已完成', type: 'success' },
  rejected: { text: '已拒绝', type: 'danger' }
}

export const afterSaleTypeMap = {
  return: '退货退款',
  exchange: '换货',
  repair: '维修'
}

export const afterSaleReasonMap = {
  quality: '商品质量问题',
  mismatch: '商品与描述不符',
  size: '尺寸/尺码不合适',
  wrong: '发错商品',
  dislike: '不喜欢/不想要',
  damage: '商品损坏',
  other: '其他原因'
}
