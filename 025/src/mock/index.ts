import Mock from 'mockjs'
import type {
  Category,
  Product,
  InventoryRecord,
  OperationLog,
  PaginatedResponse,
  ApiResponse,
  FilterParams,
  PaginationParams,
  InventoryOperationType
} from '@/types'
import dayjs from 'dayjs'

const Random = Mock.Random

const categories: Category[] = [
  { id: '1', name: '零食', icon: '🍪', description: '各类休闲零食', sort: 1, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '2', name: '文具', icon: '✏️', description: '学习用品', sort: 2, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '3', name: '速食', icon: '🍜', description: '方便速食', sort: 3, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '4', name: '饮料', icon: '🥤', description: '各类饮品', sort: 4, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '5', name: '日用品', icon: '🧴', description: '日常用品', sort: 5, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' }
]

const productNames: Record<string, string[]> = {
  '1': ['薯片', '饼干', '巧克力', '坚果', '糖果', '辣条', '泡面伴侣', '海苔', '果冻', '牛肉干'],
  '2': ['笔记本', '中性笔', '钢笔', '铅笔', '橡皮', '尺子', '文件夹', '便利贴', '胶带', '订书机'],
  '3': ['泡面', '火腿肠', '面包', '三明治', '饭团', '寿司', '汉堡', '蛋挞', '烤肠', '关东煮'],
  '4': ['矿泉水', '可乐', '雪碧', '橙汁', '奶茶', '咖啡', '果汁', '牛奶', '酸奶', '啤酒'],
  '5': ['纸巾', '湿巾', '牙膏', '牙刷', '毛巾', '垃圾袋', '洗手液', '雨伞', '充电宝', '耳机']
}

const operationTypeTextMap: Record<InventoryOperationType, string> = {
  'in': '入库',
  'out': '出库',
  'sale': '售卖',
  'offline': '下架'
}

function calculateStatus(stock: number, minStock: number, expiryDate: string): Product['status'] {
  const now = dayjs()
  const expiry = dayjs(expiryDate)
  const daysToExpiry = expiry.diff(now, 'day')

  if (daysToExpiry <= 0) return 'expired'
  if (daysToExpiry <= 7) return 'expiring_soon'
  if (stock === 0) return 'out_of_stock'
  if (stock <= minStock) return 'low_stock'
  return 'normal'
}

function generateProducts(): Product[] {
  const products: Product[] = []
  for (let i = 0; i < 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const names = productNames[category.id]
    const name = names[Math.floor(Math.random() * names.length)]
    const stock = Random.integer(0, 200)
    const minStock = Random.integer(5, 20)
    const productionDate = dayjs().subtract(Random.integer(0, 180), 'day').format('YYYY-MM-DD')
    const shelfLifeDays = Random.integer(30, 365)
    const expiryDate = dayjs(productionDate).add(shelfLifeDays, 'day').format('YYYY-MM-DD')

    products.push({
      id: String(i + 1),
      name,
      categoryId: category.id,
      categoryName: category.name,
      barcode: Random.string('number', 13),
      price: Random.float(1, 100, 2, 2),
      costPrice: Random.float(0.5, 50, 2, 2),
      stock,
      minStock,
      unit: ['个', '包', '盒', '瓶', '件'][Random.integer(0, 4)],
      manufacturer: Random.ctitle(3, 8) + '有限公司',
      productionDate,
      shelfLifeDays,
      expiryDate,
      status: 'normal',
      description: Random.cparagraph(1, 3),
      image: `https://picsum.photos/200/200?random=${i}`,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })
  }

  return products.map((p: Product) => ({
    ...p,
    status: calculateStatus(p.stock, p.minStock, p.expiryDate)
  }))
}

function generateInventoryRecords(products: Product[]): InventoryRecord[] {
  const records: InventoryRecord[] = []
  const operationTypes: Array<{ type: InventoryOperationType; text: string }> = [
    { type: 'in', text: '入库' },
    { type: 'out', text: '出库' },
    { type: 'sale', text: '售卖' },
    { type: 'offline', text: '下架' }
  ]

  for (let i = 0; i < 100; i++) {
    const product = products[Math.floor(Math.random() * products.length)]
    const op = operationTypes[Math.floor(Math.random() * operationTypes.length)]
    const quantity = Random.integer(1, 50)
    const stockBefore = Random.integer(0, 200)
    const stockAfter = op.type === 'in' ? stockBefore + quantity : Math.max(0, stockBefore - quantity)

    records.push({
      id: String(i + 1),
      productId: product.id,
      productName: product.name,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      operationType: op.type,
      operationTypeText: op.text,
      quantity,
      stockBefore,
      stockAfter,
      operator: ['张三', '李四', '王五', '赵六'][Random.integer(0, 3)],
      remark: Random.paragraph(1, 2),
      createTime: dayjs().subtract(Random.integer(0, 30), 'day').format('YYYY-MM-DD HH:mm:ss')
    })
  }

  return records.sort((a: InventoryRecord, b: InventoryRecord) =>
    dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf()
  )
}

function generateOperationLogs(): OperationLog[] {
  const logs: OperationLog[] = []
  const operations: Array<{ type: OperationLog['operationType']; text: string; module: string }> = [
    { type: 'add', text: '新增', module: '商品管理' },
    { type: 'edit', text: '编辑', module: '商品管理' },
    { type: 'delete', text: '删除', module: '商品管理' },
    { type: 'add', text: '新增', module: '分类管理' },
    { type: 'edit', text: '编辑', module: '分类管理' },
    { type: 'delete', text: '删除', module: '分类管理' },
    { type: 'in_stock', text: '入库', module: '库存管理' },
    { type: 'out_stock', text: '出库', module: '库存管理' },
    { type: 'sale', text: '售卖', module: '库存管理' },
    { type: 'offline', text: '下架', module: '库存管理' }
  ]

  for (let i = 0; i < 100; i++) {
    const op = operations[Math.floor(Math.random() * operations.length)]
    logs.push({
      id: String(i + 1),
      operationType: op.type,
      operationTypeText: op.text,
      module: op.module,
      targetId: String(Random.integer(1, 50)),
      targetName: Random.ctitle(2, 6),
      operator: ['张三', '李四', '王五', '赵六'][Random.integer(0, 3)],
      detail: Random.cparagraph(1, 2),
      ip: Random.ip(),
      createTime: dayjs().subtract(Random.integer(0, 30), 'day').format('YYYY-MM-DD HH:mm:ss')
    })
  }

  return logs.sort((a: OperationLog, b: OperationLog) =>
    dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf()
  )
}

let mockProducts = generateProducts()
let mockCategories = [...categories]
let mockInventoryRecords = generateInventoryRecords(mockProducts)
let mockOperationLogs = generateOperationLogs()

function successResponse<T>(data: T): ApiResponse<T> {
  return {
    code: 200,
    message: 'success',
    data
  }
}

function errorResponse(message: string, code: number = 400): ApiResponse<null> {
  return {
    code,
    message,
    data: null
  }
}

function paginate<T>(list: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    list: list.slice(start, end),
    total: list.length,
    page,
    pageSize
  }
}

