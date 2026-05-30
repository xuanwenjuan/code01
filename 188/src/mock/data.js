export const categories = [
  {
    id: 1,
    name: '绿植花卉',
    icon: '🌿',
    children: [
      { id: 11, name: '耐寒绿植' },
      { id: 12, name: '观赏花卉' },
      { id: 13, name: '多肉植物' },
      { id: 14, name: '乔木灌木' }
    ]
  },
  {
    id: 2,
    name: '园艺工具',
    icon: '🔧',
    children: [
      { id: 21, name: '修剪工具' },
      { id: 22, name: '浇水工具' },
      { id: 23, name: '松土工具' },
      { id: 24, name: '防护用品' }
    ]
  },
  {
    id: 3,
    name: '园林资材',
    icon: '🏡',
    children: [
      { id: 31, name: '防腐木材' },
      { id: 32, name: '石材石料' },
      { id: 33, name: '景观灯具' },
      { id: 34, name: '喷灌设备' }
    ]
  },
  {
    id: 4,
    name: '花肥农药',
    icon: '🧪',
    children: [
      { id: 41, name: '有机肥料' },
      { id: 42, name: '复合肥料' },
      { id: 43, name: '杀虫剂' },
      { id: 44, name: '杀菌剂' }
    ]
  },
  {
    id: 5,
    name: '花盆容器',
    icon: '🪴',
    children: [
      { id: 51, name: '陶瓷花盆' },
      { id: 52, name: '塑料花盆' },
      { id: 53, name: '水泥花盆' },
      { id: 54, name: '花箱花槽' }
    ]
  },
  {
    id: 6,
    name: '草坪草种',
    icon: '🌱',
    children: [
      { id: 61, name: '冷季型草种' },
      { id: 62, name: '暖季型草种' },
      { id: 63, name: '观赏草' },
      { id: 64, name: '牧草种子' }
    ]
  },
  {
    id: 7,
    name: '景观小品',
    icon: '⛲',
    children: [
      { id: 71, name: '假山流水' },
      { id: 72, name: '雕塑摆件' },
      { id: 73, name: '花园围栏' },
      { id: 74, name: '户外家具' }
    ]
  },
  {
    id: 8,
    name: '工程配套',
    icon: '📦',
    children: [
      { id: 81, name: '土工材料' },
      { id: 82, name: '排水系统' },
      { id: 83, name: '绿化养护' },
      { id: 84, name: '其他配套' }
    ]
  }
]

