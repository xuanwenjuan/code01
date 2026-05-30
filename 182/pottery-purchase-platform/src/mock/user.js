export const mockUsers = {
  buyer: {
    id: 1,
    username: 'buyer123',
    password: '123456',
    role: 'buyer',
    nickname: '陶艺爱好者',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13800138000',
    email: 'buyer@example.com',
    address: '北京市朝阳区某某街道123号',
    registerTime: '2024-01-15',
    level: 'VIP2'
  },
  supplier: {
    id: 2,
    username: 'supplier123',
    password: '123456',
    role: 'supplier',
    nickname: '陶艺工坊供应商',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13900139000',
    email: 'supplier@example.com',
    companyName: '陶艺工坊有限公司',
    businessLicense: '123456789012345678',
    registerTime: '2023-06-20',
    status: 'approved'
  }
}

export const mockOrders = [
  {
    id: 'ORD202405010001',
    createTime: '2024-05-01 14:30:00',
    status: 'completed',
    statusText: '已完成',
    totalAmount: 526,
    products: [
      {
        id: 1,
        name: '专业陶艺制坯工具套装',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=100&h=100&fit=crop',
        price: 328,
        quantity: 1,
        spec: '专业款'
      },
      {
        id: 5,
        name: '高品质陶泥套装5kg',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
        price: 89,
        quantity: 2,
        spec: '5kg装'
      }
    ],
    address: {
      name: '张三',
      phone: '13800138000',
      detail: '北京市朝阳区某某街道123号'
    },
    trackingNo: 'SF1234567890'
  },
  {
    id: 'ORD202405100002',
    createTime: '2024-05-10 09:15:00',
    status: 'shipping',
    statusText: '已发货',
    totalAmount: 198,
    products: [
      {
        id: 2,
        name: '高级修坯刀具12件套',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
        price: 198,
        quantity: 1,
        spec: '标准款'
      }
    ],
    address: {
      name: '张三',
      phone: '13800138000',
      detail: '北京市朝阳区某某街道123号'
    },
    trackingNo: 'YT9876543210'
  },
  {
    id: 'ORD202405150003',
    createTime: '2024-05-15 16:45:00',
    status: 'pending',
    statusText: '待付款',
    totalAmount: 766,
    products: [
      {
        id: 3,
        name: '电动施釉喷笔套装',
        image: 'https://images.unsplash.com/photo-1556770384-2e75f8d7bb48?w=100&h=100&fit=crop',
        price: 568,
        quantity: 1,
        spec: '标准套装'
      },
      {
        id: 4,
        name: '手工雕刻工具套装',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100&h=100&fit=crop',
        price: 168,
        quantity: 1,
        spec: '标准款'
      }
    ],
    address: {
      name: '张三',
      phone: '13800138000',
      detail: '北京市朝阳区某某街道123号'
    },
    trackingNo: ''
  }
]

export const mockFavorites = [
  {
    id: 1,
    productId: 1,
    name: '专业陶艺制坯工具套装',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop',
    price: 328,
    addTime: '2024-04-20'
  },
  {
    id: 2,
    productId: 6,
    name: '智能控温电窑炉',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=200&h=200&fit=crop',
    price: 8800,
    addTime: '2024-04-25'
  },
  {
    id: 3,
    productId: 7,
    name: '初学者入门工具套装',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop',
    price: 128,
    addTime: '2024-05-05'
  }
]
