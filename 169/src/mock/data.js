const categoryIcons = {
  ac: '❄️',
  fridge: '🧊',
  washer: '🧺',
  tv: '📺',
  water: '🚿',
  kitchen: '🍳',
  small: '🔌',
  install: '🔧'
}

const colors = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16']

export const categories = [
  { id: 'ac', name: '空调维修', icon: categoryIcons.ac },
  { id: 'fridge', name: '冰箱维修', icon: categoryIcons.fridge },
  { id: 'washer', name: '洗衣机维修', icon: categoryIcons.washer },
  { id: 'tv', name: '电视维修', icon: categoryIcons.tv },
  { id: 'water', name: '热水器维修', icon: categoryIcons.water },
  { id: 'kitchen', name: '厨房家电', icon: categoryIcons.kitchen },
  { id: 'small', name: '小家电维修', icon: categoryIcons.small },
  { id: 'install', name: '家电安装', icon: categoryIcons.install }
]

export const banners = [
  { id: 1, color: colors[0], title: '夏季空调维修特惠', subtitle: '专业师傅上门，立享8折优惠' },
  { id: 2, color: colors[1], title: '新用户专享', subtitle: '首单立减50元' },
  { id: 3, color: colors[2], title: '品质保障', subtitle: '30天质保，维修无忧' }
]

