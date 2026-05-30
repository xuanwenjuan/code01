export const mockCategories = [
  { id: 1, name: '旁轴相机', icon: 'Camera', description: '经典旁轴取景，适合街拍' },
  { id: 2, name: '单反相机', icon: 'VideoCamera', description: '专业级画质，可换镜头' },
  { id: 3, name: '双反相机', icon: 'Picture', description: '中画幅复古之选' },
  { id: 4, name: '傻瓜相机', icon: 'MagicStick', description: '操作简单，随身携带' },
  { id: 5, name: '大画幅相机', icon: 'Grid', description: '极致画质，专业摄影' },
  { id: 6, name: '半格相机', icon: 'Tickets', description: '双倍乐趣，文艺青年最爱' }
]

export const mockCameras = [
  {
    id: 1,
    name: 'Leica M3',
    brand: 'Leica',
    categoryId: 1,
    price: 28800,
    originalPrice: 32000,
    condition: 'excellent',
    description: '徕卡M3是徕卡历史上最经典的旁轴相机之一，1954年推出，被誉为旁轴之王。全机械结构，做工精湛，是收藏家和摄影爱好者的梦寐以求之物。',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'
    ],
    parameters: {
      type: '旁轴胶片相机',
      format: '35mm',
      lensMount: '徕卡M卡口',
      shutterSpeed: '1s - 1/1000s',
      isoRange: '25 - 1600',
      weight: '580g',
      dimensions: '138 x 77 x 38mm',
      year: '1954-1966'
    },
    packages: [
      { id: 1, name: '标准版', price: 0, items: ['机身', '机身盖', '背带'] },
      { id: 2, name: '套餐一', price: 2000, items: ['机身', 'Summicron 50mm f/2镜头', 'UV镜', '相机包'] },
      { id: 3, name: '套餐二', price: 5000, items: ['机身', 'Summilux 35mm f/1.4镜头', '遮光罩', 'UV镜', '专业相机包', '测光表'] }
    ],
    stock: 3,
    views: 2568,
    sales: 128,
    isHot: true,
    merchantId: 1,
    merchantName: '经典相机行',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Canon AE-1',
    brand: 'Canon',
    categoryId: 2,
    price: 3200,
    originalPrice: 3800,
    condition: 'good',
    description: '佳能AE-1是1976年推出的经典单反相机，是第一款采用微处理器控制的单反相机。操作简单，适合胶片摄影入门。',
    images: [
      'https://images.unsplash.com/photo-1495707903217-d65367864e30?w=400'
    ],
    parameters: {
      type: '35mm单反相机',
      format: '35mm',
      lensMount: '佳能FD卡口',
      shutterSpeed: '2s - 1/1000s',
      isoRange: '25 - 3200',
      weight: '590g',
      dimensions: '141 x 87 x 48mm',
      year: '1976-1984'
    },
    packages: [
      { id: 1, name: '标准版', price: 0, items: ['机身', '机身盖', '电池'] },
      { id: 2, name: '套餐一', price: 800, items: ['机身', '50mm f/1.8镜头', 'UV镜', '相机包'] }
    ],
    stock: 8,
    views: 1892,
    sales: 256,
    isHot: true,
    merchantId: 2,
    merchantName: '胶片时光',
    createdAt: '2024-02-20T10:00:00Z'
  },
  {
    id: 3,
    name: 'Rolleiflex 2.8F',
    brand: 'Rollei',
    categoryId: 3,
    price: 15800,
    originalPrice: 18000,
    condition: 'excellent',
    description: '禄莱双反相机的巅峰之作，2.8F配备80mm f/2.8 Planar镜头，是中画幅双反的代名词，成像画质优异。',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'
    ],
    parameters: {
      type: '双反中画幅相机',
      format: '120中画幅',
      lens: 'Carl Zeiss Planar 80mm f/2.8',
      shutterSpeed: '1s - 1/500s',
      isoRange: '25 - 6400',
      weight: '1180g',
      dimensions: '145 x 100 x 105mm',
      year: '1960-1981'
    },
    packages: [
      { id: 1, name: '标准版', price: 0, items: ['机身', '镜头盖', '背带', '遮光罩'] },
      { id: 2, name: '套餐一', price: 1500, items: ['机身', '原装皮套', 'UV镜', '120胶卷x5', '测光表'] }
    ],
    stock: 2,
    views: 2145,
    sales: 68,
    isHot: true,
    merchantId: 1,
    merchantName: '经典相机行',
    createdAt: '2024-01-25T10:00:00Z'
  },
  {
    id: 4,
    name: 'Olympus mju-II',
    brand: 'Olympus',
    categoryId: 4,
    price: 1800,
    originalPrice: 2200,
    condition: 'good',
    description: '奥林巴斯u2是最受欢迎的傻瓜相机之一，配备35mm f/2.8镜头，画质出色，便携性极佳，是街拍神器。',
    images: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400'
    ],
    parameters: {
      type: '便携式傻瓜相机',
      format: '35mm',
      lens: '35mm f/2.8',
      shutterSpeed: '4s - 1/1000s',
      isoRange: '50 - 3200',
      weight: '185g',
      dimensions: '108 x 59 x 36mm',
      year: '1997-2003'
    },
    packages: [
      { id: 1, name: '标准版', price: 0, items: ['机身', '电池', '手绳'] },
      { id: 2, name: '套餐一', price: 300, items: ['机身', '电池x2', '相机套', '35mm胶卷x3'] }
    ],
    stock: 12,
    views: 3256,
    sales: 428,
    isHot: true,
    merchantId: 3,
    merchantName: '复古相机馆',
    createdAt: '2024-03-10T10:00:00Z'
  },
  {
    id: 5,
    name: 'Nikon F3',
    brand: 'Nikon',
    categoryId: 2,
    price: 4500,
    originalPrice: 5200,
    condition: 'excellent',
    description: '尼康F3是专业级胶片单反的代表，1980年推出，被众多专业摄影师使用。坚固耐用，性能可靠。',
    images: [
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400'
    ],
    parameters: {
      type: '专业35mm单反相机',
      format: '35mm',
      lensMount: '尼康F卡口',
      shutterSpeed: '8s - 1/2000s',
      isoRange: '12 - 6400',
      weight: '715g',
      dimensions: '148 x 97 x 66mm',
      year: '1980-2001'
    },
    packages: [
      { id: 1, name: '标准版', price: 0, items: ['机身', '机身盖', '背带', '电池'] },
      { id: 2, name: '套餐一', price: 1200, items: ['机身', '50mm f/1.4镜头', 'UV镜', '相机包'] }
    ],
    stock: 5,
    views: 1568,
    sales: 89,
    isHot: false,
    merchantId: 2,
    merchantName: '胶片时光',
    createdAt: '2024-02-28T10:00:00Z'
  },
  {
    id: 6,
    name: 'Hasselblad 500C/M',
    brand: 'Hasselblad',
    categoryId: 3,
    price: 22000,
    originalPrice: 25000,
    condition: 'excellent',
    description: '哈苏500C/M是中画幅单反的传奇，模块化设计，80mm f/2.8 Planar镜头，是商业摄影和风光摄影的利器。',
    images: [
      'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=400'
    ],
    parameters: {
      type: '中画幅单反相机',
      format: '120中画幅(6x6)',
      lensMount: '哈苏V卡口',
      shutterSpeed: '1s - 1/500s',
      isoRange: '25 - 6400',
      weight: '1520g',
      dimensions: '150 x 150 x 190mm',
      year: '1970-1994'
    },
    packages: [
      { id: 1, name: '标准版', price: 0, items: ['机身', '取景器', '80mm镜头', '胶片后背', '镜头盖'] },
      { id: 2, name: '套餐一', price: 3000, items: ['机身', '取景器', '80mm镜头', '120mm镜头', '胶片后背x2', 'UV镜x2', '专业脚架'] }
    ],
    stock: 2,
    views: 1896,
    sales: 45,
    isHot: true,
    merchantId: 1,
    merchantName: '经典相机行',
    createdAt: '2024-01-18T10:00:00Z'
  },
  {
    id: 7,
    name: 'Konica Hexar AF',
    brand: 'Konica',
    categoryId: 4,
    price: 2800,
    originalPrice: 3200,
    condition: 'good',
    description: '柯尼卡Hexar AF是高端傻瓜相机，配备35mm f/2.0 Hexanon镜头，画质惊人，被称为"穷人的徕卡"。',
    images: [
      'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=400'
    ],
    parameters: {
      type: '高端便携式相机',
      format: '35mm',
      lens: '35mm f/2.0 Hexanon',
      shutterSpeed: '1/4s - 1/250s',
      isoRange: '25 - 3200',
      weight: '320g',
      dimensions: '139 x 78 x 49mm',
      year: '1993-2000'
    },
    packages: [
      { id: 1, name: '标准版', price: 0, items: ['机身', '电池', '镜头盖'] },
      { id: 2, name: '套餐一', price: 400, items: ['机身', '电池x2', 'UV镜', '相机套', '胶卷x5'] }
    ],
    stock: 6,
    views: 2135,
    sales: 156,
    isHot: false,
    merchantId: 3,
    merchantName: '复古相机馆',
    createdAt: '2024-03-05T10:00:00Z'
  },
  {
    id: 8,
    name: 'Olympus Pen F',
    brand: 'Olympus',
    categoryId: 6,
    price: 3800,
    originalPrice: 4500,
    condition: 'excellent',
    description: '奥林巴斯Pen F是半格相机的巅峰之作，独特的快门设计，精美的做工，可以拍摄72张半格照片。',
    images: [
      'https://images.unsplash.com/photo-1542567455-cd732f434ae5?w=400'
    ],
    parameters: {
      type: '半格单反相机',
      format: '35mm半格',
      lensMount: '奥林巴斯Pen F卡口',
      shutterSpeed: '1s - 1/500s',
      isoRange: '25 - 800',
      weight: '570g',
      dimensions: '140 x 83 x 65mm',
      year: '1963-1970'
    },
    packages: [
      { id: 1, name: '标准版', price: 0, items: ['机身', '38mm f/1.8镜头', '镜头盖', '背带'] },
      { id: 2, name: '套餐一', price: 1000, items: ['机身', '38mm镜头', '100mm镜头', 'UV镜x2', '相机包', '半格取景器'] }
    ],
    stock: 3,
    views: 1658,
    sales: 78,
    isHot: true,
    merchantId: 2,
    merchantName: '胶片时光',
    createdAt: '2024-02-15T10:00:00Z'
  },
  {
    id: 9,
    name: 'Contax G2',
    brand: 'Contax',
    categoryId: 1,
    price: 12800,
    originalPrice: 15000,
    condition: 'excellent',
    description: '康泰时G2是自动对焦旁轴相机的王者，蔡司镜头，钛金属机身，画质与便携性的完美结合。',
    images: [
      'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400'
    ],
    parameters: {
      type: '自动对焦旁轴相机',
      format: '35mm',
      lensMount: 'Contax G卡口',
      shutterSpeed: '16s - 1/6000s',
      isoRange: '25 - 6400',
      weight: '560g',
      dimensions: '139 x 78 x 61mm',
      year: '1996-2005'
    },
    packages: [
      { id: 1, name: '标准版', price: 0, items: ['机身', '电池', '机身盖'] },
      { id: 2, name: '套餐一', price: 3500, items: ['机身', '45mm f/2.0镜头', '90mm f/2.8镜头', 'UV镜x2', '相机包'] }
    ],
    stock: 2,
    views: 1823,
    sales: 56,
    isHot: false,
    merchantId: 1,
    merchantName: '经典相机行',
    createdAt: '2024-02-10T10:00:00Z'
  },
  {
    id: 10,
    name: 'Yashica T4',
    brand: 'Yashica',
    categoryId: 4,
    price: 1500,
    originalPrice: 1800,
    condition: 'good',
    description: '雅西卡T4是经典的傻瓜相机，配备蔡司35mm f/3.5 Tessar镜头，画质优秀，性价比极高。',
    images: [
      'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=400'
    ],
    parameters: {
      type: '便携式傻瓜相机',
      format: '35mm',
      lens: 'Carl Zeiss Tessar 35mm f/3.5',
      shutterSpeed: '1s - 1/500s',
      isoRange: '50 - 1600',
      weight: '200g',
      dimensions: '115 x 65 x 45mm',
      year: '1988-1995'
    },
    packages: [
      { id: 1, name: '标准版', price: 0, items: ['机身', '电池', '手绳'] },
      { id: 2, name: '套餐一', price: 250, items: ['机身', '电池x2', '相机套', '胶卷x3'] }
    ],
    stock: 10,
    views: 2456,
    sales: 312,
    isHot: true,
    merchantId: 3,
    merchantName: '复古相机馆',
    createdAt: '2024-03-15T10:00:00Z'
  }
]

