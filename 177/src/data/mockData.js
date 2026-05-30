export const categories = [
  { id: 1, name: '羊毛毡', icon: '🐑', color: '#ff9a9e', count: 128 },
  { id: 2, name: '皮革手作', icon: '👜', color: '#a18cd1', count: 86 },
  { id: 3, name: '串珠饰品', icon: '💎', color: '#fbc2eb', count: 256 },
  { id: 4, name: '黏土陶艺', icon: '🏺', color: '#84fab0', count: 92 },
  { id: 5, name: '刺绣布艺', icon: '🧵', color: '#8fd3f4', count: 167 },
  { id: 6, name: '蜡烛香薰', icon: '🕯️', color: '#fccb90', count: 78 },
  { id: 7, name: '干花永生', icon: '🌸', color: '#d4fc79', count: 134 },
  { id: 8, name: '金属绕线', icon: '🔮', color: '#96e6a1', count: 65 }
]

export const products = [
  {
    id: 1,
    name: '梦幻星空羊毛毡套装',
    category: '羊毛毡',
    categoryId: 1,
    price: 168,
    originalPrice: 228,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584037618688-1a85c09fa9f0?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582561833407-b95380302ec9?w=600&h=600&fit=crop'
    ],
    rating: 4.9,
    sales: 2341,
    description: '精选澳洲进口羊毛，色彩丰富，手感柔软，适合制作星空主题的羊毛毡作品。',
    parameters: [
      { label: '材质', value: '100%澳洲羊毛' },
      { label: '颜色数量', value: '24色' },
      { label: '重量', value: '500g' },
      { label: '包含工具', value: '戳针3支 + 泡沫垫 + 图纸' }
    ],
    sets: [
      { id: 's1', name: '基础套装', price: 168, items: ['24色羊毛', '戳针3支', '泡沫垫', '基础图纸'] },
      { id: 's2', name: '进阶套装', price: 268, items: ['36色羊毛', '戳针5支', '泡沫垫', '进阶图纸', '配件包'] },
      { id: 's3', name: '豪华套装', price: 398, items: ['48色羊毛', '戳针8支', '专业泡沫垫', '全套图纸', '配件包', '展示盒'] }
    ],
    isHot: true,
    isNew: true
  },
  {
    id: 2,
    name: '复古皮革手作工具包',
    category: '皮革手作',
    categoryId: 2,
    price: 298,
    originalPrice: 388,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop'
    ],
    rating: 4.8,
    sales: 1856,
    description: '专业级皮革制作工具，适合手工皮具爱好者，可制作钱包、卡包等小物。',
    parameters: [
      { label: '工具数量', value: '32件' },
      { label: '材质', value: '不锈钢 + 实木手柄' },
      { label: '适用皮料', value: '1.5-3.0mm厚度' }
    ],
    sets: [
      { id: 's1', name: '入门套装', price: 298, items: ['基础工具12件', '练习皮料', '针线套装'] },
      { id: 's2', name: '专业套装', price: 498, items: ['专业工具24件', '意大利植鞣革', '全套配件'] }
    ],
    isHot: true,
    isNew: false
  },
  {
    id: 3,
    name: '水晶串珠DIY材料包',
    category: '串珠饰品',
    categoryId: 3,
    price: 128,
    originalPrice: 168,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop'
    ],
    rating: 4.7,
    sales: 3562,
    description: '奥地利进口水晶珠子，闪耀夺目，可制作手链、项链、耳环等饰品。',
    parameters: [
      { label: '珠子数量', value: '约500颗' },
      { label: '材质', value: '奥地利水晶' },
      { label: '包含配件', value: '龙虾扣、延长链、耳钩' }
    ],
    sets: [
      { id: 's1', name: '简约套装', price: 128, items: ['水晶珠300颗', '基础配件', '教程'] },
      { id: 's2', name: '豪华套装', price: 238, items: ['水晶珠800颗', '全套配件', '收纳盒'] }
    ],
    isHot: true,
    isNew: true
  },
  {
    id: 4,
    name: '软陶黏土入门套装',
    category: '黏土陶艺',
    categoryId: 4,
    price: 89,
    originalPrice: 128,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop'
    ],
    rating: 4.6,
    sales: 4123,
    description: '安全环保软陶泥，色彩鲜艳，可塑性强，适合儿童和初学者。',
    parameters: [
      { label: '颜色数量', value: '36色' },
      { label: '重量', value: '720g' },
      { label: '安全认证', value: '符合EN71标准' }
    ],
    sets: [
      { id: 's1', name: '基础套装', price: 89, items: ['36色陶泥', '工具5件', '说明书'] },
      { id: 's2', name: '创意套装', price: 158, items: ['50色陶泥', '工具12件', '模具套装'] }
    ],
    isHot: false,
    isNew: false
  },
  {
    id: 5,
    name: '法式刺绣材料包',
    category: '刺绣布艺',
    categoryId: 5,
    price: 158,
    originalPrice: 198,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop'
    ],
    rating: 4.9,
    sales: 1234,
    description: '法式立体刺绣材料包，包含进口绣线和详细教程，轻松上手。',
    parameters: [
      { label: '绣线数量', value: '25色DMC绣线' },
      { label: '布料', value: '亚麻布料' },
      { label: '图案', value: '花卉系列' }
    ],
    sets: [
      { id: 's1', name: '单图案套装', price: 158, items: ['图案布料', '对应绣线', '绣绷', '针'] },
      { id: 's2', name: '三图案套装', price: 398, items: ['3款图案', '全套绣线', '工具套装'] }
    ],
    isHot: true,
    isNew: false
  },
  {
    id: 6,
    name: '香薰蜡烛DIY套装',
    category: '蜡烛香薰',
    categoryId: 6,
    price: 198,
    originalPrice: 258,
    image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=600&fit=crop'
    ],
    rating: 4.8,
    sales: 2156,
    description: '天然大豆蜡，多种精油香型可选，打造专属香氛体验。',
    parameters: [
      { label: '蜡材', value: '美国进口大豆蜡' },
      { label: '精油', value: '天然植物精油' },
      { label: '容器', value: '玻璃罐2个' }
    ],
    sets: [
      { id: 's1', name: '基础套装', price: 198, items: ['大豆蜡500g', '精油3款', '容器2个', '烛芯'] },
      { id: 's2', name: '豪华套装', price: 358, items: ['大豆蜡1kg', '精油6款', '容器5个', '干花装饰'] }
    ],
    isHot: false,
    isNew: true
  },
  {
    id: 7,
    name: '永生花礼盒材料包',
    category: '干花永生',
    categoryId: 7,
    price: 228,
    originalPrice: 298,
    image: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=600&fit=crop'
    ],
    rating: 4.7,
    sales: 987,
    description: '厄瓜多尔进口永生玫瑰，搭配精美礼盒，永不凋谢的浪漫。',
    parameters: [
      { label: '花材', value: '永生玫瑰6朵' },
      { label: '配件', value: '礼盒、丝带、卡片' },
      { label: '保存期限', value: '3-5年' }
    ],
    sets: [
      { id: 's1', name: '经典礼盒', price: 228, items: ['永生玫瑰6朵', '礼盒', '工具包'] },
      { id: 's2', name: '豪华礼盒', price: 458, items: ['永生玫瑰12朵', '高端礼盒', 'LED灯串'] }
    ],
    isHot: false,
    isNew: false
  },
  {
    id: 8,
    name: '金属绕线首饰套装',
    category: '金属绕线',
    categoryId: 8,
    price: 178,
    originalPrice: 238,
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=600&fit=crop'
    ],
    rating: 4.6,
    sales: 765,
    description: '专业金属绕线工具套装，适合制作个性化首饰，展现独特创意。',
    parameters: [
      { label: '线材', value: '铜丝3卷' },
      { label: '工具', value: '钳子3把' },
      { label: '配件', value: '宝石、挂扣等' }
    ],
    sets: [
      { id: 's1', name: '入门套装', price: 178, items: ['铜丝3卷', '基础工具', '入门配件'] },
      { id: 's2', name: '专业套装', price: 328, items: ['铜线6卷', '专业工具', '宝石配件套装'] }
    ],
    isHot: false,
    isNew: true
  }
]

