export const mockCities = [
  '北京市', '上海市', '广州市', '深圳市', '杭州市',
  '成都市', '武汉市', '西安市', '南京市', '重庆市',
  '苏州市', '天津市', '长沙市', '郑州市', '东莞市'
]

export const mockBanners = [
  {
    id: 1,
    title: '春季宠物洗护特惠',
    subtitle: '全场8折起，新用户首单立减50',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=400&fit=crop',
    link: '/services?category=wash'
  },
  {
    id: 2,
    title: '专业宠物寄养服务',
    subtitle: '24小时专人照顾，温馨舒适环境',
    image: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1200&h=400&fit=crop',
    link: '/services?category=boarding'
  },
  {
    id: 3,
    title: '宠物美容造型',
    subtitle: '资深美容师，让爱宠焕然一新',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=400&fit=crop',
    link: '/services?category=beauty'
  }
]

export const mockCategories = [
  { id: 'wash', name: '宠物洗护', icon: 'BathOutlined', color: '#1890ff' },
  { id: 'boarding', name: '宠物寄养', icon: 'HomeOutlined', color: '#52c41a' },
  { id: 'beauty', name: '宠物美容', icon: 'ScissorsOutlined', color: '#eb2f96' },
  { id: 'medical', name: '宠物医疗', icon: 'MedicineBoxOutlined', color: '#fa8c16' },
  { id: 'training', name: '宠物训练', icon: 'TrophyOutlined', color: '#722ed1' },
  { id: 'grooming', name: '宠物SPA', icon: 'SmileOutlined', color: '#13c2c2' },
  { id: 'delivery', name: '上门服务', icon: 'CarOutlined', color: '#faad14' },
  { id: 'more', name: '更多服务', icon: 'AppstoreOutlined', color: '#8c8c8c' }
]

export const mockGroomers = [
  {
    id: 1,
    name: '张小红',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    title: '高级宠物美容师',
    experience: 6,
    rating: 4.9,
    orderCount: 1256,
    specialty: ['泰迪造型', '金毛洗护', '猫咪SPA'],
    price: 128,
    description: '国家高级宠物美容师认证，擅长各类犬种造型设计',
    location: '朝阳区'
  },
  {
    id: 2,
    name: '李明华',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    title: '资深宠物护理师',
    experience: 8,
    rating: 4.8,
    orderCount: 2103,
    specialty: ['宠物寄养', '老年犬护理', '康复训练'],
    price: 98,
    description: '从事宠物护理8年，对老年犬和特殊需求宠物有丰富经验',
    location: '海淀区'
  },
  {
    id: 3,
    name: '王芳',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    title: '猫咪专属护理师',
    experience: 5,
    rating: 4.95,
    orderCount: 890,
    specialty: ['猫咪洗护', '猫咪美容', '猫咪行为矫正'],
    price: 158,
    description: '专注猫咪护理5年，温柔耐心，深受猫咪喜爱',
    location: '西城区'
  },
  {
    id: 4,
    name: '陈志强',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    title: '宠物训练师',
    experience: 7,
    rating: 4.7,
    orderCount: 678,
    specialty: ['服从训练', '行为矫正', '技能培训'],
    price: 200,
    description: '国家级宠物训练师，擅长解决各类宠物行为问题',
    location: '东城区'
  }
]

