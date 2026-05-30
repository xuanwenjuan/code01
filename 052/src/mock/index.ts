import Mock from 'mockjs'
import type { Material, Designer, Order, Contract, ContractItem } from '@/types'

const Random = Mock.Random

const generateMaterials = (): Material[] => {
  const categories: Material['category'][] = ['furniture', 'curtain', 'lighting', 'carpet', 'decoration']
  const styleTags = ['现代简约', '北欧风格', '中式古典', '欧式奢华', '工业风', '日式禅意']
  const names: Record<string, string[]> = {
    furniture: ['实木沙发', '真皮床', '餐桌椅组合', '书柜', '电视柜'],
    curtain: ['遮光窗帘', '纱帘', '罗马帘', '百叶窗', '布艺窗帘'],
    lighting: ['吊灯', '台灯', '落地灯', '壁灯', '吸顶灯'],
    carpet: ['客厅地毯', '卧室地毯', '玄关地垫', '飘窗垫', '儿童地毯'],
    decoration: ['装饰画', '花瓶花艺', '摆件', '钟表', '墙面装饰']
  }
  
  const materials: Material[] = []
  for (let i = 0; i < 20; i++) {
    const category = Random.pick(categories)
    materials.push({
      id: Random.id(),
      name: Random.pick(names[category]),
      category,
      specs: Random.pick(['L120*W60*H70cm', 'D80*H150cm', 'W150*H200cm', '标准尺寸']),
      styleTags: Random.shuffle(styleTags).slice(0, Random.integer(1, 3)),
      price: Random.integer(100, 10000),
      status: Random.pick(['on', 'off']),
      imageUrl: Random.dataImage('200x200', '软装素材'),
      createTime: Random.datetime(),
      updateTime: Random.datetime()
    })
  }
  return materials
}

const generateDesigners = (): Designer[] => {
  const styles = ['现代简约', '北欧风格', '中式古典', '欧式奢华', '工业风', '日式禅意', '轻奢风格']
  const statuses: Designer['status'][] = ['on', 'off', 'leave']
  const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴']
  const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋']
  
  const designers: Designer[] = []
  for (let i = 0; i < 15; i++) {
    designers.push({
      id: Random.id(),
      name: Random.pick(firstNames) + Random.pick(lastNames),
      phone: '1' + Random.integer(3, 9) + Random.integer(100000000, 999999999).toString(),
      email: Random.email(),
      avatar: Random.dataImage('100x100', '设计师头像'),
      specialtyStyles: Random.shuffle(styles).slice(0, Random.integer(1, 3)),
      status: Random.pick(statuses),
      works: Random.shuffle(['现代简约客厅', '北欧卧室', '中式书房', '轻奢餐厅']).slice(0, Random.integer(1, 3)),
      createTime: Random.datetime(),
      updateTime: Random.datetime()
    })
  }
  return designers
}

const generateOrders = (): Order[] => {
  const houseTypes = ['一室一厅', '两室一厅', '三室一厅', '三室两厅', '四室两厅', '别墅']
  const styles = ['现代简约', '北欧风格', '中式古典', '欧式奢华', '工业风', '日式禅意', '轻奢风格']
  const statuses: Order['status'][] = ['pending', 'assigned', 'designing', 'completed', 'deal']
  const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴']
  const lastNames = ['先生', '女士']
  
  const orders: Order[] = []
  for (let i = 0; i < 25; i++) {
    orders.push({
      id: Random.id(),
      orderNo: 'ORD' + Random.integer(10000000, 99999999),
      customerName: Random.pick(firstNames) + Random.pick(lastNames),
      customerPhone: '1' + Random.integer(3, 9) + Random.integer(100000000, 999999999).toString(),
      style: Random.pick(styles),
      houseType: Random.pick(houseTypes),
      area: Random.integer(50, 300),
      designerId: Random.id(),
      designerName: Random.cname(),
      status: Random.pick(statuses),
      requirement: Random.cparagraph(1, 3),
      createTime: Random.datetime(),
      updateTime: Random.datetime()
    })
  }
  return orders
}

const generateContracts = (): Contract[] => {
  const statuses: Contract['status'][] = ['pending', 'signed', 'cancelled']
  const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴']
  const lastNames = ['先生', '女士']
  const itemNames = ['沙发', '茶几', '电视柜', '餐桌', '餐椅', '床', '床头柜', '衣柜', '窗帘', '吊灯']
  
  const contracts: Contract[] = []
  for (let i = 0; i < 20; i++) {
    const items: ContractItem[] = []
    const count = Random.integer(3, 8)
    for (let j = 0; j < count; j++) {
      const unitPrice = Random.integer(500, 5000)
      const quantity = Random.integer(1, 5)
      items.push({
        id: Random.id(),
        name: Random.pick(itemNames),
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity
      })
    }
    
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const discount = Random.float(0.7, 1, 1, 2)
    
    contracts.push({
      id: Random.id(),
      contractNo: 'CON' + Random.integer(10000000, 99999999),
      orderId: Random.id(),
      orderNo: 'ORD' + Random.integer(10000000, 99999999),
      designerId: Random.id(),
      designerName: Random.cname(),
      customerName: Random.pick(firstNames) + Random.pick(lastNames),
      customerPhone: '1' + Random.integer(3, 9) + Random.integer(100000000, 999999999).toString(),
      items,
      totalAmount,
      discount,
      finalAmount: Math.round(totalAmount * discount),
      status: Random.pick(statuses),
      createTime: Random.datetime(),
      updateTime: Random.datetime()
    })
  }
  return contracts
}

Mock.setup({
  timeout: '200-600'
})

Mock.mock('/api/materials', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: generateMaterials()
  }
})

Mock.mock('/api/designers', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: generateDesigners()
  }
})

Mock.mock('/api/orders', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: generateOrders()
  }
})

Mock.mock('/api/contracts', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: generateContracts()
  }
})

export default Mock
