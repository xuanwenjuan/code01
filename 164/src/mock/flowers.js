export const categories = [
  { id: 1, name: '玫瑰', icon: '🌹', color: '#ff6b6b' },
  { id: 2, name: '百合', icon: '💮', color: '#ffd93d' },
  { id: 3, name: '康乃馨', icon: '🌸', color: '#ff9ff3' },
  { id: 4, name: '向日葵', icon: '🌻', color: '#feca57' },
  { id: 5, name: '郁金香', icon: '🌷', color: '#ff6b9d' },
  { id: 6, name: '满天星', icon: '✨', color: '#a29bfe' },
  { id: 7, name: '绣球', icon: '💐', color: '#74b9ff' },
  { id: 8, name: '永生花', icon: '🎀', color: '#fd79a8' }
]

export const purposes = [
  { id: 1, name: '爱情告白' },
  { id: 2, name: '生日祝福' },
  { id: 3, name: '感谢恩师' },
  { id: 4, name: '探望病人' },
  { id: 5, name: '商务礼仪' },
  { id: 6, name: '婚礼用花' },
  { id: 7, name: '家居装饰' },
  { id: 8, name: '节日送礼' }
]

export const priceRanges = [
  { id: 1, name: '100元以下', min: 0, max: 100 },
  { id: 2, name: '100-200元', min: 100, max: 200 },
  { id: 3, name: '200-500元', min: 200, max: 500 },
  { id: 4, name: '500-1000元', min: 500, max: 1000 },
  { id: 5, name: '1000元以上', min: 1000, max: 99999 }
]

