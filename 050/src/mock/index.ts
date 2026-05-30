import Mock from 'mockjs'
import type { Customer, ProductCategory, CustomsDeclaration, FeeSettlement } from '@/types'

const generateId = () => Mock.Random.guid()

const mockCustomers: Customer[] = Mock.mock({
  'list|20': [
    {
      id: generateId,
      name: '@ctitle(5, 10)外贸公司',
      creditCode: /^[0-9A-Z]{18}$/,
      qualification: '@pick(["进出口经营权", "一般纳税人资质", "AEO认证", "保税物流资质"])',
      contractStatus: '@pick(["signed", "pending", "expired"])',
      validStart: '@date("2023-01-01", "2024-01-01")',
      validEnd: '@date("2024-06-01", "2026-12-31")',
      contact: '@cname',
      phone: /^1[3-9]\d{9}$/,
      address: '@county(true)',
      status: '@pick(["active", "inactive"])',
      createTime: '@datetime("2024-01-01 HH:mm:ss", "2024-12-31 HH:mm:ss")'
    }
  ]
}).list

const categories = ['机电产品', '化工产品', '纺织服装', '食品饮料', '电子产品', '机械设备']
const mockProducts: ProductCategory[] = categories.map((name, index) => ({
  id: generateId(),
  name,
  code: `CAT${String(index + 1).padStart(3, '0')}`,
  parentId: null,
  declarationElements: ['品名', '规格型号', '品牌', '用途', '材质'],
  supervisionConditions: ['A', 'B', 'M', 'N'].slice(0, Math.floor(Math.random() * 4) + 1),
  taxNature: '一般征税',
  status: index < 4 ? 'active' : 'inactive',
  sort: index + 1,
  createTime: Mock.Random.datetime()
}))

const declarationStatuses: CustomsDeclaration['status'][] = ['draft', 'submitted', 'reviewing', 'inspecting', 'released', 'completed', 'rejected']
const mockDeclarations: CustomsDeclaration[] = Mock.mock({
  'list|30': [
    {
      id: generateId,
      declarationNo: () => `BG${Mock.Random.date('yyyyMMdd')}${Mock.Random.string('number', 6)}`,
      customerId: () => mockCustomers[Mock.Random.integer(0, mockCustomers.length - 1)].id,
      customerName: () => mockCustomers[Mock.Random.integer(0, mockCustomers.length - 1)].name,
      productCategory: () => categories[Mock.Random.integer(0, categories.length - 1)],
      productName: '@ctitle(3, 8)',
      productCode: /^[0-9]{8}$/,
      quantity: '@integer(10, 1000)',
      unit: '@pick(["件", "箱", "吨", "千克", "台"])',
      amount: '@float(1000, 100000, 2, 2)',
      currency: '@pick(["CNY", "USD", "EUR"])',
      status: () => declarationStatuses[Mock.Random.integer(0, declarationStatuses.length - 1)],
      currentStep: function() {
        const idx = declarationStatuses.indexOf(this.status)
        return idx < 0 ? 0 : idx + 1
      },
      createTime: '@datetime("2024-01-01 HH:mm:ss", "2024-12-31 HH:mm:ss")',
      submitTime: function() {
        return this.status !== 'draft' ? Mock.Random.datetime(this.createTime, '2024-12-31 HH:mm:ss') : undefined
      },
      completeTime: function() {
        return this.status === 'completed' ? Mock.Random.datetime(this.submitTime, '2024-12-31 HH:mm:ss') : undefined
      },
      operator: '@cname'
    }
  ]
}).list

const mockSettlements: FeeSettlement[] = Mock.mock({
  'list|15': [
    {
      id: generateId,
      settlementNo: () => `JS${Mock.Random.date('yyyyMM')}${Mock.Random.string('number', 4)}`,
      customerId: () => mockCustomers[Mock.Random.integer(0, mockCustomers.length - 1)].id,
      customerName: () => mockCustomers[Mock.Random.integer(0, mockCustomers.length - 1)].name,
      month: '@date("2024-01", "2024-12")',
      serviceFee: '@float(500, 5000, 2, 2)',
      portFee: '@float(1000, 10000, 2, 2)',
      taxFee: '@float(2000, 50000, 2, 2)',
      totalAmount: function() {
        return this.serviceFee + this.portFee + this.taxFee
      },
      status: '@pick(["pending", "settled"])',
      createTime: '@datetime("2024-01-01 HH:mm:ss", "2024-12-31 HH:mm:ss")',
      settleTime: function() {
        return this.status === 'settled' ? Mock.Random.datetime(this.createTime, '2024-12-31 HH:mm:ss') : undefined
      },
      operator: '@cname'
    }
  ]
}).list

