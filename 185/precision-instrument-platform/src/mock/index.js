export const categories = [
  { id: 1, name: '光学配件', icon: 'Sunny', count: 128 },
  { id: 2, name: '电子元件', icon: 'Cpu', count: 256 },
  { id: 3, name: '机械零件', icon: 'Setting', count: 189 },
  { id: 4, name: '传感器', icon: 'Monitor', count: 96 },
  { id: 5, name: '密封件', icon: 'CircleCheck', count: 72 },
  { id: 6, name: '紧固件', icon: 'Link', count: 144 },
  { id: 7, name: '弹簧配件', icon: 'MagicStick', count: 68 },
  { id: 8, name: '轴承', icon: 'RefreshRight', count: 112 }
]

export const products = [
  {
    id: 1,
    name: '高精度光学透镜',
    category: '光学配件',
    categoryId: 1,
    price: 1280,
    originalPrice: 1580,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=precision%20optical%20lens%20product%20photo&image_size=square_hd',
    description: '进口石英材质，适用于高精度光学仪器',
    precision: '±0.001mm',
    material: '石英玻璃',
    specification: '直径25mm，焦距50mm',
    stock: 156,
    sales: 892,
    rating: 4.9,
    parameters: [
      { label: '表面精度', value: 'λ/10' },
      { label: '透射率', value: '>99.5%' },
      { label: '材质', value: 'JGS1石英' },
      { label: '口径公差', value: '+0.0/-0.1mm' },
      { label: '中心厚度', value: '5.0±0.1mm' },
      { label: '镀膜', value: 'AR@400-700nm' }
    ]
  },
  {
    id: 2,
    name: '精密陶瓷轴承',
    category: '轴承',
    categoryId: 8,
    price: 860,
    originalPrice: 980,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=precision%20ceramic%20bearing%20product%20photo&image_size=square_hd',
    description: '氮化硅陶瓷材质，高速低噪音运行',
    precision: 'P4级精度',
    material: '氮化硅陶瓷',
    specification: '内径20mm，外径42mm',
    stock: 320,
    sales: 1560,
    rating: 4.8,
    parameters: [
      { label: '精度等级', value: 'P4' },
      { label: '转速', value: '30000rpm' },
      { label: '材质', value: 'Si3N4陶瓷' },
      { label: '密封型式', value: '2RS' },
      { label: '游隙', value: 'C3' },
      { label: '额定动载荷', value: '12.5kN' }
    ]
  },
  {
    id: 3,
    name: '高精度压力传感器',
    category: '传感器',
    categoryId: 4,
    price: 2450,
    originalPrice: 2800,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=precision%20pressure%20sensor%20product%20photo&image_size=square_hd',
    description: '扩散硅芯体，不锈钢外壳，工业级精度',
    precision: '±0.1%FS',
    material: '316L不锈钢',
    specification: '0-10MPa，4-20mA输出',
    stock: 88,
    sales: 456,
    rating: 4.9,
    parameters: [
      { label: '测量范围', value: '0-10MPa' },
      { label: '精度', value: '±0.1%FS' },
      { label: '输出信号', value: '4-20mA' },
      { label: '供电电压', value: '12-36VDC' },
      { label: '工作温度', value: '-40~125°C' },
      { label: '防护等级', value: 'IP67' }
    ]
  },
  {
    id: 4,
    name: '微型滚珠丝杠',
    category: '机械零件',
    categoryId: 3,
    price: 1680,
    originalPrice: 1980,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=miniature%20ball%20screw%20product%20photo&image_size=square_hd',
    description: 'C5级精度，适用于精密定位平台',
    precision: '±0.003mm/300mm',
    material: '轴承钢GCr15',
    specification: '直径12mm，导程5mm',
    stock: 210,
    sales: 720,
    rating: 4.7,
    parameters: [
      { label: '精度等级', value: 'C5' },
      { label: '轴径', value: '12mm' },
      { label: '导程', value: '5mm' },
      { label: '轴向间隙', value: '<0.005mm' },
      { label: '预压方式', value: '双螺母预压' },
      { label: '表面处理', value: '发黑' }
    ]
  },
  {
    id: 5,
    name: 'FFC扁平柔性电缆',
    category: '电子元件',
    categoryId: 2,
    price: 28,
    originalPrice: 35,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=FFC%20flexible%20flat%20cable%20product%20photo&image_size=square_hd',
    description: '0.5mm间距，适用于精密电子设备内部连接',
    precision: '±0.02mm',
    material: '镀锡铜导体/PET绝缘',
    specification: '24Pin，长度150mm',
    stock: 5000,
    sales: 8900,
    rating: 4.6,
    parameters: [
      { label: '间距', value: '0.5mm' },
      { label: 'PIN数', value: '24P' },
      { label: '厚度', value: '0.3mm' },
      { label: '导体', value: '镀锡铜' },
      { label: '额定电流', value: '0.5A/PIN' },
      { label: '工作温度', value: '-20~85°C' }
    ]
  },
  {
    id: 6,
    name: '耐高压密封圈',
    category: '密封件',
    categoryId: 5,
    price: 45,
    originalPrice: 55,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=high%20pressure%20resistant%20seal%20ring%20product%20photo&image_size=square_hd',
    description: '聚氨酯材质，耐高压耐磨',
    precision: '±0.1mm',
    material: '聚氨酯PU',
    specification: '内径50mm，线径5mm',
    stock: 1200,
    sales: 3200,
    rating: 4.8,
    parameters: [
      { label: '内径', value: '50mm' },
      { label: '线径', value: '5mm' },
      { label: '材质', value: 'PU聚氨酯' },
      { label: '硬度', value: '90±5 Shore A' },
      { label: '工作压力', value: '≤40MPa' },
      { label: '工作温度', value: '-30~110°C' }
    ]
  },
  {
    id: 7,
    name: '钛合金精密螺钉',
    category: '紧固件',
    categoryId: 6,
    price: 18,
    originalPrice: 22,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=titanium%20alloy%20precision%20screw%20product%20photo&image_size=square_hd',
    description: 'TC4钛合金，重量轻强度高',
    precision: '6g级',
    material: 'TC4钛合金',
    specification: 'M3×12mm，内六角圆柱头',
    stock: 8000,
    sales: 12000,
    rating: 4.9,
    parameters: [
      { label: '规格', value: 'M3×12mm' },
      { label: '头型', value: '内六角圆柱头' },
      { label: '材质', value: 'TC4钛合金' },
      { label: '强度等级', value: '12.9级' },
      { label: '公差', value: '6g' },
      { label: '表面处理', value: '本色' }
    ]
  },
  {
    id: 8,
    name: '精密恒力弹簧',
    category: '弹簧配件',
    categoryId: 7,
    price: 125,
    originalPrice: 150,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=precision%20constant%20force%20spring%20product%20photo&image_size=square_hd',
    description: '不锈钢材质，输出力恒定',
    precision: '±5%',
    material: '301不锈钢',
    specification: '输出力20N，行程100mm',
    stock: 450,
    sales: 1800,
    rating: 4.7,
    parameters: [
      { label: '输出力', value: '20N' },
      { label: '行程', value: '100mm' },
      { label: '使用寿命', value: '>50000次' },
      { label: '材质', value: 'SUS301' },
      { label: '厚度', value: '0.15mm' },
      { label: '宽度', value: '10mm' }
    ]
  }
]

