export const users = {
  admin: {
    id: 'admin_001',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: '系统管理员',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=admin%20avatar%20portrait%20professional&image_size=square',
    email: 'admin@mortise.com',
    phone: '13800138000',
    department: '平台运营部',
    permissions: ['user_manage', 'content_manage', 'data_view', 'system_config']
  },
  craftsman1: {
    id: 'user_001',
    username: 'craftsman',
    password: 'craft123',
    role: 'craftsman',
    name: '李明',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20craftsman%20portrait%20woodworking%20artisan&image_size=square',
    email: 'liming@mortise.com',
    phone: '13912345678',
    title: '高级木工技师',
    experience: '20年',
    bio: '师承国家级非遗传承人，专注传统榫卯技艺研究与传承',
    skills: ['明式家具制作', '古建筑修缮', '榫卯创新设计'],
    certifications: ['国家级非遗传承人', '高级工艺美术师']
  },
  craftsman2: {
    id: 'user_002',
    username: 'designer',
    password: 'design123',
    role: 'craftsman',
    name: '王芳',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20female%20furniture%20designer%20portrait&image_size=square',
    email: 'wangfang@mortise.com',
    phone: '13887654321',
    title: '家具设计师',
    experience: '10年',
    bio: '中央美术学院家具设计专业毕业，致力于传统榫卯的现代化应用',
    skills: ['现代家具设计', '参数化设计', '3D建模'],
    certifications: ['中国家具协会认证设计师', '红点设计奖获得者']
  }
}

export const designers = [
  {
    id: 1,
    name: '陈传统',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elder%20chinese%20master%20carpenter%20portrait&image_size=square',
    title: '国家级非遗传承人',
    experience: '45年',
    followers: 12580,
    worksCount: 86,
    bio: '陈氏榫卯技艺第七代传人，终身致力于传统榫卯技艺的研究与传承。',
    certifications: ['国家级非遗传承人', '中国工艺美术大师'],
    specialty: ['古典家具制作', '斗拱结构', '古建筑修缮']
  },
  {
    id: 2,
    name: '张明匠',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=middle%20aged%20chinese%20carpenter%20portrait&image_size=square',
    title: '高级工艺美术师',
    experience: '28年',
    followers: 8960,
    worksCount: 62,
    bio: '明式家具制作专家，作品曾获多项国家级奖项。',
    certifications: ['高级工艺美术师', '传统技艺大师'],
    specialty: ['明式家具', '桌椅类榫卯']
  },
  {
    id: 3,
    name: '李巧思',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20chinese%20female%20woodworker%20portrait&image_size=square',
    title: '青年木工艺术家',
    experience: '8年',
    followers: 15680,
    worksCount: 45,
    bio: '青年一代木工艺术家的代表，善于将传统技艺与现代设计融合。',
    certifications: ['新锐设计师奖'],
    specialty: ['创新榫卯', '装饰榫卯']
  },
  {
    id: 4,
    name: '王创新',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20chinese%20male%20designer%20portrait%20modern&image_size=square',
    title: '跨界设计师',
    experience: '12年',
    followers: 22350,
    worksCount: 78,
    bio: '工业设计背景，专注于传统榫卯的现代化、参数化设计研究。',
    certifications: ['红点设计奖', 'iF设计奖'],
    specialty: ['模块化设计', '参数化榫卯', '3D打印应用']
  },
  {
    id: 5,
    name: '赵数码',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20digital%20designer%20portrait%20tech&image_size=square',
    title: '数字化设计专家',
    experience: '10年',
    followers: 18920,
    worksCount: 56,
    bio: '建筑参数化设计专家，致力于将传统建筑智慧数字化。',
    certifications: ['参数化设计认证'],
    specialty: ['参数化设计', '建筑信息模型', '算法设计']
  },
  {
    id: 6,
    name: '古建大师',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20chinese%20architect%20portrait%20traditional&image_size=square',
    title: '古建筑大师',
    experience: '50年',
    followers: 35680,
    worksCount: 120,
    bio: '参与过多项国家级文物建筑修缮工程，古建筑斗拱结构权威专家。',
    certifications: ['国家级古建筑专家', '文物保护工程责任设计师'],
    specialty: ['斗拱结构', '古建筑修缮', '文物保护']
  }
]
