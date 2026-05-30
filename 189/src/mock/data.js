export const users = [
  {
    id: 1,
    username: 'buyer',
    password: '123456',
    name: '李工坊主',
    role: 'buyer',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    phone: '13800138001',
    email: 'buyer@craft.com',
    workshopName: '锦绣非遗手作工坊',
    address: '江苏省苏州市姑苏区平江路188号',
    createTime: '2024-01-15'
  },
  {
    id: 2,
    username: 'supplier',
    password: '123456',
    name: '王供货商',
    role: 'supplier',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    phone: '13800138002',
    email: 'supplier@raw.com',
    companyName: '云南古方原料供应有限公司',
    address: '云南省昆明市呈贡区工业园区88号',
    createTime: '2023-11-20'
  }
]

export const categories = [
  { id: 1, name: '天然植物染料', icon: 'Brush', count: 28 },
  { id: 2, name: '传统纺织原料', icon: 'Goods', count: 35 },
  { id: 3, name: '陶瓷土料', icon: 'Histogram', count: 18 },
  { id: 4, name: '竹木藤草', icon: 'Menu', count: 42 },
  { id: 5, name: '金属矿产', icon: 'Coin', count: 15 },
  { id: 6, name: '天然宝石', icon: 'Star', count: 22 },
  { id: 7, name: '动物毛发', icon: 'Guide', count: 12 },
  { id: 8, name: '古法纸料', icon: 'Document', count: 16 }
]

