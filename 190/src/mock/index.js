export const categories = [
  { id: 1, name: '恒温养殖设备', icon: 'Odometer', children: [
    { id: 11, name: '仔猪保温箱' },
    { id: 12, name: '小鸡育雏保温灯' },
    { id: 13, name: '养殖加温设备' },
    { id: 14, name: '温控系统' }
  ]},
  { id: 2, name: '防疫消毒器械', icon: 'FirstAidKit', children: [
    { id: 21, name: '高压消毒机' },
    { id: 22, name: '喷雾消毒器' },
    { id: 23, name: '人员消毒通道' },
    { id: 24, name: '紫外线消毒灯' }
  ]},
  { id: 3, name: '饲料加工设备', icon: 'Setting', children: [
    { id: 31, name: '饲料粉碎机' },
    { id: 32, name: '饲料搅拌机' },
    { id: 33, name: '颗粒饲料机' },
    { id: 34, name: '青贮设备' }
  ]},
  { id: 4, name: '畜禽养殖设备', icon: 'Grid', children: [
    { id: 41, name: '鸡笼设备' },
    { id: 42, name: '猪栏设备' },
    { id: 43, name: '牛栏设备' },
    { id: 44, name: '羊栏设备' }
  ]},
  { id: 5, name: '饮水饲喂设备', icon: 'Coffee', children: [
    { id: 51, name: '自动饮水器' },
    { id: 52, name: '自动喂料机' },
    { id: 53, name: '干湿料槽' },
    { id: 54, name: '乳头饮水器' }
  ]},
  { id: 6, name: '环境控制设备', icon: 'Wind', children: [
    { id: 61, name: '风机通风系统' },
    { id: 62, name: '湿帘降温系统' },
    { id: 63, name: '氨气检测仪' },
    { id: 64, name: '环境控制器' }
  ]},
  { id: 7, name: '粪污处理设备', icon: 'Delete', children: [
    { id: 71, name: '刮粪机' },
    { id: 72, name: '固液分离机' },
    { id: 73, name: '沼气池设备' },
    { id: 74, name: '有机肥设备' }
  ]},
  { id: 8, name: '检测化验设备', icon: 'DataAnalysis', children: [
    { id: 81, name: '疫病检测设备' },
    { id: 82, name: '饲料检测设备' },
    { id: 83, name: '水质检测设备' },
    { id: 84, name: '体温检测设备' }
  ]}
]

