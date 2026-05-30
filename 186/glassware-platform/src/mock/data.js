export const categories = [
  { id: 1, name: '烧杯', icon: 'Cup', count: 128 },
  { id: 2, name: '烧瓶', icon: 'Dish', count: 86 },
  { id: 3, name: '试管', icon: 'Document', count: 256 },
  { id: 4, name: '量筒', icon: 'DataAnalysis', count: 72 },
  { id: 5, name: '移液管', icon: 'Pointer', count: 94 },
  { id: 6, name: '滴定管', icon: 'Rank', count: 58 },
  { id: 7, name: '冷凝管', icon: 'Connection', count: 45 },
  { id: 8, name: '分液漏斗', icon: 'Filter', count: 63 }
]

export const products = [
  {
    id: 1,
    name: '高硼硅玻璃烧杯',
    categoryId: 1,
    price: 28.5,
    originalPrice: 35,
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01k3t7hs1z8QWQ7n8Xh_!!6000000006695-2-tps-600-600.png',
    images: [
      'https://img.alicdn.com/imgextra/i4/O1CN01k3t7hs1z8QWQ7n8Xh_!!6000000006695-2-tps-600-600.png',
      'https://img.alicdn.com/imgextra/i2/O1CN01Z8kq2b1y7wX7y7wX7y_!!6000000003288-2-tps-600-600.png'
    ],
    specs: ['50ml', '100ml', '250ml', '500ml', '1000ml'],
    material: '高硼硅3.3玻璃',
    temperature: '-20℃ ~ 500℃',
    resistance: '耐强酸、强碱',
    scenes: ['常规加热实验', '溶液配制', '样品储存'],
    description: '采用高硼硅3.3玻璃材质，具有优异的热稳定性和化学稳定性，可直接加热，刻度清晰准确。',
    sales: 2568,
    rating: 4.9,
    stock: 500,
    isHighTemp: true,
    isCorrosionResistant: true,
    supplier: '江苏华鸥玻璃有限公司'
  },
  {
    id: 2,
    name: '圆底蒸馏烧瓶',
    categoryId: 2,
    price: 45.0,
    originalPrice: 58,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01J8xXyZ1X7Z7Z7Z7Z7_!!6000000002420-2-tps-600-600.png',
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01J8xXyZ1X7Z7Z7Z7Z7_!!6000000002420-2-tps-600-600.png'
    ],
    specs: ['100ml', '250ml', '500ml', '1000ml', '2000ml'],
    material: '高硼硅3.3玻璃',
    temperature: '-20℃ ~ 450℃',
    resistance: '耐酸、耐有机溶剂',
    scenes: ['蒸馏实验', '回流反应', '溶剂回收'],
    description: '耐高温圆底设计，受热均匀，适合各种蒸馏和回流操作，壁厚均匀，机械强度高。',
    sales: 1892,
    rating: 4.8,
    stock: 320,
    isHighTemp: true,
    isCorrosionResistant: false,
    supplier: '蜀玻集团'
  },
  {
    id: 3,
    name: '具塞刻度试管',
    categoryId: 3,
    price: 8.5,
    originalPrice: 12,
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01K7yY4v1V7V7V7V7V7_!!6000000002648-2-tps-600-600.png',
    images: [
      'https://img.alicdn.com/imgextra/i3/O1CN01K7yY4v1V7V7V7V7V7_!!6000000002648-2-tps-600-600.png'
    ],
    specs: ['10ml', '15ml', '25ml', '50ml'],
    material: '钠钙玻璃',
    temperature: '0℃ ~ 120℃',
    resistance: '一般耐腐蚀性',
    scenes: ['样品盛放', '反应实验', '离心分离'],
    description: '带刻度具塞设计，密封性好，刻度清晰，适用于各种定性定量分析实验。',
    sales: 5682,
    rating: 4.7,
    stock: 1200,
    isHighTemp: false,
    isCorrosionResistant: false,
    supplier: '北京玻璃集团'
  },
  {
    id: 4,
    name: 'A级量筒',
    categoryId: 4,
    price: 32.0,
    originalPrice: 42,
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01L8zZ5X1Y7Y7Y7Y7Y7_!!6000000003021-2-tps-600-600.png',
    images: [
      'https://img.alicdn.com/imgextra/i2/O1CN01L8zZ5X1Y7Y7Y7Y7Y7_!!6000000003021-2-tps-600-600.png'
    ],
    specs: ['10ml', '25ml', '50ml', '100ml', '250ml', '500ml', '1000ml'],
    material: '高硼硅玻璃',
    temperature: '-20℃ ~ 200℃',
    resistance: '耐酸、耐碱',
    scenes: ['液体量取', '溶液稀释', '体积测量'],
    description: 'A级精度，刻度清晰准确，误差小于±0.5%，适用于精确量取液体。',
    sales: 3256,
    rating: 4.9,
    stock: 800,
    isHighTemp: false,
    isCorrosionResistant: true,
    supplier: '江苏华鸥玻璃有限公司'
  },
  {
    id: 5,
    name: '酸式滴定管',
    categoryId: 6,
    price: 68.0,
    originalPrice: 85,
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01M9aA6b1Z7Z7Z7Z7Z7_!!6000000003175-2-tps-600-600.png',
    images: [
      'https://img.alicdn.com/imgextra/i4/O1CN01M9aA6b1Z7Z7Z7Z7Z7_!!6000000003175-2-tps-600-600.png'
    ],
    specs: ['10ml', '25ml', '50ml'],
    material: '高硼硅玻璃',
    temperature: '0℃ ~ 60℃',
    resistance: '耐强酸',
    scenes: ['酸碱滴定', '容量分析', '定量实验'],
    description: 'A级精度酸式滴定管，玻璃活塞，密封性好，操作流畅，刻度精细。',
    sales: 1568,
    rating: 4.8,
    stock: 280,
    isHighTemp: false,
    isCorrosionResistant: true,
    supplier: '上海精密仪器厂'
  },
  {
    id: 6,
    name: '蛇形冷凝管',
    categoryId: 7,
    price: 58.0,
    originalPrice: 72,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01N7bB7c1W7W7W7W7W7_!!6000000002789-2-tps-600-600.png',
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01N7bB7c1W7W7W7W7W7_!!6000000002789-2-tps-600-600.png'
    ],
    specs: ['200mm', '300mm', '400mm', '500mm'],
    material: '高硼硅玻璃',
    temperature: '-20℃ ~ 200℃',
    resistance: '耐有机溶剂',
    scenes: ['蒸馏冷凝', '回流装置', '溶剂回收'],
    description: '蛇形设计增加冷却面积，冷凝效率高，标准磨口连接，密封性好。',
    sales: 2134,
    rating: 4.7,
    stock: 420,
    isHighTemp: true,
    isCorrosionResistant: false,
    supplier: '蜀玻集团'
  },
  {
    id: 7,
    name: '聚四氟活塞分液漏斗',
    categoryId: 8,
    price: 89.0,
    originalPrice: 118,
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01P8cC8d1U7U7U7U7U7_!!6000000002568-2-tps-600-600.png',
    images: [
      'https://img.alicdn.com/imgextra/i3/O1CN01P8cC8d1U7U7U7U7U7_!!6000000002568-2-tps-600-600.png'
    ],
    specs: ['60ml', '125ml', '250ml', '500ml', '1000ml'],
    material: '高硼硅玻璃+PTFE',
    temperature: '-20℃ ~ 180℃',
    resistance: '耐强酸强碱',
    scenes: ['液液萃取', '分离提纯', '反应加料'],
    description: '采用聚四氟乙烯活塞，耐强酸碱腐蚀，无需涂凡士林，操作方便。',
    sales: 1876,
    rating: 4.9,
    stock: 350,
    isHighTemp: false,
    isCorrosionResistant: true,
    supplier: '江苏华鸥玻璃有限公司'
  },
  {
    id: 8,
    name: '刻度移液管',
    categoryId: 5,
    price: 15.0,
    originalPrice: 20,
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01Q9dD9e1S7S7S7S7S7_!!6000000002895-2-tps-600-600.png',
    images: [
      'https://img.alicdn.com/imgextra/i2/O1CN01Q9dD9e1S7S7S7S7S7_!!6000000002895-2-tps-600-600.png'
    ],
    specs: ['1ml', '2ml', '5ml', '10ml', '25ml'],
    material: '高硼硅玻璃',
    temperature: '0℃ ~ 100℃',
    resistance: '一般耐腐蚀性',
    scenes: ['精确移液', '样品转移', '试剂添加'],
    description: 'A级精度刻度移液管，刻度清晰，误差小，适用于精确移取液体。',
    sales: 4235,
    rating: 4.8,
    stock: 950,
    isHighTemp: false,
    isCorrosionResistant: false,
    supplier: '上海精密仪器厂'
  },
  {
    id: 9,
    name: '耐高温石英烧杯',
    categoryId: 1,
    price: 128.0,
    originalPrice: 168,
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01R7eE0f1T7T7T7T7T7_!!6000000003210-2-tps-600-600.png',
    images: [
      'https://img.alicdn.com/imgextra/i4/O1CN01R7eE0f1T7T7T7T7T7_!!6000000003210-2-tps-600-600.png'
    ],
    specs: ['50ml', '100ml', '250ml', '500ml'],
    material: '高纯石英玻璃',
    temperature: '-200℃ ~ 1100℃',
    resistance: '耐强酸',
    scenes: ['高温加热', '熔融实验', '强酸处理'],
    description: '采用高纯石英玻璃，可承受1100℃高温，热稳定性极佳，适合高温实验。',
    sales: 892,
    rating: 5.0,
    stock: 150,
    isHighTemp: true,
    isCorrosionResistant: true,
    supplier: '东海石英制品厂'
  },
  {
    id: 10,
    name: '耐强腐蚀四氟烧杯',
    categoryId: 1,
    price: 156.0,
    originalPrice: 198,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01S8fF1g1V7V7V7V7V7_!!6000000003056-2-tps-600-600.png',
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01S8fF1g1V7V7V7V7V7_!!6000000003056-2-tps-600-600.png'
    ],
    specs: ['50ml', '100ml', '250ml', '500ml', '1000ml'],
    material: '聚四氟乙烯(PTFE)',
    temperature: '-200℃ ~ 250℃',
    resistance: '耐所有强酸强碱',
    scenes: ['强酸实验', '强碱反应', '氢氟酸处理'],
    description: '聚四氟乙烯材质，可耐王水、氢氟酸等强腐蚀性试剂，化学稳定性极佳。',
    sales: 678,
    rating: 4.9,
    stock: 180,
    isHighTemp: false,
    isCorrosionResistant: true,
    supplier: '泰州四氟制品厂'
  }
]

