export const categories = [
  { id: 1, name: '护肤', icon: '🧴' },
  { id: 2, name: '彩妆', icon: '💄' },
  { id: 3, name: '香水', icon: '🌸' },
  { id: 4, name: '美发', icon: '💇‍♀️' },
  { id: 5, name: '身体护理', icon: '🛁' },
  { id: 6, name: '男士专区', icon: '🧔' },
  { id: 7, name: '面膜', icon: '🎭' },
  { id: 8, name: '套装礼盒', icon: '🎁' }
]

export const brands = [
  { id: 1, name: '兰蔻' },
  { id: 2, name: '雅诗兰黛' },
  { id: 3, name: '香奈儿' },
  { id: 4, name: '迪奥' },
  { id: 5, name: 'SK-II' },
  { id: 6, name: '欧莱雅' },
  { id: 7, name: '资生堂' },
  { id: 8, name: '自然堂' }
]

const generateProducts = () => {
  const productNames = [
    { name: '小黑瓶精华肌底液', category: 1, brand: 1, basePrice: 760 },
    { name: '小棕瓶精华眼霜', category: 1, brand: 2, basePrice: 520 },
    { name: '红腰子精华', category: 1, brand: 7, basePrice: 680 },
    { name: '神仙水护肤精华露', category: 1, brand: 5, basePrice: 1540 },
    { name: '粉水清滢柔肤水', category: 1, brand: 1, basePrice: 320 },
    { name: '特润修护精华露', category: 1, brand: 2, basePrice: 890 },
    { name: '口红58号丝绒', category: 2, brand: 4, basePrice: 320 },
    { name: '烈艳蓝金唇膏', category: 2, brand: 4, basePrice: 330 },
    { name: '丝绒雾面唇釉', category: 2, brand: 3, basePrice: 380 },
    { name: '持妆粉底液', category: 2, brand: 1, basePrice: 480 },
    { name: '凝脂恒久粉底液', category: 2, brand: 4, basePrice: 520 },
    { name: '黑管哑光口红', category: 2, brand: 3, basePrice: 360 },
    { name: '可可小姐香水', category: 3, brand: 3, basePrice: 1180 },
    { name: '真我女士香水', category: 3, brand: 4, basePrice: 1280 },
    { name: '邂逅清新淡香水', category: 3, brand: 3, basePrice: 980 },
    { name: '奇迹香水', category: 3, brand: 1, basePrice: 680 },
    { name: '透明质酸水润洗发水', category: 4, brand: 6, basePrice: 128 },
    { name: '多效修复护发素', category: 4, brand: 6, basePrice: 108 },
    { name: '精油修护发膜', category: 4, brand: 7, basePrice: 268 },
    { name: '持久留香沐浴露', category: 5, brand: 6, basePrice: 89 },
    { name: '烟酰胺身体乳', category: 5, brand: 8, basePrice: 128 },
    { name: '男士焕活护肤精华', category: 6, brand: 1, basePrice: 580 },
    { name: '男士保湿面霜', category: 6, brand: 2, basePrice: 460 },
    { name: '玻尿酸补水面膜', category: 7, brand: 8, basePrice: 89 },
    { name: '美白淡斑面膜', category: 7, brand: 5, basePrice: 320 },
    { name: '抗皱紧致面膜', category: 7, brand: 2, basePrice: 280 },
    { name: '水漾保湿套装', category: 8, brand: 1, basePrice: 1280 },
    { name: '护肤经典礼盒', category: 8, brand: 2, basePrice: 1680 },
    { name: '彩妆入门套装', category: 8, brand: 4, basePrice: 880 },
    { name: '香氛礼盒套装', category: 8, brand: 3, basePrice: 2180 }
  ]

  const specs = [
    { name: '规格', options: ['30ml', '50ml', '75ml', '100ml'] },
    { name: '功效', options: ['保湿', '美白', '抗皱', '修复', '控油'] },
    { name: '适用肤质', options: ['干性', '油性', '混合性', '敏感性', '所有肤质'] }
  ]

  return productNames.map((item, index) => {
    const id = index + 1
    const discount = Math.random() > 0.5 ? (0.7 + Math.random() * 0.2).toFixed(1) : 1
    const originalPrice = item.basePrice
    const price = Math.round(originalPrice * discount)
    
    return {
      id,
      name: item.name,
      categoryId: item.category,
      categoryName: categories.find(c => c.id === item.category)?.name,
      brandId: item.brand,
      brandName: brands.find(b => b.id === item.brand)?.name,
      price,
      originalPrice: discount < 1 ? originalPrice : null,
      discount: discount < 1 ? Math.round((1 - discount) * 100) : null,
      sales: Math.floor(Math.random() * 5000) + 100,
      stock: Math.floor(Math.random() * 500) + 50,
      rating: (4 + Math.random()).toFixed(1),
      reviews: Math.floor(Math.random() * 2000) + 100,
      description: `这款${item.name}采用先进配方，蕴含多种珍贵成分，能够有效呵护您的肌肤/秀发，带来奢华的使用体验。`,
      details: [
        '产品功效：深层滋养，持久保湿',
        '主要成分：多种植物精华提取物',
        '使用方法：早晚洁面后，取适量均匀涂抹于面部',
        '适合人群：所有肤质适用'
      ],
      images: [
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(item.name + ' beauty cosmetic product elegant white background')}&image_size=square_hd`,
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(item.name + ' beauty product detail texture')}&image_size=square_hd`,
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(item.name + ' cosmetic packaging luxury')}&image_size=square_hd`,
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(item.name + ' beauty product lifestyle')}&image_size=square_hd`
      ],
      specs: specs.map(spec => ({
        name: spec.name,
        options: spec.options.slice(0, Math.floor(Math.random() * 3) + 2)
      })),
      isHot: Math.random() > 0.7,
      isNew: Math.random() > 0.7,
      createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  })
}

export const products = generateProducts()

export const banners = [
  {
    id: 1,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beauty%20cosmetics%20banner%20pink%20elegant%20sale%20promotion&image_size=landscape_16_9',
    title: '春季焕新季',
    subtitle: '全场满300减50',
    link: '/list'
  },
  {
    id: 2,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=skincare%20products%20banner%20luxury%20feminine%20elegant&image_size=landscape_16_9',
    title: '护肤盛典',
    subtitle: '爆款精华限时特惠',
    link: '/list?category=1'
  },
  {
    id: 3,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=perfume%20cosmetics%20banner%20luxury%20golden%20elegant&image_size=landscape_16_9',
    title: '香氛之旅',
    subtitle: '精选香水低至5折',
    link: '/list?category=3'
  },
  {
    id: 4,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=makeup%20cosmetics%20banner%20colorful%20vibrant%20sale&image_size=landscape_16_9',
    title: '彩妆狂欢',
    subtitle: '大牌口红买一送一',
    link: '/list?category=2'
  }
]

export const activities = [
  {
    id: 1,
    title: '限时秒杀',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flash%20sale%20pink%20countdown%20icon&image_size=square',
    link: '/list?sort=sales'
  },
  {
    id: 2,
    title: '新人专享',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=new%20user%20gift%20welcome%20icon&image_size=square',
    link: '/register'
  },
  {
    id: 3,
    title: '每日签到',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=daily%20check%20calendar%20reward%20icon&image_size=square',
    link: '/user'
  },
  {
    id: 4,
    title: '会员专区',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vip%20member%20exclusive%20crown%20icon&image_size=square',
    link: '/user'
  }
]
