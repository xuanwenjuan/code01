export const mockUser = {
  id: 1,
  username: 'beauty_user',
  nickname: '美妆达人',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20woman%20avatar%20portrait%20elegant&image_size=square',
  phone: '138****8888',
  email: 'user@beauty.com',
  gender: 'female',
  birthday: '1998-05-20',
  level: '黄金会员',
  points: 2580,
  balance: 1288.50,
  createTime: '2023-01-15'
}

export const mockAddresses = [
  {
    id: 1,
    name: '张小姐',
    phone: '13888888888',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南区A座1001室',
    isDefault: true
  },
  {
    id: 2,
    name: '李女士',
    phone: '13999999999',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '建国路88号SOHO现代城B座2002室',
    isDefault: false
  }
]

export const mockOrders = [
  {
    id: '202405150001',
    createTime: '2024-05-15 14:30:00',
    status: 'pending',
    statusText: '待付款',
    totalPrice: 1280,
    payPrice: 1180,
    items: [
      {
        id: 1,
        productId: 1,
        name: '小黑瓶精华肌底液',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=兰蔻小黑瓶精华化妆品&image_size=square',
        price: 760,
        quantity: 1,
        specs: { '规格': '50ml' }
      },
      {
        id: 2,
        productId: 5,
        name: '粉水清滢柔肤水',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=兰蔻粉水化妆品&image_size=square',
        price: 320,
        quantity: 2,
        specs: { '规格': '200ml' }
      }
    ]
  },
  {
    id: '202405100002',
    createTime: '2024-05-10 09:15:00',
    status: 'shipped',
    statusText: '待收货',
    totalPrice: 680,
    payPrice: 650,
    items: [
      {
        id: 3,
        productId: 7,
        name: '口红58号丝绒',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=迪奥口红58号化妆品&image_size=square',
        price: 320,
        quantity: 2,
        specs: { '颜色': '丝绒红' }
      }
    ]
  },
  {
    id: '202405050003',
    createTime: '2024-05-05 16:45:00',
    status: 'completed',
    statusText: '已完成',
    totalPrice: 1540,
    payPrice: 1540,
    items: [
      {
        id: 4,
        productId: 4,
        name: '神仙水护肤精华露',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=SKII神仙水化妆品&image_size=square',
        price: 1540,
        quantity: 1,
        specs: { '规格': '230ml' }
      }
    ]
  },
  {
    id: '202404280004',
    createTime: '2024-04-28 11:20:00',
    status: 'cancelled',
    statusText: '已取消',
    totalPrice: 980,
    payPrice: 980,
    items: [
      {
        id: 5,
        productId: 15,
        name: '邂逅清新淡香水',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=香奈儿邂逅香水&image_size=square',
        price: 980,
        quantity: 1,
        specs: { '规格': '50ml' }
      }
    ]
  }
]

export const mockFavorites = [1, 2, 3, 7, 13, 15, 24]