export const packages = [
  {
    id: 1,
    name: '基础实验套装',
    description: '适合初高中化学实验教学，包含常用基础器皿',
    price: 299,
    originalPrice: 388,
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01T9gG2h1W7W7W7W7W7_!!6000000003312-2-tps-600-600.png',
    items: [
      { productId: 1, spec: '100ml', quantity: 5 },
      { productId: 3, spec: '15ml', quantity: 10 },
      { productId: 4, spec: '100ml', quantity: 2 },
      { productId: 8, spec: '5ml', quantity: 3 }
    ],
    totalItems: 20,
    sales: 1256
  },
  {
    id: 2,
    name: '有机合成套装',
    description: '适合有机化学合成实验，包含蒸馏回流装置',
    price: 899,
    originalPrice: 1180,
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01U7hH3i1X7X7X7X7X7_!!6000000003425-2-tps-600-600.png',
    items: [
      { productId: 2, spec: '500ml', quantity: 2 },
      { productId: 6, spec: '400mm', quantity: 2 },
      { productId: 1, spec: '250ml', quantity: 3 },
      { productId: 7, spec: '250ml', quantity: 2 }
    ],
    totalItems: 9,
    sales: 568
  },
  {
    id: 3,
    name: '分析滴定套装',
    description: '适合容量分析实验，包含滴定管、移液管等',
    price: 568,
    originalPrice: 720,
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01V8iI4j1Y7Y7Y7Y7Y7_!!6000000003568-2-tps-600-600.png',
    items: [
      { productId: 5, spec: '50ml', quantity: 2 },
      { productId: 8, spec: '10ml', quantity: 5 },
      { productId: 4, spec: '250ml', quantity: 2 },
      { productId: 3, spec: '25ml', quantity: 10 }
    ],
    totalItems: 19,
    sales: 786
  },
  {
    id: 4,
    name: '科研级耐高温套装',
    description: '适合高校科研实验室，耐高温高纯度石英材质',
    price: 1999,
    originalPrice: 2580,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01W9jJ5k1Z7Z7Z7Z7Z7_!!6000000003712-2-tps-600-600.png',
    items: [
      { productId: 9, spec: '250ml', quantity: 3 },
      { productId: 9, spec: '500ml', quantity: 2 },
      { productId: 2, spec: '1000ml', quantity: 1 }
    ],
    totalItems: 6,
    sales: 234
  }
]