export const products = [
  {
    id: 1,
    name: '板蓝根天然染料',
    categoryId: 1,
    categoryName: '天然植物染料',
    price: 128,
    unit: '公斤',
    stock: 500,
    sold: 1280,
    grade: '特级',
    origin: '贵州省黔东南州',
    isNatural: true,
    isTraditional: true,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01k3tYQk1x8X7X7X7X7_!!6000000006422-0-tps-800-800.jpg',
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01k3tYQk1x8X7X7X7X7_!!6000000006422-0-tps-800-800.jpg',
      'https://img.alicdn.com/imgextra/i2/O1CN01k3tYQk1x8X7X7X7X8_!!6000000006422-0-tps-800-800.jpg'
    ],
    description: '采用贵州传统古法工艺提取的板蓝根天然染料，色泽纯正，持久不褪色。',
    specs: [
      { name: '品级', value: '特级' },
      { name: '提取工艺', value: '古法浸泡提取' },
      { name: '保质期', value: '24个月' },
      { name: '适用工艺', value: '蜡染、扎染、蓝染' }
    ],
    uses: ['苗族蜡染', '白族扎染', '传统蓝染技艺', '草木染'],
    gradeStandards: [
      { level: '特级', criteria: '选取三年生板蓝根根部，靛蓝含量≥5%，色泽纯正', price: 128 },
      { level: '一级', criteria: '选取二年生板蓝根根部，靛蓝含量≥4%，色泽良好', price: 98 },
      { level: '二级', criteria: '选取一年生板蓝根根部，靛蓝含量≥3%，色泽一般', price: 78 }
    ],
    storageConditions: {
      temperature: '5-25℃',
      humidity: '相对湿度≤60%',
      storage: '密封阴凉干燥处，避免阳光直射',
      shelfLife: '24个月'
    },
    processAdaptation: {
      suitable: ['蜡染', '扎染', '蓝染', '草木染', '靛蓝印花'],
      unsuitable: ['高温印染', '化学合成染色'],
      tips: '建议使用软水溶解，水温控制在40-60℃'
    },
    tieredPricing: [
      { minQty: 1, maxQty: 9, price: 128, discount: '原价' },
      { minQty: 10, maxQty: 49, price: 115, discount: '9折' },
      { minQty: 50, maxQty: 199, price: 102, discount: '8折' },
      { minQty: 200, maxQty: null, price: 90, discount: '7折' }
    ],
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    createTime: '2024-03-15'
  },
  {
    id: 2,
    name: '苏木红色染料',
    categoryId: 1,
    categoryName: '天然植物染料',
    price: 168,
    unit: '公斤',
    stock: 320,
    sold: 890,
    grade: '一级',
    origin: '广西壮族自治区',
    isNatural: true,
    isTraditional: true,
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01k3tYQk1x8X7X7X7X9_!!6000000006422-0-tps-800-800.jpg',
    images: [
      'https://img.alicdn.com/imgextra/i2/O1CN01k3tYQk1x8X7X7X7X9_!!6000000006422-0-tps-800-800.jpg'
    ],
    description: '精选广西优质苏木，采用传统工艺提取的红色染料，色彩艳丽高贵。',
    specs: [
      { name: '品级', value: '一级' },
      { name: '提取工艺', value: '古法煎煮提取' },
      { name: '保质期', value: '24个月' },
      { name: '适用工艺', value: '丝绸染色、织物染印' }
    ],
    uses: ['云锦织造', '苏绣配色', '传统服饰染色', '书画装裱'],
    gradeStandards: [
      { level: '特级', criteria: '精选十年生苏木心材，色素含量≥8%，色泽深红', price: 168 },
      { level: '一级', criteria: '选取五年生苏木边材，色素含量≥6%，色泽正红', price: 138 },
      { level: '二级', criteria: '选取三年生苏木，色素含量≥4%，色泽浅红', price: 108 }
    ],
    storageConditions: {
      temperature: '0-30℃',
      humidity: '相对湿度≤65%',
      storage: '密封避光保存，防止受潮',
      shelfLife: '24个月'
    },
    processAdaptation: {
      suitable: ['丝绸染色', '棉麻染色', '纸张染色', '传统印染', '书画装裱'],
      unsuitable: ['化纤染色', '紫外线固化工艺'],
      tips: '建议使用纯净水溶解，水温控制在60-80℃效果最佳'
    },
    tieredPricing: [
      { minQty: 1, maxQty: 9, price: 168, discount: '原价' },
      { minQty: 10, maxQty: 49, price: 151, discount: '9折' },
      { minQty: 50, maxQty: 199, price: 134, discount: '8折' },
      { minQty: 200, maxQty: null, price: 118, discount: '7折' }
    ],
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    createTime: '2024-02-20'
  },
  {
    id: 3,
    name: '景德镇高岭土',
    categoryId: 3,
    categoryName: '陶瓷土料',
    price: 88,
    unit: '公斤',
    stock: 2000,
    sold: 3560,
    grade: '特级',
    origin: '江西省景德镇市',
    isNatural: true,
    isTraditional: false,
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01k3tYQk1x8X7X7X7X0_!!6000000006422-0-tps-800-800.jpg',
    images: [
      'https://img.alicdn.com/imgextra/i3/O1CN01k3tYQk1x8X7X7X7X0_!!6000000006422-0-tps-800-800.jpg'
    ],
    description: '产自景德镇高岭山的优质高岭土，质地纯净细腻，是制作高档瓷器的首选原料。',
    specs: [
      { name: '品级', value: '特级' },
      { name: '白度', value: '92%' },
      { name: '目数', value: '325目' },
      { name: '适用工艺', value: '青花瓷、玲珑瓷' }
    ],
    uses: ['景德镇青花瓷', '龙泉青瓷', '德化白瓷', '宜兴紫砂'],
    gradeStandards: [
      { level: '特级', criteria: '高岭山核心产区，白度≥92%，铝含量≥38%', price: 88 },
      { level: '一级', criteria: '高岭山周边产区，白度≥88%，铝含量≥35%', price: 68 },
      { level: '二级', criteria: '周边矿区，白度≥85%，铝含量≥32%', price: 52 }
    ],
    storageConditions: {
      temperature: '-5-40℃',
      humidity: '相对湿度≤70%',
      storage: '防潮密封储存，避免与有色物质接触',
      shelfLife: '36个月'
    },
    processAdaptation: {
      suitable: ['青花瓷', '玲珑瓷', '粉彩瓷', '白瓷', '紫砂'],
      unsuitable: ['高温颜色釉', '窑变釉'],
      tips: '使用前需过筛除铁，陈腐72小时以上效果更佳'
    },
    tieredPricing: [
      { minQty: 1, maxQty: 49, price: 88, discount: '原价' },
      { minQty: 50, maxQty: 199, price: 79, discount: '9折' },
      { minQty: 200, maxQty: 499, price: 70, discount: '8折' },
      { minQty: 500, maxQty: null, price: 62, discount: '7折' }
    ],
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    createTime: '2024-01-10'
  },
  {
    id: 4,
    name: '湖州毛笔山羊毛',
    categoryId: 7,
    categoryName: '动物毛发',
    price: 258,
    unit: '两',
    stock: 150,
    sold: 420,
    grade: '特级',
    origin: '浙江省湖州市',
    isNatural: true,
    isTraditional: true,
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01k3tYQk1x8X7X7X7X1_!!6000000006422-0-tps-800-800.jpg',
    images: [
      'https://img.alicdn.com/imgextra/i4/O1CN01k3tYQk1x8X7X7X7X1_!!6000000006422-0-tps-800-800.jpg'
    ],
    description: '精选湖州优质山羊毛，锋毫尖锐，弹性适中，是制作湖笔的上佳材料。',
    specs: [
      { name: '品级', value: '特级' },
      { name: '毛长', value: '4-6cm' },
      { name: '产地', value: '湖州安吉' },
      { name: '适用工艺', value: '湖笔制作、书画毛笔' }
    ],
    uses: ['湖笔制作', '宣纸书画', '工笔画笔', '书法用笔'],
    gradeStandards: [
      { level: '特级', criteria: '选取山羊毛锋颖部分，毛长5-6cm，弹性极佳', price: 258 },
      { level: '一级', criteria: '选取山羊毛中部，毛长4-5cm，弹性良好', price: 218 },
      { level: '二级', criteria: '选取山羊毛根部，毛长3-4cm，弹性适中', price: 178 }
    ],
    storageConditions: {
      temperature: '5-25℃',
      humidity: '相对湿度40-60%',
      storage: '通风干燥处，防虫蛀，避免重压',
      shelfLife: '60个月'
    },
    processAdaptation: {
      suitable: ['湖笔制作', '书画毛笔', '化妆刷', '工艺品毛刷'],
      unsuitable: ['工业毛刷', '高温设备'],
      tips: '使用前需用温水梳理，自然阴干，避免阳光直射'
    },
    tieredPricing: [
      { minQty: 1, maxQty: 9, price: 258, discount: '原价' },
      { minQty: 10, maxQty: 29, price: 232, discount: '9折' },
      { minQty: 30, maxQty: 99, price: 206, discount: '8折' },
      { minQty: 100, maxQty: null, price: 181, discount: '7折' }
    ],
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    createTime: '2024-04-05'
  },
  {
    id: 5,
    name: '安徽泾县青檀皮',
    categoryId: 8,
    categoryName: '古法纸料',
    price: 198,
    unit: '公斤',
    stock: 280,
    sold: 650,
    grade: '一级',
    origin: '安徽省宣城市泾县',
    isNatural: true,
    isTraditional: true,
    image: 'https://img.alicdn.com/imgextra/i5/O1CN01k3tYQk1x8X7X7X7X2_!!6000000006422-0-tps-800-800.jpg',
    images: [
      'https://img.alicdn.com/imgextra/i5/O1CN01k3tYQk1x8X7X7X7X2_!!6000000006422-0-tps-800-800.jpg'
    ],
    description: '泾县特产青檀树皮，纤维细长柔韧，是制作宣纸的核心原料。',
    specs: [
      { name: '品级', value: '一级' },
      { name: '纤维长度', value: '3-5mm' },
      { name: '产地', value: '泾县榔桥镇' },
      { name: '适用工艺', value: '宣纸制作、古籍修复' }
    ],
    uses: ['红星宣纸', '古籍修复纸', '书画用纸', '传统拓印'],
    gradeStandards: [
      { level: '特级', criteria: '选用30年以上树龄青檀皮，纤维长度≥5mm', price: 198 },
      { level: '一级', criteria: '选用20年以上树龄青檀皮，纤维长度≥4mm', price: 168 },
      { level: '二级', criteria: '选用10年以上树龄青檀皮，纤维长度≥3mm', price: 138 }
    ],
    storageConditions: {
      temperature: '10-25℃',
      humidity: '相对湿度50-70%',
      storage: '通风干燥，防潮防霉，远离火源',
      shelfLife: '60个月'
    },
    processAdaptation: {
      suitable: ['宣纸制作', '古籍修复', '书画纸', '皮纸', '传统拓印'],
      unsuitable: ['新闻纸', '包装纸'],
      tips: '使用前需浸泡软化，去除杂质，打浆时控制好浓度'
    },
    tieredPricing: [
      { minQty: 1, maxQty: 19, price: 198, discount: '原价' },
      { minQty: 20, maxQty: 49, price: 178, discount: '9折' },
      { minQty: 50, maxQty: 199, price: 158, discount: '8折' },
      { minQty: 200, maxQty: null, price: 139, discount: '7折' }
    ],
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    createTime: '2024-03-22'
  },
  {
    id: 6,
    name: '新疆和田玉籽料',
    categoryId: 6,
    categoryName: '天然宝石',
    price: 8800,
    unit: '克',
    stock: 50,
    sold: 85,
    grade: '特级',
    origin: '新疆维吾尔自治区和田地区',
    isNatural: true,
    isTraditional: false,
    image: 'https://img.alicdn.com/imgextra/i6/O1CN01k3tYQk1x8X7X7X7X3_!!6000000006422-0-tps-800-800.jpg',
    images: [
      'https://img.alicdn.com/imgextra/i6/O1CN01k3tYQk1x8X7X7X7X3_!!6000000006422-0-tps-800-800.jpg'
    ],
    description: '新疆和田玉龙喀什河出产的优质籽料，温润细腻，油脂光泽极佳。',
    specs: [
      { name: '品级', value: '特级' },
      { name: '密度', value: '2.95g/cm³' },
      { name: '硬度', value: '6.5-6.9' },
      { name: '适用工艺', value: '玉雕、首饰制作' }
    ],
    uses: ['扬州玉雕', '苏州玉雕', '北京玉雕', '首饰镶嵌'],
    gradeStandards: [
      { level: '特级', criteria: '玉龙喀什河籽料，羊脂白玉，无杂质无裂，油润度极佳', price: 8800 },
      { level: '一级', criteria: '玉龙喀什河籽料，白玉，少杂质少裂，油润度良好', price: 6800 },
      { level: '二级', criteria: '和田地区籽料，青白玉，有少量杂质或裂纹', price: 4800 }
    ],
    storageConditions: {
      temperature: '常温',
      humidity: '常温环境',
      storage: '软布包裹，避免碰撞划伤，远离化学物品',
      shelfLife: '永久保存'
    },
    processAdaptation: {
      suitable: ['玉雕摆件', '首饰镶嵌', '把件雕刻', '印章制作'],
      unsuitable: ['大型雕刻', '工业用途'],
      tips: '加工时注意保护原石皮色，雕刻时避免过热导致开裂'
    },
    tieredPricing: [
      { minQty: 1, maxQty: 4, price: 8800, discount: '原价' },
      { minQty: 5, maxQty: 9, price: 7920, discount: '9折' },
      { minQty: 10, maxQty: 29, price: 7040, discount: '8折' },
      { minQty: 30, maxQty: null, price: 6160, discount: '7折' }
    ],
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    createTime: '2024-02-28'
  },
  {
    id: 7,
    name: '江苏苏州缂丝线',
    categoryId: 2,
    categoryName: '传统纺织原料',
    price: 328,
    unit: '把',
    stock: 180,
    sold: 340,
    grade: '特级',
    origin: '江苏省苏州市',
    isNatural: true,
    isTraditional: true,
    image: 'https://img.alicdn.com/imgextra/i7/O1CN01k3tYQk1x8X7X7X7X4_!!6000000006422-0-tps-800-800.jpg',
    images: [
      'https://img.alicdn.com/imgextra/i7/O1CN01k3tYQk1x8X7X7X7X4_!!6000000006422-0-tps-800-800.jpg'
    ],
    description: '苏州传统缂丝专用丝线，采用优质桑蚕丝，色彩丰富，光泽柔和。',
    specs: [
      { name: '品级', value: '特级' },
      { name: '材质', value: '100%桑蚕丝' },
      { name: '规格', value: '200根/把' },
      { name: '适用工艺', value: '缂丝、苏绣' }
    ],
    uses: ['苏州缂丝', '云锦织造', '蜀绣', '粤绣'],
    gradeStandards: [
      { level: '特级', criteria: '100%桑蚕丝，光泽柔和，拉力强度≥4.5CN', price: 328 },
      { level: '一级', criteria: '95%以上桑蚕丝，光泽良好，拉力强度≥4.0CN', price: 278 },
      { level: '二级', criteria: '85%以上桑蚕丝，光泽较好，拉力强度≥3.5CN', price: 228 }
    ],
    storageConditions: {
      temperature: '5-25℃',
      humidity: '相对湿度40-65%',
      storage: '防潮防蛀，避免阳光直射，远离樟脑丸',
      shelfLife: '36个月'
    },
    processAdaptation: {
      suitable: ['缂丝', '苏绣', '云锦', '蜀绣', '粤绣', '湘绣'],
      unsuitable: ['机绣', '高速缝纫'],
      tips: '使用前需用温水浸泡30分钟，自然阴干后再使用'
    },
    tieredPricing: [
      { minQty: 1, maxQty: 9, price: 328, discount: '原价' },
      { minQty: 10, maxQty: 29, price: 295, discount: '9折' },
      { minQty: 30, maxQty: 99, price: 262, discount: '8折' },
      { minQty: 100, maxQty: null, price: 230, discount: '7折' }
    ],
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    createTime: '2024-04-12'
  },
  {
    id: 8,
    name: '浙江东阳樟木',
    categoryId: 4,
    categoryName: '竹木藤草',
    price: 458,
    unit: '立方米',
    stock: 120,
    sold: 210,
    grade: '一级',
    origin: '浙江省金华市东阳市',
    isNatural: true,
    isTraditional: false,
    image: 'https://img.alicdn.com/imgextra/i8/O1CN01k3tYQk1x8X7X7X7X5_!!6000000006422-0-tps-800-800.jpg',
    images: [
      'https://img.alicdn.com/imgextra/i8/O1CN01k3tYQk1x8X7X7X7X5_!!6000000006422-0-tps-800-800.jpg'
    ],
    description: '东阳优质香樟木，纹理美观，香气持久，是木雕和家具制作的上等材料。',
    specs: [
      { name: '品级', value: '一级' },
      { name: '规格', value: '2m×0.5m×0.3m' },
      { name: '含水率', value: '≤12%' },
      { name: '适用工艺', value: '东阳木雕、家具制作' }
    ],
    uses: ['东阳木雕', '黄杨木雕', '龙眼木雕', '金漆木雕'],
    gradeStandards: [
      { level: '特级', criteria: '百年以上樟木，纹理美观，香气浓郁，无结疤', price: 458 },
      { level: '一级', criteria: '五十年以上樟木，纹理良好，香气较浓，少量结疤', price: 388 },
      { level: '二级', criteria: '三十年以上樟木，纹理一般，香气适中，有结疤', price: 318 }
    ],
    storageConditions: {
      temperature: '5-30℃',
      humidity: '相对湿度40-70%',
      storage: '通风干燥处，避免阳光直射，定期刷桐油保养',
      shelfLife: '长期保存'
    },
    processAdaptation: {
      suitable: ['木雕', '家具制作', '根雕', '木盒制作', '装饰板材'],
      unsuitable: ['地板', '户外建筑'],
      tips: '加工前需自然风干6个月以上，含水率控制在12%以内'
    },
    tieredPricing: [
      { minQty: 1, maxQty: 4, price: 458, discount: '原价' },
      { minQty: 5, maxQty: 14, price: 412, discount: '9折' },
      { minQty: 15, maxQty: 49, price: 366, discount: '8折' },
      { minQty: 50, maxQty: null, price: 321, discount: '7折' }
    ],
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    createTime: '2024-03-08'
  }
]