export const mockFilmTypes = [
  {
    id: 1,
    name: 'Kodak Gold 200',
    brand: 'Kodak',
    type: '彩色负片',
    format: '35mm',
    iso: 200,
    price: 35,
    description: '柯达金胶卷200是最受欢迎的入门级彩色胶卷，色彩温暖，适合日常拍摄。',
    suitableCameras: ['所有35mm相机'],
    tips: '适合晴天和室外拍摄，阴天可使用闪光灯补光。'
  },
  {
    id: 2,
    name: 'Kodak Portra 400',
    brand: 'Kodak',
    type: '彩色负片',
    format: '35mm/120',
    iso: 400,
    price: 85,
    description: '专业级彩色人像胶卷，肤色还原极佳，颗粒细腻，宽容度高。',
    suitableCameras: ['所有35mm/120相机'],
    tips: '非常适合人像拍摄，也可用于风光，色彩表现自然。'
  },
  {
    id: 3,
    name: 'Fujifilm C200',
    brand: 'Fujifilm',
    type: '彩色负片',
    format: '35mm',
    iso: 200,
    price: 32,
    description: '富士C200是性价比极高的彩色胶卷，绿色表现突出，适合风光拍摄。',
    suitableCameras: ['所有35mm相机'],
    tips: '富士绿是其特色，拍摄自然风光效果出众。'
  },
  {
    id: 4,
    name: 'Ilford HP5 Plus',
    brand: 'Ilford',
    type: '黑白负片',
    format: '35mm/120',
    iso: 400,
    price: 55,
    description: '伊尔福HP5是最经典的黑白胶卷之一，颗粒适中，反差柔和，适应性强。',
    suitableCameras: ['所有35mm/120相机'],
    tips: '可迫冲至ISO 1600使用，适合各种光线条件。'
  },
  {
    id: 5,
    name: 'Kodak Tri-X 400',
    brand: 'Kodak',
    type: '黑白负片',
    format: '35mm/120',
    iso: 400,
    price: 58,
    description: '柯达Tri-X是历史上最著名的黑白胶卷，无数经典照片的缔造者。',
    suitableCameras: ['所有35mm/120相机'],
    tips: '颗粒感较强，反差大，适合纪实和街拍。'
  },
  {
    id: 6,
    name: 'Fujifilm Velvia 50',
    brand: 'Fujifilm',
    type: '彩色反转片',
    format: '35mm/120',
    iso: 50,
    price: 75,
    description: '富士Velvia 50是风光摄影的王者，色彩饱和度极高，画质锐利。',
    suitableCameras: ['所有35mm/120相机'],
    tips: '低ISO，需要充足光线或三脚架，适合风光和静物。'
  },
  {
    id: 7,
    name: 'Kodak Ektar 100',
    brand: 'Kodak',
    type: '彩色负片',
    format: '35mm/120',
    iso: 100,
    price: 65,
    description: '柯达Ektar 100号称"世界上颗粒最细的彩色胶卷"，色彩鲜艳饱和。',
    suitableCameras: ['所有35mm/120相机'],
    tips: '适合风光和商业摄影，色彩浓郁。'
  },
  {
    id: 8,
    name: 'Ilford Pan F Plus',
    brand: 'Ilford',
    type: '黑白负片',
    format: '35mm/120',
    iso: 50,
    price: 60,
    description: '伊尔福Pan F是低感光度黑白胶卷，颗粒极细，画质锐利。',
    suitableCameras: ['所有35mm/120相机'],
    tips: '需要充足光线，适合静物和人像，画质细腻。'
  }
]