export const mockServices = [
  {
    id: 1,
    name: '小型犬精致洗护',
    category: 'wash',
    categoryName: '宠物洗护',
    price: 68,
    originalPrice: 98,
    duration: 60,
    description: '包含洗澡、吹干、梳毛、指甲修剪、耳道清洁',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop',
    rating: 4.9,
    reviewCount: 328,
    sales: 1562,
    distance: 1.2,
    groomerId: 1,
    tags: ['新客优惠', '限时特价'],
    address: '朝阳区建国路88号爱宠生活馆',
    serviceFlow: [
      { step: 1, title: '预约确认', desc: '客服确认预约时间和服务内容' },
      { step: 2, title: '宠物体检', desc: '入店前进行基础健康检查' },
      { step: 3, title: '专业洗护', desc: '使用进口宠物专用洗护产品' },
      { step: 4, title: '美容造型', desc: '根据宠主需求进行造型修剪' },
      { step: 5, title: '清洁消毒', desc: '使用后工具和环境彻底消毒' }
    ],
    priceList: [
      { name: '基础洗护', price: 68, include: '洗澡、吹干、梳毛' },
      { name: '精致洗护', price: 98, include: '基础洗护+指甲修剪+耳道清洁' },
      { name: 'SPA洗护', price: 158, include: '精致洗护+精油SPA+深层护理' }
    ]
  },
  {
    id: 2,
    name: '中型犬深度洗护',
    category: 'wash',
    categoryName: '宠物洗护',
    price: 98,
    originalPrice: 138,
    duration: 90,
    description: '适合中型犬种，包含深层清洁、护毛素护理',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
    rating: 4.8,
    reviewCount: 256,
    sales: 1024,
    distance: 2.5,
    groomerId: 1,
    tags: ['热门'],
    address: '海淀区中关村大街1号萌宠之家',
    serviceFlow: [
      { step: 1, title: '预约确认', desc: '客服确认预约时间和服务内容' },
      { step: 2, title: '宠物体检', desc: '入店前进行基础健康检查' },
      { step: 3, title: '专业洗护', desc: '使用进口宠物专用洗护产品' },
      { step: 4, title: '美容造型', desc: '根据宠主需求进行造型修剪' }
    ],
    priceList: [
      { name: '基础洗护', price: 98, include: '洗澡、吹干、梳毛' },
      { name: '精致洗护', price: 138, include: '基础洗护+指甲修剪+耳道清洁' }
    ]
  },
  {
    id: 3,
    name: '猫咪专业洗护',
    category: 'wash',
    categoryName: '宠物洗护',
    price: 128,
    originalPrice: 168,
    duration: 75,
    description: '专为猫咪设计的温柔洗护服务，减少应激反应',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
    rating: 4.95,
    reviewCount: 412,
    sales: 2156,
    distance: 0.8,
    groomerId: 3,
    tags: ['新客优惠', '猫咪专属'],
    address: '西城区金融街15号猫语坊',
    serviceFlow: [
      { step: 1, title: '预约确认', desc: '客服确认预约时间和服务内容' },
      { step: 2, title: '情绪安抚', desc: '专业猫咪安抚，减少应激' },
      { step: 3, title: '温柔洗护', desc: '使用猫咪专用无刺激洗护产品' },
      { step: 4, title: '吹干护理', desc: '低温吹干，避免猫咪不适' }
    ],
    priceList: [
      { name: '基础洗护', price: 128, include: '洗澡、吹干、梳毛' },
      { name: '精致洗护', price: 168, include: '基础洗护+指甲修剪+耳道清洁' }
    ]
  },
  {
    id: 4,
    name: '家庭式宠物寄养（日）',
    category: 'boarding',
    categoryName: '宠物寄养',
    price: 88,
    originalPrice: 128,
    duration: 1440,
    description: '温馨家庭环境，24小时专人照顾，每日视频反馈',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
    rating: 4.85,
    reviewCount: 189,
    sales: 876,
    distance: 3.1,
    groomerId: 2,
    tags: ['限时优惠'],
    address: '朝阳区望京SOHO T1爱宠驿站',
    serviceFlow: [
      { step: 1, title: '预约咨询', desc: '了解宠物习性和特殊需求' },
      { step: 2, title: '签订协议', desc: '签订寄养协议，明确双方责任' },
      { step: 3, title: '入托接待', desc: '宠物入托，熟悉环境' },
      { step: 4, title: '日常照料', desc: '定时喂食、遛弯、视频反馈' },
      { step: 5, title: '开心接回', desc: '宠物健康状态良好，开心回家' }
    ],
    priceList: [
      { name: '小型犬/猫', price: 88, include: '每日三餐+遛弯2次+视频反馈' },
      { name: '中型犬', price: 128, include: '每日三餐+遛弯3次+视频反馈' },
      { name: '大型犬', price: 168, include: '每日三餐+遛弯4次+视频反馈' }
    ]
  },
  {
    id: 5,
    name: '宠物VIP寄养套房',
    category: 'boarding',
    categoryName: '宠物寄养',
    price: 198,
    originalPrice: 268,
    duration: 1440,
    description: '独立豪华套房，空调恒温，专属护理人员一对一服务',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
    rating: 4.9,
    reviewCount: 98,
    sales: 432,
    distance: 4.5,
    groomerId: 2,
    tags: ['高端服务'],
    address: '海淀区万柳中路6号宠物度假酒店',
    serviceFlow: [
      { step: 1, title: '预约咨询', desc: '了解宠物习性和特殊需求' },
      { step: 2, title: 'VIP接待', desc: '专属服务人员全程陪同' },
      { step: 3, title: '豪华入住', desc: '独立套房，24小时监控' },
      { step: 4, title: '专属照料', desc: '一对一服务，定制饮食和活动' }
    ],
    priceList: [
      { name: '小型犬/猫', price: 198, include: '独立套房+24h监控+专属护理' },
      { name: '中型犬', price: 258, include: '独立套房+24h监控+专属护理' }
    ]
  },
  {
    id: 6,
    name: '泰迪时尚造型',
    category: 'beauty',
    categoryName: '宠物美容',
    price: 168,
    originalPrice: 218,
    duration: 120,
    description: '专业泰迪造型设计，包含剪毛、修型、精修',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
    rating: 4.92,
    reviewCount: 567,
    sales: 2341,
    distance: 1.8,
    groomerId: 1,
    tags: ['热门', '新客优惠'],
    address: '朝阳区三里屯太古里南区宠物沙龙',
    serviceFlow: [
      { step: 1, title: '造型沟通', desc: '与宠主确认造型需求' },
      { step: 2, title: '基础洗护', desc: '洗澡、吹干、梳毛' },
      { step: 3, title: '造型修剪', desc: '专业美容师精修剪型' },
      { step: 4, title: '细节精修', desc: '面部、脚部细节处理' }
    ],
    priceList: [
      { name: '基础造型', price: 168, include: '剪毛+修型+洗护' },
      { name: '精致造型', price: 218, include: '基础造型+染色+配饰' }
    ]
  },
  {
    id: 7,
    name: '猫咪美容造型',
    category: 'beauty',
    categoryName: '宠物美容',
    price: 198,
    originalPrice: 258,
    duration: 90,
    description: '专业猫咪美容，轻柔操作，减少猫咪应激',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=300&fit=crop',
    rating: 4.88,
    reviewCount: 234,
    sales: 987,
    distance: 2.2,
    groomerId: 3,
    tags: ['猫咪专属'],
    address: '西城区西单北大街猫主题生活馆',
    serviceFlow: [
      { step: 1, title: '情绪安抚', desc: '专业猫咪安抚，减少应激' },
      { step: 2, title: '基础洗护', desc: '猫咪专用洗护产品' },
      { step: 3, title: '美容造型', desc: '轻柔修剪，避免不适' },
      { step: 4, title: '细节处理', desc: '指甲修剪、脚底毛修剪' }
    ],
    priceList: [
      { name: '基础造型', price: 198, include: '剪毛+修型+洗护' },
      { name: '精致造型', price: 258, include: '基础造型+造型设计' }
    ]
  },
  {
    id: 8,
    name: '宠物基础体检',
    category: 'medical',
    categoryName: '宠物医疗',
    price: 128,
    originalPrice: 198,
    duration: 45,
    description: '专业兽医基础检查，包含体温、心率、五官、皮肤等检查',
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&h=300&fit=crop',
    rating: 4.95,
    reviewCount: 789,
    sales: 3456,
    distance: 2.8,
    groomerId: null,
    tags: ['医疗服务', '新客优惠'],
    address: '海淀区学院路38号爱宠动物医院',
    serviceFlow: [
      { step: 1, title: '挂号登记', desc: '宠主信息和宠物基本信息登记' },
      { step: 2, title: '基础检查', desc: '体温、心率、呼吸等基础检查' },
      { step: 3, title: '专科检查', desc: '五官、皮肤、四肢等详细检查' },
      { step: 4, title: '健康报告', desc: '出具健康报告和建议' }
    ],
    priceList: [
      { name: '基础体检', price: 128, include: '常规检查+健康报告' },
      { name: '全面体检', price: 298, include: '基础体检+血常规+生化检查' }
    ]
  },
  {
    id: 9,
    name: '幼犬疫苗接种',
    category: 'medical',
    categoryName: '宠物医疗',
    price: 168,
    originalPrice: 218,
    duration: 30,
    description: '幼犬基础疫苗接种，含疫苗费用和接种服务',
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop',
    rating: 4.9,
    reviewCount: 456,
    sales: 1876,
    distance: 3.5,
    groomerId: null,
    tags: ['医疗服务'],
    address: '朝阳区建国路88号爱宠动物医院',
    serviceFlow: [
      { step: 1, title: '健康检查', desc: '接种前健康检查' },
      { step: 2, title: '疫苗接种', desc: '专业兽医注射疫苗' },
      { step: 3, title: '留观30分钟', desc: '接种后留观确保安全' },
      { step: 4, title: '接种证明', desc: '发放疫苗接种证书' }
    ],
    priceList: [
      { name: '四联疫苗', price: 168, include: '疫苗+接种服务' },
      { name: '六联疫苗', price: 218, include: '疫苗+接种服务' }
    ]
  },
  {
    id: 10,
    name: '宠物服从训练课程',
    category: 'training',
    categoryName: '宠物训练',
    price: 298,
    originalPrice: 398,
    duration: 60,
    description: '一对一专业训练，包含坐、卧、定、来等基础服从训练',
    image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=300&fit=crop',
    rating: 4.85,
    reviewCount: 123,
    sales: 567,
    distance: 5.2,
    groomerId: 4,
    tags: ['训练服务'],
    address: '东城区东直门内大街宠物训练中心',
    serviceFlow: [
      { step: 1, title: '行为评估', desc: '评估宠物基础情况和问题' },
      { step: 2, title: '制定计划', desc: '根据评估结果制定训练计划' },
      { step: 3, title: '专业训练', desc: '一对一训练，宠主陪同学习' },
      { step: 4, title: '课后指导', desc: '提供家庭训练指导和建议' }
    ],
    priceList: [
      { name: '单次课程', price: 298, include: '1小时训练+课后指导' },
      { name: '10次课程', price: 2680, include: '10次训练+赠送2次' }
    ]
  },
  {
    id: 11,
    name: '宠物SPA护理',
    category: 'grooming',
    categoryName: '宠物SPA',
    price: 158,
    originalPrice: 198,
    duration: 90,
    description: '精油SPA+深层护理，滋养毛发，舒缓皮肤',
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&h=300&fit=crop',
    rating: 4.9,
    reviewCount: 345,
    sales: 1234,
    distance: 1.5,
    groomerId: 1,
    tags: ['热门', 'SPA'],
    address: '朝阳区国贸商城宠物生活馆',
    serviceFlow: [
      { step: 1, title: '皮肤评估', desc: '评估皮肤和毛发状况' },
      { step: 2, title: '精油SPA', desc: '专业精油按摩，促进血液循环' },
      { step: 3, title: '深层护理', desc: '滋养发膜，深层修护' },
      { step: 4, title: '吹干造型', desc: '吹干并做简单造型' }
    ],
    priceList: [
      { name: '基础SPA', price: 158, include: '精油按摩+护理' },
      { name: '高级SPA', price: 258, include: '基础SPA+药浴+深层滋养' }
    ]
  },
  {
    id: 12,
    name: '上门遛狗服务',
    category: 'delivery',
    categoryName: '上门服务',
    price: 48,
    originalPrice: 68,
    duration: 30,
    description: '专业遛狗师上门服务，每次30分钟，包含遛弯和基本互动',
    image: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=400&h=300&fit=crop',
    rating: 4.8,
    reviewCount: 678,
    sales: 4567,
    distance: 0,
    groomerId: null,
    tags: ['上门服务', '新客优惠'],
    address: '全城服务',
    serviceFlow: [
      { step: 1, title: '预约确认', desc: '确认时间地点和狗狗信息' },
      { step: 2, title: '上门服务', desc: '专业遛狗师准时上门' },
      { step: 3, title: '遛弯互动', desc: '30分钟遛弯和互动' },
      { step: 4, title: '服务反馈', desc: '发送遛弯照片和情况反馈' }
    ],
    priceList: [
      { name: '30分钟', price: 48, include: '遛弯+互动+照片反馈' },
      { name: '60分钟', price: 78, include: '遛弯+互动+照片反馈' }
    ]
  }
]

