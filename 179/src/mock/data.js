export const mockCategories = [
  { id: 1, name: '项链', icon: '🍀', description: '复古优雅项链系列' },
  { id: 2, name: '耳环', icon: '💎', description: '精致复古耳环系列' },
  { id: 3, name: '手链', icon: '📿', description: '经典复古手链系列' },
  { id: 4, name: '戒指', icon: '💍', description: '典雅复古戒指系列' },
  { id: 5, name: '胸针', icon: '🌺', description: '气质复古胸针系列' },
  { id: 6, name: '发饰', icon: '👑', description: '复古发饰系列' }
]

export const mockProducts = [
  {
    id: 1,
    name: '维多利亚复古珍珠项链',
    categoryId: 1,
    price: 299,
    originalPrice: 499,
    description: '采用19世纪维多利亚时代设计风格，精选淡水珍珠，镶嵌工艺精湛，彰显高贵典雅气质。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20victorian%20pearl%20necklace%20elegant%20jewelry&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20pearl%20necklace%20detail%20shot&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20necklace%20on%20model%20elegant&image_size=square_hd'
    ],
    material: '925银镀18K金 + 淡水珍珠',
    sizes: ['40cm', '45cm', '50cm'],
    stock: 50,
    sales: 1280,
    isHot: true,
    isNew: false,
    tags: ['维多利亚', '珍珠', '优雅'],
    merchant: '古韵堂',
    createdAt: '2024-01-15T10:00:00Z',
    details: {
      brand: '古韵堂',
      style: '维多利亚复古',
      material: '925银镀18K金',
      pearlType: '淡水珍珠',
      pearlSize: '8-9mm',
      chainLength: '可调节',
      weight: '约15g',
      packaging: '精美礼盒包装'
    }
  },
  {
    id: 2,
    name: '巴洛克复古耳环',
    categoryId: 2,
    price: 199,
    originalPrice: 299,
    description: '巴洛克风格设计，金属雕花工艺，复古典雅，适合各种场合佩戴。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baroque%20vintage%20earrings%20gold%20ornate&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20earrings%20detail%20carving&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baroque%20earrings%20on%20model&image_size=square_hd'
    ],
    material: '合金镀古铜',
    sizes: ['均码'],
    stock: 100,
    sales: 890,
    isHot: true,
    isNew: true,
    tags: ['巴洛克', '雕花', '复古'],
    merchant: '时光印记',
    createdAt: '2024-03-20T14:30:00Z',
    details: {
      brand: '时光印记',
      style: '巴洛克复古',
      material: '合金镀古铜',
      size: '约3.5cm',
      weight: '约8g/对',
      earType: '耳针款',
      packaging: '精美礼盒包装'
    }
  },
  {
    id: 3,
    name: '中世纪复古手链',
    categoryId: 3,
    price: 259,
    originalPrice: 399,
    description: '中世纪骑士风格设计，链条雕刻精美图案，展现复古魅力。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medieval%20vintage%20bracelet%20silver%20chain&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20bracelet%20detail%20engraving&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medieval%20bracelet%20on%20wrist&image_size=square_hd'
    ],
    material: '925银',
    sizes: ['18cm', '20cm', '22cm'],
    stock: 30,
    sales: 560,
    isHot: false,
    isNew: false,
    tags: ['中世纪', '骑士', '银饰'],
    merchant: '古韵堂',
    createdAt: '2024-02-10T09:00:00Z',
    details: {
      brand: '古韵堂',
      style: '中世纪复古',
      material: '925纯银',
      chainWidth: '约8mm',
      weight: '约25g',
      claspType: '龙虾扣',
      packaging: '精美礼盒包装'
    }
  },
  {
    id: 4,
    name: 'Art Deco复古戒指',
    categoryId: 4,
    price: 399,
    originalPrice: 599,
    description: '1920年代Art Deco风格，几何图案设计，镶嵌锆石，奢华典雅。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=art%20deco%20vintage%20ring%20gold%20geometric&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20ring%20detail%20zirconia&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=art%20deco%20ring%20on%20finger&image_size=square_hd'
    ],
    material: '925银镀18K金 + 锆石',
    sizes: ['16号', '17号', '18号', '19号'],
    stock: 25,
    sales: 720,
    isHot: true,
    isNew: true,
    tags: ['Art Deco', '锆石', '奢华'],
    merchant: '流金岁月',
    createdAt: '2024-03-25T11:00:00Z',
    details: {
      brand: '流金岁月',
      style: 'Art Deco',
      material: '925银镀18K金',
      stone: '5A级锆石',
      stoneCount: '12颗',
      ringFace: '约1.2cm',
      packaging: '精美礼盒包装'
    }
  },
  {
    id: 5,
    name: '维多利亚复古胸针',
    categoryId: 5,
    price: 189,
    originalPrice: 289,
    description: '维多利亚时代花卉造型，珐琅彩工艺，精致典雅，适合搭配外套或连衣裙。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20vintage%20brooch%20floral%20enamel&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20brooch%20detail%20enamel&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20brooch%20on%20coat&image_size=square_hd'
    ],
    material: '合金镀18K金 + 珐琅彩',
    sizes: ['均码'],
    stock: 80,
    sales: 450,
    isHot: false,
    isNew: false,
    tags: ['维多利亚', '珐琅彩', '花卉'],
    merchant: '时光印记',
    createdAt: '2024-01-28T15:00:00Z',
    details: {
      brand: '时光印记',
      style: '维多利亚复古',
      material: '合金镀18K金',
      craft: '珐琅彩',
      size: '约4cm',
      weight: '约12g',
      packaging: '精美礼盒包装'
    }
  },
  {
    id: 6,
    name: '复古宫廷发簪',
    categoryId: 6,
    price: 229,
    originalPrice: 359,
    description: '欧洲宫廷风格设计，珍珠点缀，优雅高贵，适合宴会或婚礼场合。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20palace%20hairpin%20pearl%20elegant&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20hairpin%20detail%20pearl&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20hairpin%20in%20hairstyle&image_size=square_hd'
    ],
    material: '合金镀18K金 + 珍珠',
    sizes: ['均码'],
    stock: 40,
    sales: 380,
    isHot: false,
    isNew: true,
    tags: ['宫廷', '珍珠', '优雅'],
    merchant: '流金岁月',
    createdAt: '2024-03-28T16:00:00Z',
    details: {
      brand: '流金岁月',
      style: '宫廷复古',
      material: '合金镀18K金',
      pearl: '淡水珍珠',
      length: '约15cm',
      weight: '约20g',
      packaging: '精美礼盒包装'
    }
  },
  {
    id: 7,
    name: '波西米亚复古项链',
    categoryId: 1,
    price: 169,
    originalPrice: 269,
    description: '波西米亚风格，多层链条设计，搭配流苏和天然石，自由随性。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bohemian%20vintage%20necklace%20layered%20tassel&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bohemian%20necklace%20detail%20stones&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bohemian%20necklace%20on%20model&image_size=square_hd'
    ],
    material: '合金 + 天然石',
    sizes: ['45cm', '50cm'],
    stock: 60,
    sales: 920,
    isHot: true,
    isNew: false,
    tags: ['波西米亚', '多层', '流苏'],
    merchant: '自由风尚',
    createdAt: '2024-02-15T10:30:00Z',
    details: {
      brand: '自由风尚',
      style: '波西米亚复古',
      material: '合金 + 天然石',
      layers: '3层',
      tassel: '约5cm',
      weight: '约18g',
      packaging: '精美礼盒包装'
    }
  },
  {
    id: 8,
    name: '复古浮雕耳环',
    categoryId: 2,
    price: 159,
    originalPrice: 249,
    description: '古罗马浮雕工艺，人像图案设计，古典优雅，艺术气息浓厚。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20cameo%20earrings%20roman%20portrait&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cameo%20earring%20detail%20carving&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20cameo%20earrings%20on%20model&image_size=square_hd'
    ],
    material: '树脂浮雕 + 925银',
    sizes: ['均码'],
    stock: 70,
    sales: 640,
    isHot: false,
    isNew: false,
    tags: ['浮雕', '古罗马', '艺术'],
    merchant: '古韵堂',
    createdAt: '2024-01-20T14:00:00Z',
    details: {
      brand: '古韵堂',
      style: '古罗马复古',
      material: '树脂浮雕 + 925银',
      size: '约2cm',
      weight: '约6g/对',
      earType: '耳针款',
      packaging: '精美礼盒包装'
    }
  },
  {
    id: 9,
    name: '复古编织手链',
    categoryId: 3,
    price: 129,
    originalPrice: 199,
    description: '手工编织工艺，搭配复古金属配件，民族风十足，适合日常佩戴。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20woven%20bracelet%20bohemian%20handmade&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=woven%20bracelet%20detail%20knots&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=woven%20bracelet%20on%20wrist&image_size=square_hd'
    ],
    material: '蜡绳 + 合金',
    sizes: ['可调节'],
    stock: 120,
    sales: 1100,
    isHot: true,
    isNew: true,
    tags: ['手工', '编织', '民族风'],
    merchant: '自由风尚',
    createdAt: '2024-03-30T09:00:00Z',
    details: {
      brand: '自由风尚',
      style: '民族复古',
      material: '蜡绳 + 合金',
      length: '16-24cm可调节',
      width: '约5mm',
      weight: '约5g',
      packaging: '精美礼盒包装'
    }
  },
  {
    id: 10,
    name: '复古宝石戒指',
    categoryId: 4,
    price: 459,
    originalPrice: 699,
    description: '复古宫廷风格，镶嵌合成红宝石，周边碎钻点缀，奢华大气。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20ruby%20ring%20gold%20ornate&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20ring%20detail%20gemstone&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ruby%20ring%20on%20finger%20elegant&image_size=square_hd'
    ],
    material: '925银镀18K金 + 合成红宝石',
    sizes: ['15号', '16号', '17号', '18号', '19号'],
    stock: 20,
    sales: 340,
    isHot: false,
    isNew: false,
    tags: ['宫廷', '红宝石', '奢华'],
    merchant: '流金岁月',
    createdAt: '2024-02-20T11:30:00Z',
    details: {
      brand: '流金岁月',
      style: '宫廷复古',
      material: '925银镀18K金',
      mainStone: '合成红宝石',
      mainStoneSize: '约8mm',
      sideStones: '锆石',
      packaging: '精美礼盒包装'
    }
  },
  {
    id: 11,
    name: '复古羽毛胸针',
    categoryId: 5,
    price: 149,
    originalPrice: 229,
    description: '复古羽毛造型，金属质感强烈，男士女士皆可佩戴，时尚百搭。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20feather%20brooch%20antique%20silver&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=feather%20brooch%20detail%20texture&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=feather%20brooch%20on%20suit&image_size=square_hd'
    ],
    material: '合金镀古银',
    sizes: ['均码'],
    stock: 90,
    sales: 580,
    isHot: false,
    isNew: false,
    tags: ['羽毛', '百搭', '中性'],
    merchant: '时光印记',
    createdAt: '2024-01-25T13:00:00Z',
    details: {
      brand: '时光印记',
      style: '复古英伦',
      material: '合金镀古银',
      size: '约6cm',
      weight: '约10g',
      gender: '男女通用',
      packaging: '精美礼盒包装'
    }
  },
  {
    id: 12,
    name: '复古皇冠发箍',
    categoryId: 6,
    price: 179,
    originalPrice: 279,
    description: '复古皇冠设计，镶嵌水钻，优雅高贵，适合派对或特殊场合。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20crown%20headband%20rhinestone%20elegant&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=crown%20headband%20detail%20rhinestone&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20crown%20headband%20on%20model&image_size=square_hd'
    ],
    material: '合金 + 水钻',
    sizes: ['均码'],
    stock: 35,
    sales: 420,
    isHot: false,
    isNew: true,
    tags: ['皇冠', '水钻', '派对'],
    merchant: '流金岁月',
    createdAt: '2024-03-15T10:00:00Z',
    details: {
      brand: '流金岁月',
      style: '宫廷复古',
      material: '合金 + 水钻',
      crownHeight: '约3cm',
      weight: '约30g',
      adjustable: '是',
      packaging: '精美礼盒包装'
    }
  }
]

