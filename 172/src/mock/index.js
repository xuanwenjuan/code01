export const banners = [
  {
    id: 1,
    title: '新品首发',
    description: '精选文具礼盒，送礼首选',
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&h=400&fit=crop',
    link: '/category/new'
  },
  {
    id: 2,
    title: '限时特惠',
    description: '全场满199减50，错过再等一年',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=1200&h=400&fit=crop',
    link: '/sale'
  },
  {
    id: 3,
    title: '文具套装',
    description: '一站式购齐，省心又省钱',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    link: '/category/sets'
  }
];

export const categories = [
  { id: 1, name: '书写工具', icon: '✏️', count: 128 },
  { id: 2, name: '笔记本', icon: '📓', count: 86 },
  { id: 3, name: '文件管理', icon: '📁', count: 64 },
  { id: 4, name: '办公文具', icon: '🖇️', count: 92 },
  { id: 5, name: '礼品套装', icon: '🎁', count: 45 },
  { id: 6, name: '学生用品', icon: '🎒', count: 78 },
  { id: 7, name: '美术用品', icon: '🎨', count: 56 },
  { id: 8, name: '数码配件', icon: '💻', count: 38 }
];

export const products = [
  {
    id: 1,
    name: '派克钢笔礼盒套装',
    price: 299,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=400&fit=crop',
    category: '书写工具',
    categoryId: 1,
    sales: 2568,
    rating: 4.9,
    stock: 100,
    description: '经典派克钢笔，采用优质不锈钢材质，书写流畅，是商务送礼的绝佳选择。套装包含钢笔、墨水、精美礼盒。',
    specs: [
      { name: '颜色', options: ['黑色', '银色', '金色'] },
      { name: '笔尖', options: ['F尖', 'M尖', 'B尖'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1569017388730-020b5f80a004?w=600&h=600&fit=crop'
    ],
    isHot: true,
    isNew: true
  },
  {
    id: 2,
    name: 'Moleskine经典笔记本',
    price: 128,
    originalPrice: 168,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
    category: '笔记本',
    categoryId: 2,
    sales: 5896,
    rating: 4.8,
    stock: 200,
    description: '意大利原装进口Moleskine笔记本，优质象牙白纸张，适合书写和绘画。硬壳封面，耐用耐磨。',
    specs: [
      { name: '尺寸', options: ['口袋本', '大型本', '超大本'] },
      { name: '内页', options: ['空白', '横线', '方格'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=600&fit=crop'
    ],
    isHot: true,
    isNew: false
  },
  {
    id: 3,
    name: '得力文件收纳套装',
    price: 89,
    originalPrice: 129,
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop',
    category: '文件管理',
    categoryId: 3,
    sales: 3421,
    rating: 4.7,
    stock: 150,
    description: '得力高品质文件收纳套装，包含文件架、文件盒、文件夹。优质PP材料，环保无异味。',
    specs: [
      { name: '颜色', options: ['蓝色', '灰色', '黑色'] },
      { name: '层数', options: ['三层', '四层', '五层'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=600&fit=crop'
    ],
    isHot: false,
    isNew: true
  },
  {
    id: 4,
    name: '晨光按动中性笔12支装',
    price: 29.9,
    originalPrice: 49.9,
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop',
    category: '书写工具',
    categoryId: 1,
    sales: 12568,
    rating: 4.9,
    stock: 500,
    description: '晨光经典按动中性笔，0.5mm笔尖，书写顺滑不断墨。12支超值装，日常办公学习必备。',
    specs: [
      { name: '颜色', options: ['黑色', '蓝色', '红色'] },
      { name: '笔尖', options: ['0.38mm', '0.5mm', '0.7mm'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&h=600&fit=crop'
    ],
    isHot: true,
    isNew: false
  },
  {
    id: 5,
    name: '精美文具礼盒套装',
    price: 199,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=400&fit=crop',
    category: '礼品套装',
    categoryId: 5,
    sales: 1856,
    rating: 4.8,
    stock: 80,
    description: '精选文具礼盒套装，包含钢笔、笔记本、书签、胶带等。精美包装，适合各种送礼场合。',
    specs: [
      { name: '款式', options: ['商务款', '少女款', '简约款'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=600&fit=crop'
    ],
    isHot: true,
    isNew: true
  },
  {
    id: 6,
    name: '樱花固体水彩颜料24色',
    price: 168,
    originalPrice: 218,
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop',
    category: '美术用品',
    categoryId: 7,
    sales: 2345,
    rating: 4.9,
    stock: 120,
    description: '日本樱花固体水彩，色彩鲜艳，透明度高。24色套装，附带水彩笔和调色盘。',
    specs: [
      { name: '色数', options: ['12色', '24色', '36色', '48色'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=600&fit=crop'
    ],
    isHot: false,
    isNew: false
  },
  {
    id: 7,
    name: '国誉活页本B5',
    price: 45,
    originalPrice: 65,
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop',
    category: '笔记本',
    categoryId: 2,
    sales: 6789,
    rating: 4.8,
    stock: 300,
    description: '国誉高品质活页本，可随意添加或更换内页。8mm横线，优质纸张不洇墨。',
    specs: [
      { name: '尺寸', options: ['A5', 'B5', 'A4'] },
      { name: '颜色', options: ['蓝色', '粉色', '绿色', '灰色'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=600&fit=crop'
    ],
    isHot: true,
    isNew: false
  },
  {
    id: 8,
    name: '小米无线鼠标',
    price: 79,
    originalPrice: 99,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
    category: '数码配件',
    categoryId: 8,
    sales: 8965,
    rating: 4.7,
    stock: 200,
    description: '小米无线静音鼠标，2.4G无线连接，精准定位。静音按键设计，不打扰他人。',
    specs: [
      { name: '颜色', options: ['黑色', '白色', '银色'] },
      { name: '连接方式', options: ['无线2.4G', '蓝牙', '双模'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=600&fit=crop'
    ],
    isHot: true,
    isNew: true
  },
  {
    id: 9,
    name: '迪士尼学生书包',
    price: 159,
    originalPrice: 219,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    category: '学生用品',
    categoryId: 6,
    sales: 3456,
    rating: 4.9,
    stock: 150,
    description: '迪士尼正版授权学生书包，防水面料，多隔层设计。透气背负系统，呵护孩子脊椎。',
    specs: [
      { name: '尺寸', options: ['小号1-3年级', '大号4-6年级'] },
      { name: '款式', options: ['米奇', '米妮', '漫威', '冰雪奇缘'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop'
    ],
    isHot: false,
    isNew: true
  },
  {
    id: 10,
    name: '3M便利贴组合装',
    price: 39.9,
    originalPrice: 59.9,
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=400&fit=crop',
    category: '办公文具',
    categoryId: 4,
    sales: 15678,
    rating: 4.8,
    stock: 400,
    description: '3M经典便利贴，粘性强，不留残胶。多种颜色和尺寸组合装，满足各种需求。',
    specs: [
      { name: '包装', options: ['6本装', '12本装', '24本装'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=600&fit=crop'
    ],
    isHot: true,
    isNew: false
  },
  {
    id: 11,
    name: '施德楼自动铅笔',
    price: 59,
    originalPrice: 79,
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop',
    category: '书写工具',
    categoryId: 1,
    sales: 4567,
    rating: 4.9,
    stock: 180,
    description: '德国施德楼自动铅笔，金属笔身，手感舒适。0.5mm笔尖，书写绘画两相宜。',
    specs: [
      { name: '颜色', options: ['银色', '黑色', '蓝色'] },
      { name: '笔尖', options: ['0.3mm', '0.5mm', '0.7mm'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&h=600&fit=crop'
    ],
    isHot: false,
    isNew: false
  },
  {
    id: 12,
    name: '无印良品文具盒',
    price: 68,
    originalPrice: 88,
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop',
    category: '学生用品',
    categoryId: 6,
    sales: 5678,
    rating: 4.7,
    stock: 220,
    description: '无印良品简约风格文具盒，透明PC材质，大容量设计。可容纳各种文具用品。',
    specs: [
      { name: '颜色', options: ['透明', '黑色', '蓝色'] },
      { name: '尺寸', options: ['小号', '大号'] }
    ],
    images: [
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=600&fit=crop'
    ],
    isHot: false,
    isNew: false
  }
];

export const users = {
  user: {
    id: 1,
    username: 'user',
    password: '123456',
    role: 'user',
    name: '普通用户',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
  },
  admin: {
    id: 2,
    username: 'admin',
    password: '123456',
    role: 'admin',
    name: '管理员',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  }
};

export const orders = [];
