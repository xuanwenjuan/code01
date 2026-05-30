export const mockCategories = [
  { id: 'cleaning', name: '家庭保洁', icon: 'CleanOutlined', color: '#1677ff' },
  { id: 'appliance', name: '家电清洗', icon: 'ThunderboltOutlined', color: '#faad14' },
  { id: 'repair', name: '家电维修', icon: 'ToolOutlined', color: '#52c41a' },
  { id: 'moving', name: '搬家服务', icon: 'CarOutlined', color: '#eb2f96' },
  { id: 'pest', name: '杀虫除螨', icon: 'BugOutlined', color: '#722ed1' },
  { id: 'plumbing', name: '管道疏通', icon: 'ExperimentOutlined', color: '#13c2c2' },
  { id: 'nanny', name: '月嫂育儿', icon: 'UserOutlined', color: '#fa8c16' },
  { id: 'elderly', name: '老人陪护', icon: 'HeartOutlined', color: '#f5222d' }
]

export const mockServices = [
  {
    id: 1,
    name: '深度保洁服务',
    category: 'cleaning',
    price: 60,
    priceUnit: '元/小时',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    rating: 4.9,
    orderCount: 2356,
    distance: 0.8,
    description: '专业团队，标准化服务流程，全屋深度清洁，让家焕然一新。包含厨房、卫生间、客厅、卧室等全面清洁。',
    workerCount: 12,
    features: ['专业工具', '环保清洁剂', '满意保障', '快速上门'],
    process: [
      { step: 1, title: '预约下单', desc: '在线选择服务，填写预约信息' },
      { step: 2, title: '确认订单', desc: '客服确认服务时间和地址' },
      { step: 3, title: '上门服务', desc: '专业师傅按时上门服务' },
      { step: 4, title: '验收评价', desc: '服务完成后验收并评价' }
    ],
    reviews: [
      { id: 1, userName: '张**', rating: 5, content: '清洁得非常干净，师傅很专业，下次还会再来！', time: '2024-01-10', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
      { id: 2, userName: '李**', rating: 5, content: '服务态度很好，清洁效果超出预期', time: '2024-01-08', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
      { id: 3, userName: '王**', rating: 4, content: '整体不错，就是时间稍微长了点', time: '2024-01-05', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' }
    ]
  },
  {
    id: 2,
    name: '日常保洁',
    category: 'cleaning',
    price: 40,
    priceUnit: '元/小时',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400',
    rating: 4.8,
    orderCount: 5689,
    distance: 1.2,
    description: '日常家庭保洁服务，包含表面清洁、垃圾清理、物品整理等，适合每周定期保洁。',
    workerCount: 25,
    features: ['快速响应', '按时上门', '品质保证'],
    process: [
      { step: 1, title: '预约下单', desc: '在线选择服务，填写预约信息' },
      { step: 2, title: '确认订单', desc: '客服确认服务时间和地址' },
      { step: 3, title: '上门服务', desc: '专业师傅按时上门服务' },
      { step: 4, title: '验收评价', desc: '服务完成后验收并评价' }
    ],
    reviews: [
      { id: 1, userName: '赵**', rating: 5, content: '阿姨打扫很认真，非常满意', time: '2024-01-12', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }
    ]
  },
  {
    id: 3,
    name: '空调清洗',
    category: 'appliance',
    price: 120,
    priceUnit: '元/台',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    rating: 4.7,
    orderCount: 1890,
    distance: 2.1,
    description: '专业空调深度清洗，去除灰尘、细菌，改善空气质量，延长空调使用寿命。',
    workerCount: 8,
    features: ['深度清洁', '消毒杀菌', '环保无害'],
    process: [
      { step: 1, title: '预约下单', desc: '选择空调清洗服务' },
      { step: 2, title: '师傅上门', desc: '专业师傅携带工具上门' },
      { step: 3, title: '清洗服务', desc: '深度拆洗，全面清洁' },
      { step: 4, title: '试机验收', desc: '开机测试，确保正常运行' }
    ],
    reviews: [
      { id: 1, userName: '孙**', rating: 5, content: '洗得很干净，出风都清新了很多', time: '2024-01-11', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' }
    ]
  },
  {
    id: 4,
    name: '油烟机清洗',
    category: 'appliance',
    price: 150,
    priceUnit: '元/台',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    rating: 4.8,
    orderCount: 2100,
    distance: 1.5,
    description: '油烟机深度清洗，去除顽固油污，提升排烟效果，消除安全隐患。',
    workerCount: 10,
    features: ['强力除油', '高温消毒', '部件养护'],
    process: [
      { step: 1, title: '预约下单', desc: '选择油烟机清洗服务' },
      { step: 2, title: '师傅上门', desc: '专业师傅上门服务' },
      { step: 3, title: '拆洗清洁', desc: '全面拆卸，深度清洗' },
      { step: 4, title: '安装测试', desc: '重新安装，测试运行' }
    ],
    reviews: [
      { id: 1, userName: '周**', rating: 5, content: '清洗前后差别太大了，师傅很专业', time: '2024-01-09', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' }
    ]
  },
  {
    id: 5,
    name: '家电维修',
    category: 'repair',
    price: 80,
    priceUnit: '元起',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    rating: 4.6,
    orderCount: 3200,
    distance: 0.5,
    description: '各类家电维修服务，专业技师，先检测后维修，修不好不收费。',
    workerCount: 15,
    features: ['专业检测', '透明收费', '保修保障'],
    process: [
      { step: 1, title: '预约下单', desc: '描述故障，预约服务' },
      { step: 2, title: '检测报价', desc: '师傅检测，给出报价' },
      { step: 3, title: '维修服务', desc: '同意后进行维修' },
      { step: 4, title: '验收保修', desc: '验收通过，享受保修' }
    ],
    reviews: [
      { id: 1, userName: '吴**', rating: 4, content: '维修师傅技术不错，价格也合理', time: '2024-01-07', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7' }
    ]
  },
  {
    id: 6,
    name: '搬家服务',
    category: 'moving',
    price: 300,
    priceUnit: '元起',
    image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400',
    rating: 4.5,
    orderCount: 1560,
    distance: 3.2,
    description: '专业搬家团队，提供打包、搬运、拆装一站式服务，让您轻松搬家。',
    workerCount: 20,
    features: ['专业团队', '安全保障', '损坏赔付'],
    process: [
      { step: 1, title: '预约咨询', desc: '咨询报价，确定搬家方案' },
      { step: 2, title: '上门打包', desc: '专业人员上门打包' },
      { step: 3, title: '搬运运输', desc: '安全搬运，准时送达' },
      { step: 4, title: '验收结算', desc: '物品验收，确认无误' }
    ],
    reviews: [
      { id: 1, userName: '郑**', rating: 5, content: '搬家师傅很专业，效率很高', time: '2024-01-06', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8' }
    ]
  },
  {
    id: 7,
    name: '除螨服务',
    category: 'pest',
    price: 99,
    priceUnit: '元/房间',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400',
    rating: 4.9,
    orderCount: 890,
    distance: 2.8,
    description: '专业除螨服务，高温蒸汽杀灭螨虫、细菌，改善睡眠环境，适合母婴家庭。',
    workerCount: 6,
    features: ['高温杀菌', '无化学残留', '母婴安全'],
    process: [
      { step: 1, title: '预约服务', desc: '选择除螨服务' },
      { step: 2, title: '上门检测', desc: '检测螨虫情况' },
      { step: 3, title: '除螨作业', desc: '高温蒸汽全面除螨' },
      { step: 4, title: '效果确认', desc: '确认除螨效果' }
    ],
    reviews: [
      { id: 1, userName: '冯**', rating: 5, content: '做完后睡觉都安心多了，推荐！', time: '2024-01-08', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=9' }
    ]
  },
  {
    id: 8,
    name: '管道疏通',
    category: 'plumbing',
    price: 100,
    priceUnit: '元/次',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    rating: 4.4,
    orderCount: 4500,
    distance: 0.3,
    description: '专业管道疏通，马桶、地漏、洗菜池等各类管道堵塞疏通，快速上门。',
    workerCount: 18,
    features: ['快速上门', '专业设备', '不通不收费'],
    process: [
      { step: 1, title: '紧急预约', desc: '电话或在线预约' },
      { step: 2, title: '快速上门', desc: '师傅快速到达' },
      { step: 3, title: '疏通作业', desc: '专业设备疏通' },
      { step: 4, title: '验收付款', desc: '疏通成功后付款' }
    ],
    reviews: [
      { id: 1, userName: '陈**', rating: 5, content: '师傅半小时就到了，很快就疏通了', time: '2024-01-13', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=10' }
    ]
  },
  {
    id: 9,
    name: '月嫂服务',
    category: 'nanny',
    price: 8000,
    priceUnit: '元/26天',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    rating: 4.9,
    orderCount: 560,
    distance: 5.0,
    description: '专业持证月嫂，母婴护理经验丰富，提供科学坐月子指导，让您安心度过产褥期。',
    workerCount: 12,
    features: ['持证上岗', '经验丰富', '科学护理'],
    process: [
      { step: 1, title: '咨询预约', desc: '咨询月嫂服务，预约面试' },
      { step: 2, title: '月嫂面试', desc: '与月嫂面对面沟通' },
      { step: 3, title: '签订协议', desc: '确认服务，签订协议' },
      { step: 4, title: '上门服务', desc: '月嫂按时上岗服务' }
    ],
    reviews: [
      { id: 1, userName: '刘**', rating: 5, content: '月嫂阿姨非常专业，把宝宝和我都照顾得很好', time: '2024-01-05', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=11' }
    ]
  }
]

export const mockWorkers = [
  {
    id: 1,
    name: '李师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=worker1',
    category: 'cleaning',
    skills: ['深度保洁', '日常保洁', '玻璃清洁'],
    rating: 4.9,
    orderCount: 568,
    experience: 5,
    description: '从事家政服务5年，经验丰富，干活细致认真，深受客户好评。',
    certificates: ['高级家政服务师', '健康证']
  },
  {
    id: 2,
    name: '王师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=worker2',
    category: 'appliance',
    skills: ['空调清洗', '油烟机清洗', '洗衣机清洗'],
    rating: 4.8,
    orderCount: 420,
    experience: 6,
    description: '家电清洗专家，熟悉各类家电结构，清洗彻底，服务规范。',
    certificates: ['家电清洗技师', '健康证']
  },
  {
    id: 3,
    name: '张师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=worker3',
    category: 'repair',
    skills: ['家电维修', '水电维修', '家具维修'],
    rating: 4.7,
    orderCount: 380,
    experience: 8,
    description: '维修老师傅，技术精湛，能快速定位问题并解决，价格公道。',
    certificates: ['高级维修技师', '电工证']
  },
  {
    id: 4,
    name: '刘阿姨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=worker4',
    category: 'nanny',
    skills: ['月嫂', '育儿嫂', '催乳师'],
    rating: 4.9,
    orderCount: 156,
    experience: 10,
    description: '金牌月嫂，带过近百个宝宝，经验丰富，有爱心有耐心。',
    certificates: ['高级月嫂证', '营养师证', '健康证']
  },
  {
    id: 5,
    name: '陈师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=worker5',
    category: 'moving',
    skills: ['搬家搬运', '家具拆装', '钢琴搬运'],
    rating: 4.6,
    orderCount: 280,
    experience: 7,
    description: '搬家团队负责人，组织协调能力强，保证物品安全。',
    certificates: ['搬运工证', '健康证']
  },
  {
    id: 6,
    name: '赵阿姨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=worker6',
    category: 'elderly',
    skills: ['老人陪护', '康复护理', '营养配餐'],
    rating: 4.8,
    orderCount: 120,
    experience: 6,
    description: '养老护理员，有耐心有爱心，专业护理经验丰富。',
    certificates: ['养老护理员证', '健康证']
  }
]

export const mockPriceRanges = [
  { label: '不限', value: [] },
  { label: '0-50元', value: [0, 50] },
  { label: '50-100元', value: [50, 100] },
  { label: '100-200元', value: [100, 200] },
  { label: '200元以上', value: [200, 10000] }
]

export const mockSortOptions = [
  { label: '综合排序', value: 'default' },
  { label: '距离最近', value: 'distance' },
  { label: '好评优先', value: 'rating' },
  { label: '销量最高', value: 'sales' },
  { label: '价格从低到高', value: 'priceAsc' },
  { label: '价格从高到低', value: 'priceDesc' }
]