export const combos = [
  {
    id: 1,
    name: '蓝染工艺入门套餐',
    price: 299,
    originalPrice: 398,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01combo11x8X7X7X7X7_!!6000000006422-0-tps-800-800.jpg',
    description: '包含板蓝根染料、靛蓝助剂、染色工具全套，适合初学者体验传统蓝染技艺',
    products: [
      { id: 1, name: '板蓝根天然染料', quantity: 2 },
      { id: 2, name: '苏木红色染料', quantity: 1 }
    ],
    sales: 568
  },
  {
    id: 2,
    name: '宣纸制作原料套装',
    price: 588,
    originalPrice: 760,
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01combo21x8X7X7X7X8_!!6000000006422-0-tps-800-800.jpg',
    description: '青檀皮、沙田稻草、宣纸胶料全套，还原古法宣纸制作工艺',
    products: [
      { id: 5, name: '安徽泾县青檀皮', quantity: 3 }
    ],
    sales: 320
  },
  {
    id: 3,
    name: '陶瓷创作基础包',
    price: 428,
    originalPrice: 560,
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01combo31x8X7X7X7X9_!!6000000006422-0-tps-800-800.jpg',
    description: '高岭土、釉料、制瓷工具一应俱全，开启陶瓷创作之旅',
    products: [
      { id: 3, name: '景德镇高岭土', quantity: 5 }
    ],
    sales: 456
  }
]