export const flowers = [
  {
    id: 1,
    name: '浪漫红玫瑰',
    price: 199,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1518882605630-8132cf358a85?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1518882605630-8132cf358a85?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=600&fit=crop'
    ],
    categoryId: 1,
    purposeId: 1,
    sales: 2568,
    rating: 4.9,
    stock: 100,
    description: '精选19朵优质红玫瑰，搭配满天星和尤加利叶，传递浓烈的爱意。每一朵玫瑰都经过精心挑选，花型饱满，色彩艳丽，是表达爱情的最佳选择。',
    meaning: '红玫瑰代表热烈的爱情，19朵寓意一生一世长长久久。',
    specs: [
      { id: 1, name: '19朵红玫瑰', price: 199 },
      { id: 2, name: '33朵红玫瑰', price: 299 },
      { id: 3, name: '99朵红玫瑰', price: 699 }
    ],
    isHot: true,
    isNew: false,
    delivery: '同城2小时送达'
  },
  {
    id: 2,
    name: '粉色甜蜜',
    price: 168,
    originalPrice: 228,
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=600&h=600&fit=crop'
    ],
    categoryId: 1,
    purposeId: 2,
    sales: 1856,
    rating: 4.8,
    stock: 80,
    description: '11朵粉色玫瑰搭配白色洋桔梗，温柔甜美，适合送给心爱的她。粉色玫瑰带来温柔的浪漫感，是表达心意的不二之选。',
    meaning: '粉色玫瑰代表初恋、温柔和感谢，11朵寓意一心一意。',
    specs: [
      { id: 1, name: '11朵粉玫瑰', price: 168 },
      { id: 2, name: '19朵粉玫瑰', price: 268 },
      { id: 3, name: '33朵粉玫瑰', price: 388 }
    ],
    isHot: true,
    isNew: true,
    delivery: '同城2小时送达'
  },
  {
    id: 3,
    name: '百年好合',
    price: 258,
    originalPrice: 358,
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1575160601917-9384c54e1a8a?w=600&h=600&fit=crop'
    ],
    categoryId: 2,
    purposeId: 6,
    sales: 1234,
    rating: 4.9,
    stock: 50,
    description: '精选6朵香水百合，搭配黄莺和满天星，寓意百年好合。百合花姿优美，花香宜人，是婚礼和祝福的首选。',
    meaning: '百合寓意百年好合、美好家庭、伟大的爱，深深祝福。',
    specs: [
      { id: 1, name: '6朵香水百合', price: 258 },
      { id: 2, name: '9朵香水百合', price: 368 },
      { id: 3, name: '12朵香水百合', price: 468 }
    ],
    isHot: false,
    isNew: false,
    delivery: '同城2小时送达'
  },
  {
    id: 4,
    name: '感恩之心',
    price: 158,
    originalPrice: 198,
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598495037053-3d5b2a61e2db?w=600&h=600&fit=crop'
    ],
    categoryId: 3,
    purposeId: 3,
    sales: 2100,
    rating: 4.7,
    stock: 120,
    description: '20朵粉色康乃馨，搭配绿叶，表达对母亲和恩师的感激之情。康乃馨被称为"母亲之花"，是感恩的最佳代言。',
    meaning: '康乃馨代表母爱、温馨的祝福、感恩之情。',
    specs: [
      { id: 1, name: '20朵粉康乃馨', price: 158 },
      { id: 2, name: '33朵粉康乃馨', price: 228 },
      { id: 3, name: '50朵粉康乃馨', price: 328 }
    ],
    isHot: true,
    isNew: false,
    delivery: '同城2小时送达'
  },
  {
    id: 5,
    name: '阳光向日葵',
    price: 188,
    originalPrice: 258,
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop'
    ],
    categoryId: 4,
    purposeId: 2,
    sales: 1680,
    rating: 4.8,
    stock: 90,
    description: '6朵向日葵搭配尤加利叶，阳光明媚，传递积极向上的力量。向日葵永远追随阳光，象征着乐观和希望。',
    meaning: '向日葵代表阳光、热情、忠诚、沉默的爱、勇敢追求幸福。',
    specs: [
      { id: 1, name: '6朵向日葵', price: 188 },
      { id: 2, name: '9朵向日葵', price: 268 },
      { id: 3, name: '12朵向日葵', price: 358 }
    ],
    isHot: false,
    isNew: true,
    delivery: '同城2小时送达'
  },
  {
    id: 6,
    name: '紫色梦幻',
    price: 228,
    originalPrice: 298,
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&h=600&fit=crop'
    ],
    categoryId: 5,
    purposeId: 1,
    sales: 1450,
    rating: 4.9,
    stock: 60,
    description: '19朵紫色郁金香，神秘高贵，送给最特别的她。郁金香是荷兰的国花，被誉为"花中皇后"。',
    meaning: '紫色郁金香代表高贵的爱、无尽的爱、永恒的祝福。',
    specs: [
      { id: 1, name: '11朵紫郁金香', price: 168 },
      { id: 2, name: '19朵紫郁金香', price: 228 },
      { id: 3, name: '33朵紫郁金香', price: 368 }
    ],
    isHot: true,
    isNew: false,
    delivery: '同城2小时送达'
  },
  {
    id: 7,
    name: '繁星点点',
    price: 128,
    originalPrice: 168,
    image: 'https://images.unsplash.com/photo-1464982326199-86b358b60c5e?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1464982326199-86b358b60c5e?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=600&h=600&fit=crop'
    ],
    categoryId: 6,
    purposeId: 7,
    sales: 1890,
    rating: 4.6,
    stock: 200,
    description: '大束满天星，如繁星点点，清新雅致，可做干花长期保存。满天星是最受欢迎的配花，也是许多人的心头好。',
    meaning: '满天星代表思念、清纯、梦境、真心喜欢、配角但不可或缺。',
    specs: [
      { id: 1, name: '白色满天星', price: 128 },
      { id: 2, name: '粉色满天星', price: 138 },
      { id: 3, name: '蓝色满天星', price: 148 }
    ],
    isHot: false,
    isNew: false,
    delivery: '同城2小时送达'
  },
  {
    id: 8,
    name: '幸福绣球',
    price: 268,
    originalPrice: 338,
    image: 'https://images.unsplash.com/photo-1495231916356-a86217efff12?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1495231916356-a86217efff12?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&h=600&fit=crop'
    ],
    categoryId: 7,
    purposeId: 2,
    sales: 980,
    rating: 4.8,
    stock: 40,
    description: '精选3朵绣球花，团团圆圆，象征幸福美满。绣球花型丰满，花色多变，是近年来非常受欢迎的花材。',
    meaning: '绣球花代表希望、忠贞、永恒、美满、团聚。',
    specs: [
      { id: 1, name: '3朵绣球', price: 268 },
      { id: 2, name: '5朵绣球', price: 398 },
      { id: 3, name: '混色绣球', price: 328 }
    ],
    isHot: false,
    isNew: true,
    delivery: '同城2小时送达'
  },
  {
    id: 9,
    name: '永生玫瑰礼盒',
    price: 388,
    originalPrice: 498,
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1540337969851-4f1c3e3c9095?w=600&h=600&fit=crop'
    ],
    categoryId: 8,
    purposeId: 1,
    sales: 760,
    rating: 4.9,
    stock: 30,
    description: '精选进口永生花玫瑰，可保存3-5年，搭配精美礼盒，是送礼佳品。永生花采用先进工艺制作，保留鲜花的质感和色泽。',
    meaning: '永生花代表永恒的爱、永不凋谢的爱情、守护的爱。',
    specs: [
      { id: 1, name: '单朵永生玫瑰', price: 388 },
      { id: 2, name: '永生玫瑰花束', price: 588 },
      { id: 3, name: '永生花音乐盒', price: 688 }
    ],
    isHot: true,
    isNew: false,
    delivery: '顺丰包邮'
  },
  {
    id: 10,
    name: '混搭花束',
    price: 198,
    originalPrice: 268,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1495231916356-a86217efff12?w=600&h=600&fit=crop'
    ],
    categoryId: 1,
    purposeId: 8,
    sales: 2340,
    rating: 4.7,
    stock: 150,
    description: '玫瑰、百合、康乃馨混搭，色彩丰富，适合各种场合送礼。混搭花束集合了多种花材的优点，性价比高。',
    meaning: '混搭花束代表丰富多彩的生活、美好的祝愿。',
    specs: [
      { id: 1, name: '精致款', price: 198 },
      { id: 2, name: '豪华款', price: 298 },
      { id: 3, name: '尊享款', price: 458 }
    ],
    isHot: true,
    isNew: false,
    delivery: '同城2小时送达'
  },
  {
    id: 11,
    name: '白色恋人',
    price: 218,
    originalPrice: 288,
    image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518882605630-8132cf358a85?w=600&h=600&fit=crop'
    ],
    categoryId: 1,
    purposeId: 1,
    sales: 1560,
    rating: 4.8,
    stock: 70,
    description: '19朵白玫瑰，纯洁无瑕，代表纯纯的爱恋。白玫瑰高贵优雅，是表达纯洁爱情的最佳选择。',
    meaning: '白玫瑰代表纯洁的爱、天真、尊敬、谦卑。',
    specs: [
      { id: 1, name: '11朵白玫瑰', price: 158 },
      { id: 2, name: '19朵白玫瑰', price: 218 },
      { id: 3, name: '33朵白玫瑰', price: 328 }
    ],
    isHot: false,
    isNew: false,
    delivery: '同城2小时送达'
  },
  {
    id: 12,
    name: '橙色阳光',
    price: 178,
    originalPrice: 228,
    image: 'https://images.unsplash.com/photo-1540337969851-4f1c3e3c9095?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1540337969851-4f1c3e3c9095?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&h=600&fit=crop'
    ],
    categoryId: 5,
    purposeId: 2,
    sales: 890,
    rating: 4.7,
    stock: 45,
    description: '橙色郁金香，温暖活力，带来阳光般的心情。橙色郁金香热情洋溢，是送给朋友和恋人的好选择。',
    meaning: '橙色郁金香代表美好的回忆、永恒的爱、荣誉。',
    specs: [
      { id: 1, name: '11朵橙色郁金香', price: 178 },
      { id: 2, name: '19朵橙色郁金香', price: 268 },
      { id: 3, name: '33朵橙色郁金香', price: 398 }
    ],
    isHot: false,
    isNew: true,
    delivery: '同城2小时送达'
  }
]