export const products = [
  {
    id: 1,
    name: '智能仔猪保温箱',
    categoryId: 1,
    categoryName: '恒温养殖设备',
    price: 1280,
    originalPrice: 1580,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=intelligent%20piglet%20incubator%20box%20farm%20equipment&image_size=square_hd',
    description: '采用优质保温材料，智能温控系统，为仔猪提供舒适温暖的生长环境',
    power: '500W',
    serviceLife: '8年',
    protectionLevel: 'IP54',
    applicableScale: '适合100-500头规模猪场',
    applicableScenes: ['生猪养殖', '仔猪保育', '规模化猪场'],
    operationParams: {
      '工作电压': '220V/50Hz',
      '额定功率': '500W',
      '温控精度': '±1℃',
      '加热方式': '碳纤维加热板',
      '控制方式': '数字智能温控'
    },
    parameters: {
      '额定电压': '220V',
      '温度范围': '25-40℃可调',
      '外形尺寸': '1000×600×800mm',
      '材质': 'PP塑料+保温棉',
      '重量': '25kg'
    },
    packageConfig: [
      { name: '标准套装', items: ['保温箱主体×1', '加热板×1', '温控器×1'], price: 1280 },
      { name: '加厚套装', items: ['保温箱主体×1', '加热板×2', '温控器×1', '保温垫×2'], price: 1680, unitPrice: 1680 },
      { name: '豪华套装', items: ['保温箱主体×1', '加热板×2', '智能温控器×1', '保温垫×4', '消毒灯×1'], price: 2180, unitPrice: 2180 }
    ],
    supplier: '河南XX养殖设备有限公司',
    sales: 2568,
    rating: 4.8,
    stock: 100,
    tags: ['热销', '智能温控', '节能']
  },
  {
    id: 2,
    name: '红外线育雏保温灯',
    categoryId: 1,
    categoryName: '恒温养殖设备',
    price: 85,
    originalPrice: 120,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=infrared%20chick%20brooder%20heat%20lamp&image_size=square_hd',
    description: '高效红外线加热，节能环保，适用于鸡鸭鹅等禽类育雏保温',
    power: '250W',
    serviceLife: '3年',
    protectionLevel: 'IP65',
    applicableScale: '适合1000-10000只规模禽场',
    applicableScenes: ['家禽养殖', '雏鸡育雏', '鹌鹑养殖'],
    operationParams: {
      '工作电压': '220V/50Hz',
      '额定功率': '250W',
      '表面温度': '200-300℃',
      '红外波长': '2-10μm',
      '照射角度': '120°'
    },
    parameters: {
      '额定电压': '220V',
      '功率': '250W',
      '照射范围': '3-5平方米',
      '使用寿命': '5000小时',
      '灯头规格': 'E27'
    },
    packageConfig: [
      { name: '单灯套装', items: ['保温灯×1', '灯座×1'], price: 85 },
      { name: '10只套装', items: ['保温灯×10', '灯座×10'], price: 800, unitPrice: 80 },
      { name: '50只套装', items: ['保温灯×50', '灯座×50', '备用灯×5'], price: 3800, unitPrice: 76 }
    ],
    supplier: '山东XX禽业设备厂',
    sales: 8956,
    rating: 4.6,
    stock: 500,
    tags: ['低价', '耐用']
  },
  {
    id: 3,
    name: '高压喷雾消毒机',
    categoryId: 2,
    categoryName: '防疫消毒器械',
    price: 2680,
    originalPrice: 3200,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=high%20pressure%20spray%20disinfection%20machine&image_size=square_hd',
    description: '全自动高压喷雾系统，360度无死角消毒，有效杀灭细菌病毒',
    power: '1500W',
    serviceLife: '6年',
    protectionLevel: 'IP66',
    applicableScale: '适合年出栏5000头以上规模养殖场',
    applicableScenes: ['养殖场入口', '车辆消毒', '圈舍消毒'],
    operationParams: {
      '工作电压': '380V/50Hz',
      '额定功率': '1500W',
      '工作压力': '4-6MPa',
      '喷雾量': '20L/min',
      '喷头数量': '6个',
      '控制方式': '自动/手动切换'
    },
    parameters: {
      '额定电压': '380V',
      '流量': '20L/min',
      '压力': '4-6MPa',
      '喷雾距离': '8-12米',
      '水箱容量': '100L'
    },
    packageConfig: [
      { name: '基础版', items: ['消毒机主机×1', '喷头×6', '水管×10米'], price: 2680 },
      { name: '标准版', items: ['消毒机主机×1', '喷头×10', '水管×20米', '自动控制器×1'], price: 3580, unitPrice: 3580 },
      { name: '豪华版', items: ['消毒机主机×1', '喷头×16', '水管×30米', '自动控制器×1', '加热系统×1'], price: 4880, unitPrice: 4880 }
    ],
    supplier: '江苏XX环保科技有限公司',
    sales: 1856,
    rating: 4.9,
    stock: 50,
    tags: ['防疫必备', '全自动']
  },
  {
    id: 4,
    name: '移动人员消毒通道',
    categoryId: 2,
    categoryName: '防疫消毒器械',
    price: 15800,
    originalPrice: 18800,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20personnel%20disinfection%20channel&image_size=square_hd',
    description: '智能感应喷雾消毒，人员进出自动消毒，配套鞋底消毒池',
    power: '2000W',
    serviceLife: '10年',
    protectionLevel: 'IP65',
    applicableScale: '适合日人流量500人以上场所',
    applicableScenes: ['养殖场入口', '饲料厂入口', '屠宰场入口'],
    operationParams: {
      '工作电压': '220V/50Hz',
      '额定功率': '2000W',
      '感应方式': '红外人体感应',
      '喷雾量': '12L/min',
      '消毒时间': '5-10秒可调',
      '水箱容量': '80L'
    },
    parameters: {
      '额定电压': '220V',
      '尺寸': '2000×1500×2200mm',
      '消毒时间': '5-10秒',
      '喷头数量': '16个',
      '材质': '304不锈钢'
    },
    packageConfig: [
      { name: '标准版', items: ['消毒通道主体×1', '智能感应系统×1', '喷头×16'], price: 15800 },
      { name: '增强版', items: ['消毒通道主体×1', '智能感应系统×1', '喷头×20', '鞋底消毒池×1'], price: 18800, unitPrice: 18800 },
      { name: '豪华版', items: ['消毒通道主体×1', '智能感应系统×1', '喷头×24', '鞋底消毒池×1', '加热系统×1', '人脸识别×1'], price: 25800, unitPrice: 25800 }
    ],
    supplier: '广东XX消毒设备有限公司',
    sales: 423,
    rating: 4.7,
    stock: 20,
    tags: ['智能感应', '不锈钢']
  },
  {
    id: 5,
    name: '全自动饲料粉碎机',
    categoryId: 3,
    categoryName: '饲料加工设备',
    price: 5800,
    originalPrice: 6800,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=automatic%20feed%20grinder%20machine&image_size=square_hd',
    description: '时产500kg，可粉碎玉米、豆粕等多种原料，适合中小型养殖场',
    power: '7500W',
    serviceLife: '10年',
    protectionLevel: 'IP44',
    applicableScale: '适合年出栏1000-5000头规模猪场',
    applicableScenes: ['饲料加工', '玉米粉碎', '中小型养殖场'],
    operationParams: {
      '工作电压': '380V/50Hz',
      '额定功率': '7.5kW',
      '主轴转速': '3800r/min',
      '产量': '500kg/h',
      '粉碎细度': '20-120目可调'
    },
    parameters: {
      '额定电压': '380V',
      '产量': '500kg/h',
      '粉碎细度': '20-120目',
      '电机功率': '7.5kW',
      '重量': '280kg'
    },
    packageConfig: [
      { name: '基础版', items: ['粉碎机主机×1', '筛片×2套', '工具包×1'], price: 5800 },
      { name: '标准版', items: ['粉碎机主机×1', '筛片×5套', '工具包×1', '自动上料机×1'], price: 7800, unitPrice: 7800 },
      { name: '豪华版', items: ['粉碎机主机×1', '筛片×10套', '工具包×1', '自动上料机×1', '除尘系统×1'], price: 9800, unitPrice: 9800 }
    ],
    supplier: '河南XX农牧机械有限公司',
    sales: 956,
    rating: 4.5,
    stock: 30,
    tags: ['高效', '耐用']
  },
  {
    id: 6,
    name: '立式饲料搅拌机',
    categoryId: 3,
    categoryName: '饲料加工设备',
    price: 8500,
    originalPrice: 9800,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vertical%20feed%20mixer&image_size=square_hd',
    description: '立式设计，搅拌均匀，混合均匀度高，适合配合饲料生产',
    power: '5500W',
    serviceLife: '12年',
    protectionLevel: 'IP44',
    applicableScale: '适合年出栏3000-10000头规模猪场',
    applicableScenes: ['饲料混合', '预混料生产', '规模化养殖场'],
    operationParams: {
      '工作电压': '380V/50Hz',
      '额定功率': '5.5kW',
      '搅拌容量': '1000kg',
      '搅拌转速': '35r/min',
      '混合均匀度': 'CV≤5%'
    },
    parameters: {
      '额定电压': '380V',
      '容量': '1000kg',
      '搅拌时间': '15-20分钟',
      '电机功率': '5.5kW',
      '外形尺寸': '1500×1500×2800mm'
    },
    packageConfig: [
      { name: '基础版', items: ['搅拌机主机×1', '螺旋输送器×1', '控制箱×1'], price: 8500 },
      { name: '标准版', items: ['搅拌机主机×1', '螺旋输送器×1', '控制箱×1', '称重系统×1'], price: 12800, unitPrice: 12800 },
      { name: '豪华版', items: ['搅拌机主机×1', '螺旋输送器×1', '智能控制箱×1', '称重系统×1', '自动配料×1'], price: 18800, unitPrice: 18800 }
    ],
    supplier: '山东XX农牧机械有限公司',
    sales: 723,
    rating: 4.6,
    stock: 25,
    tags: ['大容量', '均匀度高']
  },
  {
    id: 7,
    name: '阶梯式蛋鸡笼',
    categoryId: 4,
    categoryName: '畜禽养殖设备',
    price: 12500,
    originalPrice: 15000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=step%20type%20layer%20cage&image_size=square_hd',
    description: '热镀锌材质，阶梯式布局，自动清粪，提高养殖效率',
    power: '1000W',
    serviceLife: '15年',
    protectionLevel: 'IP54',
    applicableScale: '适合10000-50000只规模蛋鸡场',
    applicableScenes: ['蛋鸡养殖', '规模化鸡场', '种鸡养殖'],
    operationParams: {
      '配套功率': '1kW',
      '清粪方式': '传送带自动清粪',
      '喂料方式': '行车式自动喂料',
      '集蛋方式': '自动集蛋系统'
    },
    parameters: {
      '尺寸': '1950×2100×1800mm',
      '饲养量': '160只/组',
      '笼层': '4层',
      '材质': 'Q235热镀锌',
      '钢丝直径': '2.5mm'
    },
    packageConfig: [
      { name: '笼具套装', items: ['鸡笼主体×1组', '饲槽×1套', '水杯×1套'], price: 12500 },
      { name: '半自动套装', items: ['鸡笼主体×1组', '饲槽×1套', '水杯×1套', '自动清粪×1套'], price: 18500, unitPrice: 18500 },
      { name: '全自动套装', items: ['鸡笼主体×1组', '饲槽×1套', '水杯×1套', '自动清粪×1套', '自动喂料×1套', '自动集蛋×1套'], price: 28500, unitPrice: 28500 }
    ],
    supplier: '河北XX养殖设备有限公司',
    sales: 1256,
    rating: 4.8,
    stock: 15,
    tags: ['热镀锌', '自动化']
  },
  {
    id: 8,
    name: '母猪定位栏',
    categoryId: 4,
    categoryName: '畜禽养殖设备',
    price: 1800,
    originalPrice: 2200,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sow%20gestation%20stall&image_size=square_hd',
    description: '国标钢管焊接，热镀锌处理，结实耐用，适合规模化猪场',
    power: '0W',
    serviceLife: '20年',
    protectionLevel: 'IP54',
    applicableScale: '适合100-1000头规模母猪场',
    applicableScenes: ['母猪饲养', '怀孕母猪', '规模化猪场'],
    operationParams: {
      '安装方式': '落地式安装',
      '单栏尺寸': '2200×650×1000mm',
      '适配猪只': '怀孕母猪/空怀母猪'
    },
    parameters: {
      '尺寸': '2200×650×1000mm',
      '材质': '国标钢管',
      '壁厚': '2.5mm',
      '表面处理': '热镀锌',
      '单栏重量': '65kg'
    },
    packageConfig: [
      { name: '单栏套装', items: ['定位栏主体×1', '食槽×1', '饮水器×1'], price: 1800 },
      { name: '10栏套装', items: ['定位栏主体×10', '食槽×10', '饮水器×10', '连接配件×1套'], price: 17000, unitPrice: 1700 },
      { name: '50栏套装', items: ['定位栏主体×50', '食槽×50', '饮水器×50', '连接配件×5套', '漏粪板×50'], price: 80000, unitPrice: 1600 }
    ],
    supplier: '河南XX养殖设备有限公司',
    sales: 3652,
    rating: 4.7,
    stock: 200,
    tags: ['国标材质', '热镀锌']
  },
  {
    id: 9,
    name: '猪用自动饮水器',
    categoryId: 5,
    categoryName: '饮水饲喂设备',
    price: 25,
    originalPrice: 35,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=automatic%20pig%20drinker%20nipple&image_size=square_hd',
    description: '不锈钢材质，自动出水，节约用水，减少浪费',
    power: '0W',
    serviceLife: '8年',
    protectionLevel: 'IP67',
    applicableScale: '适合所有规模猪场',
    applicableScenes: ['生猪养殖', '育肥猪', '仔猪'],
    operationParams: {
      '工作压力': '0.1-0.5MPa',
      '出水量': '1-3L/min',
      '开启方式': '鸭嘴式/乳头式'
    },
    parameters: {
      '材质': '304不锈钢',
      '接口': '4分/6分可选',
      '出水量': '1-3L/min',
      '工作压力': '0.1-0.5MPa'
    },
    packageConfig: [
      { name: '10只装', items: ['饮水器×10', '密封圈×20'], price: 250 },
      { name: '50只装', items: ['饮水器×50', '密封圈×100', '安装工具×1'], price: 1150, unitPrice: 23 },
      { name: '200只装', items: ['饮水器×200', '密封圈×400', '安装工具×2', '备用阀芯×20'], price: 4200, unitPrice: 21 }
    ],
    supplier: '山东XX畜牧设备有限公司',
    sales: 15689,
    rating: 4.5,
    stock: 2000,
    tags: ['低价', '不锈钢']
  },
  {
    id: 10,
    name: '自动喂料线系统',
    categoryId: 5,
    categoryName: '饮水饲喂设备',
    price: 28000,
    originalPrice: 32000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=automatic%20feeding%20line%20system&image_size=square_hd',
    description: '全自动喂料系统，定时定量饲喂，节省人工，提高养殖效率',
    power: '3000W',
    serviceLife: '10年',
    protectionLevel: 'IP54',
    applicableScale: '适合500-5000头规模育肥猪场',
    applicableScenes: ['规模化猪场', '自动饲喂', '育肥猪舍'],
    operationParams: {
      '工作电压': '380V/50Hz',
      '额定功率': '3kW',
      '输送速度': '500kg/h',
      '输送距离': '100米',
      '控制方式': 'PLC智能控制'
    },
    parameters: {
      '额定电压': '380V',
      '输送距离': '100米',
      '输送量': '500kg/h',
      '料塔容量': '3-10吨可选',
      '控制方式': 'PLC自动控制'
    },
    packageConfig: [
      { name: '基础版', items: ['料塔×3吨', '输送系统×100米', '控制箱×1', '料槽×20个'], price: 28000 },
      { name: '标准版', items: ['料塔×5吨', '输送系统×150米', '智能控制箱×1', '料槽×40个', '称重模块×1'], price: 42000, unitPrice: 42000 },
      { name: '豪华版', items: ['料塔×10吨', '输送系统×200米', '智能控制箱×1', '料槽×60个', '称重模块×1', '远程监控×1'], price: 68000, unitPrice: 68000 }
    ],
    supplier: '河南XX智能养殖设备有限公司',
    sales: 189,
    rating: 4.9,
    stock: 10,
    tags: ['智能化', '省人工']
  },
  {
    id: 11,
    name: '玻璃钢负压风机',
    categoryId: 6,
    categoryName: '环境控制设备',
    price: 1200,
    originalPrice: 1500,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=FRP%20negative%20pressure%20fan&image_size=square_hd',
    description: '大风量低噪音，耐腐蚀，适合畜禽舍通风降温',
    power: '1100W',
    serviceLife: '10年',
    protectionLevel: 'IP55',
    applicableScale: '适合1000-5000㎡畜禽舍',
    applicableScenes: ['鸡舍通风', '猪舍降温', '温室大棚'],
    operationParams: {
      '工作电压': '380V/50Hz',
      '额定功率': '1.1kW',
      '转速': '450r/min',
      '风量': '44000m³/h',
      '噪音': '≤75dB'
    },
    parameters: {
      '额定电压': '380V',
      '风量': '44000m³/h',
      '功率': '1.1kW',
      '噪音': '≤75dB',
      '外形尺寸': '1380×1380×450mm'
    },
    packageConfig: [
      { name: '单台装', items: ['风机主机×1', '防护网×1', '安装配件×1套'], price: 1200 },
      { name: '4台套装', items: ['风机主机×4', '防护网×4', '安装配件×4套', '温控器×1'], price: 4500, unitPrice: 1125 },
      { name: '10台套装', items: ['风机主机×10', '防护网×10', '安装配件×10套', '智能温控箱×1', '联动控制×1'], price: 10800, unitPrice: 1080 }
    ],
    supplier: '山东XX通风设备有限公司',
    sales: 2568,
    rating: 4.7,
    stock: 80,
    tags: ['大风量', '耐腐蚀']
  },
  {
    id: 12,
    name: '水帘降温系统',
    categoryId: 6,
    categoryName: '环境控制设备',
    price: 350,
    originalPrice: 420,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=evaporative%20cooling%20pad%20system&image_size=square_hd',
    description: '高效蒸发降温，配合风机使用，降温效果显著',
    power: '200W',
    serviceLife: '8年',
    protectionLevel: 'IP54',
    applicableScale: '适合500-3000㎡畜禽舍',
    applicableScenes: ['鸡舍降温', '猪舍降温', '温室降温'],
    operationParams: {
      '工作电压': '220V/50Hz',
      '水泵功率': '200W',
      '降温幅度': '4-8℃',
      '蒸发效率': '≥80%',
      '水流量': '10L/min/㎡'
    },
    parameters: {
      '厚度': '10/15cm可选',
      '高度': '1.5/1.8/2.0m',
      '降温幅度': '4-8℃',
      '材质': '特种纸'
    },
    packageConfig: [
      { name: '10㎡套装', items: ['水帘纸×10㎡', '边框×1套', '水泵×1', '水管×10米'], price: 3500 },
      { name: '30㎡套装', items: ['水帘纸×30㎡', '边框×1套', '水泵×2', '水管×30米', '过滤器×1'], price: 9800, unitPrice: 327 },
      { name: '50㎡套装', items: ['水帘纸×50㎡', '边框×1套', '水泵×3', '水管×50米', '过滤器×2', '自动控水×1'], price: 15800, unitPrice: 316 }
    ],
    supplier: '江苏XX温控设备有限公司',
    sales: 3256,
    rating: 4.6,
    stock: 500,
    tags: ['降温快', '节能']
  }
]