export const products = [
  {
    id: 1,
    name: '北海道黄杨 耐寒常绿灌木',
    categoryId: 11,
    price: 28,
    originalPrice: 38,
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop'
    ],
    sales: 2580,
    rating: 4.9,
    stock: 500,
    isColdResistant: true,
    isPreservative: false,
    supplier: '绿之源苗圃',
    supplierId: 1,
    description: '北海道黄杨是一种耐寒常绿灌木，适合北方地区园林绿化，叶片翠绿有光泽，冬季不落叶，是优良的绿篱材料。',
    specs: [
      { name: '高度', values: ['50cm', '80cm', '100cm', '120cm'] },
      { name: '数量', values: ['10株', '50株', '100株', '500株'] }
    ],
    parameters: [
      { label: '植物类型', value: '常绿灌木' },
      { label: '耐寒温度', value: '-25°C' },
      { label: '生长周期', value: '多年生' },
      { label: '光照需求', value: '全日照/半阴' },
      { label: '土壤要求', value: '疏松肥沃排水良好' },
      { label: '花期', value: '6-7月' }
    ],
    dimensions: [
      { spec: '50cm', height: '50-60cm', crown: '30-40cm', pot: '15cm', price: 28 },
      { spec: '80cm', height: '80-90cm', crown: '40-50cm', pot: '20cm', price: 45 },
      { spec: '100cm', height: '100-110cm', crown: '50-60cm', pot: '25cm', price: 68 },
      { spec: '120cm', height: '120-130cm', crown: '60-70cm', pot: '30cm', price: 98 }
    ],
    materialRatio: [
      { name: '北海道黄杨', ratio: 100, color: '#67c23a' }
    ],
    growingEnvironment: {
      temperature: { min: -25, max: 35, unit: '°C', desc: '耐寒性极强，可在北方地区露地越冬' },
      light: { requirement: '全日照/半阴', desc: '光照充足时叶色更鲜亮，半阴环境也能正常生长' },
      soil: { type: '疏松肥沃排水良好', ph: '6.5-7.5', desc: '适应性强，对土壤要求不严' },
      moisture: { requirement: '中等', desc: '耐旱性较强，忌积水，浇水见干见湿' },
      hardiness: { zone: '4-9区', desc: '适合我国大部分地区种植' }
    },
    scenes: ['市政道路绿化', '小区庭院绿篱', '公园景观造型', '厂区绿化隔离带'],
    createTime: '2024-01-15'
  },
  {
    id: 2,
    name: '金叶女贞 彩色绿篱植物',
    categoryId: 11,
    price: 15,
    originalPrice: 22,
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&h=800&fit=crop'
    ],
    sales: 3200,
    rating: 4.8,
    stock: 800,
    isColdResistant: true,
    isPreservative: false,
    supplier: '绿之源苗圃',
    supplierId: 1,
    description: '金叶女贞叶色金黄，色彩鲜艳，是园林绿化中常用的彩色绿篱植物，耐寒耐旱，易于养护。',
    specs: [
      { name: '高度', values: ['30cm', '40cm', '50cm', '60cm'] },
      { name: '数量', values: ['50株', '100株', '500株', '1000株'] }
    ],
    parameters: [
      { label: '植物类型', value: '落叶灌木' },
      { label: '耐寒温度', value: '-20°C' },
      { label: '生长周期', value: '多年生' },
      { label: '光照需求', value: '全日照' },
      { label: '土壤要求', value: '适应性强' },
      { label: '叶色', value: '金黄色' }
    ],
    dimensions: [
      { spec: '30cm', height: '30-35cm', crown: '20-25cm', pot: '12cm', price: 15 },
      { spec: '40cm', height: '40-45cm', crown: '25-30cm', pot: '15cm', price: 22 },
      { spec: '50cm', height: '50-55cm', crown: '30-35cm', pot: '18cm', price: 30 },
      { spec: '60cm', height: '60-65cm', crown: '35-40cm', pot: '20cm', price: 38 }
    ],
    materialRatio: [
      { name: '金叶女贞', ratio: 100, color: '#e6a23c' }
    ],
    growingEnvironment: {
      temperature: { min: -20, max: 38, unit: '°C', desc: '耐寒性好，也耐高温' },
      light: { requirement: '全日照', desc: '喜光，光照充足叶色更金黄，遮阴会变绿' },
      soil: { type: '适应性强', ph: '6.0-8.0', desc: '对土壤要求不严，耐瘠薄' },
      moisture: { requirement: '中等', desc: '耐旱，忌积水' },
      hardiness: { zone: '5-9区', desc: '适合我国华北、华东、华中地区' }
    },
    scenes: ['街道绿化色带', '广场图案造型', '小区彩化配置', '公园色块拼图'],
    createTime: '2024-01-20'
  },
  {
    id: 3,
    name: '防腐木花箱 户外实木花盆',
    categoryId: 31,
    price: 168,
    originalPrice: 228,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=800&fit=crop'
    ],
    sales: 1560,
    rating: 4.7,
    stock: 200,
    isColdResistant: false,
    isPreservative: true,
    supplier: '木艺坊园林',
    supplierId: 2,
    description: '精选进口俄罗斯樟子松，经过ACQ防腐处理，防霉防蛀，户外使用寿命可达10年以上。',
    specs: [
      { name: '尺寸', values: ['60*30*30cm', '80*40*40cm', '100*50*50cm', '120*60*60cm'] },
      { name: '颜色', values: ['原木色', '碳化色', '胡桃木色'] }
    ],
    parameters: [
      { label: '材质', value: '进口樟子松' },
      { label: '防腐处理', value: 'ACQ真空加压' },
      { label: '使用寿命', value: '8-12年' },
      { label: '重量', value: '12kg（80cm款）' },
      { label: '工艺', value: '榫卯结构' },
      { label: '适用场景', value: '户外/室内' }
    ],
    dimensions: [
      { spec: '60*30*30cm', length: 60, width: 30, height: 30, weight: '8kg', price: 168 },
      { spec: '80*40*40cm', length: 80, width: 40, height: 40, weight: '12kg', price: 228 },
      { spec: '100*50*50cm', length: 100, width: 50, height: 50, weight: '18kg', price: 318 },
      { spec: '120*60*60cm', length: 120, width: 60, height: 60, weight: '25kg', price: 428 }
    ],
    materialRatio: [
      { name: '进口樟子松', ratio: 85, color: '#d4a574' },
      { name: 'ACQ防腐剂', ratio: 5, color: '#67c23a' },
      { name: '不锈钢五金', ratio: 8, color: '#c0c4cc' },
      { name: '木器漆', ratio: 2, color: '#e6a23c' }
    ],
    growingEnvironment: {
      temperature: { min: -30, max: 60, unit: '°C', desc: '耐极端温度，户外四季可用' },
      light: { requirement: '全日照/半阴', desc: '木材经过防紫外线处理，不易褪色' },
      soil: { type: '任意', ph: '5.0-9.0', desc: '内置无纺布内衬，防止土壤直接接触木材' },
      moisture: { requirement: '防水防腐', desc: '底部预留排水孔，防止积水' },
      hardiness: { zone: '2-11区', desc: '适合全国各地区户外使用' }
    },
    scenes: ['阳台花园', '庭院露台', '商业街绿化', '市政工程'],
    createTime: '2024-02-01'
  },
  {
    id: 4,
    name: '北欧风园艺剪刀 修枝剪',
    categoryId: 21,
    price: 45,
    originalPrice: 68,
    image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=800&h=800&fit=crop'
    ],
    sales: 4200,
    rating: 4.9,
    stock: 1000,
    isColdResistant: false,
    isPreservative: false,
    supplier: '精工工具',
    supplierId: 3,
    description: '日本进口SK5钢刀片，特氟龙涂层不粘胶，人体工学手柄设计，长时间使用不累手。',
    specs: [
      { name: '类型', values: ['直头剪', '弯头剪'] },
      { name: '尺寸', values: ['8寸', '10寸'] }
    ],
    parameters: [
      { label: '刀片材质', value: 'SK5高碳钢' },
      { label: '手柄材质', value: 'TPR软胶' },
      { label: '剪切直径', value: '最大20mm' },
      { label: '全长', value: '200mm' },
      { label: '重量', value: '180g' },
      { label: '表面处理', value: '特氟龙不粘涂层' }
    ],
    scenes: ['家庭园艺', '果树修剪', '花卉整形', '盆景造型'],
    createTime: '2024-02-10'
  },
  {
    id: 5,
    name: '缓释有机复合肥 通用型',
    categoryId: 41,
    price: 58,
    originalPrice: 78,
    image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=800&h=800&fit=crop'
    ],
    sales: 5600,
    rating: 4.8,
    stock: 2000,
    isColdResistant: false,
    isPreservative: false,
    supplier: '绿源肥业',
    supplierId: 4,
    description: '精选天然有机质，添加多种微量元素，肥效持续3个月，适用于各类花卉绿植。',
    specs: [
      { name: '规格', values: ['1kg装', '2.5kg装', '5kg装', '10kg装'] }
    ],
    parameters: [
      { label: '氮磷钾', value: '14-14-14' },
      { label: '有机质', value: '≥45%' },
      { label: '有效期', value: '3个月' },
      { label: '适用植物', value: '通用型' },
      { label: '形态', value: '颗粒' },
      { label: '特点', value: '缓释/环保' }
    ],
    dimensions: [
      { spec: '1kg装', weight: '1kg', coverage: '约5-8㎡', price: 58 },
      { spec: '2.5kg装', weight: '2.5kg', coverage: '约15-20㎡', price: 128 },
      { spec: '5kg装', weight: '5kg', coverage: '约30-40㎡', price: 228 },
      { spec: '10kg装', weight: '10kg', coverage: '约60-80㎡', price: 398 }
    ],
    materialRatio: [
      { name: '有机质', ratio: 45, color: '#8b7355' },
      { name: '氮元素', ratio: 14, color: '#409eff' },
      { name: '磷元素', ratio: 14, color: '#e6a23c' },
      { name: '钾元素', ratio: 14, color: '#67c23a' },
      { name: '微量元素', ratio: 8, color: '#f56c6c' },
      { name: '缓释载体', ratio: 5, color: '#909399' }
    ],
    growingEnvironment: {
      temperature: { min: -10, max: 40, unit: '°C', desc: '肥效受温度影响，20-30°C时释放最佳' },
      light: { requirement: '任意', desc: '不受光照影响，适合各种环境' },
      soil: { type: '通用', ph: '5.5-8.0', desc: '适合各类土壤，可改良土壤结构' },
      moisture: { requirement: '适量', desc: '浇水后肥效开始释放，保持土壤微湿' },
      hardiness: { zone: '3-10区', desc: '全国各地区均可使用' }
    },
    scenes: ['家庭盆栽', '园林景观', '农业生产', '大棚种植'],
    createTime: '2024-02-15'
  },
  {
    id: 6,
    name: '太阳能庭院灯 景观灯',
    categoryId: 33,
    price: 128,
    originalPrice: 188,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop'
    ],
    sales: 2100,
    rating: 4.6,
    stock: 300,
    isColdResistant: false,
    isPreservative: true,
    supplier: '阳光照明',
    supplierId: 5,
    description: '高效太阳能板，智能光控，天黑自动亮，IP65防水，适合户外庭院使用。',
    specs: [
      { name: '类型', values: ['地插灯', '壁灯', '吊灯', '草坪灯'] },
      { name: '色温', values: ['暖黄光', '正白光', '彩色变换'] }
    ],
    parameters: [
      { label: '太阳能板', value: '多晶硅' },
      { label: '电池', value: '锂电池1200mAh' },
      { label: 'LED灯珠', value: '24颗' },
      { label: '照明时长', value: '8-12小时' },
      { label: '防水等级', value: 'IP65' },
      { label: '材质', value: 'ABS+不锈钢' }
    ],
    scenes: ['花园庭院', '公园步道', '广场景观', '小区亮化'],
    createTime: '2024-02-20'
  },
  {
    id: 7,
    name: '进口草坪种子 四季青混播',
    categoryId: 61,
    price: 88,
    originalPrice: 120,
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&h=800&fit=crop'
    ],
    sales: 3800,
    rating: 4.7,
    stock: 1500,
    isColdResistant: true,
    isPreservative: false,
    supplier: '绿源种业',
    supplierId: 6,
    description: '美国进口优质草种混合配方，四季常青，耐寒耐旱，耐践踏，成坪速度快。',
    specs: [
      { name: '规格', values: ['1kg装', '5kg装', '10kg装', '25kg装'] }
    ],
    parameters: [
      { label: '品种组合', value: '早熟禾+黑麦草+高羊茅' },
      { label: '发芽率', value: '≥90%' },
      { label: '播种量', value: '30-40g/㎡' },
      { label: '成坪时间', value: '45-60天' },
      { label: '耐寒温度', value: '-30°C' },
      { label: '耐践踏', value: '强' }
    ],
    scenes: ['别墅庭院', '足球场', '高尔夫球场', '公共绿地'],
    createTime: '2024-03-01'
  },
  {
    id: 8,
    name: '假山流水喷泉 庭院造景',
    categoryId: 71,
    price: 2888,
    originalPrice: 3888,
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=800&fit=crop'
    ],
    sales: 180,
    rating: 4.9,
    stock: 50,
    isColdResistant: false,
    isPreservative: true,
    supplier: '山水造景',
    supplierId: 7,
    description: '纯天然青石打造，手工雕刻，配带雾化器和循环水泵，营造山水意境。',
    specs: [
      { name: '尺寸', values: ['80*60*120cm', '120*80*160cm', '150*100*200cm'] },
      { name: '风格', values: ['中式古典', '现代简约', '日式禅意'] }
    ],
    parameters: [
      { label: '材质', value: '天然青石' },
      { label: '水泵', value: '静音循环泵' },
      { label: '雾化器', value: '超声波雾化' },
      { label: '重量', value: '80kg起' },
      { label: '工艺', value: '手工雕刻' },
      { label: '电压', value: '220V' }
    ],
    scenes: ['别墅庭院', '酒店大堂', '会所景观', '公司前台'],
    createTime: '2024-03-10'
  },
  {
    id: 9,
    name: '自动滴灌系统 智能浇水',
    categoryId: 34,
    price: 268,
    originalPrice: 368,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop'
    ],
    sales: 890,
    rating: 4.8,
    stock: 400,
    isColdResistant: false,
    isPreservative: false,
    supplier: '智慧园艺',
    supplierId: 8,
    description: '智能定时控制，自动浇水，省水省力，适合盆栽和小型花园使用。',
    specs: [
      { name: '滴头数量', values: ['10头套装', '20头套装', '30头套装', '50头套装'] }
    ],
    parameters: [
      { label: '控制器', value: '智能定时' },
      { label: '水管长度', value: '10m起' },
      { label: '滴头间距', value: '可调节' },
      { label: '出水量', value: '2L/小时' },
      { label: '电源', value: '电池/太阳能' },
      { label: '材质', value: 'PP环保材料' }
    ],
    scenes: ['阳台盆栽', '屋顶花园', '温室大棚', '家庭菜园'],
    createTime: '2024-03-15'
  },
  {
    id: 10,
    name: '藤本月季 大花浓香爬藤植物',
    categoryId: 12,
    price: 68,
    originalPrice: 98,
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=800&fit=crop'
    ],
    sales: 4500,
    rating: 4.9,
    stock: 600,
    isColdResistant: true,
    isPreservative: false,
    supplier: '香薇月季园',
    supplierId: 9,
    description: '精选大花品种，花色丰富，香气浓郁，花期长，是打造花墙花拱门的最佳选择。',
    specs: [
      { name: '颜色', values: ['红色', '粉色', '黄色', '白色', '复色'] },
      { name: '苗龄', values: ['1年苗', '2年苗', '3年大苗'] }
    ],
    parameters: [
      { label: '植物类型', value: '藤本花卉' },
      { label: '耐寒温度', value: '-15°C' },
      { label: '花期', value: '5-11月' },
      { label: '花香', value: '浓香' },
      { label: '成熟高度', value: '3-5m' },
      { label: '光照需求', value: '全日照' }
    ],
    scenes: ['花墙打造', '拱门造型', '围栏美化', '庭院装饰'],
    createTime: '2024-03-20'
  }
]

