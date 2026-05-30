import Mock from 'mockjs'
import type { DeviceInventory, InventoryStatus } from '@/types'

const houseTypes = ['一室一厅', '两室一厅', '三室一厅', '三室两厅', '四室两厅', '别墅']

const inventories: DeviceInventory[] = Mock.mock({
  'list|30': [
    {
      id: () => Mock.Random.id(),
      'categoryId|1': ['1-1', '1-2', '2-1', '2-2', '3-1', '4-1', '5-1'],
      categoryName() {
        const map: Record<string, string> = {
          '1-1': '智能灯泡', '1-2': '智能灯带',
          '2-1': '智能摄像头', '2-2': '智能门锁',
          '3-1': '智能音箱', '4-1': '智能油烟机', '5-1': '智能空调'
        }
        return map[this.categoryId]
      },
      model: () => `${Mock.Random.word(3).toUpperCase()}-${Mock.Random.natural(100, 999)}`,
      specs: () => `${Mock.Random.pick(['RGB', 'WiFi', '蓝牙', '4K', '1080P', '智能'])} ${Mock.Random.natural(10, 100)}W`,
      houseType: () => Mock.Random.pick(houseTypes),
      purchasePrice: () => Mock.Random.natural(100, 2000),
      retailPrice() { return Math.floor(this.purchasePrice * Mock.Random.float(1.5, 2.5)) },
      stock: () => Mock.Random.natural(0, 500),
      warningThreshold: () => Mock.Random.natural(10, 50),
      status: () => Mock.Random.pick(['on_sale', 'off_sale']) as InventoryStatus,
      createTime: () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updateTime: () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
  ]
}).list

Mock.mock(/\/api\/inventory\??/, 'get', (options: { url: string }) => {
  const urlParams = new URLSearchParams(options.url.split('?')[1])
  const categoryId = urlParams.get('categoryId')
  const model = urlParams.get('model')
  const specs = urlParams.get('specs')
  const houseType = urlParams.get('houseType')
  const status = urlParams.get('status')
  const minStock = urlParams.get('minStock')
  const maxStock = urlParams.get('maxStock')
  const page = parseInt(urlParams.get('page') || '1')
  const pageSize = parseInt(urlParams.get('pageSize') || '10')
  
  let result = [...inventories]
  
  if (categoryId) {
    result = result.filter(i => i.categoryId === categoryId)
  }
  if (model) {
    result = result.filter(i => i.model.toLowerCase().includes(model.toLowerCase()))
  }
  if (specs) {
    result = result.filter(i => i.specs.toLowerCase().includes(specs.toLowerCase()))
  }
  if (houseType) {
    result = result.filter(i => i.houseType === houseType)
  }
  if (status) {
    result = result.filter(i => i.status === status)
  }
  if (minStock) {
    result = result.filter(i => i.stock >= parseInt(minStock))
  }
  if (maxStock) {
    result = result.filter(i => i.stock <= parseInt(maxStock))
  }
  
  const total = result.length
  const start = (page - 1) * pageSize
  const list = result.slice(start, start + pageSize)
  
  return {
    code: 200,
    message: 'success',
    data: {
      list,
      total,
      page,
      pageSize
    }
  }
})

Mock.mock('/api/inventory/spec-options', 'get', () => {
  const specOptions = new Set<string>()
  const houseTypeOptions = new Set<string>()
  
  inventories.forEach(item => {
    specOptions.add(item.specs.split(' ')[0])
    houseTypeOptions.add(item.houseType)
  })
  
  return {
    code: 200,
    message: 'success',
    data: {
      specOptions: Array.from(specOptions).map(s => ({ label: s, value: s })),
      houseTypeOptions: Array.from(houseTypeOptions).map(h => ({ label: h, value: h }))
    }
  }
})

Mock.mock('/api/inventory', 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body) as DeviceInventory
  
  const newItem: DeviceInventory = {
    id: Mock.Random.id(),
    ...data,
    createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
  inventories.unshift(newItem)
  
  return {
    code: 200,
    message: '添加成功',
    data: newItem
  }
})

Mock.mock(/\/api\/inventory\/\w+/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/').pop()
  const data = JSON.parse(options.body) as DeviceInventory
  const index = inventories.findIndex(i => i.id === id)
  
  if (index === -1) {
    return { code: 404, message: '设备不存在', data: null }
  }
  
  inventories[index] = {
    ...inventories[index],
    ...data,
    updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
  
  return {
    code: 200,
    message: '更新成功',
    data: inventories[index]
  }
})

Mock.mock(/\/api\/inventory\/\w+/, 'delete', (options: { url: string }) => {
  const id = options.url.split('/').pop()
  const index = inventories.findIndex(i => i.id === id)
  
  if (index === -1) {
    return { code: 404, message: '设备不存在', data: null }
  }
  
  inventories.splice(index, 1)
  
  return {
    code: 200,
    message: '删除成功',
    data: null
  }
})

Mock.mock(/\/api\/inventory\/\w+\/stock/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/').slice(-2)[0]
  const data = JSON.parse(options.body) as { stock: number }
  const index = inventories.findIndex(i => i.id === id)
  
  if (index === -1) {
    return { code: 404, message: '设备不存在', data: null }
  }
  
  inventories[index].stock = data.stock
  inventories[index].updateTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  
  return {
    code: 200,
    message: '库存更新成功',
    data: inventories[index]
  }
})

Mock.mock(/\/api\/inventory\/\w+\/toggle-status/, 'post', (options: { url: string }) => {
  const id = options.url.split('/').slice(-2)[0]
  const index = inventories.findIndex(i => i.id === id)
  
  if (index === -1) {
    return { code: 404, message: '设备不存在', data: null }
  }
  
  inventories[index].status = inventories[index].status === 'on_sale' ? 'off_sale' : 'on_sale'
  inventories[index].updateTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  
  return {
    code: 200,
    message: '状态更新成功',
    data: inventories[index]
  }
})