export const mockUsers = [
  {
    id: 1,
    username: 'user123',
    password: '123456',
    nickname: '摄影爱好者小王',
    email: 'user@example.com',
    phone: '13800138001',
    role: 'user',
    avatar: '',
    favorites: [1, 3, 5],
    address: '北京市朝阳区xxx路xxx号',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 2,
    username: 'merchant1',
    password: '123456',
    nickname: '经典相机行店主',
    email: 'merchant@example.com',
    phone: '13800138002',
    role: 'merchant',
    avatar: '',
    shopName: '经典相机行',
    shopDescription: '专注经典胶片相机20年',
    favorites: [],
    createdAt: '2023-06-01T10:00:00Z'
  },
  {
    id: 3,
    username: 'merchant2',
    password: '123456',
    nickname: '胶片时光店长',
    email: 'merchant2@example.com',
    phone: '13800138003',
    role: 'merchant',
    avatar: '',
    shopName: '胶片时光',
    shopDescription: '让胶片记录生活的美好',
    favorites: [],
    createdAt: '2023-08-15T10:00:00Z'
  }
]

export const mockOrders = [
  {
    id: 1001,
    userId: 1,
    cameraId: 2,
    cameraName: 'Canon AE-1',
    packageName: '套餐一',
    price: 4000,
    quantity: 1,
    status: 'completed',
    address: '北京市朝阳区xxx路xxx号',
    contactName: '小王',
    contactPhone: '13800138001',
    remark: '请仔细检查相机功能',
    createdAt: '2024-03-01T10:00:00Z',
    paidAt: '2024-03-01T10:05:00Z',
    shippedAt: '2024-03-02T09:00:00Z',
    completedAt: '2024-03-05T16:30:00Z'
  },
  {
    id: 1002,
    userId: 1,
    cameraId: 4,
    cameraName: 'Olympus mju-II',
    packageName: '套餐一',
    price: 2100,
    quantity: 1,
    status: 'shipped',
    address: '北京市朝阳区xxx路xxx号',
    contactName: '小王',
    contactPhone: '13800138001',
    remark: '',
    createdAt: '2024-03-15T14:00:00Z',
    paidAt: '2024-03-15T14:02:00Z',
    shippedAt: '2024-03-16T10:00:00Z'
  },
  {
    id: 1003,
    userId: 1,
    cameraId: 10,
    cameraName: 'Yashica T4',
    packageName: '标准版',
    price: 1500,
    quantity: 1,
    status: 'pending',
    address: '北京市朝阳区xxx路xxx号',
    contactName: '小王',
    contactPhone: '13800138001',
    remark: '加急发货',
    createdAt: '2024-03-20T11:30:00Z'
  }
]

export const conditionOptions = [
  { value: 'mint', label: '全新', description: '几乎全新，无使用痕迹' },
  { value: 'excellent', label: '95新', description: '几乎无使用痕迹，功能完好' },
  { value: 'good', label: '9成新', description: '轻微使用痕迹，功能完好' },
  { value: 'fair', label: '8成新', description: '有使用痕迹，功能正常' }
]

export const orderStatusMap = {
  pending: { label: '待付款', type: 'warning' },
  paid: { label: '已付款', type: 'primary' },
  shipped: { label: '已发货', type: 'info' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
}