export const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200&h=400&fit=crop',
    title: '520情人节特惠',
    subtitle: '浪漫玫瑰，为爱放价',
    link: '/list?purpose=1'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=400&fit=crop',
    title: '母亲节感恩专场',
    subtitle: '精选康乃馨，感恩母爱',
    link: '/list?purpose=3'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=1200&h=400&fit=crop',
    title: '毕业季鲜花',
    subtitle: '致青春，致未来',
    link: '/list?purpose=8'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=1200&h=400&fit=crop',
    title: '婚礼用花定制',
    subtitle: '见证最美时刻',
    link: '/list?purpose=6'
  }
]

export const reviews = [
  {
    id: 1,
    flowerId: 1,
    userName: '小***甜',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    rating: 5,
    content: '花很新鲜，包装精美，女朋友收到特别开心！配送也很快，下次还会再来！',
    images: [
      'https://images.unsplash.com/photo-1518882605630-8132cf358a85?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=200&h=200&fit=crop'
    ],
    spec: '19朵红玫瑰',
    createTime: '2024-05-15 14:30:00'
  },
  {
    id: 2,
    flowerId: 1,
    userName: '爱***猫',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    rating: 5,
    content: '玫瑰花质量很好，花朵很大很新鲜，包装也很用心，送人很有面子！',
    images: [],
    spec: '33朵红玫瑰',
    createTime: '2024-05-14 10:20:00'
  },
  {
    id: 3,
    flowerId: 2,
    userName: '阳***光',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    rating: 4,
    content: '粉玫瑰很漂亮，就是配送稍微慢了一点，但还是很满意的。',
    images: [
      'https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=200&h=200&fit=crop'
    ],
    spec: '19朵粉玫瑰',
    createTime: '2024-05-13 16:45:00'
  },
  {
    id: 4,
    flowerId: 4,
    userName: '开***心',
    avatar: 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png',
    rating: 5,
    content: '母亲节送给妈妈的，妈妈特别喜欢！康乃馨很新鲜，包装也很精美！',
    images: [],
    spec: '33朵粉康乃馨',
    createTime: '2024-05-12 09:15:00'
  },
  {
    id: 5,
    flowerId: 5,
    userName: '向***往',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    rating: 5,
    content: '向日葵太好看了！收到后心情都变好了，花很新鲜，配送也快！',
    images: [
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&h=200&fit=crop'
    ],
    spec: '9朵向日葵',
    createTime: '2024-05-11 11:30:00'
  }
]

export const getFlowerById = (id) => {
  return flowers.find(f => f.id === parseInt(id))
}

export const getReviewsByFlowerId = (flowerId) => {
  return reviews.filter(r => r.flowerId === parseInt(flowerId))
}

export const getHotFlowers = () => {
  return flowers.filter(f => f.isHot)
}

export const getNewFlowers = () => {
  return flowers.filter(f => f.isNew)
}

export const getRecommendFlowers = () => {
  return [...flowers].sort(() => Math.random() - 0.5).slice(0, 8)
}