export const services = [
  {
    id: 1,
    name: '空调不制冷维修',
    category: 'ac',
    price: 199,
    originalPrice: 299,
    rating: 4.9,
    reviewCount: 328,
    sales: 1256,
    distance: 1.2,
    shopName: '诚信家电维修中心',
    address: '朝阳区建国路88号',
    color: colors[0],
    description: '专业空调维修，10年经验师傅上门服务，快速解决不制冷、漏水、异响等问题。',
    features: ['免费上门检测', '30天质保', '原厂配件', '明码标价'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: '加氟', price: 150 },
      { name: '清洗', price: 80 },
      { name: '更换压缩机', price: 800 },
      { name: '更换电路板', price: 300 }
    ],
    reviews: [
      { id: 1, user: '张**', rating: 5, content: '师傅很专业，很快就修好了，价格也公道', time: '2024-01-15' },
      { id: 2, user: '李**', rating: 4, content: '服务态度很好，就是稍微有点贵', time: '2024-01-10' }
    ],
    technicianId: 1
  },
  {
    id: 2,
    name: '冰箱不制冷维修',
    category: 'fridge',
    price: 259,
    originalPrice: 359,
    rating: 4.8,
    reviewCount: 256,
    sales: 892,
    distance: 2.5,
    shopName: '快修家电服务部',
    address: '海淀区中关村大街1号',
    color: colors[1],
    description: '冰箱维修专家，解决不制冷、不启动、噪音大等常见问题，上门检测维修。',
    features: ['24小时服务', '免费检测', '质保90天', '价格透明'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: '加氟', price: 200 },
      { name: '更换温控器', price: 150 },
      { name: '更换压缩机', price: 1000 },
      { name: '门封条更换', price: 80 }
    ],
    reviews: [
      { id: 1, user: '王**', rating: 5, content: '修完冰箱又能用了，师傅技术很好', time: '2024-01-12' }
    ],
    technicianId: 2
  },
  {
    id: 3,
    name: '洗衣机故障维修',
    category: 'washer',
    price: 149,
    originalPrice: 249,
    rating: 4.7,
    reviewCount: 189,
    sales: 654,
    distance: 0.8,
    shopName: '便民家电维修',
    address: '西城区西单北大街120号',
    color: colors[2],
    description: '洗衣机维修服务，专业解决不脱水、不进水、噪音大、漏水等问题。',
    features: ['快速响应', '免费检测', '30天质保', '不乱收费'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: '更换皮带', price: 100 },
      { name: '更换电机', price: 400 },
      { name: '更换电脑板', price: 350 },
      { name: '疏通排水管', price: 80 }
    ],
    reviews: [
      { id: 1, user: '赵**', rating: 5, content: '师傅很有耐心，讲解很清楚', time: '2024-01-08' }
    ],
    technicianId: 3
  },
  {
    id: 4,
    name: '电视无信号维修',
    category: 'tv',
    price: 189,
    originalPrice: 289,
    rating: 4.6,
    reviewCount: 145,
    sales: 423,
    distance: 3.1,
    shopName: '专业电视维修中心',
    address: '东城区王府井大街50号',
    color: colors[3],
    description: '电视维修专家，解决无信号、黑屏、花屏、不开机等问题，品牌全系列维修。',
    features: ['品牌授权', '原厂配件', '90天质保', '免费检测'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: '更换主板', price: 500 },
      { name: '更换电源板', price: 300 },
      { name: '更换背光', price: 400 },
      { name: '系统维护', price: 100 }
    ],
    reviews: [
      { id: 1, user: '刘**', rating: 4, content: '修好了，服务还不错', time: '2024-01-05' }
    ],
    technicianId: 4
  },
  {
    id: 5,
    name: '热水器故障维修',
    category: 'water',
    price: 219,
    originalPrice: 319,
    rating: 4.8,
    reviewCount: 210,
    sales: 567,
    distance: 1.5,
    shopName: '安心家电维修',
    address: '丰台区方庄路10号',
    color: colors[4],
    description: '热水器维修服务，解决不加热、漏水、漏电、点火失败等问题，安全第一。',
    features: ['安全保障', '持证上岗', '30天质保', '免费检测'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: '更换加热管', price: 200 },
      { name: '更换温控器', price: 150 },
      { name: '更换镁棒', price: 100 },
      { name: '清洗内胆', price: 120 }
    ],
    reviews: [],
    technicianId: 5
  },
  {
    id: 6,
    name: '油烟机清洗维修',
    category: 'kitchen',
    price: 129,
    originalPrice: 199,
    rating: 4.9,
    reviewCount: 456,
    sales: 1890,
    distance: 0.5,
    shopName: '洁净家电服务',
    address: '朝阳区国贸附近',
    color: colors[5],
    description: '油烟机深度清洗，去除顽固油污，同时检修故障，让油烟机焕然一新。',
    features: ['深度清洗', '去污杀菌', '30天质保', '价格透明'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: '深度清洗', price: 129 },
      { name: '更换电机', price: 300 },
      { name: '更换开关', price: 80 },
      { name: '更换油杯', price: 30 }
    ],
    reviews: [
      { id: 1, user: '陈**', rating: 5, content: '洗得很干净，像新的一样', time: '2024-01-18' }
    ],
    technicianId: 6
  },
  {
    id: 7,
    name: '微波炉维修',
    category: 'small',
    price: 99,
    originalPrice: 159,
    rating: 4.5,
    reviewCount: 98,
    sales: 234,
    distance: 2.8,
    shopName: '小家电维修中心',
    address: '海淀区五道口',
    color: colors[6],
    description: '微波炉专业维修，解决不加热、转盘不转、按键失灵等问题。',
    features: ['快速维修', '免费检测', '30天质保', '原厂配件'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: '更换磁控管', price: 200 },
      { name: '更换高压保险', price: 80 },
      { name: '更换转盘电机', price: 100 },
      { name: '更换控制面板', price: 150 }
    ],
    reviews: [],
    technicianId: 7
  },
  {
    id: 8,
    name: '空调安装服务',
    category: 'install',
    price: 199,
    originalPrice: 299,
    rating: 4.9,
    reviewCount: 567,
    sales: 2345,
    distance: 1.0,
    shopName: '专业安装团队',
    address: '朝阳区三里屯',
    color: colors[7],
    description: '专业空调安装、移机、拆机服务，持证上岗，安全可靠。',
    features: ['持证上岗', '安全作业', '一年质保', '免费送货'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: '挂机安装', price: 199 },
      { name: '柜机安装', price: 299 },
      { name: '移机', price: 299 },
      { name: '拆机', price: 100 }
    ],
    reviews: [
      { id: 1, user: '周**', rating: 5, content: '安装师傅很专业，干活干净利落', time: '2024-01-20' }
    ],
    technicianId: 8
  },
  {
    id: 9,
    name: '空调加氟服务',
    category: 'ac',
    price: 150,
    originalPrice: 200,
    rating: 4.8,
    reviewCount: 389,
    sales: 1567,
    distance: 1.8,
    shopName: '诚信家电维修中心',
    address: '朝阳区建国路88号',
    color: colors[0],
    description: '空调加氟服务，使用环保冷媒，让空调制冷效果更佳。',
    features: ['环保冷媒', '价格透明', '30天质保', '快速上门'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: 'R22冷媒', price: 50 },
      { name: 'R410A冷媒', price: 80 },
      { name: 'R32冷媒', price: 100 },
      { name: '检漏', price: 50 }
    ],
    reviews: [],
    technicianId: 1
  },
  {
    id: 10,
    name: '冰箱除冰清洗',
    category: 'fridge',
    price: 89,
    originalPrice: 129,
    rating: 4.7,
    reviewCount: 156,
    sales: 789,
    distance: 2.2,
    shopName: '快修家电服务部',
    address: '海淀区中关村大街1号',
    color: colors[1],
    description: '冰箱深度除冰清洗，去除异味，消毒杀菌，延长冰箱使用寿命。',
    features: ['深度清洁', '杀菌消毒', '去除异味', '价格实惠'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: '深度清洗', price: 89 },
      { name: '杀菌消毒', price: 30 },
      { name: '更换密封条', price: 80 },
      { name: '门体调整', price: 50 }
    ],
    reviews: [],
    technicianId: 2
  },
  {
    id: 11,
    name: '洗衣机清洗',
    category: 'washer',
    price: 99,
    originalPrice: 149,
    rating: 4.6,
    reviewCount: 234,
    sales: 1234,
    distance: 1.3,
    shopName: '便民家电维修',
    address: '西城区西单北大街120号',
    color: colors[2],
    description: '洗衣机内筒深度清洗，去除污垢细菌，让洗衣更干净卫生。',
    features: ['深度清洁', '杀菌除螨', '30天质保', '价格透明'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: '免拆清洗', price: 99 },
      { name: '深度拆洗', price: 199 },
      { name: '槽清洗剂', price: 30 },
      { name: '消毒处理', price: 30 }
    ],
    reviews: [],
    technicianId: 3
  },
  {
    id: 12,
    name: '电视安装挂架',
    category: 'tv',
    price: 129,
    originalPrice: 199,
    rating: 4.8,
    reviewCount: 345,
    sales: 890,
    distance: 2.0,
    shopName: '专业电视维修中心',
    address: '东城区王府井大街50号',
    color: colors[3],
    description: '专业电视挂架安装，各种型号通用，安全稳固，美观大方。',
    features: ['安全稳固', '水平精准', '隐藏走线', '一年质保'],
    process: [
      { step: 1, title: '在线预约', desc: '选择服务类型和时间' },
      { step: 2, title: '师傅上门', desc: '专业师傅准时到达' },
      { step: 3, title: '检测报价', desc: '检测问题并给出报价' },
      { step: 4, title: '维修服务', desc: '确认后开始维修' },
      { step: 5, title: '验收付款', desc: '满意后再付款' }
    ],
    priceList: [
      { name: '普通挂架', price: 129 },
      { name: '伸缩挂架', price: 299 },
      { name: '32-55寸安装', price: 129 },
      { name: '55寸以上安装', price: 199 }
    ],
    reviews: [],
    technicianId: 4
  }
]

