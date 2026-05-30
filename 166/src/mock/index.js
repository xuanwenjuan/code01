export const communities = [
  { id: 1, name: '阳光花园小区', address: '朝阳区阳光路88号', leader: '张团长', phone: '138****1234' },
  { id: 2, name: '幸福里社区', address: '海淀区幸福大街168号', leader: '李团长', phone: '139****5678' },
  { id: 3, name: '绿城家园', address: '丰台区绿城南街66号', leader: '王团长', phone: '137****9012' },
  { id: 4, name: '金色年华小区', address: '昌平区金岁路99号', leader: '赵团长', phone: '136****3456' }
]

export const banners = [
  { id: 1, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop', title: '新鲜直达 品质保障', link: '/products' },
  { id: 2, image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&h=400&fit=crop', title: '限时秒杀 低至5折', link: '/products?tag=seckill' },
  { id: 3, image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&h=400&fit=crop', title: '新人专享 首单立减20', link: '/products?tag=newuser' },
  { id: 4, image: 'https://images.unsplash.com/photo-1543168256-418811576931?w=1200&h=400&fit=crop', title: '产地直供 新鲜美味', link: '/products?category=1' }
]

export const categories = [
  { id: 1, name: '时令蔬菜', icon: '🥬', color: '#52c41a' },
  { id: 2, name: '新鲜水果', icon: '🍎', color: '#fa8c16' },
  { id: 3, name: '肉禽蛋奶', icon: '🥩', color: '#f5222d' },
  { id: 4, name: '海鲜水产', icon: '🦐', color: '#1890ff' },
  { id: 5, name: '粮油调味', icon: '🍚', color: '#faad14' },
  { id: 6, name: '酒水饮料', icon: '🍺', color: '#722ed1' },
  { id: 7, name: '休闲零食', icon: '🍪', color: '#eb2f96' },
  { id: 8, name: '速冻食品', icon: '🥟', color: '#13c2c2' }
]

export const products = [
  { id: 1, name: '有机西红柿 500g', categoryId: 1, price: 8.9, originalPrice: 12.9, image: 'https://images.unsplash.com/photo-1546470427-227c7eb9b44b?w=400&h=400&fit=crop', sales: 2345, stock: 100, description: '自然成熟，口感酸甜多汁，富含维生素C。', specs: [{ name: '500g', price: 8.9 }, { name: '1kg', price: 16.9 }], tags: ['hot', 'organic'], rating: 4.8, reviews: 156 },
  { id: 2, name: '新鲜红富士苹果 1kg', categoryId: 2, price: 12.9, originalPrice: 18.9, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop', sales: 5678, stock: 200, description: '山东烟台红富士，脆甜多汁，果香浓郁。', specs: [{ name: '1kg', price: 12.9 }, { name: '2.5kg', price: 29.9 }], tags: ['hot', 'new'], rating: 4.9, reviews: 423 },
  { id: 3, name: '土鸡蛋 30枚装', categoryId: 3, price: 35.9, originalPrice: 45.9, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop', sales: 3456, stock: 50, description: '农家散养土鸡蛋，营养丰富，口感香嫩。', specs: [{ name: '10枚', price: 12.9 }, { name: '30枚', price: 35.9 }], tags: ['hot'], rating: 4.7, reviews: 289 },
  { id: 4, name: '鲜活基围虾 500g', categoryId: 4, price: 49.9, originalPrice: 69.9, image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop', sales: 1234, stock: 30, description: '新鲜捕捞，肉质紧实Q弹，鲜美无比。', specs: [{ name: '500g', price: 49.9 }, { name: '1kg', price: 89.9 }], tags: ['seckill'], rating: 4.8, reviews: 167 },
  { id: 5, name: '东北五常大米 5kg', categoryId: 5, price: 69.9, originalPrice: 89.9, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', sales: 8901, stock: 150, description: '正宗五常大米，颗粒饱满，香糯可口。', specs: [{ name: '2.5kg', price: 38.9 }, { name: '5kg', price: 69.9 }], tags: ['hot'], rating: 4.9, reviews: 567 },
  { id: 6, name: '纯牛奶 250ml*12盒', categoryId: 3, price: 45.9, originalPrice: 55.9, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', sales: 6789, stock: 80, description: '优质奶源，香浓醇厚，营养健康。', specs: [{ name: '12盒', price: 45.9 }, { name: '24盒', price: 85.9 }], tags: ['new'], rating: 4.8, reviews: 345 },
  { id: 7, name: '有机西兰花 500g', categoryId: 1, price: 9.9, originalPrice: 14.9, image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop', sales: 1567, stock: 60, description: '有机种植，营养丰富，口感清爽。', specs: [{ name: '500g', price: 9.9 }], tags: ['organic'], rating: 4.6, reviews: 89 },
  { id: 8, name: '进口车厘子 1kg', categoryId: 2, price: 89.9, originalPrice: 129.9, image: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=400&h=400&fit=crop', sales: 2345, stock: 40, description: '智利进口，果肉饱满，甜美多汁。', specs: [{ name: '500g', price: 49.9 }, { name: '1kg', price: 89.9 }], tags: ['hot', 'seckill'], rating: 4.9, reviews: 456 },
  { id: 9, name: '雪花牛肉卷 500g', categoryId: 3, price: 68.9, originalPrice: 88.9, image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea614?w=400&h=400&fit=crop', sales: 1890, stock: 25, description: '优质雪花牛肉，肥瘦相间，鲜嫩多汁。', specs: [{ name: '250g', price: 36.9 }, { name: '500g', price: 68.9 }], tags: ['hot'], rating: 4.8, reviews: 234 },
  { id: 10, name: '新鲜三文鱼 500g', categoryId: 4, price: 79.9, originalPrice: 99.9, image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=400&fit=crop', sales: 987, stock: 20, description: '挪威进口，肉质细嫩，营养丰富。', specs: [{ name: '250g', price: 42.9 }, { name: '500g', price: 79.9 }], tags: ['seckill'], rating: 4.7, reviews: 145 },
  { id: 11, name: '有机胡萝卜 1kg', categoryId: 1, price: 6.9, originalPrice: 9.9, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop', sales: 2134, stock: 120, description: '有机种植，脆甜可口，富含胡萝卜素。', specs: [{ name: '500g', price: 3.9 }, { name: '1kg', price: 6.9 }], tags: ['organic'], rating: 4.5, reviews: 123 },
  { id: 12, name: '新鲜香蕉 1kg', categoryId: 2, price: 7.9, originalPrice: 10.9, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop', sales: 4567, stock: 180, description: '海南香蕉，软糯香甜，营养丰富。', specs: [{ name: '1kg', price: 7.9 }, { name: '2.5kg', price: 17.9 }], tags: ['new'], rating: 4.6, reviews: 267 },
  { id: 13, name: '鲜榨橙汁 1L', categoryId: 6, price: 19.9, originalPrice: 25.9, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop', sales: 1678, stock: 90, description: '100%鲜榨橙汁，无添加，酸甜可口。', specs: [{ name: '500ml', price: 10.9 }, { name: '1L', price: 19.9 }], tags: ['new'], rating: 4.7, reviews: 178 },
  { id: 14, name: '原味酸奶 1kg', categoryId: 3, price: 25.9, originalPrice: 32.9, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop', sales: 3456, stock: 70, description: '原味发酵酸奶，口感醇厚，有益肠道。', specs: [{ name: '500g', price: 13.9 }, { name: '1kg', price: 25.9 }], tags: ['hot'], rating: 4.8, reviews: 312 },
  { id: 15, name: '速冻水饺 500g', categoryId: 8, price: 15.9, originalPrice: 20.9, image: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=400&h=400&fit=crop', sales: 2890, stock: 110, description: '手工包制，皮薄馅大，鲜美可口。', specs: [{ name: '500g', price: 15.9 }, { name: '1kg', price: 28.9 }], tags: ['hot'], rating: 4.6, reviews: 198 },
  { id: 16, name: '精选土豆 2kg', categoryId: 1, price: 9.9, originalPrice: 13.9, image: 'https://images.unsplash.com/photo-1518977676601-b52368d42c89?w=400&h=400&fit=crop', sales: 3789, stock: 200, description: '内蒙土豆，粉糯香甜，营养丰富。', specs: [{ name: '1kg', price: 5.9 }, { name: '2kg', price: 9.9 }], tags: ['hot'], rating: 4.7, reviews: 245 }
]

export const seckillProducts = products.filter(p => p.tags.includes('seckill')).map(p => ({
  ...p,
  seckillPrice: (p.price * 0.5).toFixed(1),
  startTime: Date.now(),
  endTime: Date.now() + 2 * 60 * 60 * 1000,
  soldCount: Math.floor(Math.random() * 100) + 10,
  totalCount: 100
}))

export const userInfo = {
  id: 1,
  username: 'user123',
  nickname: '美食达人',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  phone: '138****1234',
  role: 'consumer',
  level: 'VIP2',
  points: 1280,
  balance: 256.8,
  coupons: 5,
  createTime: '2023-01-15'
}

export const addresses = [
  { id: 1, name: '张三', phone: '138****1234', province: '北京市', city: '北京市', district: '朝阳区', detail: '阳光花园小区A座101室', isDefault: true, tag: '家' },
  { id: 2, name: '张三', phone: '138****1234', province: '北京市', city: '北京市', district: '海淀区', detail: '中关村科技大厦B座2001室', isDefault: false, tag: '公司' },
  { id: 3, name: '李四', phone: '139****5678', province: '北京市', city: '北京市', district: '丰台区', detail: '绿城家园3号楼5单元302', isDefault: false, tag: '父母家' }
]

export const coupons = [
  { id: 1, name: '新人专享券', type: 'discount', value: 20, minAmount: 99, startTime: '2026-05-01', endTime: '2026-06-30', status: 'available' },
  { id: 2, name: '满减优惠券', type: 'discount', value: 10, minAmount: 59, startTime: '2026-05-10', endTime: '2026-05-31', status: 'available' },
  { id: 3, name: '生鲜专享券', type: 'discount', value: 15, minAmount: 79, startTime: '2026-05-15', endTime: '2026-06-15', status: 'available' },
  { id: 4, name: '母亲节专享', type: 'discount', value: 30, minAmount: 199, startTime: '2026-05-08', endTime: '2026-05-12', status: 'expired' },
  { id: 5, name: '8折优惠券', type: 'rate', value: 0.8, minAmount: 100, startTime: '2026-05-01', endTime: '2026-05-31', status: 'available' }
]

export const orders = [
  { id: '202605180001', createTime: '2026-05-18 09:30:00', status: 'pending', totalAmount: 128.7, payAmount: 108.7, products: [{ productId: 1, name: '有机西红柿 500g', image: products[0].image, price: 8.9, quantity: 2, spec: '500g' }, { productId: 2, name: '新鲜红富士苹果 1kg', image: products[1].image, price: 12.9, quantity: 1, spec: '1kg' }], address: addresses[0], deliveryTime: '2026-05-18 14:00-16:00' },
  { id: '202605170002', createTime: '2026-05-17 14:20:00', status: 'shipping', totalAmount: 256.8, payAmount: 236.8, products: [{ productId: 3, name: '土鸡蛋 30枚装', image: products[2].image, price: 35.9, quantity: 2, spec: '30枚' }, { productId: 5, name: '东北五常大米 5kg', image: products[4].image, price: 69.9, quantity: 2, spec: '5kg' }, { productId: 6, name: '纯牛奶 250ml*12盒', image: products[5].image, price: 45.9, quantity: 1, spec: '12盒' }], address: addresses[0], deliveryTime: '2026-05-18 10:00-12:00', tracking: { company: '顺丰速运', number: 'SF1234567890' } },
  { id: '202605150003', createTime: '2026-05-15 10:15:00', status: 'completed', totalAmount: 189.6, payAmount: 179.6, products: [{ productId: 4, name: '鲜活基围虾 500g', image: products[3].image, price: 49.9, quantity: 2, spec: '500g' }, { productId: 9, name: '雪花牛肉卷 500g', image: products[8].image, price: 68.9, quantity: 1, spec: '500g' }], address: addresses[0], deliveryTime: '2026-05-15 16:00-18:00' },
  { id: '202605100004', createTime: '2026-05-10 16:45:00', status: 'cancelled', totalAmount: 98.8, payAmount: 98.8, products: [{ productId: 7, name: '有机西兰花 500g', image: products[6].image, price: 9.9, quantity: 3, spec: '500g' }, { productId: 8, name: '进口车厘子 1kg', image: products[7].image, price: 89.9, quantity: 1, spec: '1kg' }], address: addresses[1], deliveryTime: '2026-05-10 18:00-20:00' }
]

export const reviews = [
  { id: 1, userId: 101, userName: '美食家小王', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop', rating: 5, content: '非常新鲜，口感很好，下次还会回购！', images: ['https://images.unsplash.com/photo-1546470427-227c7eb9b44b?w=200&h=200&fit=crop'], createTime: '2026-05-16 14:30:00', spec: '500g' },
  { id: 2, userId: 102, userName: '健康生活', userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop', rating: 4, content: '品质不错，配送也很快，包装很仔细。', images: [], createTime: '2026-05-15 10:20:00', spec: '1kg' },
  { id: 3, userId: 103, userName: '吃货一枚', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop', rating: 5, content: '真的很新鲜，比超市的还好，强烈推荐！', images: ['https://images.unsplash.com/photo-1546470427-227c7eb9b44b?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200&h=200&fit=crop'], createTime: '2026-05-14 18:45:00', spec: '500g' },
  { id: 4, userId: 104, userName: '家庭主妇', userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop', rating: 5, content: '已经买过很多次了，一如既往的好！', images: [], createTime: '2026-05-13 09:15:00', spec: '500g' }
]

export const deliveryTimes = [
  { id: 1, time: '09:00-11:00', available: true },
  { id: 2, time: '11:00-13:00', available: true },
  { id: 3, time: '14:00-16:00', available: true },
  { id: 4, time: '16:00-18:00', available: true },
  { id: 5, time: '18:00-20:00', available: false },
  { id: 6, time: '次日 09:00-11:00', available: true }
]

export const afterSales = [
  { id: 'AS202605180001', orderId: '202605170002', type: 'refund', reason: '商品有破损', status: 'processing', createTime: '2026-05-18 10:30:00', amount: 35.9 },
  { id: 'AS202605100001', orderId: '202605100004', type: 'return', reason: '商品不新鲜', status: 'completed', createTime: '2026-05-10 18:00:00', amount: 98.8 }
]