export const mockUsers = [
  {
    id: 1,
    username: 'petowner1',
    phone: '13800138001',
    password: '123456',
    userType: 'owner',
    nickname: '爱猫人士小王',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    gender: 'male',
    email: 'wang@example.com',
    address: '北京市朝阳区建国路88号',
    createdAt: '2024-01-15T00:00:00.000Z',
    status: 1
  },
  {
    id: 2,
    username: 'groomer1',
    phone: '13900139001',
    password: '123456',
    userType: 'groomer',
    nickname: '宠物美容师小红',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    gender: 'female',
    email: 'hong@example.com',
    certificate: '高级宠物美容师认证',
    experience: 6,
    createdAt: '2023-06-20T00:00:00.000Z',
    status: 1
  }
]

export const mockPets = [
  {
    id: 1,
    userId: 1,
    name: '毛毛',
    type: 'dog',
    breed: '泰迪',
    gender: 'male',
    age: 2,
    weight: 5,
    avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop',
    vaccineStatus: 'complete',
    sterilizationStatus: 'yes',
    description: '性格温顺，不挑食，喜欢玩球',
    createdAt: '2024-01-20T00:00:00.000Z'
  },
  {
    id: 2,
    userId: 1,
    name: '咪咪',
    type: 'cat',
    breed: '英国短毛猫',
    gender: 'female',
    age: 1,
    weight: 3,
    avatar: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&h=200&fit=crop',
    vaccineStatus: 'complete',
    sterilizationStatus: 'no',
    description: '有点胆小，熟悉后很粘人',
    createdAt: '2024-03-10T00:00:00.000Z'
  }
]

