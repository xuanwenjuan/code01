export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch {
    return '-'
  }
}

export const formatDateShort = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch {
    return '-'
  }
}

export const getDaysUntilExpiration = (expirationDate: string): number | null => {
  try {
    const expDate = new Date(expirationDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expDate.setHours(0, 0, 0, 0)
    
    if (isNaN(expDate.getTime())) return null
    
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  } catch {
    return null
  }
}

export const isExpiringSoon = (expirationDate: string, thresholdDays: number = 30): boolean => {
  const days = getDaysUntilExpiration(expirationDate)
  return days !== null && days <= thresholdDays && days >= 0
}

export const isExpired = (expirationDate: string): boolean => {
  const days = getDaysUntilExpiration(expirationDate)
  return days !== null && days < 0
}