Mock.mock(/\/api\/categories/, 'get', () => {
  return successResponse(mockCategories)
})

Mock.mock(/\/api\/categories\/add/, 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body) as Omit<Category, 'id' | 'createTime' | 'updateTime'>
  const newCategory: Category = {
    ...data,
    id: String(mockCategories.length + 1),
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  mockCategories.push(newCategory)
  return successResponse(newCategory)
})

Mock.mock(/\/api\/categories\/edit/, 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body) as Category
  const index = mockCategories.findIndex((c: Category) => c.id === data.id)
  if (index !== -1) {
    mockCategories[index] = {
      ...mockCategories[index],
      ...data,
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    return successResponse(mockCategories[index])
  }
  return errorResponse('分类不存在', 404)
})

Mock.mock(/\/api\/categories\/delete/, 'post', (options: { body: string }) => {
  const { id } = JSON.parse(options.body) as { id: string }
  const index = mockCategories.findIndex((c: Category) => c.id === id)
  if (index !== -1) {
    mockCategories.splice(index, 1)
    return successResponse(true)
  }
  return errorResponse('分类不存在', 404)
})

Mock.mock(/\/api\/products\/list/, 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body) as { filterParams: FilterParams; pagination: PaginationParams }
  const { filterParams, pagination } = body
  let filtered = [...mockProducts]

  if (filterParams) {
    if (filterParams.keyword) {
      const kw = filterParams.keyword.toLowerCase()
      filtered = filtered.filter((p: Product) =>
        p.name.toLowerCase().includes(kw) ||
        p.barcode.includes(kw)
      )
    }
    if (filterParams.categoryId) {
      filtered = filtered.filter((p: Product) => p.categoryId === filterParams.categoryId)
    }
    if (filterParams.status) {
      filtered = filtered.filter((p: Product) => p.status === filterParams.status)
    }
    if (filterParams.stockStatus) {
      filtered = filtered.filter((p: Product) => {
        if (filterParams.stockStatus === 'normal') return p.stock > p.minStock
        if (filterParams.stockStatus === 'low') return p.stock > 0 && p.stock <= p.minStock
        if (filterParams.stockStatus === 'out') return p.stock === 0
        return true
      })
    }
    if (filterParams.expiryStatus) {
      const now = dayjs()
      filtered = filtered.filter((p: Product) => {
        const expiry = dayjs(p.expiryDate)
        const days = expiry.diff(now, 'day')
        if (filterParams.expiryStatus === 'expired') return days <= 0
        if (filterParams.expiryStatus === 'warning') return days > 0 && days <= 7
        if (filterParams.expiryStatus === 'normal') return days > 7
        return true
      })
    }
  }

  return successResponse(paginate(filtered, pagination?.page || 1, pagination?.pageSize || 10))
})

