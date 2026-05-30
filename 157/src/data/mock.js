export const categories = [
  {
    id: 1,
    name: '奶粉辅食',
    icon: '🍼',
    children: [
      { id: 11, name: '婴儿奶粉' },
      { id: 12, name: '辅食米糊' },
      { id: 13, name: '营养品' }
    ]
  },
  {
    id: 2,
    name: '尿裤湿巾',
    icon: '🧻',
    children: [
      { id: 21, name: '纸尿裤' },
      { id: 22, name: '婴儿湿巾' },
      { id: 23, name: '婴儿纸巾' }
    ]
  },
  {
    id: 3,
    name: '喂养用品',
    icon: '🍴',
    children: [
      { id: 31, name: '奶瓶奶嘴' },
      { id: 32, name: '辅食工具' },
      { id: 33, name: '餐具' }
    ]
  },
  {
    id: 4,
    name: '婴儿服饰',
    icon: '👶',
    children: [
      { id: 41, name: '连体衣' },
      { id: 42, name: '外出服' },
      { id: 43, name: '婴儿鞋' }
    ]
  },
  {
    id: 5,
    name: '玩具教育',
    icon: '🧸',
    children: [
      { id: 51, name: '早教玩具' },
      { id: 52, name: '益智玩具' },
      { id: 53, name: '毛绒玩具' }
    ]
  },
  {
    id: 6,
    name: '婴儿推车',
    icon: '🛒',
    children: [
      { id: 61, name: '婴儿推车' },
      { id: 62, name: '安全座椅' },
      { id: 63, name: '学步车' }
    ]
  },
  {
    id: 7,
    name: '母婴电器',
    icon: '⚡',
    children: [
      { id: 71, name: '吸奶器' },
      { id: 72, name: '暖奶器' },
      { id: 73, name: '消毒器' }
    ]
  },
  {
    id: 8,
    name: '孕妈用品',
    icon: '🤰',
    children: [
      { id: 81, name: '孕妇装' },
      { id: 82, name: '产后恢复' },
      { id: 83, name: '孕妇护肤' }
    ]
  }
]