export const tutorials = [
  {
    id: 1,
    title: '新手入门：羊毛毡基础教程',
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    category: '羊毛毡',
    duration: '15分钟',
    level: '入门',
    views: 12580
  },
  {
    id: 2,
    title: '皮革钱包制作全流程',
    cover: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=250&fit=crop',
    category: '皮革手作',
    duration: '45分钟',
    level: '进阶',
    views: 8920
  },
  {
    id: 3,
    title: '水晶手链编织技巧',
    cover: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=250&fit=crop',
    category: '串珠饰品',
    duration: '20分钟',
    level: '入门',
    views: 15680
  },
  {
    id: 4,
    title: '法式刺绣立体花朵教程',
    cover: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=250&fit=crop',
    category: '刺绣布艺',
    duration: '35分钟',
    level: '进阶',
    views: 6750
  }
]

export const orders = [
  {
    id: 'ORD20240115001',
    createTime: '2024-01-15 14:30:25',
    status: '已发货',
    totalPrice: 426,
    items: [
      { productId: 1, name: '梦幻星空羊毛毡套装', price: 168, quantity: 1, image: products[0].image },
      { productId: 3, name: '水晶串珠DIY材料包', price: 258, quantity: 1, image: products[2].image }
    ],
    tracking: 'SF1234567890'
  },
  {
    id: 'ORD20240110002',
    createTime: '2024-01-10 09:15:33',
    status: '已完成',
    totalPrice: 298,
    items: [
      { productId: 2, name: '复古皮革手作工具包', price: 298, quantity: 1, image: products[1].image }
    ],
    tracking: 'YT9876543210'
  },
  {
    id: 'ORD20240105003',
    createTime: '2024-01-05 16:45:12',
    status: '待发货',
    totalPrice: 158,
    items: [
      { productId: 5, name: '法式刺绣材料包', price: 158, quantity: 1, image: products[4].image }
    ],
    tracking: ''
  },
  {
    id: 'ORD20240101004',
    createTime: '2024-01-01 10:20:45',
    status: '已取消',
    totalPrice: 89,
    items: [
      { productId: 4, name: '软陶黏土入门套装', price: 89, quantity: 1, image: products[3].image }
    ],
    tracking: ''
  }
]

export const mockUsers = [
  {
    username: 'user123',
    password: '123456',
    role: 'user',
    nickname: '手作爱好者',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  },
  {
    username: 'blogger456',
    password: '123456',
    role: 'blogger',
    nickname: 'DIY达人小美',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    followers: 12580,
    works: 36
  }
]
