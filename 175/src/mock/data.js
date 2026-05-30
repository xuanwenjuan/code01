export const cities = [
  { id: 1, name: '北京', pinyin: 'beijing' },
  { id: 2, name: '上海', pinyin: 'shanghai' },
  { id: 3, name: '广州', pinyin: 'guangzhou' },
  { id: 4, name: '深圳', pinyin: 'shenzhen' },
  { id: 5, name: '杭州', pinyin: 'hangzhou' },
  { id: 6, name: '南京', pinyin: 'nanjing' },
  { id: 7, name: '成都', pinyin: 'chengdu' },
  { id: 8, name: '武汉', pinyin: 'wuhan' },
  { id: 9, name: '西安', pinyin: 'xian' },
  { id: 10, name: '重庆', pinyin: 'chongqing' }
]

export const services = [
  {
    id: 1,
    name: '厨房下水道疏通',
    category: '厨房',
    price: 80,
    unit: '次',
    emergencyPrice: 150,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
    description: '专业疏通厨房洗菜池、洗碗池下水道堵塞问题，包括油脂堵塞、食物残渣堵塞等。',
    features: ['专业工具', '30分钟上门', '不通不收费', '售后保障'],
    priceList: [
      { item: '普通疏通', price: 80, desc: '一般性堵塞' },
      { item: '深度疏通', price: 150, desc: '顽固性堵塞' },
      { item: '管道改造', price: 300, desc: '管道损坏需改造' }
    ],
    timeSlots: ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'],
    warranty: '7天',
    rating: 4.8,
    orderCount: 2356
  },
  {
    id: 2,
    name: '马桶疏通',
    category: '卫生间',
    price: 100,
    unit: '次',
    emergencyPrice: 180,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
    description: '专业疏通马桶堵塞，包括纸巾堵塞、硬物堵塞、水垢堵塞等各类问题。',
    features: ['专业设备', '无损疏通', '快速响应', '清洁服务'],
    priceList: [
      { item: '普通疏通', price: 100, desc: '一般性堵塞' },
      { item: '高压疏通', price: 200, desc: '顽固性堵塞' },
      { item: '拆马桶疏通', price: 350, desc: '硬物堵塞需拆卸' }
    ],
    timeSlots: ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'],
    warranty: '7天',
    rating: 4.9,
    orderCount: 3421
  },
  {
    id: 3,
    name: '地漏疏通',
    category: '卫生间',
    price: 60,
    unit: '次',
    emergencyPrice: 120,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    description: '卫生间、阳台地漏疏通，解决头发堵塞、泥沙堵塞等问题。',
    features: ['快速疏通', '防臭处理', '价格透明', '满意付款'],
    priceList: [
      { item: '普通疏通', price: 60, desc: '一般性堵塞' },
      { item: '深度清洁', price: 120, desc: '长期未清理' },
      { item: '地漏更换', price: 180, desc: '地漏损坏需更换' }
    ],
    timeSlots: ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'],
    warranty: '7天',
    rating: 4.7,
    orderCount: 1892
  },
  {
    id: 4,
    name: '主管道疏通',
    category: '主管道',
    price: 200,
    unit: '次',
    emergencyPrice: 350,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    description: '小区主管道、单元主管道疏通，解决整栋楼排水不畅问题。',
    features: ['大型设备', '专业团队', '高效疏通', '定期维护'],
    priceList: [
      { item: '高压清洗', price: 200, desc: '普通堵塞' },
      { item: '吸污车作业', price: 500, desc: '严重堵塞' },
      { item: '管道检测', price: 800, desc: '管道内部检测' }
    ],
    timeSlots: ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'],
    warranty: '30天',
    rating: 4.9,
    orderCount: 567
  },
  {
    id: 5,
    name: '洗菜池疏通',
    category: '厨房',
    price: 70,
    unit: '次',
    emergencyPrice: 130,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    description: '厨房洗菜池、水槽疏通，解决油污、食物残渣造成的堵塞。',
    features: ['食品级清洁剂', '不伤管道', '快速上门', '售后无忧'],
    priceList: [
      { item: '普通疏通', price: 70, desc: '一般性堵塞' },
      { item: '油污溶解', price: 140, desc: '重度油污堵塞' },
      { item: '管道保养', price: 200, desc: '定期保养服务' }
    ],
    timeSlots: ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'],
    warranty: '7天',
    rating: 4.8,
    orderCount: 2134
  },
  {
    id: 6,
    name: '浴缸疏通',
    category: '卫生间',
    price: 90,
    unit: '次',
    emergencyPrice: 160,
    image: 'https://images.unsplash.com/photo-1567941875985-fa52c8c7b0c4?w=400&h=300&fit=crop',
    description: '浴缸、淋浴房疏通，解决头发、肥皂垢等造成的排水不畅。',
    features: ['专业工具', '表面保护', '快速解决', '清洁还原'],
    priceList: [
      { item: '普通疏通', price: 90, desc: '一般性堵塞' },
      { item: '深度疏通', price: 180, desc: '顽固性堵塞' },
      { item: '淋浴房改造', price: 500, desc: '排水系统改造' }
    ],
    timeSlots: ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'],
    warranty: '7天',
    rating: 4.7,
    orderCount: 1256
  }
]

