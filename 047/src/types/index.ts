export interface Category {
  id: string
  name: string
  parentId: string | null
  level: number
  sort: number
  status: 'active' | 'inactive'
  children?: Category[]
  createdAt: string
  updatedAt: string
}

export interface CategoryQueryParams {
  name?: string
  status?: 'active' | 'inactive' | ''
}

export interface SkuSpec {
  id: string
  name: string
  values: string[]
}

export interface ProductSku {
  id: string
  productId: string
  productName: string
  categoryId: string
  categoryName: string
  specs: Record<string, string>
  retailPrice: number
  activityPrice: number
  stock: number
  stockThreshold: number
  outOfStockReminder: boolean
  status: 'on_sale' | 'off_sale'
  createdAt: string
  updatedAt: string
}

export interface ProductQueryParams {
  productName?: string
  categoryId?: string
  status?: 'on_sale' | 'off_sale' | ''
}

export interface Order {
  id: string
  orderNo: string
  userId: string
  userName: string
  totalAmount: number
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  skuId: string
  productName: string
  specs: Record<string, string>
  quantity: number
  price: number
}

export interface AfterSale {
  id: string
  orderId: string
  orderNo: string
  type: 'return' | 'exchange' | 'refund'
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed'
  reason: string
  userId: string
  userName: string
  items: AfterSaleItem[]
  auditOpinion?: string
  auditTime?: string
  progress: AfterSaleProgress[]
  createdAt: string
  updatedAt: string
}

export interface AfterSaleQueryParams {
  orderNo?: string
  type?: 'return' | 'exchange' | 'refund' | ''
  status?: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed' | ''
  userName?: string
}

export interface AfterSaleItem {
  id: string
  skuId: string
  productName: string
  specs: Record<string, string>
  quantity: number
  price: number
}

export interface AfterSaleProgress {
  id: string
  status: string
  description: string
  operator: string
  time: string
}

export interface MemberLevel {
  id: string
  name: '普通会员' | '银卡会员' | '金卡会员' | '钻石会员'
  level: number
  discount: number
  pointsRate: number
  birthdayBenefit: string
  minPoints: number
}

export interface Member {
  id: string
  name: string
  phone: string
  email: string
  levelId: string
  levelName: string
  points: number
  totalConsumption: number
  birthday: string
  status: 'active' | 'inactive'
  levelChangeRecords: LevelChangeRecord[]
  createdAt: string
  updatedAt: string
}

export interface MemberQueryParams {
  name?: string
  phone?: string
  levelId?: string
  status?: 'active' | 'inactive' | ''
}

export interface LevelChangeRecord {
  id: string
  fromLevel: string
  toLevel: string
  reason: string
  operator: string
  time: string
}

export interface Response<T = unknown> {
  code: number
  message: string
  data: T
}

export interface QueryFormField {
  name: string
  label: string
  type: 'input' | 'select' | 'date' | 'dateRange'
  options?: Array<{ label: string; value: string | number }>
  placeholder?: string
}

export interface ModalFormConfig<T = Record<string, unknown>> {
  title: string
  width?: number | string
  initialValues?: T
  fields: Array<{
    name: string
    label: string
    type: 'input' | 'number' | 'select' | 'switch' | 'textarea'
    rules?: Array<{ required?: boolean; message?: string }>
    options?: Array<{ label: string; value: string | number }>
    placeholder?: string
  }>
}
