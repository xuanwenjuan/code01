export const carBrands = [
  { id: 1, name: '大众', logo: '🚗' },
  { id: 2, name: '丰田', logo: '🚙' },
  { id: 3, name: '本田', logo: '🚘' },
  { id: 4, name: '宝马', logo: '🏎️' },
  { id: 5, name: '奔驰', logo: '🚐' },
  { id: 6, name: '奥迪', logo: '🚕' },
  { id: 7, name: '别克', logo: '🚖' },
  { id: 8, name: '雪佛兰', logo: '🚔' }
]

export const categories = [
  { id: 1, name: '发动机系统', icon: '⚙️', children: ['机油', '滤芯', '火花塞', '皮带', '水泵'] },
  { id: 2, name: '底盘系统', icon: '🔩', children: ['刹车片', '减震器', '轮胎', '轮毂', '转向系统'] },
  { id: 3, name: '电气系统', icon: '🔋', children: ['蓄电池', '发电机', '起动机', '火花塞', '传感器'] },
  { id: 4, name: '冷却系统', icon: '❄️', children: ['水箱', '防冻液', '风扇', '节温器', '水管'] },
  { id: 5, name: '制动系统', icon: '🛑', children: ['刹车片', '刹车盘', '刹车油', '真空泵', 'ABS系统'] },
  { id: 6, name: '悬挂系统', icon: '🔧', children: ['减震器', '弹簧', '摆臂', '球头', '平衡杆'] }
]

export const maintenanceItems = [
  { id: 1, name: '机油保养', desc: '更换机油机滤', price: 299, image: 'https://picsum.photos/seed/oil1/400/300' },
  { id: 2, name: '刹车保养', desc: '检查刹车片盘', price: 399, image: 'https://picsum.photos/seed/brake1/400/300' },
  { id: 3, name: '空调养护', desc: '清洗空调系统', price: 199, image: 'https://picsum.photos/seed/ac1/400/300' },
  { id: 4, name: '轮胎更换', desc: '更换四条轮胎', price: 1599, image: 'https://picsum.photos/seed/tire1/400/300' }
]

export const brands = [
  { id: 1, name: '博世', logo: '🔷', desc: '德国知名品牌' },
  { id: 2, name: '美孚', logo: '🔶', desc: '专业润滑油品牌' },
  { id: 3, name: '米其林', logo: '🔵', desc: '轮胎制造专家' },
  { id: 4, name: '菲罗多', logo: '🔴', desc: '制动系统专家' },
  { id: 5, name: '曼牌', logo: '🟢', desc: '滤清器领先品牌' },
  { id: 6, name: '瓦尔塔', logo: '🟡', desc: '蓄电池知名品牌' }
]

export const banners = [
  { id: 1, image: 'https://picsum.photos/seed/banner1/1200/400', title: '春季保养特惠', link: '/list?category=1' },
  { id: 2, image: 'https://picsum.photos/seed/banner2/1200/400', title: '轮胎买三送一', link: '/list?category=2' },
  { id: 3, image: 'https://picsum.photos/seed/banner3/1200/400', title: '品牌机油半价', link: '/list?brand=2' }
]

const productImages = [
  'https://picsum.photos/seed/prod1/400/400',
  'https://picsum.photos/seed/prod2/400/400',
  'https://picsum.photos/seed/prod3/400/400',
  'https://picsum.photos/seed/prod4/400/400',
  'https://picsum.photos/seed/prod5/400/400',
  'https://picsum.photos/seed/prod6/400/400'
]