export const orders = [
  {
    id: 1001,
    orderNo: 'ORD202405150001',
    serviceId: 1,
    serviceName: '厨房下水道疏通',
    serviceImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
    userName: '张三',
    userPhone: '13800138001',
    address: '北京市朝阳区建国路88号',
    appointmentTime: '2024-05-16 10:00-12:00',
    price: 80,
    status: 2,
    statusText: '已完成',
    createTime: '2024-05-15 14:30:00',
    masterName: '李师傅',
    masterPhone: '13900139001',
    remark: '厨房洗菜池下水慢',
    feedback: {
      rating: 5,
      content: '师傅很专业，很快就疏通好了，服务态度也很好！',
      createTime: '2024-05-16 12:30:00'
    }
  },
  {
    id: 1002,
    orderNo: 'ORD202405140002',
    serviceId: 2,
    serviceName: '马桶疏通',
    serviceImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
    userName: '李四',
    userPhone: '13800138002',
    address: '北京市海淀区中关村大街1号',
    appointmentTime: '2024-05-15 14:00-16:00',
    price: 100,
    status: 1,
    statusText: '服务中',
    createTime: '2024-05-14 09:20:00',
    masterName: '王师傅',
    masterPhone: '13900139002',
    remark: '马桶堵了，冲不下去'
  },
  {
    id: 1003,
    orderNo: 'ORD202405130003',
    serviceId: 3,
    serviceName: '地漏疏通',
    serviceImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    userName: '王五',
    userPhone: '13800138003',
    address: '北京市西城区金融街15号',
    appointmentTime: '2024-05-14 08:00-10:00',
    price: 60,
    status: 0,
    statusText: '待接单',
    createTime: '2024-05-13 18:45:00',
    remark: '卫生间地漏反味严重'
  }
]

export const masters = [
  {
    id: 1,
    name: '李师傅',
    phone: '13900139001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    skill: ['马桶疏通', '下水道疏通', '管道维修'],
    experience: 8,
    rating: 4.9,
    orderCount: 1256,
    status: 'online'
  },
  {
    id: 2,
    name: '王师傅',
    phone: '13900139002',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    skill: ['主管道疏通', '高压清洗', '管道检测'],
    experience: 12,
    rating: 4.8,
    orderCount: 2341,
    status: 'online'
  },
  {
    id: 3,
    name: '张师傅',
    phone: '13900139003',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    skill: ['地漏疏通', '浴缸疏通', '防臭处理'],
    experience: 6,
    rating: 4.7,
    orderCount: 892,
    status: 'busy'
  }
]

export const mockUsers = [
  {
    id: 1,
    username: 'user',
    password: '123456',
    phone: '13800138000',
    role: 'user',
    name: '普通用户',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  {
    id: 2,
    username: 'master',
    password: '123456',
    phone: '13900139000',
    role: 'master',
    name: '李师傅',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
  }
]
