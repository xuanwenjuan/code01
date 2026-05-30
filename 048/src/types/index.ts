export type SupplierCategory = '五金' | '塑胶' | '电子' | '冲压件'

export type CooperationStatus = '合作中' | '已暂停' | '待审核' | '已终止'

export type OrderStatus = '待确认' | '已下单' | '供货中' | '已交付'

export type SettlementStatus = '待对账' | '对账中' | '已结算' | '已逾期'

export type QualityResult = '合格' | '不合格' | '待检验'

export interface BaseEntity {
  id: string
  createTime: string
  updateTime: string
}

export interface Supplier extends BaseEntity {
  name: string
  category: SupplierCategory
  qualification: string
  contactPerson: string
  contactPhone: string
  cooperationStatus: CooperationStatus
  qualificationExpireDate: string
  isExpiringSoon: boolean
  remark?: string
}

export interface Material extends BaseEntity {
  code: string
  name: string
  specification: string
  material: string
  purchasePrice: number
  safetyStock: number
  category: string
  unit: string
  remark?: string
}

export interface InquiryOrder extends BaseEntity {
  orderNo: string
  supplierId: string
  supplierName: string
  materialId: string
  materialName: string
  quantity: number
  inquiryPrice: number | null
  quotedPrice: number | null
  status: OrderStatus
  confirmTime: string | null
  remark?: string
}

export interface DeliveryRecord extends BaseEntity {
  deliveryNo: string
  supplierId: string
  supplierName: string
  materialId: string
  materialName: string
  quantity: number
  deliveryDate: string
  qualityResult: QualityResult
  settlementAmount: number
  settlementStatus: SettlementStatus
  remark?: string
}

export interface SelectOption {
  label: string
  value: string | number
}

export interface TableColumnConfig<T = unknown> {
  title: string
  dataIndex: keyof T | string
  key: string
  width?: number
  fixed?: 'left' | 'right'
  render?: (value: unknown, record: T, index: number) => React.ReactNode
}
