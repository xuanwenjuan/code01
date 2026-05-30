export const mockServices = [
  {
    id: 1,
    name: '普通开锁',
    icon: '🔑',
    price: 80,
    description: '专业技术开启普通房门锁、卧室门锁，不破坏锁体',
    duration: '15-30分钟',
    features: ['无损开启', '快速上门', '24小时服务'],
    priceDetails: [
      { item: '普通木门开锁', price: 80 },
      { item: '防盗门开锁', price: 120 },
      { item: '保险柜开锁', price: 200 }
    ]
  },
  {
    id: 2,
    name: '汽车开锁',
    icon: '🚗',
    price: 150,
    description: '专业汽车锁开启服务，包括车门锁、后备箱锁、点火锁',
    duration: '20-40分钟',
    features: ['专业设备', '不损车漆', '车型全覆盖'],
    priceDetails: [
      { item: '普通轿车开锁', price: 150 },
      { item: 'SUV/MPV开锁', price: 200 },
      { item: '高端车型开锁', price: 300 }
    ]
  },
  {
    id: 3,
    name: '换锁服务',
    icon: '🔒',
    price: 200,
    description: '提供各类锁具更换服务，包括门锁、防盗锁、智能锁',
    duration: '30-60分钟',
    features: ['品牌锁具', '专业安装', '质保一年'],
    priceDetails: [
      { item: '普通锁芯更换', price: 200 },
      { item: '防盗锁芯升级', price: 350 },
      { item: '智能锁安装', price: 500 }
    ]
  },
  {
    id: 4,
    name: '修锁服务',
    icon: '🔧',
    price: 100,
    description: '各类锁具维修，包括门锁、抽屉锁、文件柜锁',
    duration: '20-40分钟',
    features: ['故障排查', '零件更换', '调试优化'],
    priceDetails: [
      { item: '锁体维修', price: 100 },
      { item: '锁芯维修', price: 120 },
      { item: '门把手维修', price: 80 }
    ]
  },
  {
    id: 5,
    name: '智能锁安装',
    icon: '📱',
    price: 300,
    description: '专业安装各类智能门锁，指纹锁、密码锁、人脸识别锁',
    duration: '60-90分钟',
    features: ['专业调试', '使用指导', '售后支持'],
    priceDetails: [
      { item: '指纹锁安装', price: 300 },
      { item: '密码锁安装', price: 280 },
      { item: '人脸识别锁安装', price: 400 }
    ]
  },
  {
    id: 6,
    name: '保险柜服务',
    icon: '🗄️',
    price: 200,
    description: '保险柜开锁、维修、更换密码等专业服务',
    duration: '30-60分钟',
    features: ['技术开启', '密码重置', '保密服务'],
    priceDetails: [
      { item: '保险柜开锁', price: 200 },
      { item: '密码重置', price: 150 },
      { item: '保险柜维修', price: 180 }
    ]
  }
]

export const mockMasters = [
  {
    id: 1,
    name: '张师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
    experience: 15,
    rating: 4.9,
    orders: 1280,
    skills: ['普通开锁', '汽车开锁', '换锁'],
    area: '朝阳区、海淀区',
    description: '从事开锁行业15年，经验丰富，技术精湛'
  },
  {
    id: 2,
    name: '李师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
    experience: 10,
    rating: 4.8,
    orders: 950,
    skills: ['智能锁安装', '修锁', '保险柜服务'],
    area: '东城区、西城区',
    description: '专业智能锁安装技师，熟悉各类品牌智能锁'
  },
  {
    id: 3,
    name: '王师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    experience: 12,
    rating: 4.9,
    orders: 1100,
    skills: ['汽车开锁', '保险柜服务', '换锁'],
    area: '丰台区、大兴区',
    description: '汽车开锁专家，各类车型均可快速开启'
  },
  {
    id: 4,
    name: '刘师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liu',
    experience: 8,
    rating: 4.7,
    orders: 720,
    skills: ['普通开锁', '修锁', '智能锁安装'],
    area: '通州区、顺义区',
    description: '年轻有为的技术骨干，服务态度好'
  }
]

export const mockOrders = [
  {
    id: 'ORD202401150001',
    serviceId: 1,
    serviceName: '普通开锁',
    masterId: 1,
    masterName: '张师傅',
    customerName: '王先生',
    phone: '138****1234',
    address: '北京市朝阳区建国路88号',
    appointmentTime: '2024-01-15 14:30',
    status: 'completed',
    price: 80,
    createTime: '2024-01-15 10:20:00',
    remark: '家门钥匙忘带了'
  },
  {
    id: 'ORD202401140002',
    serviceId: 3,
    serviceName: '换锁服务',
    masterId: 2,
    masterName: '李师傅',
    customerName: '李女士',
    phone: '139****5678',
    address: '北京市海淀区中关村大街1号',
    appointmentTime: '2024-01-14 10:00',
    status: 'completed',
    price: 350,
    createTime: '2024-01-13 16:30:00',
    remark: '升级防盗锁芯'
  },
  {
    id: 'ORD202401160003',
    serviceId: 2,
    serviceName: '汽车开锁',
    masterId: 3,
    masterName: '王师傅',
    customerName: '张先生',
    phone: '137****9012',
    address: '北京市丰台区北京西站',
    appointmentTime: '2024-01-16 09:00',
    status: 'pending',
    price: 150,
    createTime: '2024-01-15 20:15:00',
    remark: '车钥匙锁在车里了'
  },
  {
    id: 'ORD202401160004',
    serviceId: 5,
    serviceName: '智能锁安装',
    masterId: 2,
    masterName: '李师傅',
    customerName: '赵女士',
    phone: '136****3456',
    address: '北京市西城区金融街',
    appointmentTime: '2024-01-16 15:30',
    status: 'confirmed',
    price: 300,
    createTime: '2024-01-15 14:00:00',
    remark: '购买了小米智能锁需要安装'
  }
]

export const mockContactRecords = [
  {
    id: 1,
    masterId: 1,
    masterName: '张师傅',
    phone: '138****1111',
    contactTime: '2024-01-15 14:25:00',
    type: 'phone',
    content: '确认上门时间'
  },
  {
    id: 2,
    masterId: 2,
    masterName: '李师傅',
    phone: '139****2222',
    contactTime: '2024-01-14 09:30:00',
    type: 'phone',
    content: '咨询锁具型号'
  },
  {
    id: 3,
    masterId: 3,
    masterName: '王师傅',
    phone: '137****3333',
    contactTime: '2024-01-13 16:00:00',
    type: 'message',
    content: '发送了位置信息'
  }
]

export const cities = [
  '北京市', '上海市', '广州市', '深圳市', '杭州市',
  '南京市', '成都市', '武汉市', '西安市', '重庆市',
  '天津市', '苏州市', '长沙市', '郑州市', '青岛市'
]
