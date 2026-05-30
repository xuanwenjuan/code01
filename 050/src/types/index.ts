export type ContractStatus = 'signed' | 'pending' | 'expired'
export type ProductStatus = 'active' | 'inactive'
export type DeclarationStatus = 'draft' | 'submitted' | 'reviewing' | 'inspecting' | 'released' | 'completed' | 'rejected'
export type SettlementStatus = 'pending' | 'settled'
export type Currency = 'CNY' | 'USD' | 'EUR'
export type TaxNature = '一般征税' | '来料加工' | '进料加工' | '特定区域'
export type Qualification = '进出口经营权' | '一般纳税人资质' | 'AEO认证' | '保税物流资质'

export const CONTRACT_STATUS_MAP: Record<ContractStatus, { label: string; type: string }> = {
  signed: { label: '已签约', type: 'success' },
  pending: { label: '待签约', type: 'warning' },
  expired: { label: '已过期', type: 'danger' }
}

export const PRODUCT_STATUS_MAP: Record<ProductStatus, { label: string; type: string }> = {
  active: { label: '启用', type: 'success' },
  inactive: { label: '停用', type: 'info' }
}

export const DECLARATION_STATUS_MAP: Record<DeclarationStatus, { label: string; type: string; step: number }> = {
  draft: { label: '草稿', type: 'info', step: 1 },
  submitted: { label: '已申报', type: 'warning', step: 2 },
  reviewing: { label: '审核中', type: 'warning', step: 3 },
  inspecting: { label: '查验中', type: 'warning', step: 4 },
  released: { label: '已放行', type: 'success', step: 5 },
  completed: { label: '已办结', type: 'success', step: 6 },
  rejected: { label: '已驳回', type: 'danger', step: 0 }
}

export const SETTLEMENT_STATUS_MAP: Record<SettlementStatus, { label: string; type: string }> = {
  pending: { label: '待结算', type: 'warning' },
  settled: { label: '已结算', type: 'success' }
}

export const CURRENCY_MAP: Record<Currency, { label: string; symbol: string }> = {
  CNY: { label: '人民币', symbol: '¥' },
  USD: { label: '美元', symbol: '$' },
  EUR: { label: '欧元', symbol: '€' }
}

export const DECLARATION_STEPS = [
  { title: '草稿', description: '录入报关单信息' },
  { title: '申报', description: '提交海关申报' },
  { title: '审核', description: '海关审核中' },
  { title: '查验', description: '货物查验' },
  { title: '放行', description: '审核通过放行' },
  { title: '办结', description: '流程完成' }
]

export const PRODUCT_CATEGORIES = ['机电产品', '化工产品', '纺织服装', '食品饮料', '电子产品', '机械设备']
export const SUPERVISION_CONDITIONS = ['A', 'B', 'M', 'N', 'P', 'Q']
export const DECLARATION_ELEMENTS = ['品名', '规格型号', '品牌', '用途', '材质', '成分含量', '加工方法']

export interface Customer {
  id: string
  name: string
  creditCode: string
  qualification: Qualification | string
  contractStatus: ContractStatus
  validStart: string
  validEnd: string
  contact: string
  phone: string
  address: string
  status: ProductStatus
  createTime: string
}

export interface ProductCategory {
  id: string
  name: string
  code: string
  parentId: string | null
  declarationElements: string[]
  supervisionConditions: string[]
  taxNature: TaxNature | string
  status: ProductStatus
  sort: number
  createTime: string
}

export interface CustomsDeclaration {
  id: string
  declarationNo: string
  customerId: string
  customerName: string
  productCategory: string
  productName: string
  productCode: string
  quantity: number
  unit: string
  amount: number
  currency: Currency | string
  status: DeclarationStatus
  currentStep: number
  createTime: string
  submitTime?: string
  completeTime?: string
  operator: string
}

export interface FeeSettlement {
  id: string
  settlementNo: string
  customerId: string
  customerName: string
  month: string
  serviceFee: number
  portFee: number
  taxFee: number
  totalAmount: number
  status: SettlementStatus
  createTime: string
  settleTime?: string
  operator: string
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface FormDialogProps<T> {
  visible: boolean
  data?: T | null
}

export interface SearchField {
  label: string
  prop: string
  type: 'input' | 'select' | 'date' | 'daterange' | 'month'
  placeholder?: string
  options?: Array<{ label: string; value: string | number }>
  clearable?: boolean
}

export interface TableColumn {
  label: string
  prop: string
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  fixed?: boolean | 'left' | 'right'
  showOverflowTooltip?: boolean
  formatter?: (row: unknown, value: unknown) => string
  slot?: string
}

export interface ValidationRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  pattern?: RegExp
  min?: number
  max?: number
  validator?: (rule: unknown, value: string, callback: (error?: Error) => void) => void
}
