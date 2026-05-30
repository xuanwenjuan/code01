export type MaterialCategory = 'furniture' | 'curtain' | 'lighting' | 'carpet' | 'decoration'

export type MaterialStatus = 'on' | 'off'

export interface Material {
  id: string
  name: string
  category: MaterialCategory
  specs: string
  styleTags: string[]
  price: number
  status: MaterialStatus
  imageUrl: string
  createTime: string
  updateTime: string
}

export type DesignerStatus = 'on' | 'off' | 'leave'

export interface Designer {
  id: string
  name: string
  phone: string
  email: string
  avatar: string
  specialtyStyles: string[]
  status: DesignerStatus
  works: string[]
  createTime: string
  updateTime: string
}

export type OrderStatus = 'pending' | 'assigned' | 'designing' | 'completed' | 'deal'

export interface Order {
  id: string
  orderNo: string
  customerName: string
  customerPhone: string
  style: string
  houseType: string
  area: number
  designerId?: string
  designerName?: string
  status: OrderStatus
  requirement: string
  createTime: string
  updateTime: string
}

export type ContractStatus = 'pending' | 'signed' | 'cancelled'

export interface ContractItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Contract {
  id: string
  contractNo: string
  orderId: string
  orderNo: string
  designerId: string
  designerName: string
  customerName: string
  customerPhone: string
  items: ContractItem[]
  totalAmount: number
  discount: number
  finalAmount: number
  status: ContractStatus
  createTime: string
  updateTime: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export type StatusMap<T extends string | number> = Record<T, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }>

export interface SearchParams {
  [key: string]: string | number | boolean | undefined
}

export interface FormDialogEmits {
  (e: 'submit', data: Record<string, unknown>): void
  (e: 'cancel'): void
  (e: 'update:modelValue', value: boolean): void
}

export type MaterialForm = Partial<Material>
export type DesignerForm = Partial<Designer>
export type OrderForm = Partial<Order>
export type ContractForm = Partial<Contract>

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface MaterialStoreState {
  materials: Material[]
  loading: boolean
}

export interface DesignerStoreState {
  designers: Designer[]
  loading: boolean
}

export interface OrderStoreState {
  orders: Order[]
  loading: boolean
}

export interface ContractStoreState {
  contracts: Contract[]
  loading: boolean
}