Mock.mock(/\/api\/products\/add/, 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body) as Omit<Product, 'id' | 'createTime' | 'updateTime' | 'status'>
  const category = mockCategories.find((c: Category) => c.id === data.categoryId)
  const newProduct: Product = {
    ...data,
    id: String(mockProducts.length + 1),
    categoryName: category?.name || '',
    status: calculateStatus(data.stock, data.minStock, data.expiryDate),
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  mockProducts.push(newProduct)
  return successResponse(newProduct)
})

Mock.mock(/\/api\/products\/edit/, 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body) as Product
  const index = mockProducts.findIndex((p: Product) => p.id === data.id)
  if (index !== -1) {
    const category = mockCategories.find((c: Category) => c.id === data.categoryId)
    mockProducts[index] = {
      ...mockProducts[index],
      ...data,
      categoryName: category?.name || '',
      status: calculateStatus(data.stock, data.minStock, data.expiryDate),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    return successResponse(mockProducts[index])
  }
  return errorResponse('商品不存在', 404)
})

Mock.mock(/\/api\/products\/delete/, 'post', (options: { body: string }) => {
  const { id } = JSON.parse(options.body) as { id: string }
  const index = mockProducts.findIndex((p: Product) => p.id === id)
  if (index !== -1) {
    mockProducts.splice(index, 1)
    return successResponse(true)
  }
  return errorResponse('商品不存在', 404)
})

interface InventoryRecordsRequest {
  pagination: PaginationParams
  productId?: string
  operationType?: string
  startTime?: string
  endTime?: string
}

