export const cities = [
  '北京市', '上海市', '广州市', '深圳市', '杭州市',
  '成都市', '重庆市', '武汉市', '西安市', '南京市',
  '苏州市', '天津市', '郑州市', '长沙市', '东莞市'
]

export const services = [
  {
    id: 1,
    name: '空调清洗',
    icon: 'SnowflakeOutlined',
    description: '专业深度清洗，除菌除异味',
    price: 99,
    originalPrice: 159,
    duration: '约60分钟',
    tags: ['深度清洁', '杀菌消毒', '环保试剂'],
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
    detail: {
      features: [
        '整机深度拆卸清洗',
        '蒸发器、风轮、过滤网全面清洁',
        '专业除菌剂消毒杀菌',
        '外机外壳清洁保养',
        '检测运行状态'
      ],
      priceList: [
        { type: '壁挂式空调', price: 99 },
        { type: '柜式空调', price: 149 },
        { type: '中央空调风口', price: 79 },
        { type: '空调加氟', price: 120 }
      ],
      process: [
        { step: 1, title: '上门检查', desc: '师傅上门检查空调状况' },
        { step: 2, title: '防护措施', desc: '做好周围物品防护' },
        { step: 3, title: '拆卸清洗', desc: '拆卸零部件深度清洗' },
        { step: 4, title: '消毒除菌', desc: '专业消毒除菌处理' },
        { step: 5, title: '安装调试', desc: '安装复原并调试运行' },
        { step: 6, title: '清洁现场', desc: '清洁作业现场' }
      ]
    }
  },
  {
    id: 2,
    name: '油烟机清洗',
    icon: 'FireOutlined',
    description: '去除顽固油污，恢复如新',
    price: 129,
    originalPrice: 199,
    duration: '约90分钟',
    tags: ['去重油污', '高温蒸汽', '机芯保养'],
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    detail: {
      features: [
        '整机拆卸深度清洁',
        '高温蒸汽溶解油污',
        '风轮、蜗壳、滤网全面清洗',
        '集油盒清理',
        '外观抛光保养'
      ],
      priceList: [
        { type: '中式油烟机', price: 129 },
        { type: '欧式油烟机', price: 159 },
        { type: '侧吸式油烟机', price: 149 },
        { type: '集成灶清洗', price: 299 }
      ],
      process: [
        { step: 1, title: '断电检查', desc: '断电并检查设备状态' },
        { step: 2, title: '拆卸部件', desc: '拆卸可清洗零部件' },
        { step: 3, title: '浸泡清洗', desc: '专用清洁剂浸泡清洗' },
        { step: 4, title: '高温蒸汽', desc: '高温蒸汽深度除油' },
        { step: 5, title: '安装复原', desc: '安装所有零部件' },
        { step: 6, title: '试机验收', desc: '通电试机确认正常' }
      ]
    }
  },
  {
    id: 3,
    name: '冰箱清洗',
    icon: 'ThunderboltOutlined',
    description: '彻底清洁除菌，去除异味',
    price: 89,
    originalPrice: 139,
    duration: '约45分钟',
    tags: ['杀菌除臭', '深度清洁', '环保无毒'],
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop',
    detail: {
      features: [
        '内外全面深度清洁',
        '密封条、抽屉等死角清理',
        '专业除菌剂消毒',
        '除臭除异味处理',
        '检测运行状态'
      ],
      priceList: [
        { type: '单门冰箱', price: 89 },
        { type: '双门冰箱', price: 119 },
        { type: '三门冰箱', price: 149 },
        { type: '对开门冰箱', price: 199 }
      ],
      process: [
        { step: 1, title: '断电准备', desc: '断电并取出食物' },
        { step: 2, title: '拆卸部件', desc: '取出搁架、抽屉等部件' },
        { step: 3, title: '内外清洁', desc: '冰箱内外全面清洁' },
        { step: 4, title: '消毒除菌', desc: '专业消毒除菌处理' },
        { step: 5, title: '除味处理', desc: '去除冰箱异味' },
        { step: 6, title: '复原验收', desc: '部件归位并通电验收' }
      ]
    }
  },
  {
    id: 4,
    name: '洗衣机清洗',
    icon: 'ClearOutlined',
    description: '去除内筒污垢，呵护健康',
    price: 109,
    originalPrice: 169,
    duration: '约60分钟',
    tags: ['内筒清洁', '杀菌除螨', '排污除垢'],
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=300&fit=crop',
    detail: {
      features: [
        '内筒深度拆卸清洗',
        '去除筒壁顽固污垢',
        '杀菌除螨处理',
        '进水口、出水口清洁',
        '检测运行状态'
      ],
      priceList: [
        { type: '波轮洗衣机', price: 109 },
        { type: '滚筒洗衣机', price: 139 },
        { type: '洗烘一体机', price: 179 },
        { type: '免拆洗', price: 79 }
      ],
      process: [
        { step: 1, title: '断电断水', desc: '断电断水做好准备' },
        { step: 2, title: '拆卸内筒', desc: '拆卸内筒进行清洗' },
        { step: 3, title: '深度清洁', desc: '全面清洁内筒外壁' },
        { step: 4, title: '消毒杀菌', desc: '专业消毒杀菌处理' },
        { step: 5, title: '安装复原', desc: '安装所有零部件' },
        { step: 6, title: '试机验收', desc: '通水试机确认正常' }
      ]
    }
  },
  {
    id: 5,
    name: '热水器清洗',
    icon: 'HeatMapOutlined',
    description: '清除水垢，提升加热效率',
    price: 99,
    originalPrice: 149,
    duration: '约50分钟',
    tags: ['除水垢', '提升能效', '延长寿命'],
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
    detail: {
      features: [
        '内胆深度除水垢',
        '加热管清洁保养',
        '更换镁棒（可选）',
        '检测加热效率',
        '安全隐患排查'
      ],
      priceList: [
        { type: '电热水器(40L)', price: 99 },
        { type: '电热水器(60L)', price: 129 },
        { type: '电热水器(80L)', price: 159 },
        { type: '燃气热水器', price: 149 }
      ],
      process: [
        { step: 1, title: '断电断水', desc: '断电断水做好安全防护' },
        { step: 2, title: '排水处理', desc: '排空热水器内积水' },
        { step: 3, title: '拆卸清洗', desc: '拆卸加热管等部件' },
        { step: 4, title: '除垢清洁', desc: '清除内胆水垢' },
        { step: 5, title: '安装复原', desc: '安装所有零部件' },
        { step: 6, title: '试机验收', desc: '通水试机确认正常' }
      ]
    }
  },
  {
    id: 6,
    name: '微波炉清洗',
    icon: 'ToTopOutlined',
    description: '去除油污异味，安全使用',
    price: 69,
    originalPrice: 99,
    duration: '约30分钟',
    tags: ['快速清洁', '去油污', '消毒杀菌'],
    image: 'https://images.unsplash.com/photo-1574269910231-bc508bcb1b36?w=400&h=300&fit=crop',
    detail: {
      features: [
        '内腔全面清洁',
        '去除顽固油污',
        '玻璃门擦拭',
        '转盘、支架清洗',
        '外部清洁保养'
      ],
      priceList: [
        { type: '台式微波炉', price: 69 },
        { type: '嵌入式微波炉', price: 99 },
        { type: '微蒸烤一体机', price: 149 }
      ],
      process: [
        { step: 1, title: '断电准备', desc: '断电并待冷却' },
        { step: 2, title: '拆卸部件', desc: '取出转盘、支架' },
        { step: 3, title: '蒸汽软化', desc: '蒸汽软化油污' },
        { step: 4, title: '内外清洁', desc: '内外全面清洁' },
        { step: 5, title: '消毒处理', desc: '消毒杀菌处理' },
        { step: 6, title: '复原验收', desc: '部件归位验收' }
      ]
    }
  }
]