export const products = [
  {
    id: 1,
    name: '美孚1号 全合成机油 0W-40 SN级 4L',
    category: 1,
    subCategory: '机油',
    brand: '美孚',
    brandId: 2,
    price: 399,
    originalPrice: 499,
    image: productImages[0],
    images: [productImages[0], productImages[1], productImages[2]],
    sales: 15680,
    rating: 4.9,
    stock: 500,
    description: '美孚1号全合成机油，采用先进配方，为发动机提供卓越保护，适用于各种驾驶条件。',
    specs: [
      { name: '粘度', values: ['0W-40', '5W-30', '10W-40'] },
      { name: '容量', values: ['1L', '4L', '5L'] }
    ],
    params: [
      { label: '品牌', value: '美孚' },
      { label: '型号', value: '0W-40' },
      { label: '规格', value: '4L' },
      { label: '产地', value: '新加坡' },
      { label: '保质期', value: '5年' }
    ],
    reviews: [
      { id: 1, user: '张**', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', rating: 5, content: '一直在用美孚1号，发动机静音效果很好，动力也不错。', time: '2024-01-15' },
      { id: 2, user: '李**', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', rating: 5, content: '正品保证，价格比实体店便宜，下次还会回购。', time: '2024-01-10' },
      { id: 3, user: '王**', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', rating: 4, content: '物流很快，包装完好，还没使用，先好评。', time: '2024-01-05' }
    ]
  },
  {
    id: 2,
    name: '博世刹车片 前片 适用于大众朗逸/宝来',
    category: 2,
    subCategory: '刹车片',
    brand: '博世',
    brandId: 1,
    price: 259,
    originalPrice: 359,
    image: productImages[1],
    images: [productImages[1], productImages[0], productImages[3]],
    sales: 8920,
    rating: 4.8,
    stock: 300,
    description: '博世正品刹车片，采用先进摩擦材料，制动性能优异，无噪音，使用寿命长。',
    specs: [
      { name: '位置', values: ['前片', '后片'] },
      { name: '套装', values: ['四轮套装', '仅前片', '仅后片'] }
    ],
    params: [
      { label: '品牌', value: '博世' },
      { label: '材质', value: '陶瓷' },
      { label: '适用车型', value: '大众朗逸/宝来' },
      { label: '产地', value: '中国' }
    ],
    reviews: [
      { id: 1, user: '赵**', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', rating: 5, content: '安装后刹车很稳，没有异响，比原车的好。', time: '2024-01-12' }
    ]
  },
  {
    id: 3,
    name: '米其林轮胎 205/55R16 91V 韧悦XM2+',
    category: 2,
    subCategory: '轮胎',
    brand: '米其林',
    brandId: 3,
    price: 599,
    originalPrice: 699,
    image: productImages[2],
    images: [productImages[2], productImages[4], productImages[5]],
    sales: 12350,
    rating: 4.9,
    stock: 200,
    description: '米其林韧悦XM2+轮胎，耐磨性能出色，湿地抓地力强，行驶静音舒适。',
    specs: [
      { name: '尺寸', values: ['205/55R16', '195/65R15', '215/60R16'] },
      { name: '数量', values: ['1条', '2条', '4条'] }
    ],
    params: [
      { label: '品牌', value: '米其林' },
      { label: '规格', value: '205/55R16' },
      { label: '负荷指数', value: '91' },
      { label: '速度级别', value: 'V' }
    ],
    reviews: [
      { id: 1, user: '孙**', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', rating: 5, content: '米其林轮胎确实静音，舒适性也很好，值得购买。', time: '2024-01-08' }
    ]
  },
  {
    id: 4,
    name: '曼牌机油滤清器 W712/95 大众车型专用',
    category: 1,
    subCategory: '滤芯',
    brand: '曼牌',
    brandId: 5,
    price: 69,
    originalPrice: 99,
    image: productImages[3],
    images: [productImages[3], productImages[0], productImages[1]],
    sales: 25680,
    rating: 4.9,
    stock: 1000,
    description: '曼牌机油滤清器，采用高品质过滤材料，过滤效率高，使用寿命长。',
    specs: [],
    params: [
      { label: '品牌', value: '曼牌' },
      { label: '型号', value: 'W712/95' },
      { label: '适用车型', value: '大众EA888发动机' },
      { label: '产地', value: '德国' }
    ],
    reviews: [
      { id: 1, user: '周**', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', rating: 5, content: '曼牌滤芯质量很好，一直用这个牌子。', time: '2024-01-18' }
    ]
  },
  {
    id: 5,
    name: '瓦尔塔蓄电池 12V 60AH L2-400 免维护',
    category: 3,
    subCategory: '蓄电池',
    brand: '瓦尔塔',
    brandId: 6,
    price: 459,
    originalPrice: 559,
    image: productImages[4],
    images: [productImages[4], productImages[5], productImages[3]],
    sales: 6780,
    rating: 4.7,
    stock: 150,
    description: '瓦尔塔免维护蓄电池，启动性能强，使用寿命长，适用于多种车型。',
    specs: [
      { name: '容量', values: ['45AH', '60AH', '70AH', '80AH'] }
    ],
    params: [
      { label: '品牌', value: '瓦尔塔' },
      { label: '型号', value: 'L2-400' },
      { label: '电压', value: '12V' },
      { label: '容量', value: '60AH' }
    ],
    reviews: [
      { id: 1, user: '吴**', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', rating: 5, content: '师傅上门安装很快，电瓶质量不错。', time: '2024-01-03' }
    ]
  },
  {
    id: 6,
    name: '博世双铱金火花塞 FR7KII33X 4支装',
    category: 1,
    subCategory: '火花塞',
    brand: '博世',
    brandId: 1,
    price: 329,
    originalPrice: 429,
    image: productImages[5],
    images: [productImages[5], productImages[2], productImages[4]],
    sales: 9450,
    rating: 4.8,
    stock: 400,
    description: '博世双铱金火花塞，点火性能优异，燃油经济性好，使用寿命长达8万公里。',
    specs: [
      { name: '数量', values: ['4支装', '6支装', '8支装'] }
    ],
    params: [
      { label: '品牌', value: '博世' },
      { label: '型号', value: 'FR7KII33X' },
      { label: '材质', value: '双铱金' },
      { label: '产地', value: '中国' }
    ],
    reviews: [
      { id: 1, user: '郑**', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', rating: 5, content: '换了火花塞后，发动机动力明显提升，怠速也稳了。', time: '2024-01-20' }
    ]
  },
  {
    id: 7,
    name: '菲罗多刹车片 后片 适用于丰田凯美瑞',
    category: 5,
    subCategory: '刹车片',
    brand: '菲罗多',
    brandId: 4,
    price: 229,
    originalPrice: 329,
    image: productImages[0],
    images: [productImages[0], productImages[1], productImages[3]],
    sales: 7560,
    rating: 4.7,
    stock: 250,
    description: '菲罗多刹车片，专业制动系统制造商，制动力稳定，耐磨性能好。',
    specs: [
      { name: '位置', values: ['前片', '后片'] }
    ],
    params: [
      { label: '品牌', value: '菲罗多' },
      { label: '材质', value: '低金属' },
      { label: '适用车型', value: '丰田凯美瑞' }
    ],
    reviews: []
  },
  {
    id: 8,
    name: '盖茨正时皮带套装 大众EA888发动机专用',
    category: 1,
    subCategory: '皮带',
    brand: '博世',
    brandId: 1,
    price: 599,
    originalPrice: 799,
    image: productImages[2],
    images: [productImages[2], productImages[4], productImages[5]],
    sales: 4320,
    rating: 4.8,
    stock: 100,
    description: '盖茨正时皮带套装，包含皮带、张紧轮、惰轮，确保发动机正时系统稳定运行。',
    specs: [],
    params: [
      { label: '品牌', value: '盖茨' },
      { label: '适用发动机', value: '大众EA888' },
      { label: '套装内容', value: '皮带+张紧轮+惰轮' }
    ],
    reviews: []
  },
  {
    id: 9,
    name: '壳牌灰喜力 全合成机油 5W-30 SP级 4L',
    category: 1,
    subCategory: '机油',
    brand: '美孚',
    brandId: 2,
    price: 359,
    originalPrice: 459,
    image: productImages[3],
    images: [productImages[3], productImages[0], productImages[1]],
    sales: 11230,
    rating: 4.8,
    stock: 450,
    description: '壳牌灰喜力全合成机油，清洁性能优异，有效减少积碳，保护发动机。',
    specs: [
      { name: '粘度', values: ['5W-30', '0W-40', '5W-40'] },
      { name: '容量', values: ['1L', '4L'] }
    ],
    params: [
      { label: '品牌', value: '壳牌' },
      { label: '型号', value: '5W-30' },
      { label: '规格', value: '4L' }
    ],
    reviews: []
  },
  {
    id: 10,
    name: 'KYB减震器 前减 适用于本田雅阁',
    category: 6,
    subCategory: '减震器',
    brand: '博世',
    brandId: 1,
    price: 499,
    originalPrice: 599,
    image: productImages[4],
    images: [productImages[4], productImages[5], productImages[2]],
    sales: 5670,
    rating: 4.6,
    stock: 180,
    description: 'KYB减震器，日本品牌，减震效果好，行驶稳定性高，乘坐舒适。',
    specs: [
      { name: '位置', values: ['前减', '后减'], },
      { name: '数量', values: ['1支', '2支', '4支'] }
    ],
    params: [
      { label: '品牌', value: 'KYB' },
      { label: '类型', value: '液压减震' },
      { label: '适用车型', value: '本田雅阁' }
    ],
    reviews: []
  },
  {
    id: 11,
    name: '嘉实多极护 全合成机油 0W-40 SP级 4L',
    category: 1,
    subCategory: '机油',
    brand: '美孚',
    brandId: 2,
    price: 429,
    originalPrice: 529,
    image: productImages[5],
    images: [productImages[5], productImages[0], productImages[3]],
    sales: 8960,
    rating: 4.9,
    stock: 380,
    description: '嘉实多极护全合成机油，钛流体技术，为发动机提供超强保护。',
    specs: [
      { name: '粘度', values: ['0W-40', '5W-30', '10W-60'] },
      { name: '容量', values: ['1L', '4L', '5L'] }
    ],
    params: [
      { label: '品牌', value: '嘉实多' },
      { label: '型号', value: '0W-40' },
      { label: '规格', value: '4L' }
    ],
    reviews: []
  },
  {
    id: 12,
    name: '马牌轮胎 215/55R17 94V UC6',
    category: 2,
    subCategory: '轮胎',
    brand: '米其林',
    brandId: 3,
    price: 649,
    originalPrice: 749,
    image: productImages[1],
    images: [productImages[1], productImages[2], productImages[4]],
    sales: 6540,
    rating: 4.8,
    stock: 160,
    description: '马牌UC6轮胎，干湿性能均衡，操控精准，静音舒适。',
    specs: [
      { name: '尺寸', values: ['215/55R17', '225/50R17', '235/45R18'] },
      { name: '数量', values: ['1条', '2条', '4条'] }
    ],
    params: [
      { label: '品牌', value: '马牌' },
      { label: '系列', value: 'UC6' },
      { label: '规格', value: '215/55R17' }
    ],
    reviews: []
  }
]

export const mockUsers = [
  {
    id: 1,
    username: 'test',
    password: '123456',
    phone: '13800138000',
    email: 'test@example.com',
    nickname: '测试用户',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    gender: '男',
    birthday: '1990-01-01'
  }
]

export const mockOrders = [
  {
    id: 1001,
    orderNo: 'ORD202401150001',
    items: [products[0], products[3]],
    total: 468,
    address: { name: '张三', phone: '13800138000', address: '北京市朝阳区某某街道123号' },
    status: 'shipped',
    createTime: Date.now() - 86400000 * 3
  },
  {
    id: 1002,
    orderNo: 'ORD202401100002',
    items: [products[2]],
    total: 599,
    address: { name: '张三', phone: '13800138000', address: '北京市朝阳区某某街道123号' },
    status: 'completed',
    createTime: Date.now() - 86400000 * 10
  }
]

export const mockAddresses = [
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    address: '某某街道123号某某小区1号楼101室',
    isDefault: true
  },
  {
    id: 2,
    name: '李四',
    phone: '13900139000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    address: '某某路456号某某大厦A座2001室',
    isDefault: false
  }
]

export const mockFavorites = [
  { ...products[0], favoriteTime: Date.now() - 86400000 * 2 },
  { ...products[2], favoriteTime: Date.now() - 86400000 * 5 }
]

export const mockHistory = [
  { ...products[1], viewTime: Date.now() - 3600000 },
  { ...products[3], viewTime: Date.now() - 7200000 },
  { ...products[5], viewTime: Date.now() - 86400000 }
]