export const packageDeals = [
  {
    id: 1,
    name: '100头母猪场设备套餐',
    price: 298000,
    originalPrice: 350000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=100%20sows%20farm%20equipment%20package&image_size=landscape_16_9',
    description: '包含定位栏、产床、保育床、自动喂料系统等全套设备',
    items: ['母猪定位栏×100组', '母猪产床×30套', '仔猪保育床×20套', '自动喂料线×2套', '通风降温系统×1套', '消毒设备×1套'],
    savings: '立省52000元',
    tag: '热销套餐'
  },
  {
    id: 2,
    name: '5000只蛋鸡场设备套餐',
    price: 168000,
    originalPrice: 198000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=5000%20layers%20farm%20equipment%20package&image_size=landscape_16_9',
    description: '阶梯式蛋鸡笼+自动喂料+自动清粪+通风降温全套方案',
    items: ['阶梯式蛋鸡笼×32组', '自动喂料系统×1套', '自动清粪系统×1套', '风机水帘系统×1套', '消毒设备×1套'],
    savings: '立省30000元',
    tag: '超值推荐'
  },
  {
    id: 3,
    name: '中小型猪场消毒防疫套餐',
    price: 12800,
    originalPrice: 15800,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=small%20pig%20farm%20disinfection%20package&image_size=landscape_16_9',
    description: '人员消毒通道+喷雾消毒机+消毒药箱等防疫必备设备',
    items: ['移动消毒通道×1套', '高压喷雾消毒机×1台', '紫外线消毒灯×10盏', '消毒药箱×2个', '防护用品×10套'],
    savings: '立省3000元',
    tag: '防疫必备'
  }
]