export const packages = [
  {
    id: 101,
    name: '全屋家电清洗套餐',
    description: '空调+油烟机+冰箱+洗衣机一站式清洗',
    price: 399,
    originalPrice: 596,
    save: 197,
    services: [1, 2, 3, 4],
    hot: true,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=300&fit=crop'
  },
  {
    id: 102,
    name: '厨房电器清洁套餐',
    description: '油烟机+冰箱+微波炉深度清洁',
    price: 259,
    originalPrice: 367,
    save: 108,
    services: [2, 3, 6],
    hot: false,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&h=300&fit=crop'
  },
  {
    id: 103,
    name: '空调深度清洗套餐',
    description: '全屋空调清洗（3台以内）',
    price: 249,
    originalPrice: 297,
    save: 48,
    services: [1],
    hot: true,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=300&fit=crop'
  },
  {
    id: 104,
    name: '卫浴电器清洁套餐',
    description: '洗衣机+热水器全面清洁',
    price: 189,
    originalPrice: 248,
    save: 59,
    services: [4, 5],
    hot: false,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=300&fit=crop'
  }
]

export const workers = [
  {
    id: 1001,
    name: '张师傅',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    skills: ['空调清洗', '油烟机清洗', '冰箱清洗'],
    rating: 4.9,
    orders: 1256,
    experience: '8年',
    phone: '138****1234'
  },
  {
    id: 1002,
    name: '李师傅',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    skills: ['洗衣机清洗', '热水器清洗', '空调清洗'],
    rating: 4.8,
    orders: 986,
    experience: '6年',
    phone: '139****5678'
  },
  {
    id: 1003,
    name: '王师傅',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    skills: ['油烟机清洗', '微波炉清洗', '冰箱清洗'],
    rating: 4.9,
    orders: 1123,
    experience: '7年',
    phone: '137****9012'
  },
  {
    id: 1004,
    name: '赵师傅',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    skills: ['热水器清洗', '洗衣机清洗', '空调清洗'],
    rating: 4.7,
    orders: 845,
    experience: '5年',
    phone: '136****3456'
  }
]