export const mockOrders = [
  {
    id: 1,
    orderNo: 'ORD202405010001',
    userId: 1,
    serviceId: 1,
    serviceName: '小型犬精致洗护',
    serviceImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&h=150&fit=crop',
    petId: 1,
    petName: '毛毛',
    groomerId: 1,
    groomerName: '张小红',
    appointmentTime: '2024-05-20T10:00:00.000Z',
    address: '朝阳区建国路88号爱宠生活馆',
    price: 68,
    originalPrice: 98,
    coupon: 30,
    totalPrice: 68,
    status: 'pending',
    payMethod: 'wechat',
    remark: '请温柔对待我家狗狗',
    createdAt: '2024-05-18T10:30:00.000Z',
    updatedAt: '2024-05-18T10:30:00.000Z'
  },
  {
    id: 2,
    orderNo: 'ORD202405150002',
    userId: 1,
    serviceId: 3,
    serviceName: '猫咪专业洗护',
    serviceImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=150&fit=crop',
    petId: 2,
    petName: '咪咪',
    groomerId: 3,
    groomerName: '王芳',
    appointmentTime: '2024-05-16T14:00:00.000Z',
    address: '西城区金融街15号猫语坊',
    price: 128,
    originalPrice: 168,
    coupon: 40,
    totalPrice: 128,
    status: 'completed',
    payMethod: 'alipay',
    remark: '',
    createdAt: '2024-05-15T09:00:00.000Z',
    updatedAt: '2024-05-16T16:30:00.000Z',
    review: {
      rating: 5,
      content: '服务非常专业，猫咪全程都很配合，美容师很有耐心，下次还会再来！',
      images: [],
      createdAt: '2024-05-16T17:00:00.000Z'
    }
  },
  {
    id: 3,
    orderNo: 'ORD202405100003',
    userId: 1,
    serviceId: 4,
    serviceName: '家庭式宠物寄养（日）',
    serviceImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&h=150&fit=crop',
    petId: 1,
    petName: '毛毛',
    groomerId: 2,
    groomerName: '李明华',
    appointmentTime: '2024-05-12T09:00:00.000Z',
    address: '朝阳区望京SOHO T1爱宠驿站',
    price: 176,
    originalPrice: 256,
    coupon: 80,
    totalPrice: 176,
    status: 'completed',
    payMethod: 'wechat',
    remark: '寄养2天，麻烦多拍些视频',
    createdAt: '2024-05-10T14:00:00.000Z',
    updatedAt: '2024-05-14T10:00:00.000Z',
    review: {
      rating: 4,
      content: '寄养环境很好，每天都有视频反馈，狗狗很开心。唯一不足是价格稍贵。',
      images: [],
      createdAt: '2024-05-14T11:00:00.000Z'
    }
  },
  {
    id: 4,
    orderNo: 'ORD202405180004',
    userId: 1,
    serviceId: 6,
    serviceName: '泰迪时尚造型',
    serviceImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=150&fit=crop',
    petId: 1,
    petName: '毛毛',
    groomerId: 1,
    groomerName: '张小红',
    appointmentTime: '2024-05-22T15:00:00.000Z',
    address: '朝阳区三里屯太古里南区宠物沙龙',
    price: 168,
    originalPrice: 218,
    coupon: 50,
    totalPrice: 168,
    status: 'confirmed',
    payMethod: 'wechat',
    remark: '想做一个圆滚滚的造型',
    createdAt: '2024-05-18T11:00:00.000Z',
    updatedAt: '2024-05-18T11:30:00.000Z'
  }
]

