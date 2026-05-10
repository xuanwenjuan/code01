export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return new Date(date).toLocaleString('zh-CN')
  }
  return date.toLocaleString('zh-CN')
}

export function formatMoney(amount: number | undefined | null, prefix: string = '¥'): string {
  if (amount === undefined || amount === null) return '-'
  return `${prefix}${amount.toFixed(2)}`
}

export function getLogTagType(type: string): 'primary' | 'success' | 'warning' | 'info' {
  if (type.includes('商品')) return 'primary'
  if (type.includes('分类')) return 'success'
  if (type.includes('出入库')) return 'warning'
  return 'info'
}

export function getActionTagType(action: string): 'primary' | 'success' | 'danger' | 'warning' | 'info' {
  switch (action) {
    case '新增':
    case '入库':
      return 'success'
    case '修改':
    case '销售':
      return 'primary'
    case '删除':
      return 'danger'
    case '下架':
      return 'warning'
    default:
      return 'info'
  }
}

export function cleanParams<T extends Record<string, unknown>>(params: T): Partial<T> {
  const cleaned: Partial<T> = {}
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key as keyof T] = value as T[keyof T]
    }
  })
  return cleaned
}

export function getOperationTypeLabel(type: string): string {
  switch (type) {
    case 'inbound':
      return '入库'
    case 'sale':
      return '销售'
    case 'offline':
      return '下架'
    default:
      return type
  }
}

export function getExpiryStatusType(status: string): 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'expired':
      return 'danger'
    case 'expiring':
      return 'warning'
    case 'normal':
      return 'info'
    default:
      return 'info'
  }
}

export function getProductStatusLabel(status: string): string {
  return status === 'active' ? '上架' : '下架'
}

export function getOfflineReasonLabel(reason: string): string {
  switch (reason) {
    case 'expired':
      return '已过期'
    case 'damaged':
      return '商品破损'
    case 'expiring':
      return '临期处理'
    case 'other':
      return '其他原因'
    default:
      return reason
  }
}
