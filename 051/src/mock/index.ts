import Mock from 'mockjs'
import type { WineBrand, Supplier, PurchaseOrder, Inventory, SaleOrder } from '@/types'
import { WineCategory, CooperationLevel, SettlementMethod, PurchaseType, PurchaseStatus, SaleType } from '@/types'

const Random = Mock.Random

const generateWineBrands = (): WineBrand[] => {
  const categories = Object.values(WineCategory)
  const levels = ['AOC', 'DOCG', 'VDP', '特级', '一级', '优级']
  const origins = ['法国波尔多', '法国勃艮第', '意大利托斯卡纳', '智利中央山谷', '澳洲巴罗萨', '苏格兰', '墨西哥', '贵州茅台镇', '四川宜宾', '比利时', '美国精酿']

  return Mock.mock({
    'list|20': [{
      'id': '@guid',
      'name': () => Random.pick(['拉菲酒庄', '拉图酒庄', '木桐酒庄', '白马酒庄', '芝华士', '尊尼获加', '百威精酿', '茅台', '五粮液', '泸州老窖', '洋河', ' Guinness', '科罗娜']),
      'category': () => Random.pick(categories),
      'origin': () => Random.pick(origins),
      'alcoholContent': () => Random.float(5, 60, 1, 1),
      'vintage?': () => Random.integer(2010, 2023),
      'level': () => Random.pick(levels),
      'status': () => Random.pick(['active', 'inactive']),
      'createTime': '@datetime'
    }]
  }).list
}

const generateSuppliers = (): Supplier[] => {
  const levels = Object.values(CooperationLevel)
  const methods = Object.values(SettlementMethod)

  return Mock.mock({
    'list|15': [{
      'id': '@guid',
      'name': () => Random.pick(['北京国际酒业', '上海名酒商贸', '广州洋酒总汇', '深圳啤酒王国', '成都白酒批发', '杭州进口酒庄']),
      'contactPerson': '@cname',
      'phone': /^1[3-9]\d{9}$/,
      'address': '@county(true)',
      'channel': () => Random.pick(['厂家直供', '一级代理', '二级代理', '进口直采']),
      'cooperationLevel': () => Random.pick(levels),
      'supplyCycle': () => Random.integer(7, 60),
      'settlementMethod': () => Random.pick(methods),
      'cooperationStartDate': '@date',
      'cooperationEndDate?': '@date',
      'status': () => Random.pick(['active', 'inactive']),
      'createTime': '@datetime'
    }]
  }).list
}

const generatePurchaseOrders = (): PurchaseOrder[] => {
  const wineBrands = generateWineBrands()
  const suppliers = generateSuppliers()
  const types = Object.values(PurchaseType)
  const statuses = Object.values(PurchaseStatus)

  return Mock.mock({
    'list|12': [{
      'id': '@guid',
      'orderNo': () => `PO${Random.integer(10000, 99999)}`,
      'supplierId': () => Random.pick(suppliers).id,
      'supplierName': () => Random.pick(suppliers).name,
      'type': () => Random.pick(types),
      'batchNo': () => `B${Random.integer(1000, 9999)}`,
      'items|1-5': [{
        'wineBrandId': () => Random.pick(wineBrands).id,
        'wineBrandName': () => Random.pick(wineBrands).name,
        'quantity': () => Random.integer(10, 200),
        'unitPrice': () => Random.float(50, 5000, 2, 2)
      }],
      'totalAmount': function() { return this.items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice, 0) },
      'status': () => Random.pick(statuses),
      'auditor?': '@cname',
      'auditTime?': '@datetime',
      'rejectReason?': () => Random.pick(['商品信息不符', '价格异常', '其他']),
      'createTime': '@datetime'
    }]
  }).list
}

const generateInventory = (): Inventory[] => {
  const wineBrands = generateWineBrands()
  const categories = Object.values(WineCategory)

  return Mock.mock({
    'list|30': [{
      'id': '@guid',
      'wineBrandId': () => Random.pick(wineBrands).id,
      'wineBrandName': () => Random.pick(wineBrands).name,
      'category': () => Random.pick(categories),
      'quantity': () => Random.integer(0, 500),
      'warningQuantity': () => Random.integer(20, 50),
      'batchNo': () => `B${Random.integer(1000, 9999)}`,
      'productionDate': '@date',
      'expiryDate': '@date',
      'unitPrice': () => Random.float(50, 5000, 2, 2),
      'createTime': '@datetime'
    }]
  }).list
}

const generateSaleOrders = (): SaleOrder[] => {
  const wineBrands = generateWineBrands()
  const types = Object.values(SaleType)

  return Mock.mock({
    'list|10': [{
      'id': '@guid',
      'orderNo': () => `SO${Random.integer(10000, 99999)}`,
      'customerName': '@cname',
      'customerPhone': /^1[3-9]\d{9}$/,
      'type': () => Random.pick(types),
      'items|1-8': [{
        'wineBrandId': () => Random.pick(wineBrands).id,
        'wineBrandName': () => Random.pick(wineBrands).name,
        'quantity': () => Random.integer(1, 50),
        'unitPrice': () => Random.float(50, 5000, 2, 2)
      }],
      'totalAmount': function() { return this.items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice, 0) },
      'createTime': '@datetime'
    }]
  }).list
}

Mock.mock('/api/wine-brands', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: generateWineBrands()
  }
})

Mock.mock('/api/suppliers', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: generateSuppliers()
  }
})

Mock.mock('/api/purchase-orders', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: generatePurchaseOrders()
  }
})

Mock.mock('/api/inventory', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: generateInventory()
  }
})

Mock.mock('/api/sale-orders', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: generateSaleOrders()
  }
})

Mock.mock(RegExp('/api/wine-brands/.*'), 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    message: 'success',
    data: { id: Random.guid(), ...data, createTime: new Date().toISOString() }
  }
})

Mock.mock(RegExp('/api/suppliers/.*'), 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    message: 'success',
    data: { id: Random.guid(), ...data, createTime: new Date().toISOString() }
  }
})

Mock.mock(RegExp('/api/purchase-orders/.*'), 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    message: 'success',
    data: { id: Random.guid(), ...data, createTime: new Date().toISOString() }
  }
})

Mock.mock(RegExp('/api/sale-orders/.*'), 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    message: 'success',
    data: { id: Random.guid(), ...data, createTime: new Date().toISOString() }
  }
})