export const mockOrders = [
  {
    id: 'ORD20240101001',
    serviceId: 1,
    serviceName: '空调清洗',
    serviceType: '壁挂式空调',
    price: 99,
    status: 'completed',
    createTime: '2024-01-01 10:30:00',
    appointmentTime: '2024-01-02 14:00:00',
    completeTime: '2024-01-02 15:10:00',
    address: '北京市朝阳区建国路88号SOHO现代城A座1001',
    phone: '138****1234',
    remark: '请带好鞋套',
    worker: workers[0],
    review: {
      rating: 5,
      content: '师傅很专业，清洗得很干净，服务态度也很好，下次还会光顾！',
      images: [],
      createTime: '2024-01-03 09:15:00'
    }
  },
  {
    id: 'ORD20240105002',
    serviceId: 2,
    serviceName: '油烟机清洗',
    serviceType: '侧吸式油烟机',
    price: 149,
    status: 'completed',
    createTime: '2024-01-05 14:20:00',
    appointmentTime: '2024-01-06 09:00:00',
    completeTime: '2024-01-06 10:45:00',
    address: '北京市海淀区中关村大街1号科技大厦B座2002',
    phone: '138****1234',
    remark: '',
    worker: workers[2],
    review: {
      rating: 4,
      content: '清洗效果不错，师傅准时到达，就是稍微有点慢。',
      images: [],
      createTime: '2024-01-07 10:30:00'
    }
  },
  {
    id: 'ORD20240110003',
    serviceId: 1,
    serviceName: '空调清洗',
    serviceType: '柜式空调',
    price: 149,
    status: 'pending',
    createTime: '2024-01-10 09:15:00',
    appointmentTime: '2024-01-12 15:00:00',
    completeTime: null,
    address: '北京市西城区金融街15号鑫茂大厦C座503',
    phone: '138****1234',
    remark: '下午3点后有空',
    worker: workers[1],
    review: null
  },
  {
    id: 'ORD20240112004',
    serviceId: 3,
    serviceName: '冰箱清洗',
    serviceType: '双门冰箱',
    price: 119,
    status: 'in_progress',
    createTime: '2024-01-12 11:30:00',
    appointmentTime: '2024-01-13 10:00:00',
    completeTime: null,
    address: '北京市东城区王府井大街138号新东安市场办公楼8层',
    phone: '138****1234',
    remark: '',
    worker: workers[3],
    review: null
  }
]

export const timeSlots = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
  '18:00-19:00', '19:00-20:00', '20:00-21:00'
]

export const banners = [
  {
    id: 1,
    title: '新春家电清洁特惠',
    subtitle: '全场满200减50，限时抢购！',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=400&fit=crop'
  },
  {
    id: 2,
    title: '新用户专享',
    subtitle: '首单立减30元，扫码立领优惠券',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=400&fit=crop'
  },
  {
    id: 3,
    title: '会员日特惠',
    subtitle: '每周三会员享8折优惠',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop'
  }
]