export const users = [
  {
    id: 1,
    username: 'buyer001',
    password: '123456',
    name: '张采购',
    role: 'buyer',
    phone: '13800138001',
    email: 'buyer@company.com',
    company: '深圳市精密科技有限公司'
  },
  {
    id: 2,
    username: 'seller001',
    password: '123456',
    name: '李商家',
    role: 'seller',
    phone: '13800138002',
    email: 'seller@company.com',
    company: '东莞市精密配件制造厂'
  }
]

export const orders = [
  {
    id: 'PO202401150001',
    productId: 1,
    productName: '高精度光学透镜',
    productImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=precision%20optical%20lens%20product%20photo&image_size=square_hd',
    quantity: 10,
    price: 1280,
    totalPrice: 12800,
    status: 'completed',
    createTime: '2024-01-15 10:30:00',
    buyer: '张采购'
  },
  {
    id: 'PO202401200002',
    productId: 3,
    productName: '高精度压力传感器',
    productImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=precision%20pressure%20sensor%20product%20photo&image_size=square_hd',
    quantity: 5,
    price: 2450,
    totalPrice: 12250,
    status: 'shipped',
    createTime: '2024-01-20 14:20:00',
    buyer: '张采购'
  },
  {
    id: 'PO202402010003',
    productId: 2,
    productName: '精密陶瓷轴承',
    productImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=precision%20ceramic%20bearing%20product%20photo&image_size=square_hd',
    quantity: 20,
    price: 860,
    totalPrice: 17200,
    status: 'pending',
    createTime: '2024-02-01 09:15:00',
    buyer: '张采购'
  },
  {
    id: 'PO202402100004',
    productId: 5,
    productName: 'FFC扁平柔性电缆',
    productImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=FFC%20flexible%20flat%20cable%20product%20photo&image_size=square_hd',
    quantity: 100,
    price: 28,
    totalPrice: 2800,
    status: 'completed',
    createTime: '2024-02-10 16:45:00',
    buyer: '张采购'
  }
]

export const favorites = [1, 3, 5, 7]

export const banners = [
  {
    id: 1,
    title: '2024春季新品上市',
    subtitle: '百款精密配件，品质保障',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=industrial%20precision%20instruments%20banner%20blue%20technology&image_size=landscape_16_9',
    link: '/category'
  },
  {
    id: 2,
    title: '企业采购专享优惠',
    subtitle: '注册即享9折，批量采购更优惠',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=precision%20mechanical%20parts%20manufacturing%20banner&image_size=landscape_16_9',
    link: '/register'
  },
  {
    id: 3,
    title: '品质承诺 假一赔十',
    subtitle: '原厂正品，30天无忧退换',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quality%20assurance%20precision%20components%20banner&image_size=landscape_16_9',
    link: '/about'
  }
]
