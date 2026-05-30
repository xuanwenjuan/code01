export const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: '系统管理员',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    email: 'admin@pigment.com',
    phone: '13800138000',
    createTime: '2023-01-01',
    status: 'active'
  },
  {
    id: 2,
    username: 'researcher',
    password: 'user123',
    role: 'user',
    name: '张研究员',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    email: 'zhang@research.com',
    phone: '13900139000',
    organization: '中国美术学院',
    researchField: '传统矿物颜料研究',
    createTime: '2023-06-15',
    status: 'active',
    favorites: [1, 3, 5, 10],
    followingMasters: [1, 3, 5],
    browseHistory: [
      { pigmentId: 1, time: '2024-03-20 14:30:00' },
      { pigmentId: 2, time: '2024-03-20 15:20:00' },
      { pigmentId: 5, time: '2024-03-19 10:15:00' },
      { pigmentId: 10, time: '2024-03-18 09:45:00' },
      { pigmentId: 3, time: '2024-03-17 16:30:00' }
    ],
    notifications: [
      {
        id: 1,
        type: 'new_pigment',
        title: '新品上架',
        content: '您关注的调配师李墨白发布了新颜料「石青-特级」',
        pigmentId: 1,
        time: '2024-03-20 10:00:00',
        read: false
      },
      {
        id: 2,
        type: 'master_update',
        title: '调配师动态',
        content: '陈红玉大师更新了朱砂制作工艺视频',
        masterId: 3,
        time: '2024-03-19 14:30:00',
        read: false
      },
      {
        id: 3,
        type: 'system',
        title: '系统通知',
        content: '平台新增素材批量下载功能，欢迎体验',
        time: '2024-03-18 09:00:00',
        read: true
      },
      {
        id: 4,
        type: 'new_pigment',
        title: '新品上架',
        content: '古法调配颜料「胭脂-极品」限时展示中',
        pigmentId: 5,
        time: '2024-03-17 16:00:00',
        read: true
      }
    ],
    downloadHistory: [
      { id: 1, pigmentId: 1, pigmentName: '石青', time: '2024-03-15 10:30:00', type: '制作素材' },
      { id: 2, pigmentId: 3, pigmentName: '朱砂', time: '2024-03-14 15:20:00', type: '色卡样本' }
    ]
  },
  {
    id: 3,
    username: 'artist',
    password: 'user123',
    role: 'user',
    name: '李画家',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    email: 'li@art.com',
    phone: '13700137000',
    organization: '中央美术学院',
    researchField: '中国山水画创作',
    createTime: '2023-09-20',
    status: 'active',
    favorites: [2, 4, 7],
    followingMasters: [2, 7],
    browseHistory: [
      { pigmentId: 2, time: '2024-03-20 11:00:00' },
      { pigmentId: 7, time: '2024-03-19 14:20:00' }
    ]
  }
]

export const masters = [
  {
    id: 1,
    name: '李墨白',
    title: '国家级非遗传承人',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    experience: 40,
    specialty: '石青石绿研磨技艺',
    bio: '李墨白大师从事矿物颜料制作四十余年，是国内石青研磨技艺的代表性传承人。其制作的石青颜料被故宫博物院用于古画修复工作。',
    followers: 2580,
    pigments: [1]
  },
  {
    id: 2,
    name: '王丹青',
    title: '省级非遗传承人',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    experience: 35,
    specialty: '石绿颜料制作',
    bio: '王丹青大师继承家传技艺，专注石绿制作三十余年，其作品被多家博物馆收藏。',
    followers: 1890,
    pigments: [2]
  },
  {
    id: 3,
    name: '陈红玉',
    title: '国家级非遗传承人',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    experience: 45,
    specialty: '朱砂印泥制作',
    bio: '陈红玉大师是朱砂制作技艺的代表性传承人，其研制的朱砂印泥被故宫博物院选用。',
    followers: 3200,
    pigments: [3]
  },
  {
    id: 4,
    name: '张黄土',
    title: '民间工艺大师',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    experience: 30,
    specialty: '矿物颜料基础色制作',
    bio: '张黄土大师从艺三十年，专注传统矿物颜料的基础色提纯工艺。',
    followers: 980,
    pigments: [4]
  },
  {
    id: 5,
    name: '林芳菲',
    title: '传统颜料调配师',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    experience: 25,
    specialty: '植物与矿物复合颜料',
    bio: '林芳菲大师擅长古法调配胭脂、藤黄等复合颜料，作品被多位工笔画家选用。',
    followers: 1560,
    pigments: [5]
  },
  {
    id: 6,
    name: '赵紫阳',
    title: '省级非遗传承人',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    experience: 38,
    specialty: '稀有矿物颜料制作',
    bio: '赵紫阳大师专注稀有矿物颜料研究三十余年，对雄黄、雌黄等颜料有深入研究。',
    followers: 1200,
    pigments: [6, 9]
  },
  {
    id: 7,
    name: '白雪松',
    title: '传统工艺大师',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    experience: 32,
    specialty: '白色颜料制作',
    bio: '白雪松大师是国内为数不多的蛤粉制作技艺传承人，其制作的蛤粉被故宫修复专家选用。',
    followers: 1350,
    pigments: [7]
  },
  {
    id: 8,
    name: '黄金声',
    title: '传统颜料调配师',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    experience: 28,
    specialty: '树脂类颜料加工',
    bio: '黄金声大师专注植物树脂颜料加工，对藤黄、胭脂等颜料的古法制作有独到研究。',
    followers: 890,
    pigments: [8]
  },
  {
    id: 9,
    name: '胡开文',
    title: '国家级非遗传承人',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    experience: 42,
    specialty: '徽墨制作技艺',
    bio: '胡开文大师是徽墨制作技艺的代表性传承人，继承百年老店传统工艺。',
    followers: 4500,
    pigments: [10]
  }
]
