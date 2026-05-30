export const categories = [
  { id: 1, name: '手机数码', icon: 'Iphone', children: [
    { id: 11, name: '手机通讯' },
    { id: 12, name: '平板电脑' },
    { id: 13, name: '智能手表' }
  ]},
  { id: 2, name: '电脑办公', icon: 'Monitor', children: [
    { id: 21, name: '笔记本电脑' },
    { id: 22, name: '台式电脑' },
    { id: 23, name: '外设配件' }
  ]},
  { id: 3, name: '家用电器', icon: 'House', children: [
    { id: 31, name: '电视' },
    { id: 32, name: '空调' },
    { id: 33, name: '冰箱' }
  ]},
  { id: 4, name: '影音娱乐', icon: 'Headset', children: [
    { id: 41, name: '耳机' },
    { id: 42, name: '音响' },
    { id: 43, name: '相机' }
  ]},
  { id: 5, name: '智能穿戴', icon: 'Timer', children: [
    { id: 51, name: '智能手环' },
    { id: 52, name: 'VR设备' }
  ]}
]

export const banners = [
  { id: 1, image: 'https://picsum.photos/1200/400?random=1', title: '新品首发', link: '/products' },
  { id: 2, image: 'https://picsum.photos/1200/400?random=2', title: '限时抢购', link: '/products' },
  { id: 3, image: 'https://picsum.photos/1200/400?random=3', title: '品牌特惠', link: '/products' },
  { id: 4, image: 'https://picsum.photos/1200/400?random=4', title: '数码狂欢', link: '/products' }
]

export const brands = [
  { id: 1, name: 'Apple', logo: 'https://picsum.photos/120/60?random=10' },
  { id: 2, name: '华为', logo: 'https://picsum.photos/120/60?random=11' },
  { id: 3, name: '小米', logo: 'https://picsum.photos/120/60?random=12' },
  { id: 4, name: '三星', logo: 'https://picsum.photos/120/60?random=13' },
  { id: 5, name: '联想', logo: 'https://picsum.photos/120/60?random=14' },
  { id: 6, name: '索尼', logo: 'https://picsum.photos/120/60?random=15' },
  { id: 7, name: '戴尔', logo: 'https://picsum.photos/120/60?random=16' },
  { id: 8, name: '惠普', logo: 'https://picsum.photos/120/60?random=17' }
]

const productNames = [
  'iPhone 15 Pro Max', '华为 Mate 60 Pro', '小米 14 Ultra', '三星 Galaxy S24',
  'MacBook Pro 14寸', 'ThinkPad X1 Carbon', '戴尔 XPS 15', '惠普暗影精灵9',
  'iPad Pro 12.9', '华为 MatePad Pro', '小米平板6', '三星 Galaxy Tab S9',
  'Apple Watch Series 9', '华为 Watch GT 4', '小米手环8', '三星 Galaxy Watch 6',
  'AirPods Pro 2', '索尼 WH-1000XM5', 'Bose QuietComfort', '小米 Buds 4'
]

export const products = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: productNames[i % productNames.length],
  categoryId: Math.floor(i / 8) + 1,
  categoryName: categories[Math.floor(i / 8)]?.name || '手机数码',
  brandId: (i % 8) + 1,
  brandName: brands[i % 8].name,
  price: Math.floor(Math.random() * 8000) + 1000,
  originalPrice: Math.floor(Math.random() * 10000) + 2000,
  sales: Math.floor(Math.random() * 5000) + 100,
  image: `https://picsum.photos/400/400?random=${i + 20}`,
  images: [
    `https://picsum.photos/600/600?random=${i + 20}`,
    `https://picsum.photos/600/600?random=${i + 100}`,
    `https://picsum.photos/600/600?random=${i + 200}`,
    `https://picsum.photos/600/600?random=${i + 300}`
  ],
  versions: ['128G', '256G', '512G', '1TB'],
  description: '这是一款高品质数码产品，性能卓越，做工精良，是您的不二之选。',
  params: [
    { name: '屏幕尺寸', value: '6.7英寸' },
    { name: '处理器', value: '最新旗舰芯片' },
    { name: '摄像头', value: '5000万像素' },
    { name: '电池容量', value: '5000mAh' },
    { name: '充电功率', value: '66W快充' },
    { name: '操作系统', value: '最新版本' }
  ],
  isNew: Math.random() > 0.7,
  isHot: Math.random() > 0.6,
  createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
}))

