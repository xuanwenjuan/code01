export const mockCities = [
  { id: 1, name: '北京', pinyin: 'beijing' },
  { id: 2, name: '上海', pinyin: 'shanghai' },
  { id: 3, name: '广州', pinyin: 'guangzhou' },
  { id: 4, name: '深圳', pinyin: 'shenzhen' },
  { id: 5, name: '杭州', pinyin: 'hangzhou' },
  { id: 6, name: '成都', pinyin: 'chengdu' },
  { id: 7, name: '武汉', pinyin: 'wuhan' },
  { id: 8, name: '南京', pinyin: 'nanjing' },
  { id: 9, name: '西安', pinyin: 'xian' },
  { id: 10, name: '重庆', pinyin: 'chongqing' }
]

export const mockUsers = [
  {
    id: 1,
    phone: '13800138000',
    password: '123456',
    nickname: '幸福妈妈',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mom1',
    role: 'mom',
    realName: '张妈妈',
    gender: 'female',
    age: 32,
    address: '北京市朝阳区'
  },
  {
    id: 2,
    phone: '13900139000',
    password: '123456',
    nickname: '李阿姨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nanny1',
    role: 'nanny',
    realName: '李阿姨',
    gender: 'female',
    age: 45,
    experience: 8,
    skills: ['月嫂', '育儿嫂', '催乳'],
    certificate: ['高级育婴师', '催乳师', '营养师'],
    introduction: '从事母婴服务行业8年，经验丰富，有爱心有耐心，擅长新生儿护理和产妇康复。',
    rating: 4.9,
    orderCount: 156
  }
]

export const mockCategories = [
  { id: 1, name: '月嫂', icon: '👶', color: '#ff6b9d', description: '专业月子护理' },
  { id: 2, name: '育儿嫂', icon: '🧸', color: '#ff9f43', description: '婴幼儿看护' },
  { id: 3, name: '催乳', icon: '🍼', color: '#54a0ff', description: '开奶/通乳服务' },
  { id: 4, name: '早教', icon: '📚', color: '#5f27cd', description: '婴幼儿启蒙教育' },
  { id: 5, name: '产后修复', icon: '💆', color: '#00d2d3', description: '产后康复调理' },
  { id: 6, name: '小儿推拿', icon: '👐', color: '#10ac84', description: '儿童保健按摩' },
  { id: 7, name: '满月发汗', icon: '🌡️', color: '#ee5a24', description: '满月汗蒸排毒' },
  { id: 8, name: '母婴摄影', icon: '📷', color: '#c23616', description: '宝宝成长记录' }
]

export const mockBanners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&h=400&fit=crop',
    title: '专业月嫂服务',
    subtitle: '让您安心坐月子'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=400&fit=crop',
    title: '新用户专享',
    subtitle: '首单立减200元'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&h=400&fit=crop',
    title: '限时优惠活动',
    subtitle: '母婴服务5折起'
  }
]

export const mockNannies = [
  {
    id: 1,
    name: '王阿姨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nanny1',
    age: 42,
    experience: 6,
    skills: ['月嫂', '育儿嫂'],
    rating: 4.8,
    orderCount: 128,
    price: 8800,
    certificate: ['高级育婴师', '营养师'],
    introduction: '有6年月嫂经验，擅长新生儿护理、产妇营养餐制作。'
  },
  {
    id: 2,
    name: '李阿姨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nanny2',
    age: 48,
    experience: 10,
    skills: ['月嫂', '催乳', '产后修复'],
    rating: 4.9,
    orderCount: 256,
    price: 12800,
    certificate: ['高级育婴师', '高级催乳师', '产后修复师'],
    introduction: '10年从业经验，金牌月嫂，服务过上百个家庭，好评如潮。'
  },
  {
    id: 3,
    name: '张阿姨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nanny3',
    age: 45,
    experience: 8,
    skills: ['育儿嫂', '早教'],
    rating: 4.7,
    orderCount: 189,
    price: 6800,
    certificate: ['育婴师', '早教师'],
    introduction: '性格开朗，喜欢孩子，擅长婴幼儿早期智力开发。'
  },
  {
    id: 4,
    name: '刘阿姨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nanny4',
    age: 50,
    experience: 12,
    skills: ['月嫂', '育儿嫂', '小儿推拿'],
    rating: 4.9,
    orderCount: 312,
    price: 10800,
    certificate: ['高级育婴师', '小儿推拿师'],
    introduction: '12年母婴护理经验，精通传统月子护理和现代科学育儿。'
  }
]