export const mockActivities = [
  {
    id: 1,
    title: '新用户注册',
    subtitle: '送100元优惠券礼包',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=200&fit=crop',
    link: '/register'
  },
  {
    id: 2,
    title: '限时秒杀',
    subtitle: '洗护服务低至5折',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=200&fit=crop',
    link: '/services?category=wash'
  },
  {
    id: 3,
    title: '邀请好友',
    subtitle: '双方各得50元',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
    link: '/invite'
  }
]

export const mockReviews = [
  {
    id: 1,
    userId: 101,
    userName: '用户123',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=r1',
    rating: 5,
    content: '服务非常专业，美容师很有耐心，狗狗做完造型特别可爱！环境也很干净，推荐给大家。',
    images: [],
    serviceId: 1,
    createdAt: '2024-05-15T10:30:00.000Z'
  },
  {
    id: 2,
    userId: 102,
    userName: '爱宠达人',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=r2',
    rating: 4,
    content: '整体不错，就是等待时间有点长。不过效果很好，猫咪洗完澡香香的，毛发也很顺滑。',
    images: [],
    serviceId: 3,
    createdAt: '2024-05-14T15:20:00.000Z'
  },
  {
    id: 3,
    userId: 103,
    userName: '铲屎官小李',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=r3',
    rating: 5,
    content: '寄养服务太棒了！每天都有视频反馈，工作人员很细心，狗狗在那边玩得很开心，完全没有不适应。',
    images: [],
    serviceId: 4,
    createdAt: '2024-05-12T09:15:00.000Z'
  }
]