Mock.setup({
  timeout: '200-500'
})

Mock.mock(/\/api\/customers/, 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: mockCustomers.slice(start, end),
      total: mockCustomers.length,
      page,
      pageSize
    }
  }
})

Mock.mock(/\/api\/customers\/expiring/, 'get', () => {
  const now = new Date()
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  const expiring = mockCustomers.filter(c => {
    const endDate = new Date(c.validEnd)
    return endDate >= now && endDate <= thirtyDaysLater && c.status === 'active'
  })
  
  return {
    code: 200,
    message: 'success',
    data: expiring
  }
})

Mock.mock(/\/api\/customers/, 'post', (options: { body: string }) => {
  const customer = JSON.parse(options.body) as Customer
  customer.id = generateId()
  customer.createTime = Mock.Random.datetime()
  mockCustomers.unshift(customer)
  
  return {
    code: 200,
    message: 'success',
    data: customer
  }
})

Mock.mock(/\/api\/customers\/(.+)/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.match(/\/api\/customers\/(.+)/)?.[1]
  const data = JSON.parse(options.body) as Partial<Customer>
  const index = mockCustomers.findIndex(c => c.id === id)
  
  if (index !== -1) {
    mockCustomers[index] = { ...mockCustomers[index], ...data }
  }
  
  return {
    code: 200,
    message: 'success',
    data: mockCustomers[index]
  }
})

Mock.mock(/\/api\/customers\/(.+)/, 'delete', (options: { url: string }) => {
  const id = options.url.match(/\/api\/customers\/(.+)/)?.[1]
  const index = mockCustomers.findIndex(c => c.id === id)
  
  if (index !== -1) {
    mockCustomers.splice(index, 1)
  }
  
  return {
    code: 200,
    message: 'success'
  }
})

Mock.mock(/\/api\/products/, 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
  const status = url.searchParams.get('status')
  const name = url.searchParams.get('name')
  
  let filtered = [...mockProducts]
  if (status) {
    filtered = filtered.filter(p => p.status === status)
  }
  if (name) {
    filtered = filtered.filter(p => p.name.includes(name))
  }
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize
    }
  }
})

Mock.mock(/\/api\/products/, 'post', (options: { body: string }) => {
  const product = JSON.parse(options.body) as ProductCategory
  product.id = generateId()
  product.createTime = Mock.Random.datetime()
  mockProducts.unshift(product)
  
  return {
    code: 200,
    message: 'success',
    data: product
  }
})

Mock.mock(/\/api\/products\/(.+)/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.match(/\/api\/products\/(.+)/)?.[1]
  const data = JSON.parse(options.body) as Partial<ProductCategory>
  const index = mockProducts.findIndex(p => p.id === id)
  
  if (index !== -1) {
    mockProducts[index] = { ...mockProducts[index], ...data }
  }
  
  return {
    code: 200,
    message: 'success',
    data: mockProducts[index]
  }
})

Mock.mock(/\/api\/products\/(.+)/, 'delete', (options: { url: string }) => {
  const id = options.url.match(/\/api\/products\/(.+)/)?.[1]
  const index = mockProducts.findIndex(p => p.id === id)
  
  if (index !== -1) {
    mockProducts.splice(index, 1)
  }
  
  return {
    code: 200,
    message: 'success'
  }
})

Mock.mock(/\/api\/declarations/, 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
  const declarationNo = url.searchParams.get('declarationNo')
  const customerName = url.searchParams.get('customerName')
  const status = url.searchParams.get('status')
  const productCategory = url.searchParams.get('productCategory')
  
  let filtered = [...mockDeclarations]
  if (declarationNo) {
    filtered = filtered.filter(d => d.declarationNo.includes(declarationNo))
  }
  if (customerName) {
    filtered = filtered.filter(d => d.customerName.includes(customerName))
  }
  if (status) {
    filtered = filtered.filter(d => d.status === status)
  }
  if (productCategory) {
    filtered = filtered.filter(d => d.productCategory === productCategory)
  }
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize
    }
  }
})