export const packages = [
  {
    id: 1,
    name: '小型庭院绿化套餐',
    price: 2999,
    originalPrice: 3999,
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=400&fit=crop',
    area: '50-80㎡',
    description: '适合小型私家庭院，包含乔木、灌木、地被植物的完整绿化方案，打造四季有景的私人花园。',
    includes: [
      { name: '骨干乔木', value: '2株（红叶李/樱花）' },
      { name: '花灌木', value: '8株（月季/绣球/连翘）' },
      { name: '地被植物', value: '20㎡（麦冬/常春藤）' },
      { name: '草坪', value: '30㎡（四季青）' },
      { name: '施工指导', value: '含图纸和视频指导' }
    ],
    scenes: ['别墅小庭院', '一楼花园', '露台花园'],
    sales: 128
  },
  {
    id: 2,
    name: '中型园林绿化套餐',
    price: 8888,
    originalPrice: 11888,
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&h=400&fit=crop',
    area: '100-200㎡',
    description: '专业园林绿化设计方案，适用于厂区、学校、小区等中型绿地，包含完整的植物配置和景观设计。',
    includes: [
      { name: '大乔木', value: '5株（法桐/国槐/白蜡）' },
      { name: '小乔木', value: '10株（红叶李/碧桃/紫薇）' },
      { name: '花灌木', value: '30株（金银木/锦带/丁香）' },
      { name: '绿篱', value: '50m（金叶女贞/大叶黄杨）' },
      { name: '地被花卉', value: '50㎡（宿根花卉组合）' },
      { name: '草坪', value: '100㎡（早熟禾混播）' },
      { name: '设计服务', value: '专业设计师一对一服务' }
    ],
    scenes: ['厂区绿化', '校园景观', '小区公共绿地', '市政小游园'],
    sales: 86
  },
  {
    id: 3,
    name: '大型工程绿化套餐',
    price: 28888,
    originalPrice: 36888,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    area: '500-1000㎡',
    description: '针对大型园林工程项目的一体化解决方案，提供从设计到施工的全程服务，品质保障。',
    includes: [
      { name: '特选大乔木', value: '15株（胸径10-15cm）' },
      { name: '中小乔木', value: '50株（各类观花观叶树种）' },
      { name: '造型球类', value: '30个（大叶黄杨球/金叶女贞球）' },
      { name: '绿篱色块', value: '200m（多种彩叶植物组合）' },
      { name: '地被花卉', value: '200㎡（花境设计）' },
      { name: '草坪', value: '500㎡' },
      { name: '园林养护', value: '免费养护1年' },
      { name: '施工服务', value: '专业施工团队上门' }
    ],
    scenes: ['市政道路', '大型公园', '商业广场', '房地产项目'],
    sales: 35
  },
  {
    id: 4,
    name: '耐寒植物专项套餐',
    price: 1688,
    originalPrice: 2188,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=400&fit=crop',
    area: '30-50㎡',
    description: '专为北方寒冷地区设计的植物套餐，所有品种均能在-25°C以下安全越冬，冬季也能欣赏绿色。',
    includes: [
      { name: '常绿乔木', value: '2株（油松/云杉）' },
      { name: '耐寒灌木', value: '10株（北海道黄杨/金叶榆）' },
      { name: '宿根花卉', value: '20株（八宝景天/虞美人）' },
      { name: '冷季草坪', value: '30㎡' }
    ],
    scenes: ['北方庭院', '东北内蒙绿化', '高寒地区项目'],
    sales: 96
  }
]

