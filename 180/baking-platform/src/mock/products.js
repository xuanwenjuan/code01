export const mockCategories = [
  { id: 1, name: '面粉类', icon: 'Grain', description: '高筋粉、低筋粉、全麦粉等' },
  { id: 2, name: '糖类', icon: 'Sugar', description: '白砂糖、红糖、糖粉等' },
  { id: 3, name: '乳制品', icon: 'Milk', description: '黄油、奶油、奶酪等' },
  { id: 4, name: '蛋类', icon: 'Egg', description: '鸡蛋、蛋黄液、蛋白粉等' },
  { id: 5, name: '添加剂', icon: 'MagicStick', description: '泡打粉、小苏打、吉利丁等' },
  { id: 6, name: '巧克力', icon: 'Candy', description: '黑巧、白巧、可可粉等' },
  { id: 7, name: '坚果干果', icon: 'Cherry', description: '杏仁、核桃、蔓越莓等' },
  { id: 8, name: '工具模具', icon: 'KnifeFork', description: '烤盘、裱花袋、模具等' }
]

export const mockProducts = [
  {
    id: 1,
    name: '高筋小麦粉 2.5kg',
    categoryId: 1,
    price: 38.00,
    originalPrice: 48.00,
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01k3t4XM1v6x6X7wvjX_!!6000000006146-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i3/O1CN01k3t4XM1v6x6X7wvjX_!!6000000006146-2-tps-800-800.png',
      'https://img.alicdn.com/imgextra/i1/O1CN01iCzFgq1ZWyZBWqCZn_!!6000000003191-2-tps-800-800.png'
    ],
    description: '精选优质小麦，蛋白质含量高，适合制作面包、披萨等烘焙食品。',
    isHot: true,
    stock: 100,
    sales: 2568,
    rating: 4.9,
    reviewCount: 856,
    params: [
      { name: '品牌', value: '金像牌' },
      { name: '规格', value: '2.5kg/袋' },
      { name: '保质期', value: '12个月' },
      { name: '产地', value: '中国深圳' },
      { name: '蛋白质含量', value: '≥11.5%' },
      { name: '储存方式', value: '阴凉干燥处密封保存' }
    ],
    shelfLife: '12个月',
    storageCondition: '阴凉干燥处密封保存',
    specifications: [
      { id: 1, name: '2.5kg/袋', price: 38.00, stock: 80 },
      { id: 2, name: '5kg/袋', price: 68.00, stock: 50 }
    ],
    usageReference: [
      { recipe: '吐司面包 (450g', amount: '高筋面粉 250g', note: '约可制作1个' },
      { recipe: '餐包 (6个)', amount: '高筋面粉 300g', note: '约可制作6个' },
      { recipe: '披萨饼底 (9寸)', amount: '高筋面粉 200g', note: '约可制作2个' },
      { recipe: '牛角包 (8个)', amount: '高筋面粉 400g', note: '约可制作8个' }
    ]
  },
  {
    id: 2,
    name: '低筋小麦粉 2kg',
    categoryId: 1,
    price: 32.00,
    originalPrice: 42.00,
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01V6cFbO1YhZKtCzGzM_!!6000000003083-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i4/O1CN01V6cFbO1YhZKtCzGzM_!!6000000003083-2-tps-800-800.png'
    ],
    description: '低筋面粉，蛋白质含量低，适合制作蛋糕、饼干、蛋挞等西点。',
    isHot: true,
    stock: 150,
    sales: 3421,
    rating: 4.8,
    reviewCount: 1024,
    params: [
      { name: '品牌', value: '美玫牌' },
      { name: '规格', value: '2kg/袋' },
      { name: '保质期', value: '12个月' },
      { name: '产地', value: '中国广东' },
      { name: '蛋白质含量', value: '≤9.5%' },
      { name: '储存方式', value: '阴凉干燥处密封保存' }
    ],
    shelfLife: '12个月',
    storageCondition: '阴凉干燥处密封保存',
    specifications: [
      { id: 1, name: '2kg/袋', price: 32.00, stock: 100 },
      { id: 2, name: '4kg/袋', price: 58.00, stock: 50 }
    ],
    usageReference: [
      { recipe: '8寸戚风蛋糕', amount: '低筋面粉 85g', note: '约可制作1个' },
      { recipe: '6寸戚风蛋糕', amount: '低筋面粉 50g', note: '约可制作1个' },
      { recipe: '曲奇饼干 (40块)', amount: '低筋面粉 200g', note: '约可制作40块' },
      { recipe: '蛋挞皮 (12个)', amount: '低筋面粉 100g', note: '约可制作12个' }
    ]
  },
  {
    id: 3,
    name: '动物黄油 454g',
    categoryId: 3,
    price: 58.00,
    originalPrice: 68.00,
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01Y56D6n1ly8m2h0F3Y_!!6000000004849-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i2/O1CN01Y56D6n1ly8m2h0F3Y_!!6000000004849-2-tps-800-800.png'
    ],
    description: '新西兰进口动物黄油，奶香味浓郁，适合曲奇、面包、蛋糕制作。',
    isHot: true,
    stock: 80,
    sales: 4210,
    rating: 4.9,
    reviewCount: 1568,
    params: [
      { name: '品牌', value: '安佳' },
      { name: '规格', value: '454g/块' },
      { name: '保质期', value: '12个月' },
      { name: '产地', value: '新西兰' },
      { name: '乳脂含量', value: '≥82%' },
      { name: '储存方式', value: '冷藏保存，-18°C冷冻可延长保质期' }
    ],
    shelfLife: '12个月',
    storageCondition: '冷藏保存，-18°C冷冻可延长保质期',
    specifications: [
      { id: 1, name: '454g/块', price: 58.00, stock: 60 },
      { id: 2, name: '227g/块', price: 32.00, stock: 80 }
    ],
    usageReference: [
      { recipe: '曲奇饼干 (40块)', amount: '黄油 150g', note: '约可制作40块' },
      { recipe: '8寸戚风蛋糕', amount: '黄油 40g', note: '约可制作1个' },
      { recipe: '吐司面包 (450g)', amount: '黄油 30g', note: '约可制作1个' },
      { recipe: '磅蛋糕 (1条)', amount: '黄油 100g', note: '约可制作1条' }
    ]
  },
  {
    id: 4,
    name: '白砂糖 1kg',
    categoryId: 2,
    price: 12.80,
    originalPrice: 18.00,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01aWmXK61f43VpJqP6M_!!6000000003981-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01aWmXK61f43VpJqP6M_!!6000000003981-2-tps-800-800.png'
    ],
    description: '优质白砂糖，颗粒均匀，溶解快，甜度适中，烘焙必备。',
    isHot: true,
    stock: 500,
    sales: 8956,
    rating: 4.7,
    reviewCount: 2341,
    params: [
      { name: '品牌', value: '太古' },
      { name: '规格', value: '1kg/袋' },
      { name: '保质期', value: '24个月' },
      { name: '产地', value: '中国广东' },
      { name: '蔗糖含量', value: '≥99.5%' },
      { name: '储存方式', value: '阴凉干燥处密封保存' }
    ],
    shelfLife: '24个月',
    storageCondition: '阴凉干燥处密封保存',
    specifications: [
      { id: 1, name: '1kg/袋', price: 12.80, stock: 300 },
      { id: 2, name: '5kg/袋', price: 55.00, stock: 100 }
    ],
    usageReference: [
      { recipe: '8寸戚风蛋糕', amount: '白砂糖 80g', note: '约可制作1个' },
      { recipe: '曲奇饼干 (40块)', amount: '白砂糖 80g', note: '约可制作40块' },
      { recipe: '吐司面包 (450g)', amount: '白砂糖 30g', note: '约可制作1个' },
      { recipe: '蛋挞液 (12个)', amount: '白砂糖 50g', note: '约可制作12个' }
    ]
  },
  {
    id: 5,
    name: '可可粉 100g',
    categoryId: 6,
    price: 28.00,
    originalPrice: 35.00,
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01C6wSdT1Nc7zYtZ3QZ_!!6000000001577-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i3/O1CN01C6wSdT1Nc7zYtZ3QZ_!!6000000001577-2-tps-800-800.png'
    ],
    description: '荷兰进口无糖可可粉，口感醇厚，适合制作巧克力蛋糕、热可可。',
    isHot: false,
    stock: 120,
    sales: 1890,
    rating: 4.8,
    reviewCount: 654,
    params: [
      { name: '品牌', value: '好时' },
      { name: '规格', value: '100g/盒' },
      { name: '保质期', value: '24个月' },
      { name: '产地', value: '荷兰' },
      { name: '可可含量', value: '100%' },
      { name: '储存方式', value: '阴凉干燥处密封保存' }
    ],
    shelfLife: '24个月',
    storageCondition: '阴凉干燥处密封保存',
    specifications: [
      { id: 1, name: '100g/盒', price: 28.00, stock: 80 },
      { id: 2, name: '226g/盒', price: 52.00, stock: 40 }
    ],
    usageReference: [
      { recipe: '巧克力蛋糕 (8寸)', amount: '可可粉 30g', note: '约可制作1个' },
      { recipe: '布朗尼 (6寸)', amount: '可可粉 20g', note: '约可制作1个' },
      { recipe: '热可可 (1杯)', amount: '可可粉 10g', note: '约可制作10杯' },
      { recipe: '巧克力曲奇 (30块)', amount: '可可粉 15g', note: '约可制作30块' }
    ]
  },
  {
    id: 6,
    name: '淡奶油 250ml',
    categoryId: 3,
    price: 25.00,
    originalPrice: 32.00,
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01rT6bWV1d3NfN4X7Zr_!!6000000003694-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i2/O1CN01rT6bWV1d3NfN4X7Zr_!!6000000003694-2-tps-800-800.png'
    ],
    description: '动物性淡奶油，乳脂含量高，易打发，适合蛋糕裱花、冰淇淋制作。',
    isHot: true,
    stock: 200,
    sales: 5680,
    rating: 4.9,
    reviewCount: 2156,
    params: [
      { name: '品牌', value: '安佳' },
      { name: '规格', value: '250ml/盒' },
      { name: '保质期', value: '6个月' },
      { name: '产地', value: '新西兰' },
      { name: '乳脂含量', value: '≥35%' },
      { name: '储存方式', value: '冷藏保存，开封后3天内用完' }
    ],
    shelfLife: '6个月',
    storageCondition: '冷藏保存，开封后3天内用完',
    specifications: [
      { id: 1, name: '250ml/盒', price: 25.00, stock: 150 },
      { id: 2, name: '1L/盒', price: 78.00, stock: 50 }
    ],
    usageReference: [
      { recipe: '8寸蛋糕裱花', amount: '淡奶油 500ml', note: '约可制作1个' },
      { recipe: '6寸蛋糕裱花', amount: '淡奶油 300ml', note: '约可制作1个' },
      { recipe: '提拉米苏 (8寸)', amount: '淡奶油 250ml', note: '约可制作1个' },
      { recipe: '冰淇淋 (500g)', amount: '淡奶油 200ml', note: '约可制作500g' }
    ]
  },
  {
    id: 7,
    name: '泡打粉 100g',
    categoryId: 5,
    price: 8.80,
    originalPrice: 12.00,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01k3t4XM1v6x6X7wvjX_!!6000000006146-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01k3t4XM1v6x6X7wvjX_!!6000000006146-2-tps-800-800.png'
    ],
    description: '无铝双效泡打粉，发面效果好，适合制作蛋糕、包子、馒头。',
    isHot: false,
    stock: 300,
    sales: 2340,
    rating: 4.7,
    reviewCount: 876,
    params: [
      { name: '品牌', value: '安琪' },
      { name: '规格', value: '100g/袋' },
      { name: '保质期', value: '24个月' },
      { name: '产地', value: '中国湖北' },
      { name: '类型', value: '无铝双效' },
      { name: '储存方式', value: '阴凉干燥处密封保存' }
    ],
    shelfLife: '24个月',
    storageCondition: '阴凉干燥处密封保存',
    specifications: [
      { id: 1, name: '100g/袋', price: 8.80, stock: 200 },
      { id: 2, name: '500g/袋', price: 35.00, stock: 100 }
    ],
    usageReference: [
      { recipe: '8寸戚风蛋糕', amount: '泡打粉 5g', note: '约可制作20个' },
      { recipe: '玛芬蛋糕 (6个)', amount: '泡打粉 6g', note: '约可制作16次' },
      { recipe: '饼干 (40块)', amount: '泡打粉 2g', note: '约可制作50次' },
      { recipe: '包子 (10个)', amount: '泡打粉 5g', note: '约可制作20次' }
    ]
  },
  {
    id: 8,
    name: '蔓越莓干 500g',
    categoryId: 7,
    price: 45.00,
    originalPrice: 58.00,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01iCzFgq1ZWyZBWqCZn_!!6000000003191-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01iCzFgq1ZWyZBWqCZn_!!6000000003191-2-tps-800-800.png'
    ],
    description: '美国进口蔓越莓干，酸甜可口，适合制作曲奇、面包、糕点。',
    isHot: true,
    stock: 180,
    sales: 3210,
    rating: 4.8,
    reviewCount: 1234,
    params: [
      { name: '品牌', value: 'Ocean Spray' },
      { name: '规格', value: '500g/袋' },
      { name: '保质期', value: '12个月' },
      { name: '产地', value: '美国' },
      { name: '配料', value: '蔓越莓、白砂糖' },
      { name: '储存方式', value: '阴凉干燥处密封保存' }
    ],
    shelfLife: '12个月',
    storageCondition: '阴凉干燥处密封保存',
    specifications: [
      { id: 1, name: '500g/袋', price: 45.00, stock: 120 },
      { id: 2, name: '1kg/袋', price: 85.00, stock: 60 }
    ],
    usageReference: [
      { recipe: '蔓越莓饼干 (40块)', amount: '蔓越莓干 80g', note: '约可制作6批' },
      { recipe: '面包 (450g)', amount: '蔓越莓干 50g', note: '约可制作10个' },
      { recipe: '蛋糕装饰 (8寸)', amount: '蔓越莓干 30g', note: '约可装饰16个' },
      { recipe: '牛轧糖 (500g)', amount: '蔓越莓干 100g', note: '约可制作5次' }
    ]
  },
  {
    id: 9,
    name: '耐高温硅胶刮刀',
    categoryId: 8,
    price: 15.80,
    originalPrice: 22.00,
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01V6cFbO1YhZKtCzGzM_!!6000000003083-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i4/O1CN01V6cFbO1YhZKtCzGzM_!!6000000003083-2-tps-800-800.png'
    ],
    description: '食品级硅胶材质，耐高温，易清洗，搅拌面糊、奶油必备工具。',
    isHot: false,
    stock: 200,
    sales: 1560,
    rating: 4.6,
    reviewCount: 543,
    params: [
      { name: '品牌', value: '展艺' },
      { name: '规格', value: '1把' },
      { name: '保质期', value: '36个月' },
      { name: '材质', value: '食品级硅胶' },
      { name: '耐温范围', value: '-40°C ~ 230°C' },
      { name: '储存方式', value: '阴凉干燥处存放' }
    ],
    shelfLife: '36个月',
    storageCondition: '阴凉干燥处存放',
    specifications: [
      { id: 1, name: '小号', price: 15.80, stock: 100 },
      { id: 2, name: '大号', price: 22.00, stock: 100 }
    ],
    usageReference: [
      { recipe: '搅拌面糊', amount: '刮刀1把', note: '适用所有面糊搅拌' },
      { recipe: '翻拌奶油', amount: '刮刀1把', note: '轻柔翻拌不消泡' },
      { recipe: '刮取容器', amount: '刮刀1把', note: '干净不残留' },
      { recipe: '耐高温烘烤', amount: '刮刀1把', note: '可直接接触热锅' }
    ]
  },
  {
    id: 10,
    name: '6寸圆形活底蛋糕模',
    categoryId: 8,
    price: 28.00,
    originalPrice: 38.00,
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01Y56D6n1ly8m2h0F3Y_!!6000000004849-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i2/O1CN01Y56D6n1ly8m2h0F3Y_!!6000000004849-2-tps-800-800.png'
    ],
    description: '不粘涂层，活底设计易脱模，适合制作戚风、芝士蛋糕。',
    isHot: true,
    stock: 150,
    sales: 2890,
    rating: 4.8,
    reviewCount: 987,
    params: [
      { name: '品牌', value: '三能' },
      { name: '规格', value: '6寸' },
      { name: '材质', value: '铝合金+不粘涂层' },
      { name: '产地', value: '中国' },
      { name: '适用烤箱', value: '通用' },
      { name: '储存方式', value: '洗净擦干存放' }
    ],
    shelfLife: '长期使用',
    storageCondition: '洗净擦干存放',
    specifications: [
      { id: 1, name: '6寸', price: 28.00, stock: 80 },
      { id: 2, name: '8寸', price: 38.00, stock: 70 }
    ],
    usageReference: [
      { recipe: '6寸戚风蛋糕', amount: '蛋糕模1个', note: '适用6寸配方' },
      { recipe: '8寸戚风蛋糕', amount: '蛋糕模1个', note: '适用8寸配方' },
      { recipe: '芝士蛋糕', amount: '蛋糕模1个', note: '水浴烘烤适用' },
      { recipe: '慕斯蛋糕', amount: '蛋糕模1个', note: '活底易脱模' }
    ]
  },
  {
    id: 11,
    name: '吉列丁片 5片装',
    categoryId: 5,
    price: 12.00,
    originalPrice: 16.00,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01aWmXK61f43VpJqP6M_!!6000000003981-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01aWmXK61f43VpJqP6M_!!6000000003981-2-tps-800-800.png'
    ],
    description: '进口鱼胶片，凝固效果好，适合制作慕斯、果冻、布丁。',
    isHot: false,
    stock: 250,
    sales: 1890,
    rating: 4.7,
    reviewCount: 654,
    params: [
      { name: '品牌', value: '百利' },
      { name: '规格', value: '5片/盒，每片5g' },
      { name: '保质期', value: '36个月' },
      { name: '产地', value: '德国' },
      { name: '成分', value: '鱼胶' },
      { name: '储存方式', value: '阴凉干燥处密封保存' }
    ],
    shelfLife: '36个月',
    storageCondition: '阴凉干燥处密封保存',
    specifications: [
      { id: 1, name: '5片装', price: 12.00, stock: 150 },
      { id: 2, name: '20片装', price: 42.00, stock: 100 }
    ],
    usageReference: [
      { recipe: '慕斯蛋糕 (8寸)', amount: '吉利丁片 10g', note: '约需2片' },
      { recipe: '果冻 (500g)', amount: '吉利丁片 5g', note: '约需1片' },
      { recipe: '布丁 (4个)', amount: '吉利丁片 5g', note: '约需1片' },
      { recipe: '软糖 (200g)', amount: '吉利丁片 7.5g', note: '约需1.5片' }
    ]
  },
  {
    id: 12,
    name: '杏仁片 100g',
    categoryId: 7,
    price: 22.00,
    originalPrice: 28.00,
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01C6wSdT1Nc7zYtZ3QZ_!!6000000001577-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i3/O1CN01C6wSdT1Nc7zYtZ3QZ_!!6000000001577-2-tps-800-800.png'
    ],
    description: '美国进口杏仁片，自然醇香，适合装饰蛋糕、面包、饼干。',
    isHot: false,
    stock: 180,
    sales: 1450,
    rating: 4.8,
    reviewCount: 432,
    params: [
      { name: '品牌', value: '蓝钻' },
      { name: '规格', value: '100g/袋' },
      { name: '保质期', value: '12个月' },
      { name: '产地', value: '美国' },
      { name: '配料', value: '杏仁' },
      { name: '储存方式', value: '阴凉干燥处密封保存' }
    ],
    shelfLife: '12个月',
    storageCondition: '阴凉干燥处密封保存',
    specifications: [
      { id: 1, name: '100g/袋', price: 22.00, stock: 100 },
      { id: 2, name: '500g/袋', price: 95.00, stock: 80 }
    ],
    usageReference: [
      { recipe: '蛋糕装饰 (8寸)', amount: '杏仁片 30g', note: '约可装饰3次' },
      { recipe: '面包表面装饰', amount: '杏仁片 15g', note: '约可装饰6次' },
      { recipe: '饼干配料 (40块)', amount: '杏仁片 40g', note: '约可制作2.5批' },
      { recipe: '杏仁瓦片 (20片)', amount: '杏仁片 50g', note: '约可制作2批' }
    ]
  }
]

