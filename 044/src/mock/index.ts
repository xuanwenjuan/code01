import Mock from 'mockjs'
import { Category, Product, Order, SeckillActivity, DiscountActivity, Coupon, Review } from '../types'

const Random = Mock.Random

const categories: Category[] = [
  { id: '1', name: '电子产品', parentId: null },
  { id: '2', name: '手机数码', parentId: '1' },
  { id: '3', name: '电脑办公', parentId: '1' },
  { id: '4', name: '服装鞋帽', parentId: null },
  { id: '5', name: '男装', parentId: '4' },
  { id: '6', name: '女装', parentId: '4' },
  { id: '7', name: '食品生鲜', parentId: null },
  { id: '8', name: '水果', parentId: '7' },
  { id: '9', name: '零食', parentId: '7' },
]

const productNames = [
  'iPhone 15 Pro Max',
  'MacBook Pro 14英寸',
  '华为Mate 60 Pro',
  '小米14 Ultra',
  '联想ThinkPad X1 Carbon',
  'Dell XPS 15',
  '男士休闲夹克',
  '女士连衣裙',
  '运动卫衣',
  '牛仔裤',
  '智利车厘子',
  '新疆阿克苏苹果',
  '三只松鼠坚果礼盒',
  '良品铺子猪肉脯',
  '索尼WH-1000XM5耳机',
]

const products: Product[] = productNames.map((name, index) => ({
  id: `product-${index + 1}`,
  name,
  categoryId: categories[Math.floor(Math.random() * categories.length)].id,
  categoryName: categories[Math.floor(Math.random() * categories.length)].name,
  price: parseFloat(Random.float(50, 5000, 2, 2)),
  activityPrice: Math.random() > 0.5 ? parseFloat(Random.float(30, 4000, 2, 2)) : undefined,
  stock: Random.integer(0, 500),
  status: Math.random() > 0.3 ? 'on' : 'off',
  image: `https://picsum.photos/200/200?random=${index}`,
  description: Random.cparagraph(2, 5),
  createTime: Random.datetime(),
}))

const orderStatusList: Order['status'][] = ['pending_payment', 'pending_shipment', 'shipping', 'completed', 'refunded']

const generateLogistics = (): Order['logistics'] => {
  const count = Random.integer(3, 8)
  const logistics: Logistics[] = []
  const statuses = ['已下单', '已发货', '运输中', '到达目的地', '派送中', '已签收']
  for (let i = 0; i < count; i++) {
    logistics.push({
      time: Random.datetime(),
      status: statuses[Math.min(i, statuses.length - 1)],
      location: Random.city(),
    })
  }
  return logistics.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}

const orders: Order[] = Array.from({ length: 30 }, (_, index) => {
  const status = orderStatusList[Math.floor(Math.random() * orderStatusList.length)]
  const itemCount = Random.integer(1, 3)
  const items: OrderItem[] = []
  for (let i = 0; i < itemCount; i++) {
    const product = products[Math.floor(Math.random() * products.length)]
    items.push({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity: Random.integer(1, 2),
    })
  }
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return {
    id: `order-${index + 1}`,
    orderNo: `ORD${Random.integer(100000000000, 999999999999)}`,
    status,
    items,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    buyerName: Random.cname(),
    buyerPhone: /^1[3-9]\d{9}$/.exec(Random.string())?.[0] || '13800138000',
    address: Random.province() + Random.city() + Random.county() + Random.cparagraph(1, 1).slice(0, 20),
    createTime: Random.datetime(),
    payTime: status !== 'pending_payment' ? Random.datetime() : undefined,
    shipTime: status === 'shipping' || status === 'completed' ? Random.datetime() : undefined,
    completeTime: status === 'completed' ? Random.datetime() : undefined,
    logistics: status === 'shipping' || status === 'completed' ? generateLogistics() : undefined,
  }
})

const seckillActivities: SeckillActivity[] = [
  {
    id: 'seckill-1',
    name: '双11限时秒杀',
    startTime: '2024-11-11 00:00:00',
    endTime: '2024-11-11 23:59:59',
    status: 'enabled',
    products: ['product-1', 'product-2', 'product-3'],
  },
  {
    id: 'seckill-2',
    name: '618大促秒杀',
    startTime: '2024-06-18 00:00:00',
    endTime: '2024-06-18 23:59:59',
    status: 'disabled',
    products: ['product-4', 'product-5'],
  },
]

const discountActivities: DiscountActivity[] = [
  {
    id: 'discount-1',
    name: '满200减30',
    minAmount: 200,
    discountAmount: 30,
    startTime: '2024-01-01 00:00:00',
    endTime: '2024-12-31 23:59:59',
    status: 'enabled',
  },
  {
    id: 'discount-2',
    name: '满500减100',
    minAmount: 500,
    discountAmount: 100,
    startTime: '2024-01-01 00:00:00',
    endTime: '2024-12-31 23:59:59',
    status: 'enabled',
  },
]

const coupons: Coupon[] = [
  {
    id: 'coupon-1',
    name: '新人专享券',
    discountType: 'fixed',
    discountValue: 50,
    minAmount: 199,
    totalCount: 1000,
    receivedCount: 456,
    startTime: '2024-01-01 00:00:00',
    endTime: '2024-12-31 23:59:59',
    status: 'enabled',
  },
  {
    id: 'coupon-2',
    name: '会员9折券',
    discountType: 'percent',
    discountValue: 10,
    minAmount: 100,
    totalCount: 5000,
    receivedCount: 2341,
    startTime: '2024-01-01 00:00:00',
    endTime: '2024-12-31 23:59:59',
    status: 'enabled',
  },
]

const reviews: Review[] = Array.from({ length: 50 }, (_, index) => {
  const rating = Random.integer(1, 5) as 1 | 2 | 3 | 4 | 5
  const type = rating >= 4 ? 'good' : rating === 3 ? 'neutral' : 'bad'
  const product = products[Math.floor(Math.random() * products.length)]
  const hasFollowUp = Math.random() > 0.7
  return {
    id: `review-${index + 1}`,
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    buyerName: Random.cname(),
    rating,
    type,
    content: Random.cparagraph(2, 5),
    images: Math.random() > 0.5 ? Array.from({ length: 3 }, (_, i) => `https://picsum.photos/200/200?random=review${index}-${i}`) : undefined,
    reply: Math.random() > 0.5 ? Random.cparagraph(1, 3) : undefined,
    replyTime: Math.random() > 0.5 ? Random.datetime() : undefined,
    hasFollowUp,
    followUpContent: hasFollowUp ? Random.cparagraph(1, 3) : undefined,
    followUpImages: hasFollowUp && Math.random() > 0.5 ? Array.from({ length: 2 }, (_, i) => `https://picsum.photos/200/200?random=follow${index}-${i}`) : undefined,
    createTime: Random.datetime(),
  }
})

export { categories, products, orders, seckillActivities, discountActivities, coupons, reviews }
