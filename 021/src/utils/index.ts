import type { Product, ProductStatus, NearExpiryAlert, ValidationRule } from '@/types'

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export const getCurrentDateTime = (): string => {
  return new Date().toISOString()
}

export const getPurityLevel = (purity: number): string => {
  if (purity >= 95) return '极高纯度'
  if (purity >= 90) return '高纯度'
  if (purity >= 80) return '优质级'
  return '普通级'
}

export const getPurityBadgeClass = (purity: number): string => {
  if (purity >= 95) return 'badge-danger'
  if (purity >= 90) return 'badge-warning'
  return 'badge-success'
}

export const calculateProductStatus = (remainingShelfLife: number, currentStatus: ProductStatus): ProductStatus => {
  if (currentStatus === '已下架') return '已下架'
  if (remainingShelfLife <= 3) return '临期'
  return '正常'
}

export const getNearExpiryWarningLevel = (product: Product): NearExpiryAlert => {
  const { remainingShelfLife, purity, name } = product
  let warningLevel: NearExpiryAlert['warningLevel'] = 'normal'
  let message = ''

  if (remainingShelfLife <= 1) {
    warningLevel = 'critical'
    message = `产品"${name}"仅剩${remainingShelfLife}个月保质期，需立即下架处理！`
  } else if (remainingShelfLife <= 3) {
    warningLevel = 'urgent'
    message = `产品"${name}"剩余${remainingShelfLife}个月保质期，建议下架处理。`
  }

  if (purity >= 95 && remainingShelfLife <= 6) {
    warningLevel = remainingShelfLife <= 3 ? 'critical' : 'urgent'
    message = `高纯度产品"${name}"（${purity}%）剩余${remainingShelfLife}个月保质期，需特别关注！`
  }

  return {
    product,
    warningLevel,
    message
  }
}

export const validateProductForm = (formData: {
  name: string
  brand: string
  categoryId: string
  purchaseYear: number
  currentStock: number
  unitPrice: number
  purity: number
  remainingShelfLife: number
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!formData.name.trim()) {
    errors.push('产品名称不能为空')
  }

  if (!formData.brand.trim()) {
    errors.push('品牌不能为空')
  }

  if (!formData.categoryId) {
    errors.push('请选择分类')
  }

  const currentYear = new Date().getFullYear()
  if (formData.purchaseYear < 1900 || formData.purchaseYear > currentYear + 10) {
    errors.push('入库年份不合法')
  }

  if (formData.currentStock < 0) {
    errors.push('库存不能为负数')
  }

  if (!Number.isInteger(formData.currentStock)) {
    errors.push('库存必须为整数')
  }

  if (formData.unitPrice < 0) {
    errors.push('单价不能为负数')
  }

  if (formData.purity < 0 || formData.purity > 100) {
    errors.push('纯度必须在0-100之间')
  }

  if (formData.remainingShelfLife < 0) {
    errors.push('保质期剩余不能为负数')
  }

  if (!Number.isInteger(formData.remainingShelfLife)) {
    errors.push('保质期剩余必须为整数（月）')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export const validateStockOperation = (
  operationType: '入库' | '出库',
  quantity: number,
  currentStock: number
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (quantity <= 0) {
    errors.push('操作数量必须大于0')
  }

  if (!Number.isInteger(quantity)) {
    errors.push('操作数量必须为整数')
  }

  if (operationType === '出库' && quantity > currentStock) {
    errors.push(`出库数量不能超过当前库存（${currentStock}）`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export const createValidationRules = (): ValidationRule[] => {
  return [
    {
      field: 'name',
      message: '产品名称不能为空',
      validator: (value: unknown) => typeof value === 'string' && value.trim().length > 0
    },
    {
      field: 'brand',
      message: '品牌不能为空',
      validator: (value: unknown) => typeof value === 'string' && value.trim().length > 0
    },
    {
      field: 'currentStock',
      message: '库存必须为非负整数',
      validator: (value: unknown) => typeof value === 'number' && value >= 0 && Number.isInteger(value)
    },
    {
      field: 'unitPrice',
      message: '单价必须为非负数',
      validator: (value: unknown) => typeof value === 'number' && value >= 0
    },
    {
      field: 'purity',
      message: '纯度必须在0-100之间',
      validator: (value: unknown) => typeof value === 'number' && value >= 0 && value <= 100
    },
    {
      field: 'remainingShelfLife',
      message: '保质期必须为非负整数',
      validator: (value: unknown) => typeof value === 'number' && value >= 0 && Number.isInteger(value)
    }
  ]
}

export const getStatusBadgeClass = (status: ProductStatus): string => {
  switch (status) {
    case '正常':
      return 'badge-success'
    case '临期':
      return 'badge-warning'
    case '已下架':
      return 'badge-danger'
    default:
      return 'badge-info'
  }
}

export const getOperationTypeBadgeClass = (type: string): string => {
  switch (type) {
    case '入库':
      return 'badge-success'
    case '出库':
      return 'badge-info'
    case '临期下架':
      return 'badge-warning'
    case '编辑':
      return 'badge-info'
    case '删除':
      return 'badge-danger'
    default:
      return 'badge-info'
  }
}