export const technicians = [
  {
    id: 1,
    name: '张师傅',
    color: colors[0],
    category: 'ac',
    experience: 12,
    rating: 4.9,
    orders: 2345,
    skills: ['空调维修', '空调安装', '空调加氟'],
    description: '12年空调维修经验，曾在多家品牌售后担任技术主管',
    certifications: ['高级制冷设备维修工', '空调安装上岗证']
  },
  {
    id: 2,
    name: '李师傅',
    color: colors[1],
    category: 'fridge',
    experience: 10,
    rating: 4.8,
    orders: 1890,
    skills: ['冰箱维修', '冰柜维修', '制冷设备维修'],
    description: '10年冰箱维修经验，精通各类冰箱故障诊断与维修',
    certifications: ['制冷设备维修工中级']
  },
  {
    id: 3,
    name: '王师傅',
    color: colors[2],
    category: 'washer',
    experience: 8,
    rating: 4.7,
    orders: 1567,
    skills: ['洗衣机维修', '烘干机维修'],
    description: '8年洗衣机维修经验，熟悉各大品牌洗衣机维修',
    certifications: ['家用电器维修工中级']
  },
  {
    id: 4,
    name: '赵师傅',
    color: colors[3],
    category: 'tv',
    experience: 15,
    rating: 4.9,
    orders: 2567,
    skills: ['电视维修', '电视安装', '家庭影院调试'],
    description: '15年电视维修经验，曾任职于知名电视品牌售后',
    certifications: ['高级家电维修技师']
  },
  {
    id: 5,
    name: '刘师傅',
    color: colors[4],
    category: 'water',
    experience: 9,
    rating: 4.8,
    orders: 1456,
    skills: ['热水器维修', '太阳能维修', '燃气具维修'],
    description: '9年热水器维修经验，持证上岗，安全第一',
    certifications: ['燃气具安装维修工', '电工证']
  },
  {
    id: 6,
    name: '陈师傅',
    color: colors[5],
    category: 'kitchen',
    experience: 7,
    rating: 4.9,
    orders: 1234,
    skills: ['油烟机维修', '燃气灶维修', '洗碗机维修'],
    description: '7年厨房家电维修经验，深度清洁专家',
    certifications: ['家用电器维修工']
  },
  {
    id: 7,
    name: '周师傅',
    color: colors[6],
    category: 'small',
    experience: 6,
    rating: 4.6,
    orders: 987,
    skills: ['微波炉维修', '电磁炉维修', '电饭煲维修'],
    description: '6年小家电维修经验，小问题专家',
    certifications: ['家用电器维修工初级']
  },
  {
    id: 8,
    name: '吴师傅',
    color: colors[7],
    category: 'install',
    experience: 11,
    rating: 4.9,
    orders: 2134,
    skills: ['空调安装', '热水器安装', '家电移机'],
    description: '11年家电安装经验，高空作业专家',
    certifications: ['高空作业证', '空调安装上岗证']
  }
]

export const promotions = [
  { id: 1, title: '首单立减', subtitle: '新用户专享', discount: 50, minAmount: 100, color: colors[0], expiry: '2024-12-31' },
  { id: 2, title: '夏季特惠', subtitle: '空调服务', discount: 30, minAmount: 150, color: colors[1], expiry: '2024-08-31' },
  { id: 3, title: '满减优惠', subtitle: '全场通用', discount: 20, minAmount: 200, color: colors[2], expiry: '2024-12-31' },
  { id: 4, title: '会员专享', subtitle: '9折优惠', discount: '10%', minAmount: 0, color: colors[3], expiry: '2024-12-31' }
]

export const timeSlots = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00'
]