Mock.mock(/\/api\/declarations\/statistics/, 'get', () => {
  const stats = {
    total: mockDeclarations.length,
    draft: mockDeclarations.filter(d => d.status === 'draft').length,
    reviewing: mockDeclarations.filter(d => ['submitted', 'reviewing', 'inspecting'].includes(d.status)).length,
    completed: mockDeclarations.filter(d => d.status === 'completed').length
  }
  
  return {
    code: 200,
    message: 'success',
    data: stats
  }
})

Mock.mock(/\/api\/declarations\/(.+)/, 'get', (options: { url: string }) => {
  const id = options.url.match(/\/api\/declarations\/(.+)/)?.[1]
  const declaration = mockDeclarations.find(d => d.id === id)
  
  return {
    code: 200,
    message: 'success',
    data: declaration
  }
})

Mock.mock(/\/api\/declarations/, 'post', (options: { body: string }) => {
  const declaration = JSON.parse(options.body) as CustomsDeclaration
  declaration.id = generateId()
  declaration.createTime = Mock.Random.datetime()
  mockDeclarations.unshift(declaration)
  
  return {
    code: 200,
    message: 'success',
    data: declaration
  }
})

Mock.mock(/\/api\/declarations\/(.+)/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.match(/\/api\/declarations\/(.+)/)?.[1]
  const data = JSON.parse(options.body) as Partial<CustomsDeclaration>
  const index = mockDeclarations.findIndex(d => d.id === id)
  
  if (index !== -1) {
    mockDeclarations[index] = { ...mockDeclarations[index], ...data }
  }
  
  return {
    code: 200,
    message: 'success',
    data: mockDeclarations[index]
  }
})

Mock.mock(/\/api\/settlements/, 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
  const settlementNo = url.searchParams.get('settlementNo')
  const customerName = url.searchParams.get('customerName')
  const month = url.searchParams.get('month')
  const status = url.searchParams.get('status')
  const minAmount = url.searchParams.get('minAmount')
  const maxAmount = url.searchParams.get('maxAmount')
  
  let filtered = [...mockSettlements]
  if (settlementNo) {
    filtered = filtered.filter(s => s.settlementNo.includes(settlementNo))
  }
  if (customerName) {
    filtered = filtered.filter(s => s.customerName.includes(customerName))
  }
  if (month) {
    filtered = filtered.filter(s => s.month.startsWith(month))
  }
  if (status) {
    filtered = filtered.filter(s => s.status === status)
  }
  if (minAmount) {
    filtered = filtered.filter(s => s.totalAmount >= parseFloat(minAmount))
  }
  if (maxAmount) {
    filtered = filtered.filter(s => s.totalAmount <= parseFloat(maxAmount))
  }
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize
    }
  }
})

Mock.mock(/\/api\/settlements\/statistics/, 'get', () => {
  const pending = mockSettlements.filter(s => s.status === 'pending')
  const settled = mockSettlements.filter(s => s.status === 'settled')
  
  const stats = {
    total: mockSettlements.length,
    pendingCount: pending.length,
    settledCount: settled.length,
    pendingAmount: pending.reduce((sum, s) => sum + s.totalAmount, 0),
    settledAmount: settled.reduce((sum, s) => sum + s.totalAmount, 0),
    totalAmount: mockSettlements.reduce((sum, s) => sum + s.totalAmount, 0)
  }
  
  return {
    code: 200,
    message: 'success',
    data: stats
  }
})

Mock.mock(/\/api\/settlements/, 'post', (options: { body: string }) => {
  const settlement = JSON.parse(options.body) as FeeSettlement
  settlement.id = generateId()
  settlement.createTime = Mock.Random.datetime()
  mockSettlements.unshift(settlement)
  
  return {
    code: 200,
    message: 'success',
    data: settlement
  }
})

Mock.mock(/\/api\/settlements\/(.+)/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.match(/\/api\/settlements\/(.+)/)?.[1]
  const data = JSON.parse(options.body) as Partial<FeeSettlement>
  const index = mockSettlements.findIndex(s => s.id === id)
  
  if (index !== -1) {
    mockSettlements[index] = { ...mockSettlements[index], ...data }
  }
  
  return {
    code: 200,
    message: 'success',
    data: mockSettlements[index]
  }
})
