import dayjs from 'dayjs'

export const formatPrice = (price, unit = '元') => {
  if (!price) return '面议'
  return price.toLocaleString() + unit
}

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

export const formatDateTime = (date) => {
  return formatDate(date, 'YYYY-MM-DD HH:mm')
}

export const formatRelativeTime = (date) => {
  if (!date) return ''
  const now = dayjs()
  const target = dayjs(date)
  const diffDays = now.diff(target, 'day')

  if (diffDays === 0) {
    const diffHours = now.diff(target, 'hour')
    if (diffHours === 0) {
      const diffMinutes = now.diff(target, 'minute')
      return diffMinutes <= 0 ? '刚刚' : `${diffMinutes}分钟前`
    }
    return `${diffHours}小时前`
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}周前`
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}个月前`
  } else {
    return `${Math.floor(diffDays / 365)}年前`
  }
}

export const formatHouseArea = (area) => {
  return area ? `${area}㎡` : '暂无'
}

export const formatHouseType = (room, hall) => {
  return room && hall ? `${room}室${hall}厅` : '暂无'
}

export const formatViewCount = (count) => {
  if (!count) return 0
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count
}
