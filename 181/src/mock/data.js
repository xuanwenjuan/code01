export const mockCategories = [
  { id: 1, name: '帐篷', icon: 'HomeFilled', count: 24 },
  { id: 2, name: '睡袋', icon: 'Moon', count: 18 },
  { id: 3, name: '背包', icon: 'Wallet', count: 32 },
  { id: 4, name: '登山鞋', icon: 'Foot', count: 28 },
  { id: 5, name: '户外服装', icon: 'Suit', count: 45 },
  { id: 6, name: '炊具炉具', icon: 'KnifeFork', count: 15 },
  { id: 7, name: '照明装备', icon: 'Sunny', count: 20 },
  { id: 8, name: '登山杖', icon: 'Connection', count: 12 }
]

export const mockScenes = [
  { type: 'camping', name: '露营', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400', description: '星空下的浪漫' },
  { type: 'hiking', name: '徒步', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400', description: '征服每一座山峰' },
  { type: 'climbing', name: '攀岩', image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400', description: '挑战自我极限' },
  { type: 'running', name: '越野跑', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400', description: '释放无限活力' }
]

const productImages = [
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
  'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600',
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
  'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600',
  'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
  'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=600',
  'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600',
  'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=600'
]

export const mockProducts = [
  {
    id: 1,
    name: '专业级双层防风帐篷',
    brand: '探路者',
    categoryId: 1,
    price: 1299,
    originalPrice: 1899,
    image: productImages[0],
    images: [productImages[0], productImages[1], productImages[2]],
    description: '采用20D尼龙面料，双层设计，防风防雨，适合3-4人使用，铝合金支架轻便耐用。',
    specs: [
      { name: '颜色', options: ['橙色', '蓝色', '绿色'] },
      { name: '人数', options: ['2人', '3人', '4人'] }
    ],
    params: [
      { label: '材质', value: '20D尼龙' },
      { label: '重量', value: '2.5kg' },
      { label: '展开尺寸', value: '210x180x120cm' },
      { label: '防水指数', value: '5000mm' },
      { label: '支架材质', value: '铝合金' }
    ],
    scenes: ['camping', 'hiking'],
    sales: 2345,
    rating: 4.8,
    reviewCount: 568,
    isHot: true,
    stock: 156,
    createdAt: '2024-01-15T08:00:00Z',
    usageInstructions: {
      usage: [
        '选择平坦、无尖锐物体的地面搭建营地',
        '先将帐杆组装完成，插入帐篷四角固定',
        '将内帐挂好，再覆盖外帐并拉紧风绳',
        '使用地钉将帐篷四角固定于地面'
      ],
      notices: [
        '避免在树下搭建，防止雷击和树枝坠落',
        '帐篷内禁止使用明火，以免引起火灾',
        '雨天使用时，确保外帐完全覆盖内帐',
        '收纳前请确保帐篷完全干燥，防止发霉'
      ],
      maintenance: [
        '每次使用后，用湿布擦拭干净并晾干',
        '避免接触尖锐物体和化学物品',
        '长期存放时，放置于干燥通风处',
        '定期检查帐杆和配件是否完好'
      ],
      package: [
        '帐篷主体 x1',
        '铝合金帐杆 x1套',
        '地钉 x8根',
        '风绳 x4根',
        '收纳袋 x1',
        '使用说明书 x1'
      ]
    }
  },
  {
    id: 2,
    name: '羽绒睡袋零下20度',
    brand: '黑冰',
    categoryId: 2,
    price: 899,
    originalPrice: 1299,
    image: productImages[1],
    images: [productImages[1], productImages[0]],
    description: '90%白鹅绒填充，舒适温度-15°C，极限温度-20°C，重量仅1.2kg。',
    specs: [
      { name: '温标', options: ['-10°C', '-15°C', '-20°C'] },
      { name: '尺码', options: ['M', 'L', 'XL'] }
    ],
    params: [
      { label: '填充', value: '90%白鹅绒' },
      { label: '蓬松度', value: '700FP' },
      { label: '重量', value: '1.2kg' },
      { label: '舒适温度', value: '-15°C' },
      { label: '收纳尺寸', value: '18x35cm' }
    ],
    scenes: ['camping', 'hiking'],
    sales: 1890,
    rating: 4.9,
    reviewCount: 423,
    isHot: true,
    stock: 89,
    createdAt: '2024-02-20T08:00:00Z',
    usageInstructions: {
      usage: [
        '打开睡袋，充分抖动使其蓬松',
        '建议穿着干净的保暖内衣使用',
        '使用时拉好拉链，保持内部温度',
        '可配合防潮垫使用，提升保暖效果'
      ],
      notices: [
        '避免在潮湿环境中长时间存放',
        '请勿机洗，建议专业干洗或手洗',
        '避免接触尖锐物品，防止面料破损',
        '睡前不要吃得过饱，影响睡眠质量'
      ],
      maintenance: [
        '每次使用后，将睡袋充分通风晾干',
        '存储时放入收纳袋，放置于干燥通风处',
        '避免长时间压缩存放，影响蓬松度',
        '定期取出晾晒，保持羽绒干燥'
      ],
      package: [
        '羽绒睡袋主体 x1',
        '收纳压缩袋 x1',
        '修补包 x1',
        '使用说明书 x1'
      ]
    }
  },
  {
    id: 3,
    name: '大容量登山背包60L',
    brand: 'Osprey',
    categoryId: 3,
    price: 1599,
    originalPrice: 2199,
    image: productImages[2],
    images: [productImages[2], productImages[3]],
    description: '专业登山背包，60L大容量，人体工学设计，多口袋分区，防水面料。',
    specs: [
      { name: '容量', options: ['40L', '50L', '60L'] },
      { name: '颜色', options: ['黑色', '灰色', '蓝色'] }
    ],
    params: [
      { label: '容量', value: '60L' },
      { label: '重量', value: '1.8kg' },
      { label: '面料', value: '420D尼龙' },
      { label: '背负系统', value: 'AirScape' },
      { label: '防水', value: '自带雨罩' }
    ],
    scenes: ['hiking', 'climbing'],
    sales: 1567,
    rating: 4.7,
    reviewCount: 389,
    isHot: true,
    stock: 67,
    createdAt: '2024-01-28T08:00:00Z',
    usageInstructions: {
      usage: [
        '打包时，重物尽量靠近背部，保持重心稳定',
        '调节肩带、腰带和胸带，使其贴合身体',
        '常用物品放在顶包或侧袋，方便取用',
        '雨天请使用配套的防雨罩保护背包'
      ],
      notices: [
        '不要超过背包最大承重，以免损坏背负系统',
        '避免在水中浸泡，如遇水请及时晾干',
        '不要在背包上放置尖锐物品，以免划破面料',
        '负重行走时，注意保持身体平衡'
      ],
      maintenance: [
        '每次使用后，清空背包并清理杂物',
        '用软毛刷和中性清洁剂清洁，自然晾干',
        '避免长时间暴晒，防止面料老化',
        '存放时，填充填充物保持背包形状'
      ],
      package: [
        '登山背包主体 x1',
        '防雨罩 x1',
        '腰带配件 x1套',
        '使用说明书 x1'
      ]
    }
  },
  {
    id: 4,
    name: '专业登山鞋防水防滑',
    brand: 'LOWA',
    categoryId: 4,
    price: 1899,
    originalPrice: 2599,
    image: productImages[3],
    images: [productImages[3], productImages[4]],
    description: 'GORE-TEX防水面料，Vibram大底，中帮设计保护脚踝，适合各种复杂地形。',
    specs: [
      { name: '尺码', options: ['39', '40', '41', '42', '43', '44'] },
      { name: '颜色', options: ['棕色', '黑色', '军绿'] }
    ],
    params: [
      { label: '鞋面', value: '头层牛皮' },
      { label: '防水', value: 'GORE-TEX' },
      { label: '大底', value: 'Vibram' },
      { label: '重量', value: '1.1kg/双' },
      { label: '帮高', value: '中帮' }
    ],
    scenes: ['hiking', 'climbing'],
    sales: 2100,
    rating: 4.9,
    reviewCount: 612,
    isHot: true,
    stock: 123,
    createdAt: '2024-02-10T08:00:00Z',
    usageInstructions: {
      usage: [
        '穿着时搭配专业户外袜，避免磨脚',
        '系好鞋带，确保脚部在鞋内稳定',
        '新鞋建议先进行短距离磨合再长距离使用',
        '登山时，根据坡度调整鞋带松紧'
      ],
      notices: [
        '避免在光滑的岩石或湿滑地面奔跑',
        '请勿在高温环境下长时间放置',
        '避免接触油类、酸碱等腐蚀性物质',
        '鞋底磨损严重时请及时更换'
      ],
      maintenance: [
        '每次使用后，清除鞋底和鞋面的泥土',
        '用湿布擦拭鞋面，自然通风晾干',
        '定期涂抹皮革保养油，保持鞋面柔软',
        '存放时塞入鞋撑，保持鞋型'
      ],
      package: [
        '登山鞋一双',
        '防尘袋 x1',
        '使用说明书 x1',
        '保修卡 x1'
      ]
    }
  },
  {
    id: 5,
    name: '三合一冲锋衣',
    brand: '始祖鸟',
    categoryId: 5,
    price: 2999,
    originalPrice: 3999,
    image: productImages[4],
    images: [productImages[4], productImages[5]],
    description: 'GORE-TEX Pro面料，可拆卸抓绒内胆，三合一设计，适应各种天气。',
    specs: [
      { name: '尺码', options: ['S', 'M', 'L', 'XL', 'XXL'] },
      { name: '颜色', options: ['黑色', '蓝色', '红色'] }
    ],
    params: [
      { label: '面料', value: 'GORE-TEX Pro' },
      { label: '内胆', value: '抓绒' },
      { label: '重量', value: '0.8kg' },
      { label: '防水指数', value: '28000mm' },
      { label: '透气指数', value: '25000g' }
    ],
    scenes: ['hiking', 'climbing', 'running'],
    sales: 987,
    rating: 4.9,
    reviewCount: 234,
    isHot: false,
    stock: 45,
    createdAt: '2024-03-01T08:00:00Z',
    usageInstructions: {
      usage: [
        '可单穿外壳、单穿抓绒或组合穿着，适应不同温度',
        '穿着时将所有拉链拉好，确保防水效果',
        '调整魔术贴袖口，防止风雪灌入',
        '收纳时折叠存放，避免过度挤压'
      ],
      notices: [
        '请勿使用柔顺剂、漂白剂清洗',
        '避免长时间暴晒，防止防水涂层老化',
        '不要靠近火源，面料易燃',
        '出现破损时请及时使用修补胶修复'
      ],
      maintenance: [
        '使用中性洗涤剂冷水机洗或手洗',
        '清洗后悬挂自然晾干，请勿拧干',
        '定期喷涂防水剂，恢复防水性能',
        '存放于干燥通风处，避免重压'
      ],
      package: [
        '冲锋衣外壳 x1',
        '抓绒内胆 x1',
        '收纳袋 x1',
        '使用说明书 x1',
        '保修卡 x1'
      ]
    }
  },
  {
    id: 6,
    name: '便携式户外炉具',
    brand: '火枫',
    categoryId: 6,
    price: 299,
    originalPrice: 399,
    image: productImages[5],
    images: [productImages[5], productImages[6]],
    description: '轻量便携炉头，功率3000W，折叠设计，适合1-2人使用。',
    specs: [
      { name: '款式', options: ['炉头', '套锅', '套装'] }
    ],
    params: [
      { label: '功率', value: '3000W' },
      { label: '重量', value: '95g' },
      { label: '展开尺寸', value: '85x68mm' },
      { label: '适用气罐', value: '扁气罐' },
      { label: '烧开1L水', value: '约3分钟' }
    ],
    scenes: ['camping', 'hiking'],
    sales: 3456,
    rating: 4.7,
    reviewCount: 890,
    isHot: true,
    stock: 234,
    createdAt: '2024-01-05T08:00:00Z',
    usageInstructions: {
      usage: [
        '选择平坦、避风的地方使用',
        '连接气罐前检查是否漏气',
        '点火前先将支架展开稳定放置',
        '使用后先开小火预热，再调节火力大小',
        '关火后待完全冷却后再收纳'
      ],
      notices: [
        '禁止在密闭空间内使用，防止一氧化碳中毒',
        '使用时请勿离开，注意防火',
        '气罐请远离高温和明火',
        '请勿在炉具上放置过重物品',
        '更换气罐时确保炉具完全冷却'
      ],
      maintenance: [
        '每次使用后，待冷却后清洁炉头和支架',
        '定期检查密封圈是否有堵塞，如有损坏及时更换',
        '存放于干燥通风处，避免潮湿生锈',
        '长时间存放时，请将电池取出'
      ],
      package: [
        '炉头主体 x1',
        '支架 x1',
        '收纳盒 x1',
        '使用说明书 x1'
      ]
    }
  },
  {
    id: 7,
    name: 'LED强光头灯',
    brand: '纳丽德',
    categoryId: 7,
    price: 199,
    originalPrice: 299,
    image: productImages[6],
    images: [productImages[6], productImages[7]],
    description: '1000流明超高亮度，IPX8防水，USB充电，续航10小时。',
    specs: [
      { name: '亮度', options: ['500lm', '1000lm', '2000lm'] }
    ],
    params: [
      { label: '亮度', value: '1000lm' },
      { label: '射程', value: '150m' },
      { label: '防水', value: 'IPX8' },
      { label: '续航', value: '10小时' },
      { label: '重量', value: '120g' }
    ],
    scenes: ['camping', 'hiking', 'climbing'],
    sales: 4567,
    rating: 4.8,
    reviewCount: 1234,
    isHot: true,
    stock: 345,
    createdAt: '2024-02-28T08:00:00Z',
    usageInstructions: {
      usage: [
        '根据头围调节头带松紧，确保佩戴舒适稳定',
        '使用前检查电量，确保电量充足',
        '根据需要调节亮度档位，节约电量',
        '可调整灯头角度，适应不同照明需求'
      ],
      notices: [
        '请勿直接照射人眼，以免造成视力损伤',
        '避免在水中长时间浸泡，如进水请立即取出电池',
        '长期不使用时，请取出电池，防止漏液',
        '请勿在易燃易爆环境中使用'
      ],
      maintenance: [
        '每次使用后，擦拭干净灯头和头带',
        '定期检查电池触点，如有氧化请清洁',
        '存放于干燥阴凉处，避免高温潮湿',
        '镜头脏污时，请用眼镜布轻轻擦拭'
      ],
      package: [
        '头灯主体 x1',
        'USB充电线 x1',
        '头带 x1',
        '使用说明书 x1',
        '保修卡 x1'
      ]
    }
  },
  {
    id: 8,
    name: '碳纤维登山杖',
    brand: 'Black Diamond',
    categoryId: 8,
    price: 399,
    originalPrice: 599,
    image: productImages[7],
    images: [productImages[7], productImages[8]],
    description: '碳纤维材质，超轻仅165g/根，三节可调节，EVA手柄。',
    specs: [
      { name: '数量', options: ['单根', '一对'] },
      { name: '材质', options: ['碳纤维', '铝合金'] }
    ],
    params: [
      { label: '材质', value: '碳纤维' },
      { label: '重量', value: '165g/根' },
      { label: '长度范围', value: '100-125cm' },
      { label: '节数', value: '3节' },
      { label: '手柄', value: 'EVA泡棉' }
    ],
    scenes: ['hiking', 'climbing'],
    sales: 2890,
    rating: 4.8,
    reviewCount: 567,
    isHot: false,
    stock: 178,
    createdAt: '2024-03-05T08:00:00Z',
    usageInstructions: {
      usage: [
        '根据身高和地形调整登山杖长度',
        '上坡时缩短登山杖，下坡时拉长登山杖',
        '使用腕带，将力量分散到手臂',
        '行走时，登山杖与异侧脚配合摆动'
      ],
      notices: [
        '避免用登山杖支撑全身重量跳跃',
        '不要在坚硬岩石上用力敲击，以免损坏杖尖',
        '碳纤维材质易碎，避免横向受力',
        '收纳时，将登山杖完全收缩并锁定'
      ],
      maintenance: [
        '每次使用后，清洁登山杖表面的泥土',
        '定期检查锁扣是否紧固，如有松动及时调整',
        '杖尖磨损后可更换，延长使用寿命',
        '存放时避免重压，防止杖身变形'
      ],
      package: [
        '登山杖 x1',
        '杖尖保护套 x1',
        '泥托 x1',
        '使用说明书 x1'
      ]
    }
  },
  {
    id: 9,
    name: '速干透气T恤',
    brand: 'Patagonia',
    categoryId: 5,
    price: 259,
    originalPrice: 359,
    image: productImages[8],
    images: [productImages[8], productImages[9]],
    description: '速干面料，UPF50+防晒，抗菌防臭，适合户外运动。',
    specs: [
      { name: '尺码', options: ['S', 'M', 'L', 'XL'] },
      { name: '颜色', options: ['黑色', '白色', '灰色', '蓝色'] }
    ],
    params: [
      { label: '面料', value: '聚酯纤维' },
      { label: '防晒指数', value: 'UPF50+' },
      { label: '功能', value: '速干、抗菌' },
      { label: '重量', value: '120g' },
      { label: '适用季节', value: '春夏秋' }
    ],
    scenes: ['hiking', 'running', 'climbing'],
    sales: 5678,
    rating: 4.7,
    reviewCount: 1567,
    isHot: true,
    stock: 456,
    createdAt: '2024-03-10T08:00:00Z',
    usageInstructions: {
      usage: [
        '选择合身尺码，确保运动时舒适透气',
        '运动时穿着，可快速排汗保持干爽',
        '可搭配其他服装进行多层穿搭，适应不同温度',
        '清洗后速干，适合长途旅行使用'
      ],
      notices: [
        '请勿使用柔顺剂、漂白剂清洗',
        '避免长时间暴晒，防止面料老化',
        '不要靠近火源，面料易燃',
        '避免与尖锐物品接触，防止勾丝'
      ],
      maintenance: [
        '使用中性洗涤剂冷水或温水机洗',
        '洗后自然晾干，避免熨烫',
        '存放于干燥通风处',
        '避免与深色衣物分开洗涤，防止染色'
      ],
      package: [
        '速干T恤 x1',
        '吊牌 x1',
        '使用说明书 x1'
      ]
    }
  },
  {
    id: 10,
    name: '户外保温水壶',
    brand: '膳魔师',
    categoryId: 6,
    price: 189,
    originalPrice: 259,
    image: productImages[9],
    images: [productImages[9], productImages[10]],
    description: '316不锈钢内胆，24小时保温，大容量1000ml，食品级材质。',
    specs: [
      { name: '容量', options: ['500ml', '750ml', '1000ml'] },
      { name: '颜色', options: ['黑色', '蓝色', '红色', '银色'] }
    ],
    params: [
      { label: '内胆', value: '316不锈钢' },
      { label: '容量', value: '1000ml' },
      { label: '保温时间', value: '24小时' },
      { label: '保冷时间', value: '12小时' },
      { label: '重量', value: '280g' }
    ],
    scenes: ['camping', 'hiking', 'running'],
    sales: 3456,
    rating: 4.9,
    reviewCount: 987,
    isHot: false,
    stock: 289,
    createdAt: '2024-02-15T08:00:00Z',
    usageInstructions: {
      usage: [
        '使用前用温水预热或预冷，提升保温效果',
        '注入液体后，请确保瓶盖拧紧',
        '避免盛装碳酸饮料、乳制品等易变质饮品',
        '饮用时注意温度，避免烫伤'
      ],
      notices: [
        '请勿放入微波炉、洗碗机、消毒柜中使用',
        '避免掉落或撞击，以免影响保温效果',
        '不要盛装干冰、沸水等，以免内部压力过大',
        '请勿长时间存放酸性或碱性液体'
      ],
      maintenance: [
        '每次使用后，用中性清洁剂和软刷清洗',
        '清洗后请彻底晾干后再存放',
        '定期清洗密封圈和瓶盖，防止异味',
        '长期存放时，请保持瓶盖打开'
      ],
      package: [
        '保温水壶主体 x1',
        '瓶盖 x1',
        '茶隔 x1',
        '使用说明书 x1',
        '保修卡 x1'
      ]
    }
  },
  {
    id: 11,
    name: '攀岩安全带',
    brand: 'Petzl',
    categoryId: 5,
    price: 599,
    originalPrice: 799,
    image: productImages[10],
    images: [productImages[10], productImages[11]],
    description: '专业攀岩安全带，可调式腿环，多装备挂点，舒适透气。',
    specs: [
      { name: '尺码', options: ['S', 'M', 'L'] }
    ],
    params: [
      { label: '承重', value: '15kN' },
      { label: '重量', value: '350g' },
      { label: '装备挂点', value: '4个' },
      { label: '可调腿环', value: '是' },
      { label: '认证', value: 'CE EN 358' }
    ],
    scenes: ['climbing'],
    sales: 456,
    rating: 4.8,
    reviewCount: 123,
    isHot: false,
    stock: 34,
    createdAt: '2024-03-12T08:00:00Z',
    usageInstructions: {
      usage: [
        '穿戴时，腰带位于髋骨上方，腿环位于大腿根部',
        '调整腰带和腿环松紧，确保穿戴舒适安全',
        '确保所有卡扣正确扣合并反穿',
        '连接绳索时，请使用正确的绳结和装备'
      ],
      notices: [
        '攀岩属于高危运动，请在专业指导下使用',
        '使用前请检查安全带是否有磨损、断裂等情况',
        '请勿超过安全带的承重范围',
        '坠落一次后，建议更换安全带'
      ],
      maintenance: [
        '每次使用后，检查所有部件是否完好',
        '用中性清洁剂手洗，自然晾干',
        '避免接触尖锐物品和化学物质',
        '存放于干燥通风处，避免阳光直射'
      ],
      package: [
        '攀岩安全带 x1',
        '装备环 x4',
        '使用说明书 x1',
        '保修卡 x1'
      ]
    }
  },
  {
    id: 12,
    name: '越野跑鞋',
    brand: 'Salomon',
    categoryId: 4,
    price: 899,
    originalPrice: 1199,
    image: productImages[11],
    images: [productImages[11], productImages[0]],
    description: '专业越野跑鞋，抓地力强，缓震舒适，适合长距离越野跑。',
    specs: [
      { name: '尺码', options: ['39', '40', '41', '42', '43', '44'] },
      { name: '颜色', options: ['黑色', '蓝色', '红色'] }
    ],
    params: [
      { label: '鞋面', value: '透气网布' },
      { label: '中底', value: 'EnergyCell+' },
      { label: '大底', value: 'Contagrip' },
      { label: '重量', value: '280g/只' },
      { label: '落差', value: '8mm' }
    ],
    scenes: ['running', 'hiking'],
    sales: 1890,
    rating: 4.8,
    reviewCount: 456,
    isHot: true,
    stock: 156,
    createdAt: '2024-02-25T08:00:00Z',
    usageInstructions: {
      usage: [
        '选择合适尺码，建议比日常运动鞋大半码',
        '穿着专业运动袜，提升舒适度',
        '系好鞋带，确保脚部在鞋内稳定',
        '新鞋建议先进行短距离磨合'
      ],
      notices: [
        '适合越野路面，不建议在平坦公路长时间穿着',
        '避免在湿滑岩石上快速奔跑',
        '请勿在高温环境下长时间放置',
        '鞋底磨损严重时请及时更换'
      ],
      maintenance: [
        '每次使用后，清除鞋底和鞋面的泥土',
        '用湿布擦拭鞋面，自然通风晾干',
        '避免水洗，以免影响中底性能',
        '存放时塞入鞋撑，保持鞋型'
      ],
      package: [
        '越野跑鞋一双',
        '防尘袋 x1',
        '使用说明书 x1',
        '保修卡 x1'
      ]
    }
  }
]

export const mockUsers = [
  {
    id: 1,
    username: 'user',
    password: '123456',
    nickname: '户外爱好者',
    phone: '13800138001',
    email: 'user@example.com',
    role: 'user',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'merchant',
    password: '123456',
    nickname: '户外装备旗舰店',
    phone: '13800138002',
    email: 'merchant@example.com',
    role: 'merchant',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    storeName: '探索者户外专营店',
    createdAt: '2024-01-01T00:00:00Z'
  }
]

export const mockOrders = [
  {
    id: 'ORD202403010001',
    userId: 1,
    items: [
      { productId: 1, name: '专业级双层防风帐篷', price: 1299, quantity: 1, image: productImages[0], spec: '橙色 / 3人' }
    ],
    totalAmount: 1299,
    status: 'completed',
    address: '北京市朝阳区xxx街道xxx号',
    createdAt: '2024-03-01T10:30:00Z'
  },
  {
    id: 'ORD202403050002',
    userId: 1,
    items: [
      { productId: 2, name: '羽绒睡袋零下20度', price: 899, quantity: 1, image: productImages[1], spec: '-15°C / L' },
      { productId: 6, name: '便携式户外炉具', price: 299, quantity: 1, image: productImages[5], spec: '套装' }
    ],
    totalAmount: 1198,
    status: 'shipping',
    address: '北京市朝阳区xxx街道xxx号',
    createdAt: '2024-03-05T14:20:00Z'
  },
  {
    id: 'ORD202403100003',
    userId: 1,
    items: [
      { productId: 7, name: 'LED强光头灯', price: 199, quantity: 2, image: productImages[6], spec: '1000lm' }
    ],
    totalAmount: 398,
    status: 'pending',
    address: '北京市朝阳区xxx街道xxx号',
    createdAt: '2024-03-10T09:15:00Z'
  },
  {
    id: 'ORD202402280004',
    userId: 1,
    items: [
      { productId: 4, name: '专业登山鞋防水防滑', price: 1899, quantity: 1, image: productImages[3], spec: '棕色 / 42' }
    ],
    totalAmount: 1899,
    status: 'cancelled',
    address: '北京市朝阳区xxx街道xxx号',
    createdAt: '2024-02-28T16:45:00Z'
  }
]