Mock.mock(/\/api\/inventory\/records/, 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body) as InventoryRecordsRequest
  const { pagination, productId, operationType, startTime, endTime } = body
  let filtered = [...mockInventoryRecords]

  if (productId) {
    filtered = filtered.filter((r: InventoryRecord) => r.productId === productId)
  }
  if (operationType) {
    filtered = filtered.filter((r: InventoryRecord) => r.operationType === operationType)
  }
  if (startTime) {
    filtered = filtered.filter((r: InventoryRecord) => dayjs(r.createTime) >= dayjs(startTime))
  }
  if (endTime) {
    filtered = filtered.filter((r: InventoryRecord) => dayjs(r.createTime) <= dayjs(endTime))
  }

  return successResponse(paginate(filtered, pagination?.page || 1, pagination?.pageSize || 10))
})

Mock.mock(/\/api\/inventory\/operation/, 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body) as {
    productId: string
    operationType: InventoryOperationType
    quantity: number
    operator: string
    remark: string
  }

  const productIndex = mockProducts.findIndex((p: Product) => p.id === data.productId)
  if (productIndex === -1) {
    return errorResponse('商品不存在', 404)
  }

  const product = mockProducts[productIndex]
  const stockBefore = product.stock

  if (data.quantity <= 0) {
    return errorResponse('操作数量必须大于0', 400)
  }

  let stockAfter = stockBefore

  if (data.operationType === 'in') {
    stockAfter = stockBefore + data.quantity
  } else if (['out', 'sale', 'offline'].includes(data.operationType)) {
    if (stockBefore < data.quantity) {
      return errorResponse(`库存不足，当前库存: ${stockBefore}`, 400)
    }
    stockAfter = stockBefore - data.quantity
  }

  mockProducts[productIndex] = {
    ...product,
    stock: stockAfter,
    status: calculateStatus(stockAfter, product.minStock, product.expiryDate),
    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }

  const record: InventoryRecord = {
    id: String(mockInventoryRecords.length + 1),
    productId: product.id,
    productName: product.name,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    operationType: data.operationType,
    operationTypeText: operationTypeTextMap[data.operationType],
    quantity: data.quantity,
    stockBefore,
    stockAfter,
    operator: data.operator,
    remark: data.remark,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }

  mockInventoryRecords.unshift(record)

  return successResponse(record)
})

interface LogsRequest {
  pagination: PaginationParams
  operator?: string
  operationType?: string
  startTime?: string
  endTime?: string
}

Mock.mock(/\/api\/logs\/list/, 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body) as LogsRequest
  const { pagination, operator, operationType, startTime, endTime } = body
  let filtered = [...mockOperationLogs]

  if (operator) {
    filtered = filtered.filter((l: OperationLog) => l.operator === operator)
  }
  if (operationType) {
    filtered = filtered.filter((l: OperationLog) => l.operationType === operationType)
  }
  if (startTime) {
    filtered = filtered.filter((l: OperationLog) => dayjs(l.createTime) >= dayjs(startTime))
  }
  if (endTime) {
    filtered = filtered.filter((l: OperationLog) => dayjs(l.createTime) <= dayjs(endTime))
  }

  return successResponse(paginate(filtered, pagination?.page || 1, pagination?.pageSize || 10))
})

Mock.mock(/\/api\/logs\/add/, 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body) as Omit<OperationLog, 'id' | 'createTime'>
  const log: OperationLog = {
    ...data,
    id: String(mockOperationLogs.length + 1),
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  mockOperationLogs.unshift(log)
  return successResponse(log)
})

Mock.mock(/\/api\/stats/, 'get', () => {
  const now = dayjs()
  const stats = {
    totalProducts: mockProducts.length,
    totalStock: mockProducts.reduce((sum: number, p: Product) => sum + p.stock, 0),
    lowStockCount: mockProducts.filter((p: Product) => p.stock > 0 && p.stock <= p.minStock).length,
    expiringCount: mockProducts.filter((p: Product) => {
      const expiry = dayjs(p.expiryDate)
      const days = expiry.diff(now, 'day')
      return days > 0 && days <= 7
    }).length,
    expiredCount: mockProducts.filter((p: Product) => dayjs(p.expiryDate) <= now).length
  }
  return successResponse(stats)
})

export default Mock
