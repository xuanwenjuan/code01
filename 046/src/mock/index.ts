import Mock from 'mockjs'

const Random = Mock.Random

const categoryData = [
  { id: '1', name: '鲜果茶' },
  { id: '2', name: '奶绿' },
  { id: '3', name: '咖啡' },
  { id: '4', name: '小食' }
]

const drinkNames = [
  '杨枝甘露', '多肉葡萄', '芝芝莓莓', '柠檬茶', '百香果双响炮',
  '珍珠奶茶', '芋泥啵啵奶绿', '抹茶奶绿', '焦糖奶茶', '燕麦奶茶',
  '美式咖啡', '拿铁', '卡布奇诺', '摩卡', '焦糖玛奇朵',
  '鸡米花', '薯条', '蛋挞', '鸡肉卷', '三明治'
]

const drinks = Mock.mock({
  'list|20': [{
    'id|+1': 1,
    'name': () => drinkNames[Random.integer(0, 19)],
    'categoryId': () => Random.integer(1, 4).toString(),
    'categoryName': function() {
      const cat = categoryData.find(c => c.id === this.categoryId)
      return cat ? cat.name : '其他'
    },
    'price': () => Random.integer(8, 35),
    'originalPrice': function() { return this.price + Random.integer(2, 10) },
    'description': () => Random.csentence(10, 30),
    'specs': () => [
      { name: '规格', options: ['中杯', '大杯', '超大杯'] },
      { name: '甜度', options: ['无糖', '三分糖', '五分糖', '七分糖', '全糖'] },
      { name: '冰度', options: ['热饮', '常温', '少冰', '正常冰', '去冰'] }
    ],
    'isOnSale': () => Random.boolean(7, 3, true),
    'createTime': () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
    'updateTime': () => Random.datetime('yyyy-MM-dd HH:mm:ss')
  }]
}).list.map((item: any) => ({
  ...item,
  id: item.id.toString()
}))

const positionMap: Record<string, string> = {
  manager: '店长',
  barista: '调饮师',
  cashier: '收银员',
  cleaner: '保洁员'
}

const statusMap: Record<string, string> = {
  active: '在职',
  inactive: '离职',
  vacation: '休假'
}

const storeNames = ['中心广场店', '大学城店', '科技园店', '步行街店', '高铁站店']

const employees = Mock.mock({
  'list|30': [{
    'id|+1': 1,
    'name': () => Random.cname(),
    'phone': /^1[3-9]\d{9}$/,
    'position': () => Random.pick(['manager', 'barista', 'cashier', 'cleaner']),
    'positionName': function() { return positionMap[this.position] },
    'storeId': () => Random.integer(1, 5).toString(),
    'storeName': () => Random.pick(storeNames),
    'status': () => Random.pick(['active', 'inactive', 'vacation']),
    'statusName': function() { return statusMap[this.status] },
    'hireDate': () => Random.date('yyyy-MM-dd'),
    'schedule': () => Random.shuffle(['周一', '周二', '周三', '周四', '周五', '周六', '周日']).slice(0, 5),
    'createTime': () => Random.datetime('yyyy-MM-dd HH:mm:ss')
  }]
}).list.map((item: any) => ({
  ...item,
  id: item.id.toString()
}))

const statusOrderMap: Record<string, string> = {
  pending: '待接单',
  making: '制作中',
  ready: '已出餐',
  completed: '已完成',
  cancelled: '已取消'
}

const typeOrderMap: Record<string, string> = {
  dine_in: '堂食',
  takeaway: '外卖'
}

const orders = Mock.mock({
  'list|50': [{
    'id|+1': 1,
    'orderNo': () => `ORD${Random.date('yyyyMMdd')}${Random.string('number', 6)}`,
    'type': () => Random.pick(['dine_in', 'takeaway']),
    'typeName': function() { return typeOrderMap[this.type] },
    'status': () => Random.pick(['pending', 'making', 'ready', 'completed', 'cancelled']),
    'statusName': function() { return statusOrderMap[this.status] },
    'tableNo': function() { return this.type === 'dine_in' ? Random.integer(1, 20).toString() : undefined },
    'items|1-5': [{
      'drinkId': () => Random.integer(1, 20).toString(),
      'drinkName': () => Random.pick(drinkNames),
      'quantity': () => Random.integer(1, 3),
      'price': () => Random.integer(8, 35),
      'specs': {
        '规格': () => Random.pick(['中杯', '大杯', '超大杯']),
        '甜度': () => Random.pick(['无糖', '三分糖', '五分糖', '七分糖', '全糖']),
        '冰度': () => Random.pick(['热饮', '常温', '少冰', '正常冰', '去冰'])
      }
    }],
    'totalAmount': function() {
      return this.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    },
    'customerName': () => Random.cname(),
    'customerPhone': /^1[3-9]\d{9}$/,
    'createTime': () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
    'updateTime': () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
    'remark': () => Random.boolean(3, 7, false) ? Random.csentence(5, 15) : ''
  }]
}).list.map((item: any) => ({
  ...item,
  id: item.id.toString()
}))

const categoryInventoryMap: Record<string, string> = {
  tea_base: '茶底',
  dairy: '奶品',
  ingredient: '配料',
  packaging: '包装'
}

const inventoryNames = {
  tea_base: ['红茶底', '绿茶底', '乌龙茶底', '普洱茶底', '茉莉茶底'],
  dairy: ['鲜牛奶', '淡奶油', '炼乳', '酸奶', '芝士奶盖'],
  ingredient: ['珍珠', '芋圆', '椰果', '红豆', '布丁', '仙草', '芒果丁', '草莓酱'],
  packaging: ['奶茶杯', '吸管', '打包袋', '杯盖', '封口膜']
}

const unitMap = ['ml', 'g', '个', '包', '盒', '杯']

const inventory = Mock.mock({
  'list|30': [{
    'id|+1': 1,
    'category': () => Random.pick(['tea_base', 'dairy', 'ingredient', 'packaging']),
    'categoryName': function() { return categoryInventoryMap[this.category] },
    'name': function() { return Random.pick(inventoryNames[this.category as keyof typeof inventoryNames]) },
    'quantity': () => Random.integer(0, 1000),
    'unit': () => Random.pick(unitMap),
    'warningThreshold': () => Random.integer(50, 200),
    'expiryDate': () => Random.date('yyyy-MM-dd'),
    'isExpiring': function() {
      const now = new Date()
      const expiry = new Date(this.expiryDate)
      const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diff <= 7 && diff > 0
    },
    'isLowStock': function() { return this.quantity <= this.warningThreshold },
    'createTime': () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
    'updateTime': () => Random.datetime('yyyy-MM-dd HH:mm:ss')
  }]
}).list.map((item: any) => ({
  ...item,
  id: item.id.toString()
}))

export const mockApi = {
  getCategories: () => Promise.resolve(categoryData),
  getDrinks: () => Promise.resolve(drinks),
  getEmployees: () => Promise.resolve(employees),
  getOrders: () => Promise.resolve(orders),
  getInventory: () => Promise.resolve(inventory)
}