export const mockUsers = [
  {
    id: 1,
    username: 'user123',
    password: '123456',
    nickname: '复古爱好者',
    email: 'user@example.com',
    phone: '13800138001',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    role: 'user',
    address: '北京市朝阳区某某路123号',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'merchant123',
    password: '123456',
    nickname: '古韵堂商家',
    email: 'merchant@example.com',
    phone: '13900139001',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    role: 'merchant',
    shopName: '古韵堂',
    shopDescription: '专注复古饰品十余年',
    createdAt: '2023-06-01T00:00:00Z'
  }
]

export const mockOrders = [
  {
    id: 1001,
    userId: 1,
    orderNo: 'ORD202403010001',
    items: [
      {
        productId: 1,
        name: '维多利亚复古珍珠项链',
        price: 299,
        quantity: 1,
        size: '45cm',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20victorian%20pearl%20necklace%20elegant%20jewelry&image_size=square_hd'
      }
    ],
    totalPrice: 299,
    status: 'completed',
    address: '北京市朝阳区某某路123号',
    phone: '13800138001',
    createdAt: '2024-03-01T10:00:00Z',
    paidAt: '2024-03-01T10:05:00Z',
    shippedAt: '2024-03-02T09:00:00Z',
    completedAt: '2024-03-05T14:30:00Z'
  },
  {
    id: 1002,
    userId: 1,
    orderNo: 'ORD202403100002',
    items: [
      {
        productId: 2,
        name: '巴洛克复古耳环',
        price: 199,
        quantity: 1,
        size: '均码',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baroque%20vintage%20earrings%20gold%20ornate&image_size=square_hd'
      },
      {
        productId: 3,
        name: '中世纪复古手链',
        price: 259,
        quantity: 1,
        size: '20cm',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medieval%20vintage%20bracelet%20silver%20chain&image_size=square_hd'
      }
    ],
    totalPrice: 458,
    status: 'shipped',
    address: '北京市朝阳区某某路123号',
    phone: '13800138001',
    createdAt: '2024-03-10T15:00:00Z',
    paidAt: '2024-03-10T15:03:00Z',
    shippedAt: '2024-03-11T10:00:00Z'
  },
  {
    id: 1003,
    userId: 1,
    orderNo: 'ORD202403200003',
    items: [
      {
        productId: 4,
        name: 'Art Deco复古戒指',
        price: 399,
        quantity: 1,
        size: '17号',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=art%20deco%20vintage%20ring%20gold%20geometric&image_size=square_hd'
      }
    ],
    totalPrice: 399,
    status: 'pending',
    address: '北京市朝阳区某某路123号',
    phone: '13800138001',
    createdAt: new Date().toISOString()
  }
]

export const mockAfterSales = [
  {
    id: 501,
    userId: 1,
    orderId: 1001,
    orderNo: 'ORD202403010001',
    productName: '维多利亚复古珍珠项链',
    type: 'return',
    reason: '尺寸不合适',
    description: '项链长度比预期短，希望退换。',
    images: [],
    status: 'completed',
    createdAt: '2024-03-06T09:00:00Z',
    resolvedAt: '2024-03-08T14:00:00Z',
    result: '已同意退款，款项已原路返回。'
  },
  {
    id: 502,
    userId: 1,
    orderId: 1002,
    orderNo: 'ORD202403100002',
    productName: '巴洛克复古耳环',
    type: 'exchange',
    reason: '商品有瑕疵',
    description: '收到的耳环有轻微划痕，希望更换。',
    images: [],
    status: 'processing',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
]
