export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateTime = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export const RARE_LEVELS = {
  1: { label: '普通', color: 'badge-info' },
  2: { label: '珍贵', color: 'badge-warning' },
  3: { label: '珍稀', color: 'badge-danger' },
  4: { label: '特级珍稀', color: 'badge-danger' }
}

export const SPECIMEN_STATUS = {
  normal: { label: '正常', color: 'badge-success' },
  borrowed: { label: '已借出', color: 'badge-warning' },
  maintenance: { label: '养护中', color: 'badge-info' },
  damaged: { label: '破损', color: 'badge-danger' }
}

export const STATUS_TRANSITIONS = {
  normal: ['borrowed', 'maintenance', 'damaged'],
  borrowed: ['normal', 'damaged', 'maintenance'],
  maintenance: ['normal', 'damaged'],
  damaged: ['maintenance', 'normal']
}

export const STATUS_TRANSITION_LABELS = {
  normal: { from: '正常', to: '已借出、养护中、破损' },
  borrowed: { from: '已借出', to: '正常、破损、养护中' },
  maintenance: { from: '养护中', to: '正常、破损' },
  damaged: { from: '破损', to: '养护中、正常' }
}

export const canTransitionToStatus = (currentStatus, targetStatus) => {
  const allowed = STATUS_TRANSITIONS[currentStatus]
  return allowed?.includes(targetStatus) || false
}

export const BORROW_STATUS = {
  borrowing: { label: '借阅中', color: 'badge-warning' },
  returned: { label: '已归还', color: 'badge-success' }
}

export const MAINTENANCE_STATUS = {
  scheduled: { label: '待处理', color: 'badge-warning' },
  completed: { label: '已完成', color: 'badge-success' }
}

export const AGE_STATUS = {
  normal: { label: '正常', color: 'badge-success' },
  warning: { label: '即将过期', color: 'badge-warning' },
  expired: { label: '已过期', color: 'badge-danger' }
}

export const WARRANTY_PERIODS = {
  herbaceous: 5,
  woody: 10,
  mineral: 20,
  fungus: 3,
  animal: 5
}

export const CATEGORY_WARRANTY_MAP = {
  '草本类': 'herbaceous',
  '木本类': 'woody',
  '矿物类': 'mineral',
  '菌菇类': 'fungus',
  '动物类': 'animal'
}

export const getRareLevelLabel = (level) => RARE_LEVELS[level]?.label || '未知'
export const getRareLevelColor = (level) => RARE_LEVELS[level]?.color || 'badge-secondary'
export const getSpecimenStatusLabel = (status) => SPECIMEN_STATUS[status]?.label || '未知'
export const getSpecimenStatusColor = (status) => SPECIMEN_STATUS[status]?.color || 'badge-secondary'
export const getBorrowStatusLabel = (status) => BORROW_STATUS[status]?.label || '未知'
export const getBorrowStatusColor = (status) => BORROW_STATUS[status]?.color || 'badge-secondary'
export const getMaintenanceStatusLabel = (status) => MAINTENANCE_STATUS[status]?.label || '未知'
export const getMaintenanceStatusColor = (status) => MAINTENANCE_STATUS[status]?.color || 'badge-secondary'
export const getAgeStatusLabel = (status) => AGE_STATUS[status]?.label || '未知'
export const getAgeStatusColor = (status) => AGE_STATUS[status]?.color || 'badge-secondary'

export const getWarrantyYears = (categoryName) => {
  const key = CATEGORY_WARRANTY_MAP[categoryName]
  return WARRANTY_PERIODS[key] || 5
}

export const calculateSpecimenAge = (collectYear) => {
  if (!collectYear) return 0
  const currentYear = new Date().getFullYear()
  return currentYear - collectYear
}

export const getSpecimenAgeStatus = (collectYear, categoryName) => {
  const age = calculateSpecimenAge(collectYear)
  const warranty = getWarrantyYears(categoryName)
  
  if (age >= warranty) {
    return 'expired'
  } else if (age >= warranty - 1) {
    return 'warning'
  }
  return 'normal'
}

export const getRemainingWarrantyYears = (collectYear, categoryName) => {
  const age = calculateSpecimenAge(collectYear)
  const warranty = getWarrantyYears(categoryName)
  return Math.max(0, warranty - age)
}

export const generateSpecimenCode = () => {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `TCM-${year}-${random}`
}