export const reviews = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  productId: Math.floor(Math.random() * 40) + 1,
  userName: '用户' + (i + 1),
  avatar: `https://picsum.photos/50/50?random=${i + 500}`,
  rating: Math.floor(Math.random() * 2) + 4,
  content: ['非常满意，质量很好，物流很快，服务态度好，下次还会再来购买！', '产品不错，性价比很高，推荐购买！'][i % 2],
  images: i % 3 === 0 ? [
    `https://picsum.photos/100/100?random=${i + 600}`,
    `https://picsum.photos/100/100?random=${i + 700}`
  ] : [],
  createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
}))

export const news = [
  { id: 1, title: '2024年最值得入手的5款旗舰手机推荐', image: 'https://picsum.photos/300/200?random=800', createTime: '2026-05-15' },
  { id: 2, title: 'AI人工智能发展趋势分析报告', image: 'https://picsum.photos/300/200?random=801', createTime: '2026-05-14' },
  { id: 3, title: '如何选择适合自己的笔记本电脑', image: 'https://picsum.photos/300/200?random=802', createTime: '2026-05-13' },
  { id: 4, title: '智能家居产品选购指南', image: 'https://picsum.photos/300/200?random=803', createTime: '2026-05-12' }
]

export const activities = [
  { id: 1, title: '限时秒杀', image: 'https://picsum.photos/300/200?random=900', discount: '低至5折' },
  { id: 2, title: '满减活动', image: 'https://picsum.photos/300/200?random=901', discount: '满1000减200' },
  { id: 3, title: '新人专享', image: 'https://picsum.photos/300/200?random=902', discount: '首单立减100' },
  { id: 4, title: '品牌日', image: 'https://picsum.photos/300/200?random=903', discount: '品牌特惠' }
]

export const defaultAddresses = [
  { id: 1, name: '张三', phone: '13800138000', province: '北京市', city: '北京市', district: '朝阳区', address: '中关村大街1号', isDefault: true },
  { id: 2, name: '李四', phone: '13900139000', province: '上海市', city: '上海市', district: '浦东新区', address: '陆家嘴金融中心88号', isDefault: false }
]

export const defaultOrders = [
  { id: 'ORD20260501ABC12345', createTime: '2026-05-01 10:30:00', status: 1, statusText: '待付款', totalPrice: 8999, items: [
    { id: 1, name: 'iPhone 15 Pro Max', image: 'https://picsum.photos/80/80?random=1000', price: 8999, count: 1, version: '256G' }
  ]},
  { id: 'ORD20260425DEF67890', createTime: '2026-04-25 14:20:00', status: 3, statusText: '待收货', totalPrice: 5999, items: [
    { id: 2, name: '华为 Mate 60 Pro', image: 'https://picsum.photos/80/80?random=1001', price: 5999, count: 1, version: '256G' }
  ]},
  { id: 'ORD20260420GHI11111', createTime: '2026-04-20 09:15:00', status: 5, statusText: '已完成', totalPrice: 12999, items: [
    { id: 3, name: 'MacBook Pro 14寸', image: 'https://picsum.photos/80/80?random=1002', price: 12999, count: 1, version: '512G' }
  ]}
]

export const defaultFavorites = products.slice(0, 5).map(p => ({ ...p, favoriteTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) }))

export const defaultHistory = products.slice(5, 10).map(p => ({ ...p, browseTime: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) }))
