import Mock from 'mockjs'
import type { Category, Supplier, PurchaseOrder, CustomerOrder } from '@/types'
import { Status, CooperationStatus, PurchaseOrderStatus, CustomerOrderStatus, CustomerType } from '@/types'

const categoryData: Category[] = [
  {
    id: 1,
    name: '蔬菜',
    parentId: null,
    level: 1,
    sort: 1,
    status: Status.ENABLED,
    children: [
      { id: 11, name: '叶菜类', parentId: 1, level: 2, sort: 1, status: Status.ENABLED },
      { id: 12, name: '根茎类', parentId: 1, level: 2, sort: 2, status: Status.ENABLED },
      { id: 13, name: '瓜果类', parentId: 1, level: 2, sort: 3, status: Status.ENABLED }
    ]
  },
  {
    id: 2,
    name: '水果',
    parentId: null,
    level: 1,
    sort: 2,
    status: Status.ENABLED,
    children: [
      { id: 21, name: '柑橘类', parentId: 2, level: 2, sort: 1, status: Status.ENABLED },
      { id: 22, name: '核果类', parentId: 2, level: 2, sort: 2, status: Status.ENABLED }
    ]
  },
  {
    id: 3,
    name: '肉禽',
    parentId: null,
    level: 1,
    sort: 3,
    status: Status.ENABLED,
    children: [
      { id: 31, name: '猪肉', parentId: 3, level: 2, sort: 1, status: Status.ENABLED },
      { id: 32, name: '鸡肉', parentId: 3, level: 2, sort: 2, status: Status.ENABLED }
    ]
  },
  {
    id: 4,
    name: '水产',
    parentId: null,
    level: 1,
    sort: 4,
    status: Status.ENABLED,
    children: [
      { id: 41, name: '鱼类', parentId: 4, level: 2, sort: 1, status: Status.ENABLED },
      { id: 42, name: '虾蟹类', parentId: 4, level: 2, sort: 2, status: Status.ENABLED }
    ]
  },
  {
    id: 5,
    name: '干货',
    parentId: null,
    level: 1,
    sort: 5,
    status: Status.DISABLED,
    children: [
      { id: 51, name: '菌菇类', parentId: 5, level: 2, sort: 1, status: Status.ENABLED }
    ]
  }
]

const supplierData: Supplier[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `${Mock.Random.cname()}农产品合作社`,
  origin: Mock.Random.city(true),
  contactPerson: Mock.Random.cname(),
  phone: Mock.Random.regexp(/^1[3-9]\d{9}$/),
  qualification: Mock.Random.pick(["A级资质", "B级资质", "C级资质"]),
  supplyCycle: Mock.Random.pick(["每周一次", "每周两次", "每两周一次", "按需供货"]),
  deliveryRange: Mock.Random.pick(["全市配送", "主城区配送", "省内配送"]),
  cooperationStatus: Mock.Random.pick([CooperationStatus.COOPERATING, CooperationStatus.SUSPENDED, CooperationStatus.PENDING]),
  contractExpireDate: Mock.Random.date('yyyy-MM-dd'),
  remark: Mock.Random.cparagraph(1)
}))

const purchaseOrderData: PurchaseOrder[] = Array.from({ length: 30 }, (_, i) => {
  const itemCount = Mock.Random.integer(1, 5)
  const items = Array.from({ length: itemCount }, () => {
    const quantity = Mock.Random.integer(100, 1000)
    const unitPrice = Mock.Random.float(2, 50, 1, 2)
    return {
      categoryId: Mock.Random.integer(11, 51),
      categoryName: Mock.Random.pick(["白菜", "萝卜", "苹果", "橙子", "猪肉", "鸡肉", "鲫鱼", "虾", "香菇"]),
      quantity,
      unit: Mock.Random.pick(["kg", "斤", "箱", "件"]),
      unitPrice,
      subtotal: quantity * unitPrice
    }
  })
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)
  return {
    id: i + 1,
    orderNo: `PO${Mock.Random.datetime('yyyyMMddHHmmss')}${Mock.Random.integer(100, 999)}`,
    supplierId: Mock.Random.integer(1, 20),
    supplierName: `${Mock.Random.cname()}农产品合作社`,
    items,
    totalAmount,
    orderDate: Mock.Random.date('yyyy-MM-dd'),
    expectedDate: Mock.Random.date('yyyy-MM-dd'),
    actualDate: Mock.Random.boolean() ? Mock.Random.date('yyyy-MM-dd') : undefined,
    status: Mock.Random.pick([PurchaseOrderStatus.PENDING, PurchaseOrderStatus.DELIVERING, PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.REJECTED]),
    defectiveQuantity: Mock.Random.boolean() ? Mock.Random.integer(0, 50) : undefined,
    remark: Mock.Random.boolean() ? Mock.Random.cparagraph(1) : undefined
  }
})

