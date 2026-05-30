export const formatPrice = (price) => {
  return `¥${Number(price).toFixed(2)}`
}

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
}

export const formatDateTime = (date) => {
  return formatDate(date, 'YYYY-MM-DD HH:mm')
}

export const formatDistance = (distance) => {
  if (distance === 0) return '全城服务'
  if (distance < 1) return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
}

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}小时`
  return `${hours}小时${mins}分钟`
}

export const getOrderStatusText = (status) => {
  const statusMap = {
    pending: '待确认',
    confirmed: '已确认',
    inProgress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

export const getOrderStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    confirmed: 'blue',
    inProgress: 'processing',
    completed: 'success',
    cancelled: 'default',
  }
  return colorMap[status] || 'default'
}

export const getServiceCategory = (category) => {
  const categoryMap = {
    wash: '宠物洗护',
    boarding: '宠物寄养',
    beauty: '宠物美容',
    medical: '宠物医疗',
    training: '宠物训练',
    grooming: '宠物SPA',
    delivery: '上门服务',
  }
  return categoryMap[category] || category
}

export const getPetTypeText = (type) => {
  const typeMap = {
    dog: '狗狗',
    cat: '猫咪',
    other: '其他',
  }
  return typeMap[type] || type
}

export const generateOrderNo = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD${year}${month}${day}${random}`
}