export const orders = [
  {
    id: 'ORD202405010001',
    buyerId: 1,
    buyerName: '李工坊主',
    buyerWorkshop: '锦绣非遗手作工坊',
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    products: [
      { id: 1, name: '板蓝根天然染料', price: 128, quantity: 10, unit: '公斤' },
      { id: 2, name: '苏木红色染料', price: 168, quantity: 5, unit: '公斤' }
    ],
    totalAmount: 2120,
    status: 'delivered',
    statusText: '已完成',
    createTime: '2024-05-01 10:30:00',
    payTime: '2024-05-01 10:35:00',
    shipTime: '2024-05-02 09:00:00',
    receiveTime: '2024-05-04 14:20:00',
    address: {
      name: '李工坊主',
      phone: '13800138001',
      address: '江苏省苏州市姑苏区平江路188号'
    },
    tracking: {
      company: '顺丰速运',
      number: 'SF1234567890123'
    }
  },
  {
    id: 'ORD202405100002',
    buyerId: 1,
    buyerName: '李工坊主',
    buyerWorkshop: '锦绣非遗手作工坊',
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    products: [
      { id: 5, name: '安徽泾县青檀皮', price: 198, quantity: 20, unit: '公斤' }
    ],
    totalAmount: 3960,
    status: 'shipping',
    statusText: '运输中',
    createTime: '2024-05-10 15:20:00',
    payTime: '2024-05-10 15:25:00',
    shipTime: '2024-05-11 10:00:00',
    address: {
      name: '李工坊主',
      phone: '13800138001',
      address: '江苏省苏州市姑苏区平江路188号'
    },
    tracking: {
      company: '京东物流',
      number: 'JD9876543210987'
    }
  },
  {
    id: 'ORD202405150003',
    buyerId: 1,
    buyerName: '李工坊主',
    buyerWorkshop: '锦绣非遗手作工坊',
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    products: [
      { id: 3, name: '景德镇高岭土', price: 88, quantity: 50, unit: '公斤' },
      { id: 7, name: '江苏苏州缂丝线', price: 328, quantity: 2, unit: '把' }
    ],
    totalAmount: 5056,
    status: 'pending',
    statusText: '待发货',
    createTime: '2024-05-15 09:10:00',
    payTime: '2024-05-15 09:15:00',
    address: {
      name: '李工坊主',
      phone: '13800138001',
      address: '江苏省苏州市姑苏区平江路188号'
    }
  },
  {
    id: 'ORD202405180004',
    buyerId: 1,
    buyerName: '李工坊主',
    buyerWorkshop: '锦绣非遗手作工坊',
    supplierId: 2,
    supplierName: '云南古方原料供应有限公司',
    products: [
      { id: 4, name: '湖州毛笔山羊毛', price: 258, quantity: 10, unit: '两' }
    ],
    totalAmount: 2580,
    status: 'unpaid',
    statusText: '待支付',
    createTime: '2024-05-18 16:45:00',
    address: {
      name: '李工坊主',
      phone: '13800138001',
      address: '江苏省苏州市姑苏区平江路188号'
    }
  }
]

export const favorites = [
  { id: 1, productId: 1, createTime: '2024-04-10 08:30:00' },
  { id: 2, productId: 3, createTime: '2024-04-12 14:20:00' },
  { id: 3, productId: 5, createTime: '2024-04-15 10:15:00' },
  { id: 4, productId: 6, createTime: '2024-04-20 16:45:00' }
]