export const mockRecipes = [
  {
    id: 1,
    title: '戚风蛋糕',
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01k3t4XM1v6x6X7wvjX_!!6000000006146-2-tps-400-300.png',
    description: '经典戚风蛋糕，松软可口',
    difficulty: '中等',
    time: '60分钟',
    ingredients: ['低筋面粉', '鸡蛋', '白砂糖', '牛奶', '玉米油']
  },
  {
    id: 2,
    title: '黄油曲奇',
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01iCzFgq1ZWyZBWqCZn_!!6000000003191-2-tps-400-300.png',
    description: '酥脆香浓的黄油曲奇',
    difficulty: '简单',
    time: '40分钟',
    ingredients: ['黄油', '低筋面粉', '糖粉', '鸡蛋']
  },
  {
    id: 3,
    title: '提拉米苏',
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01Y56D6n1ly8m2h0F3Y_!!6000000004849-2-tps-400-300.png',
    description: '意式经典甜品，口感丰富',
    difficulty: '较难',
    time: '120分钟',
    ingredients: ['马斯卡彭奶酪', '淡奶油', '咖啡', '手指饼干', '蛋黄']
  },
  {
    id: 4,
    title: '葡式蛋挞',
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01V6cFbO1YhZKtCzGzM_!!6000000003083-2-tps-400-300.png',
    description: '外酥里嫩的美味蛋挞',
    difficulty: '中等',
    time: '50分钟',
    ingredients: ['蛋挞皮', '淡奶油', '牛奶', '蛋黄', '白砂糖']
  }
]
