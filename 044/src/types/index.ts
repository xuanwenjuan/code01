export type ProductStatus = 'on' | 'off'

export type OrderStatus = 'pending_payment' | 'pending_shipment' | 'shipping' | 'completed' | 'refunded'

export type ActivityStatus = 'enabled' | 'disabled'

export type ReviewType = 'good' | 'neutral' | 'bad'

export type DiscountType = 'fixed' | 'percent'

export interface Category {
  id: string
  name: string
  parentId: string | null
  children?: Category[]
}

export interface Product {
  id: string
  name: string
  categoryId: string
  categoryName: string
  price: number
  activityPrice?: number
  stock: number
  status: ProductStatus
  image: string
  description: string
  createTime: string
}

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
}

export interface Logistics {
  time: string
  status: string
  location: string
}

export interface Order {
  id: string
  orderNo: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: number
  buyerName: string
  buyerPhone: string
  address: string
  createTime: string
  payTime?: string
  shipTime?: string
  completeTime?: string
  logistics?: Logistics[]
}

export interface SeckillActivity {
  id: string
  name: string
  startTime: string
  endTime: string
  status: ActivityStatus
  products: string[]
}

export interface DiscountActivity {
  id: string
  name: string
  minAmount: number
  discountAmount: number
  startTime: string
  endTime: string
  status: ActivityStatus
}

export interface Coupon {
  id: string
  name: string
  discountType: DiscountType
  discountValue: number
  minAmount: number
  totalCount: number
  receivedCount: number
  startTime: string
  endTime: string
  status: ActivityStatus
}

export interface Review {
  id: string
  productId: string
  productName: string
  productImage: string
  buyerName: string
  rating: 1 | 2 | 3 | 4 | 5
  type: ReviewType
  content: string
  images?: string[]
  reply?: string
  replyTime?: string
  hasFollowUp: boolean
  followUpContent?: string
  followUpImages?: string[]
  createTime: string
}

export interface ModalConfig {
  title: string
  width?: number
  okText?: string
  cancelText?: string
  confirmLoading?: boolean
}

export interface TableColumnConfig {
  title: string
  dataIndex: string
  width?: number
  render?: (value: unknown, record: unknown, index: number) => React.ReactNode
}