export const mockServices = [
  {
    id: 1,
    name: '金牌月嫂26天住家服务',
    category: '月嫂',
    categoryId: 1,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=300&fit=crop',
    price: 8800,
    originalPrice: 12800,
    rating: 4.9,
    reviewCount: 256,
    sales: 1568,
    distance: 2.5,
    address: '北京市朝阳区建国路88号',
    description: '专业月嫂24小时住家服务，包含新生儿护理、产妇护理、月子餐制作、乳房护理等全套月子服务。',
    features: ['24小时住家', '持证上岗', '经验丰富', '好评如潮'],
    serviceFlow: [
      { step: 1, title: '咨询预约', desc: '在线咨询并预约服务时间' },
      { step: 2, title: '匹配月嫂', desc: '根据需求匹配合适的月嫂' },
      { step: 3, title: '签订合同', desc: '签订服务合同保障权益' },
      { step: 4, title: '上门服务', desc: '月嫂按约定时间上门服务' },
      { step: 5, title: '服务验收', desc: '服务结束后进行评价' }
    ],
    priceDetail: [
      { item: '基础服务费', price: 8000 },
      { item: '服务费', price: 800 }
    ],
    serviceCycle: ['26天', '42天', '52天'],
    reviews: [
      { id: 1, userId: 1, userName: '王妈妈', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', rating: 5, content: '李阿姨非常专业，把宝宝和我都照顾得很好，月子餐也做得很美味。', time: '2024-01-15' },
      { id: 2, userId: 2, userName: '张妈妈', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', rating: 5, content: '服务态度很好，经验丰富，遇到问题都能及时解决。', time: '2024-01-10' }
    ],
    nanny: mockNannies[0]
  },
  {
    id: 2,
    name: '高级育儿嫂日常看护',
    category: '育儿嫂',
    categoryId: 2,
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop',
    price: 5800,
    originalPrice: 7800,
    rating: 4.8,
    reviewCount: 189,
    sales: 896,
    distance: 3.2,
    address: '北京市海淀区中关村大街1号',
    description: '专业育儿嫂提供0-3岁婴幼儿日常护理、辅食制作、早期教育等服务。',
    features: ['科学育儿', '辅食制作', '早教启蒙', '贴心细致'],
    serviceFlow: [
      { step: 1, title: '咨询预约', desc: '在线咨询并预约服务时间' },
      { step: 2, title: '匹配育儿嫂', desc: '根据需求匹配合适的育儿嫂' },
      { step: 3, title: '面试确认', desc: '视频或线下面试确认' },
      { step: 4, title: '上门服务', desc: '育儿嫂按约定时间上门服务' },
      { step: 5, title: '定期回访', desc: '服务期间定期回访跟进' }
    ],
    priceDetail: [
      { item: '基础服务费', price: 5200 },
      { item: '服务费', price: 600 }
    ],
    serviceCycle: ['1个月', '3个月', '6个月', '12个月'],
    reviews: [
      { id: 1, userId: 3, userName: '李妈妈', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3', rating: 5, content: '张阿姨很有耐心，和宝宝相处得很好，辅食做得也很棒。', time: '2024-01-12' }
    ],
    nanny: mockNannies[2]
  },
  {
    id: 3,
    name: '专业催乳通乳服务',
    category: '催乳',
    categoryId: 3,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop',
    price: 398,
    originalPrice: 598,
    rating: 4.9,
    reviewCount: 423,
    sales: 2341,
    distance: 1.8,
    address: '北京市朝阳区望京SOHO',
    description: '专业催乳师提供开奶、通乳、追奶、回奶等服务，解决哺乳期各种问题。',
    features: ['无痛催乳', '快速见效', '持证上岗', '隐私保护'],
    serviceFlow: [
      { step: 1, title: '在线预约', desc: '选择服务项目并预约时间' },
      { step: 2, title: '确认订单', desc: '客服确认订单和服务时间' },
      { step: 3, title: '上门服务', desc: '催乳师按时上门服务' },
      { step: 4, title: '效果评估', desc: '服务后评估效果并给出建议' }
    ],
    priceDetail: [
      { item: '催乳服务', price: 398 }
    ],
    serviceCycle: ['单次', '3次套餐', '5次套餐'],
    reviews: [
      { id: 1, userId: 4, userName: '陈妈妈', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4', rating: 5, content: '刘老师手法很专业，通乳过程不痛苦，效果很好。', time: '2024-01-18' }
    ],
    nanny: mockNannies[1]
  },
  {
    id: 4,
    name: '婴幼儿早教启蒙课程',
    category: '早教',
    categoryId: 4,
    image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=300&fit=crop',
    price: 298,
    originalPrice: 398,
    rating: 4.7,
    reviewCount: 156,
    sales: 678,
    distance: 4.5,
    address: '北京市西城区金融街',
    description: '针对0-6岁婴幼儿的专业早教课程，开发智力潜能，培养良好习惯。',
    features: ['专业课程', '小班教学', '趣味互动', '能力培养'],
    serviceFlow: [
      { step: 1, title: '预约试听', desc: '预约免费试听课程' },
      { step: 2, title: '能力评估', desc: '对宝宝进行能力评估' },
      { step: 3, title: '定制课程', desc: '根据评估结果定制课程' },
      { step: 4, title: '开始学习', desc: '按课程表开始学习' }
    ],
    priceDetail: [
      { item: '单次课程', price: 298 }
    ],
    serviceCycle: ['单次体验', '12课时', '24课时', '48课时'],
    reviews: [
      { id: 1, userId: 5, userName: '赵妈妈', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5', rating: 5, content: '宝宝很喜欢上早教课，进步很大。', time: '2024-01-08' }
    ],
    nanny: mockNannies[2]
  },
  {
    id: 5,
    name: '产后修复调理套餐',
    category: '产后修复',
    categoryId: 5,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    price: 3980,
    originalPrice: 5980,
    rating: 4.8,
    reviewCount: 98,
    sales: 345,
    distance: 2.1,
    address: '北京市朝阳区三里屯',
    description: '专业产后修复服务，包括盆底肌修复、腹直肌分离修复、骨盆矫正等。',
    features: ['专业仪器', '手法修复', '个性化方案', '效果保障'],
    serviceFlow: [
      { step: 1, title: '到店咨询', desc: '到店进行身体评估' },
      { step: 2, title: '定制方案', desc: '根据评估结果定制修复方案' },
      { step: 3, title: '开始修复', desc: '按方案进行修复调理' },
      { step: 4, title: '效果跟踪', desc: '定期跟踪修复效果' }
    ],
    priceDetail: [
      { item: '盆底肌修复10次', price: 2000 },
      { item: '腹直肌修复10次', price: 1500 },
      { item: '服务费', price: 480 }
    ],
    serviceCycle: ['基础套餐', '进阶套餐', '尊享套餐'],
    reviews: [],
    nanny: mockNannies[1]
  },
  {
    id: 6,
    name: '小儿推拿保健服务',
    category: '小儿推拿',
    categoryId: 6,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
    price: 198,
    originalPrice: 298,
    rating: 4.6,
    reviewCount: 234,
    sales: 1234,
    distance: 1.5,
    address: '北京市丰台区方庄',
    description: '专业小儿推拿师提供儿童保健按摩，增强体质，预防疾病。',
    features: ['绿色疗法', '无副作用', '增强体质', '专业手法'],
    serviceFlow: [
      { step: 1, title: '预约服务', desc: '在线预约推拿服务' },
      { step: 2, title: '体质诊断', desc: '对宝宝进行体质诊断' },
      { step: 3, title: '推拿服务', desc: '根据诊断进行推拿' },
      { step: 4, title: '健康指导', desc: '给出日常护理建议' }
    ],
    priceDetail: [
      { item: '小儿推拿', price: 198 }
    ],
    serviceCycle: ['单次', '5次卡', '10次卡', '20次卡'],
    reviews: [
      { id: 1, userId: 6, userName: '孙妈妈', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user6', rating: 5, content: '宝宝感冒后推拿几次就好了，很神奇。', time: '2024-01-20' }
    ],
    nanny: mockNannies[3]
  },
  {
    id: 7,
    name: '满月发汗排毒调理',
    category: '满月发汗',
    categoryId: 7,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
    price: 598,
    originalPrice: 898,
    rating: 4.7,
    reviewCount: 87,
    sales: 456,
    distance: 3.8,
    address: '北京市通州区梨园',
    description: '专业满月汗蒸服务，帮助产妇排出体内毒素，恢复身体健康。',
    features: ['中药熏蒸', '排毒养颜', '舒缓疲劳', '专业护理'],
    serviceFlow: [
      { step: 1, title: '预约服务', desc: '提前预约发汗时间' },
      { step: 2, title: '准备工作', desc: '更换衣物，做好准备' },
      { step: 3, title: '发汗调理', desc: '进行中药熏蒸发汗' },
      { step: 4, title: '产后修复', desc: '发汗后进行身体调理' }
    ],
    priceDetail: [
      { item: '满月发汗', price: 598 }
    ],
    serviceCycle: ['单次', '3次套餐'],
    reviews: [],
    nanny: mockNannies[1]
  },
  {
    id: 8,
    name: '宝宝成长摄影套餐',
    category: '母婴摄影',
    categoryId: 8,
    image: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=400&h=300&fit=crop',
    price: 1299,
    originalPrice: 1899,
    rating: 4.8,
    reviewCount: 145,
    sales: 567,
    distance: 5.2,
    address: '北京市东城区王府井',
    description: '专业儿童摄影服务，记录宝宝成长的每一个美好瞬间。',
    features: ['专业拍摄', '多套服装', '精修照片', '精美相册'],
    serviceFlow: [
      { step: 1, title: '预约拍摄', desc: '选择套餐并预约拍摄时间' },
      { step: 2, title: '服装造型', desc: '选择服装和造型风格' },
      { step: 3, title: '正式拍摄', desc: '专业摄影师进行拍摄' },
      { step: 4, title: '选片取件', desc: '选片后等待成品制作' }
    ],
    priceDetail: [
      { item: '拍摄服务', price: 800 },
      { item: '精修照片20张', price: 300 },
      { item: '精美相册', price: 199 }
    ],
    serviceCycle: ['百天照', '周岁照', '成长套系'],
    reviews: [
      { id: 1, userId: 7, userName: '周妈妈', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user7', rating: 5, content: '拍摄效果很好，宝宝很配合，照片很漂亮。', time: '2024-01-05' }
    ],
    nanny: null
  }
]

export const mockPromotions = [
  {
    id: 1,
    title: '新用户专享',
    subtitle: '首单立减200元',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=200&fit=crop',
    discount: 200,
    condition: '满500可用'
  },
  {
    id: 2,
    title: '限时特惠',
    subtitle: '月嫂服务8折',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=200&fit=crop',
    discount: '8折',
    condition: '限本月'
  },
  {
    id: 3,
    title: '套餐优惠',
    subtitle: '买10次送2次',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=200&fit=crop',
    discount: '买10送2',
    condition: '催乳套餐'
  }
]

export const mockBabies = [
  {
    id: 1,
    name: '小宝',
    gender: 'boy',
    birthday: '2023-06-15',
    weight: 8.5,
    height: 72,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=baby1'
  }
]

export const mockOrders = [
  {
    id: 1,
    orderNo: 'ORD202401200001',
    serviceId: 1,
    serviceName: '金牌月嫂26天住家服务',
    serviceImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&h=150&fit=crop',
    price: 8800,
    status: 'completed',
    createTime: '2024-01-01T10:00:00Z',
    serviceTime: '2024-01-10',
    serviceCycle: '26天',
    babyId: 1,
    babyName: '小宝',
    address: '北京市朝阳区建国路88号',
    phone: '13800138000',
    remark: '希望阿姨有爱心，有经验',
    review: null
  },
  {
    id: 2,
    orderNo: 'ORD202401200002',
    serviceId: 3,
    serviceName: '专业催乳通乳服务',
    serviceImage: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=150&fit=crop',
    price: 398,
    status: 'confirmed',
    createTime: '2024-01-15T14:30:00Z',
    serviceTime: '2024-01-22',
    serviceCycle: '单次',
    babyId: 1,
    babyName: '小宝',
    address: '北京市朝阳区望京SOHO',
    phone: '13800138000',
    remark: '下午3点上门',
    review: null
  },
  {
    id: 3,
    orderNo: 'ORD202401200003',
    serviceId: 4,
    serviceName: '婴幼儿早教启蒙课程',
    serviceImage: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=200&h=150&fit=crop',
    price: 298,
    status: 'pending',
    createTime: '2024-01-18T09:00:00Z',
    serviceTime: '2024-01-25',
    serviceCycle: '单次体验',
    babyId: 1,
    babyName: '小宝',
    address: '北京市西城区金融街',
    phone: '13800138000',
    remark: '',
    review: null
  }
]