export const mockUsers = [
  {
    id: 1,
    username: 'buyer123',
    password: '123456',
    role: 'buyer',
    name: '张三',
    phone: '13800138001',
    email: 'buyer@example.com',
    avatar: '',
    company: 'XX园林工程有限公司',
    address: '北京市朝阳区XX路XX号',
    createTime: '2023-01-01'
  },
  {
    id: 2,
    username: 'supplier123',
    password: '123456',
    role: 'supplier',
    name: '李四',
    phone: '13900139001',
    email: 'supplier@example.com',
    avatar: '',
    company: '绿之源苗圃',
    address: '江苏省宿迁市XX区XX路XX号',
    license: 'XXXXXXXXXXXX',
    createTime: '2023-01-01'
  }
]

export const mockOrders = [
  {
    id: 'ORD202403010001',
    createTime: '2024-03-01 10:30:00',
    status: 'pending',
    statusText: '待付款',
    totalAmount: 328,
    items: [
      {
        productId: 1,
        productName: '北海道黄杨 耐寒常绿灌木',
        image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=100&h=100&fit=crop',
        spec: '高度80cm / 10株',
        price: 28,
        quantity: 10,
        subtotal: 280
      },
      {
        productId: 4,
        productName: '北欧风园艺剪刀 修枝剪',
        image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=100&h=100&fit=crop',
        spec: '弯头剪 / 8寸',
        price: 48,
        quantity: 1,
        subtotal: 48
      }
    ],
    address: {
      name: '张三',
      phone: '13800138001',
      address: '北京市朝阳区XX小区XX号楼XX单元XX室'
    },
    tracking: null
  },
  {
    id: 'ORD202402250002',
    createTime: '2024-02-25 14:20:00',
    status: 'shipped',
    statusText: '已发货',
    totalAmount: 1888,
    items: [
      {
        productId: 3,
        productName: '防腐木花箱 户外实木花盆',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&h=100&fit=crop',
        spec: '80*40*40cm / 碳化色',
        price: 188,
        quantity: 10,
        subtotal: 1888
      }
    ],
    address: {
      name: '张三',
      phone: '13800138001',
      address: '北京市朝阳区XX小区XX号楼XX单元XX室'
    },
    tracking: {
      company: '顺丰速运',
      number: 'SF1234567890123'
    }
  },
  {
    id: 'ORD202402150003',
    createTime: '2024-02-15 09:15:00',
    status: 'completed',
    statusText: '已完成',
    totalAmount: 2999,
    items: [
      {
        productId: 1,
        productName: '小型庭院绿化套餐',
        image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=100&h=100&fit=crop',
        spec: '50-80㎡',
        price: 2999,
        quantity: 1,
        subtotal: 2999
      }
    ],
    address: {
      name: '张三',
      phone: '13800138001',
      address: '北京市朝阳区XX小区XX号楼XX单元XX室'
    },
    tracking: {
      company: '专线物流',
      number: 'WL202402150001'
    }
  }
]

export const mockFavorites = products.slice(0, 5).map((p, index) => ({
  id: p.id,
  productId: p.id,
  name: p.name,
  image: p.image,
  price: p.price,
  groupId: index < 2 ? 1 : (index < 4 ? 2 : 3),
  createTime: '2024-02-' + (10 + Math.floor(Math.random() * 15))
}))

export const mockFavoriteGroups = [
  { id: 1, name: '常用绿植', count: 2, color: '#67c23a' },
  { id: 2, name: '园艺工具', count: 2, color: '#409eff' },
  { id: 3, name: '待采购', count: 1, color: '#e6a23c' }
]