export const zoneProducts = {
  constantTemp: products.filter(p => p.categoryId === 1),
  disinfection: products.filter(p => p.categoryId === 2)
}

export const users = {
  purchaser: {
    id: 1,
    username: 'farm123',
    password: '123456',
    name: '王经理',
    phone: '13800138000',
    role: 'purchaser',
    company: 'XX生猪养殖有限公司',
    address: '河南省郑州市XX区XX路123号',
    avatar: ''
  },
  supplier: {
    userId: 2,
    username: 'supplier123',
    password: '123456',
    name: '李经理',
    phone: '13900139000',
    role: 'supplier',
    company: 'XX养殖设备有限公司',
    address: '山东省济南市XX区XX路456号',
    avatar: ''
  }
}

export const orders = [
  {
    id: 'ORD202401001',
    createTime: '2024-01-15 10:30:00',
    status: '已完成',
    totalAmount: 25600,
    paymentMethod: '银行转账',
    items: [
      { productId: 1, productName: '智能仔猪保温箱', price: 12800, quantity: 2, image: products[0].image },
      { productId: 9, productName: '猪用自动饮水器', price: 25, quantity: 16, image: products[8].image }
    ],
    address: '河南省郑州市XX区XX路123号',
    contact: '王经理 13800138000'
  },
  {
    id: 'ORD202401002',
    createTime: '2024-01-20 14:20:00',
    status: '待发货',
    totalAmount: 168000,
    paymentMethod: '银行转账',
    items: [
      { productId: 10, productName: '自动喂料线系统', price: 28000, quantity: 6, image: products[9].image }
    ],
    address: '河南省郑州市XX区XX路123号',
    contact: '王经理 13800138000'
  },
  {
    id: 'ORD202401003',
    createTime: '2024-01-25 09:15:00',
    status: '已发货',
    totalAmount: 5200,
    paymentMethod: '在线支付',
    items: [
      { productId: 5, productName: '全自动饲料粉碎机', price: 5200, quantity: 1, image: products[4].image }
    ],
    address: '河南省郑州市XX区XX路123号',
    contact: '王经理 13800138000'
  },
  {
    id: 'ORD202402001',
    createTime: '2024-02-01 16:45:00',
    status: '待付款',
    totalAmount: 85,
    paymentMethod: '待支付',
    items: [
      { productId: 2, productName: '红外线育雏保温灯', price: 85, quantity: 1, image: products[1].image }
    ],
    address: '河南省郑州市XX区XX路123号',
    contact: '王经理 13800138000'
  }
]

export const favorites = [1, 3, 5, 7, 9, 11]