export const orders = [
  {
    id: 'ORD202401150001',
    createTime: '2024-01-15 14:30:25',
    status: 'completed',
    statusText: '已完成',
    totalAmount: 328.5,
    items: [
      { productId: 1, name: '高硼硅玻璃烧杯', spec: '250ml', quantity: 5, price: 28.5, image: 'https://img.alicdn.com/imgextra/i4/O1CN01k3t7hs1z8QWQ7n8Xh_!!6000000006695-2-tps-600-600.png' },
      { productId: 4, name: 'A级量筒', spec: '100ml', quantity: 2, price: 32.0, image: 'https://img.alicdn.com/imgextra/i2/O1CN01L8zZ5X1Y7Y7Y7Y7Y7_!!6000000003021-2-tps-600-600.png' }
    ]
  },
  {
    id: 'ORD202401120002',
    createTime: '2024-01-12 10:15:30',
    status: 'shipped',
    statusText: '已发货',
    totalAmount: 899.0,
    items: [
      { productId: 2, name: '圆底蒸馏烧瓶', spec: '500ml', quantity: 2, price: 45.0, image: 'https://img.alicdn.com/imgextra/i1/O1CN01J8xXyZ1X7Z7Z7Z7Z7_!!6000000002420-2-tps-600-600.png' },
      { productId: 6, name: '蛇形冷凝管', spec: '400mm', quantity: 1, price: 58.0, image: 'https://img.alicdn.com/imgextra/i1/O1CN01N7bB7c1W7W7W7W7W7_!!6000000002789-2-tps-600-600.png' }
    ]
  },
  {
    id: 'ORD202401100003',
    createTime: '2024-01-10 16:45:12',
    status: 'pending',
    statusText: '待付款',
    totalAmount: 156.0,
    items: [
      { productId: 3, name: '具塞刻度试管', spec: '25ml', quantity: 10, price: 8.5, image: 'https://img.alicdn.com/imgextra/i3/O1CN01K7yY4v1V7V7V7V7V7_!!6000000002648-2-tps-600-600.png' },
      { productId: 8, name: '刻度移液管', spec: '5ml', quantity: 5, price: 15.0, image: 'https://img.alicdn.com/imgextra/i2/O1CN01Q9dD9e1S7S7S7S7S7_!!6000000002895-2-tps-600-600.png' }
    ]
  },
  {
    id: 'ORD202401080004',
    createTime: '2024-01-08 09:20:45',
    status: 'completed',
    statusText: '已完成',
    totalAmount: 218.0,
    items: [
      { productId: 5, name: '酸式滴定管', spec: '50ml', quantity: 1, price: 68.0, image: 'https://img.alicdn.com/imgextra/i4/O1CN01M9aA6b1Z7Z7Z7Z7Z7_!!6000000003175-2-tps-600-600.png' },
      { productId: 7, name: '聚四氟活塞分液漏斗', spec: '250ml', quantity: 1, price: 89.0, image: 'https://img.alicdn.com/imgextra/i3/O1CN01P8cC8d1U7U7U7U7U7_!!6000000002568-2-tps-600-600.png' }
    ]
  }
]

export const users = [
  {
    id: 1,
    username: 'buyer001',
    password: '123456',
    role: 'buyer',
    roleText: '采购用户',
    name: '张研究员',
    email: 'zhang@lab.com',
    phone: '13800138001',
    organization: '中科院化学所',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  },
  {
    id: 2,
    username: 'supplier001',
    password: '123456',
    role: 'supplier',
    roleText: '器皿供应商',
    name: '李经理',
    email: 'li@huaou.com',
    phone: '13900139001',
    organization: '江苏华鸥玻璃有限公司',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  }
]