const customerOrderData: CustomerOrder[] = Array.from({ length: 40 }, (_, i) => {
  const itemCount = Mock.Random.integer(1, 5)
  const items = Array.from({ length: itemCount }, () => {
    const quantity = Mock.Random.integer(10, 200)
    const unitPrice = Mock.Random.float(3, 60, 1, 2)
    return {
      categoryId: Mock.Random.integer(11, 51),
      categoryName: Mock.Random.pick(["白菜", "萝卜", "苹果", "橙子", "猪肉", "鸡肉", "鲫鱼", "虾", "香菇"]),
      quantity,
      unit: Mock.Random.pick(["kg", "斤", "箱", "件"]),
      unitPrice,
      subtotal: quantity * unitPrice
    }
  })
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)
  return {
    id: i + 1,
    orderNo: `CO${Mock.Random.datetime('yyyyMMddHHmmss')}${Mock.Random.integer(100, 999)}`,
    customerName: `${Mock.Random.pick(["永辉超市", "沃尔玛", "家乐福", "社区团购", "便民店", "生鲜超市"])}${Mock.Random.integer(1, 10)}号店`,
    customerType: Mock.Random.pick([CustomerType.SUPERMARKET, CustomerType.STORE, CustomerType.GROUPBUY]),
    deliveryArea: Mock.Random.pick(["东城区", "西城区", "朝阳区", "海淀区", "丰台区"]),
    deliveryAddress: `${Mock.Random.county(true)}${Mock.Random.ctitle(5)}号`,
    contactPerson: Mock.Random.cname(),
    phone: Mock.Random.regexp(/^1[3-9]\d{9}$/),
    items,
    totalAmount,
    orderDate: Mock.Random.date('yyyy-MM-dd'),
    deliveryDate: Mock.Random.date('yyyy-MM-dd'),
    status: Mock.Random.pick([CustomerOrderStatus.PENDING, CustomerOrderStatus.PREPARING, CustomerOrderStatus.DELIVERING, CustomerOrderStatus.COMPLETED, CustomerOrderStatus.CANCELLED]),
    progress: Mock.Random.integer(0, 100),
    remark: Mock.Random.boolean() ? Mock.Random.cparagraph(1) : undefined
  }
})

Mock.mock('/api/categories', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: categoryData
  }
})

Mock.mock('/api/suppliers', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: supplierData
  }
})

Mock.mock('/api/purchase-orders', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: purchaseOrderData
  }
})

Mock.mock('/api/customer-orders', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: customerOrderData
  }
})

Mock.mock(/\/api\/category/, 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  data.id = Date.now()
  return {
    code: 200,
    message: 'success',
    data
  }
})

Mock.mock(/\/api\/supplier/, 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  data.id = Date.now()
  return {
    code: 200,
    message: 'success',
    data
  }
})

Mock.mock(/\/api\/purchase-order/, 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  data.id = Date.now()
  data.orderNo = `PO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 1000)}`
  return {
    code: 200,
    message: 'success',
    data
  }
})

Mock.mock(/\/api\/customer-order/, 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  data.id = Date.now()
  data.orderNo = `CO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 1000)}`
  return {
    code: 200,
    message: 'success',
    data
  }
})

Mock.mock(/\/api\/category\/\d+/, 'put', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    message: 'success',
    data
  }
})

Mock.mock(/\/api\/supplier\/\d+/, 'put', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    message: 'success',
    data
  }
})

Mock.mock(/\/api\/purchase-order\/\d+/, 'put', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    message: 'success',
    data
  }
})

Mock.mock(/\/api\/customer-order\/\d+/, 'put', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    message: 'success',
    data
  }
})

Mock.mock(/\/api\/category\/\d+/, 'delete', () => {
  return {
    code: 200,
    message: 'success',
    data: null
  }
})

Mock.mock(/\/api\/supplier\/\d+/, 'delete', () => {
  return {
    code: 200,
    message: 'success',
    data: null
  }
})