const generateProducts = (prefix, categoryId, count, basePrice) => {
  const products = []
  const specOptions = ['标准款', '升级款', '豪华款']
  const colorOptions = ['粉色', '蓝色', '黄色', '绿色']
  
  for (let i = 1; i <= count; i++) {
    const id = categoryId * 100 + i
    const basePriceVal = Math.floor(basePrice + Math.random() * basePrice * 0.5)
    
    const priceMap = {}
    specOptions.forEach(spec => {
      const specMultiplier = spec === '标准款' ? 1 : spec === '升级款' ? 1.3 : 1.6
      colorOptions.forEach(color => {
        const key = `${spec} / ${color}`
        priceMap[key] = Math.floor(basePriceVal * specMultiplier)
      })
    })
    
    products.push({
      id,
      name: `${prefix} 高端品质款${i}`,
      categoryId,
      price: basePriceVal,
      originalPrice: Math.floor(basePriceVal * 1.5 + Math.random() * basePriceVal * 0.3),
      priceMap,
      images: [
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prefix + ' baby product white background')}&image_size=square_hd`,
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prefix + ' product detail')}&image_size=square_hd`,
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prefix + ' product lifestyle')}&image_size=square_hd`
      ],
      description: `这是一款专为宝宝设计的高品质${prefix}，采用优质材料，安全环保，给宝宝最贴心的呵护。`,
      sales: Math.floor(Math.random() * 5000) + 100,
      stock: Math.floor(Math.random() * 500) + 50,
      rating: (4 + Math.random()).toFixed(1),
      specs: [
        { name: '规格', options: specOptions },
        { name: '颜色', options: colorOptions }
      ],
      isHot: Math.random() > 0.7,
      isNew: Math.random() > 0.8
    })
  }
  return products
}

export const products = [
  ...generateProducts('婴儿配方奶粉', 11, 12, 200),
  ...generateProducts('婴儿纸尿裤', 21, 10, 80),
  ...generateProducts('玻璃奶瓶', 31, 8, 60),
  ...generateProducts('婴儿连体衣', 41, 15, 120),
  ...generateProducts('益智早教玩具', 51, 10, 100),
  ...generateProducts('轻便婴儿推车', 61, 6, 800),
  ...generateProducts('电动吸奶器', 71, 8, 300),
  ...generateProducts('孕妇连衣裙', 81, 10, 200)
]

export const banners = [
  {
    id: 1,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mother%20baby%20mall%20banner%20pink%20warm&image_size=landscape_16_9',
    title: '新品上市',
    subtitle: '母婴好物 品质之选'
  },
  {
    id: 2,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baby%20products%20sale%20banner&image_size=landscape_16_9',
    title: '限时特惠',
    subtitle: '全场满减 最高立减100'
  },
  {
    id: 3,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20baby%20shopping%20banner&image_size=landscape_16_9',
    title: '会员专享',
    subtitle: '注册即送新人礼包'
  }
]

export const floors = [
  {
    id: 1,
    name: '奶粉辅食专区',
    categoryId: 1,
    bgColor: 'from-pink-50'
  },
  {
    id: 2,
    name: '尿裤湿巾专区',
    categoryId: 2,
    bgColor: 'from-blue-50'
  },
  {
    id: 3,
    name: '喂养用品专区',
    categoryId: 3,
    bgColor: 'from-yellow-50'
  },
  {
    id: 4,
    name: '婴儿服饰专区',
    categoryId: 4,
    bgColor: 'from-green-50'
  }
]

export const reviews = [
  {
    id: 1,
    userId: 1,
    username: '宝妈小丽',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20baby%20avatar&image_size=square',
    rating: 5,
    content: '非常好的产品，宝宝很喜欢，质量也很棒，推荐购买！',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baby%20product%20review&image_size=square'
    ],
    specs: '粉色 / 标准款',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    userId: 2,
    username: '新手妈妈',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mother%20avatar&image_size=square',
    rating: 4,
    content: '物流很快，包装完好，产品质量不错，下次还会回购。',
    images: [],
    specs: '蓝色 / 升级款',
    createdAt: '2024-01-10'
  },
  {
    id: 3,
    userId: 3,
    username: '二胎妈妈',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mom%20avatar&image_size=square',
    rating: 5,
    content: '已经是第二次购买了，大品牌值得信赖，客服态度也很好。',
    images: [],
    specs: '黄色 / 豪华款',
    createdAt: '2024-01-05'
  }
]

export const orders = [
  {
    id: 'ORD202401001',
    status: 'pending',
    statusText: '待付款',
    createTime: '2024-01-20 14:30:00',
    totalPrice: 299,
    items: [
      {
        id: 1,
        name: '婴儿配方奶粉 高端品质款1',
        price: 299,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baby%20milk%20powder&image_size=square',
        quantity: 1,
        spec: '标准款'
      }
    ]
  },
  {
    id: 'ORD202401002',
    status: 'shipped',
    statusText: '待收货',
    createTime: '2024-01-18 10:20:00',
    totalPrice: 456,
    items: [
      {
        id: 2,
        name: '婴儿纸尿裤 高端品质款1',
        price: 89,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baby%20diaper&image_size=square',
        quantity: 2,
        spec: 'L码'
      },
      {
        id: 3,
        name: '玻璃奶瓶 高端品质款1',
        price: 78,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baby%20bottle&image_size=square',
        quantity: 3,
        spec: '240ml'
      }
    ]
  },
  {
    id: 'ORD202401003',
    status: 'completed',
    statusText: '已完成',
    createTime: '2024-01-15 09:15:00',
    totalPrice: 1280,
    items: [
      {
        id: 4,
        name: '轻便婴儿推车 高端品质款1',
        price: 1280,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baby%20stroller&image_size=square',
        quantity: 1,
        spec: '经典灰'
      }
    ]
  }
]

export const addresses = [
  {
    id: 1,
    name: '张三',
    phone: '138****8888',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南区XX路XX号XX小区XX栋XX室',
    isDefault: true
  },
  {
    id: 2,
    name: '李四',
    phone: '139****9999',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: 'XX街道XX号XX大厦XX层',
    isDefault: false
  }
]

export const getProductById = (id) => {
  return products.find(p => p.id === parseInt(id))
}

export const getProductsByCategory = (categoryId) => {
  return products.filter(p => p.categoryId === parseInt(categoryId))
}

export const getHotProducts = () => {
  return products.filter(p => p.isHot).slice(0, 8)
}

export const getNewProducts = () => {
  return products.filter(p => p.isNew).slice(0, 8)
}
