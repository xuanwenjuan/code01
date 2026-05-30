export const mockCategories = [
  { id: 1, name: '前端开发', icon: 'Monitor', count: 128 },
  { id: 2, name: '后端开发', icon: 'Cpu', count: 96 },
  { id: 3, name: '移动开发', icon: 'Phone', count: 72 },
  { id: 4, name: '人工智能', icon: 'MagicStick', count: 54 },
  { id: 5, name: 'UI设计', icon: 'Picture', count: 86 },
  { id: 6, name: '产品运营', icon: 'DataAnalysis', count: 63 },
  { id: 7, name: '云计算', icon: 'Cloud', count: 45 },
  { id: 8, name: '网络安全', icon: 'Lock', count: 38 }
]

export const mockBanners = [
  {
    id: 1,
    title: '春季学习节',
    subtitle: '全场课程低至5折',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=online%20education%20banner%20spring%20sale&image_size=landscape_16_9',
    link: '/courses'
  },
  {
    id: 2,
    title: 'Python全栈开发',
    subtitle: '从零基础到实战项目',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=python%20programming%20course%20banner&image_size=landscape_16_9',
    link: '/course/2'
  },
  {
    id: 3,
    title: '免费精品课',
    subtitle: '每日更新，限时免费',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=free%20online%20courses%20promotion%20banner&image_size=landscape_16_9',
    link: '/courses?priceType=free'
  }
]

const generateLessons = (courseId) => {
  const lessons = []
  const chapterCount = Math.floor(Math.random() * 3) + 3
  let lessonId = 1
  
  for (let c = 1; c <= chapterCount; c++) {
    const chapter = {
      id: c,
      title: `第${c}章 ${['基础入门', '核心概念', '进阶技巧', '实战项目', '性能优化', '最佳实践'][c - 1] || '章节' + c}`,
      lessons: []
    }
    
    const lessonCount = Math.floor(Math.random() * 4) + 3
    for (let l = 1; l <= lessonCount; l++) {
      chapter.lessons.push({
        id: lessonId++,
        title: `1.${l} ${['环境搭建', '基础语法', '数据类型', '运算符', '流程控制', '函数定义', '面向对象', '模块导入'][l - 1] || '知识点' + l}`,
        duration: Math.floor(Math.random() * 1800) + 300,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        free: l === 1
      })
    }
    lessons.push(chapter)
  }
  return lessons
}

const generateReviews = () => {
  const reviews = []
  const reviewCount = Math.floor(Math.random() * 20) + 5
  const avatars = [
    'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  ]
  const names = ['张同学', '李老师', '王小明', '赵开发者', '孙设计', '周产品', '吴运营']
  const comments = [
    '课程内容非常详细，讲师讲得很清楚，适合入门学习！',
    '跟着学了一周，已经能独立完成小项目了，感谢老师！',
    '课程质量很高，案例都是实战项目，学完直接能用在工作中。',
    '讲解通俗易懂，概念讲得很透彻，推荐给想要入门的同学。',
    '课程更新很及时，技术点都是最新的，物超所值！',
    '老师讲课很有耐心，遇到问题都能在答疑区得到及时回复。',
    '从零基础开始学，现在已经找到前端开发工作了，感谢这个课程！'
  ]
  
  for (let i = 0; i < reviewCount; i++) {
    reviews.push({
      id: i + 1,
      userId: Math.floor(Math.random() * 1000) + 1,
      userName: names[Math.floor(Math.random() * names.length)],
      userAvatar: avatars[Math.floor(Math.random() * avatars.length)],
      rating: Math.floor(Math.random() * 2) + 4,
      content: comments[Math.floor(Math.random() * comments.length)],
      createTime: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
    })
  }
  return reviews
}

export const mockCourses = [
  {
    id: 1,
    name: 'Vue3 + TypeScript 企业级实战',
    categoryId: 1,
    categoryName: '前端开发',
    description: '从零开始学习Vue3，掌握Composition API、TypeScript、Pinia、Vite等技术栈，完成企业级项目开发。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vue3%20typescript%20course%20cover%20programming&image_size=landscape_16_9',
    price: 199,
    originalPrice: 399,
    difficulty: 'intermediate',
    duration: 48 * 3600,
    lessonCount: 128,
    studentCount: 12580,
    rating: 4.9,
    ratingCount: 3256,
    instructor: {
      id: 1,
      name: '张老师',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      title: '资深前端架构师',
      description: '10年前端开发经验，曾就职于BAT大厂，负责过多个大型前端项目架构设计。',
      courseCount: 12,
      totalStudents: 58000
    },
    tags: ['Vue3', 'TypeScript', 'Pinia', 'Vite', 'Element Plus'],
    highlights: ['掌握Vue3核心特性', '学会TypeScript类型编程', '完成企业级项目实战', '获得就业指导'],
    lessons: generateLessons(1),
    reviews: generateReviews(),
    createTime: '2024-01-15T00:00:00Z',
    updateTime: '2024-05-10T00:00:00Z'
  },
  {
    id: 2,
    name: 'Python全栈开发从入门到精通',
    categoryId: 2,
    categoryName: '后端开发',
    description: '全面学习Python编程语言，从基础语法到Web开发、数据分析、自动化脚本编写。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=python%20full%20stack%20development%20course&image_size=landscape_16_9',
    price: 299,
    originalPrice: 599,
    difficulty: 'beginner',
    duration: 72 * 3600,
    lessonCount: 186,
    studentCount: 28560,
    rating: 4.8,
    ratingCount: 7856,
    instructor: {
      id: 2,
      name: '李教授',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      title: 'Python技术专家',
      description: '8年Python开发经验，开源项目贡献者，热爱技术分享。',
      courseCount: 8,
      totalStudents: 42000
    },
    tags: ['Python', 'Django', 'Flask', '数据分析', '自动化'],
    highlights: ['Python基础到精通', 'Web框架实战', '数据分析与可视化', '自动化脚本开发'],
    lessons: generateLessons(2),
    reviews: generateReviews(),
    createTime: '2023-11-20T00:00:00Z',
    updateTime: '2024-04-15T00:00:00Z'
  },
  {
    id: 3,
    name: 'React18 高级开发实战',
    categoryId: 1,
    categoryName: '前端开发',
    description: '深入学习React18新特性，掌握Hooks、状态管理、性能优化、SSR等高级技术。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=react%20advanced%20development%20course&image_size=landscape_16_9',
    price: 259,
    originalPrice: 499,
    difficulty: 'advanced',
    duration: 56 * 3600,
    lessonCount: 142,
    studentCount: 9860,
    rating: 4.9,
    ratingCount: 2340,
    instructor: {
      id: 3,
      name: '王老师',
      avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
      title: '前端技术总监',
      description: '12年Web开发经验，React核心贡献者，多家知名企业技术顾问。',
      courseCount: 6,
      totalStudents: 35000
    },
    tags: ['React18', 'Redux', 'Next.js', 'TypeScript', '性能优化'],
    highlights: ['React18新特性详解', '自定义Hooks开发', '大型项目状态管理', '服务端渲染实践'],
    lessons: generateLessons(3),
    reviews: generateReviews(),
    createTime: '2024-02-28T00:00:00Z',
    updateTime: '2024-05-05T00:00:00Z'
  },
  {
    id: 4,
    name: 'Java企业级微服务架构',
    categoryId: 2,
    categoryName: '后端开发',
    description: '深入学习Spring Boot、Spring Cloud，掌握微服务架构设计与实践。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=java%20microservices%20architecture%20course&image_size=landscape_16_9',
    price: 399,
    originalPrice: 799,
    difficulty: 'advanced',
    duration: 80 * 3600,
    lessonCount: 210,
    studentCount: 15680,
    rating: 4.7,
    ratingCount: 4520,
    instructor: {
      id: 4,
      name: '赵架构师',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      title: '资深架构师',
      description: '15年Java开发经验，主导过多个千万级用户系统的架构设计。',
      courseCount: 4,
      totalStudents: 28000
    },
    tags: ['Java', 'Spring Boot', 'Spring Cloud', '微服务', 'Docker'],
    highlights: ['微服务架构设计', '服务治理与熔断', '容器化部署', '分布式事务'],
    lessons: generateLessons(4),
    reviews: generateReviews(),
    createTime: '2023-09-10T00:00:00Z',
    updateTime: '2024-03-20T00:00:00Z'
  },
  {
    id: 5,
    name: 'Flutter跨平台应用开发',
    categoryId: 3,
    categoryName: '移动开发',
    description: '一套代码同时构建iOS和Android应用，学习Flutter核心概念与实战开发。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flutter%20cross%20platform%20app%20development&image_size=landscape_16_9',
    price: 0,
    originalPrice: 199,
    difficulty: 'beginner',
    duration: 36 * 3600,
    lessonCount: 98,
    studentCount: 45680,
    rating: 4.6,
    ratingCount: 8950,
    instructor: {
      id: 5,
      name: '孙讲师',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      title: '移动端开发专家',
      description: '7年移动端开发经验，精通Flutter和React Native。',
      courseCount: 5,
      totalStudents: 32000
    },
    tags: ['Flutter', 'Dart', 'iOS', 'Android', '跨平台'],
    highlights: ['Dart语言基础', 'Flutter组件开发', '状态管理', '应用上架实战'],
    lessons: generateLessons(5),
    reviews: generateReviews(),
    createTime: '2024-01-05T00:00:00Z',
    updateTime: '2024-04-28T00:00:00Z'
  },
  {
    id: 6,
    name: 'UI/UX设计从入门到精通',
    categoryId: 5,
    categoryName: 'UI设计',
    description: '系统学习UI设计理论、Figma工具使用、用户体验设计方法，完成商业项目设计。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ui%20ux%20design%20course%20figma&image_size=landscape_16_9',
    price: 159,
    originalPrice: 299,
    difficulty: 'beginner',
    duration: 42 * 3600,
    lessonCount: 112,
    studentCount: 18960,
    rating: 4.8,
    ratingCount: 5620,
    instructor: {
      id: 6,
      name: '周设计师',
      avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
      title: '资深UI设计师',
      description: '10年设计经验，曾就职于知名互联网公司，作品多次获得设计大奖。',
      courseCount: 3,
      totalStudents: 25000
    },
    tags: ['Figma', 'UI设计', 'UX设计', '原型设计', '交互动效'],
    highlights: ['设计理论基础', 'Figma工具精通', '实战项目设计', '作品集制作'],
    lessons: generateLessons(6),
    reviews: generateReviews(),
    createTime: '2023-12-01T00:00:00Z',
    updateTime: '2024-02-15T00:00:00Z'
  },
  {
    id: 7,
    name: '机器学习与深度学习实战',
    categoryId: 4,
    categoryName: '人工智能',
    description: '从数学基础到算法实现，掌握机器学习核心算法，完成深度学习项目实战。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=machine%20learning%20deep%20learning%20ai%20course&image_size=landscape_16_9',
    price: 499,
    originalPrice: 999,
    difficulty: 'advanced',
    duration: 96 * 3600,
    lessonCount: 248,
    studentCount: 8560,
    rating: 4.9,
    ratingCount: 2180,
    instructor: {
      id: 7,
      name: '吴博士',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      title: 'AI研究员',
      description: '清华大学计算机博士，主攻机器学习方向，多篇论文发表于顶级会议。',
      courseCount: 2,
      totalStudents: 18000
    },
    tags: ['机器学习', '深度学习', 'TensorFlow', 'PyTorch', '神经网络'],
    highlights: ['数学基础夯实', '算法原理推导', '框架实战应用', '项目竞赛指导'],
    lessons: generateLessons(7),
    reviews: generateReviews(),
    createTime: '2023-10-15T00:00:00Z',
    updateTime: '2024-04-01T00:00:00Z'
  },
  {
    id: 8,
    name: '产品经理实战训练营',
    categoryId: 6,
    categoryName: '产品运营',
    description: '系统学习产品设计方法论，掌握需求分析、原型设计、项目管理等核心技能。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=product%20manager%20training%20course&image_size=landscape_16_9',
    price: 349,
    originalPrice: 699,
    difficulty: 'intermediate',
    duration: 60 * 3600,
    lessonCount: 156,
    studentCount: 12360,
    rating: 4.7,
    ratingCount: 3680,
    instructor: {
      id: 8,
      name: '郑产品',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      title: '高级产品总监',
      description: '10年产品经验，从0到1打造过多款千万级用户产品。',
      courseCount: 3,
      totalStudents: 22000
    },
    tags: ['产品设计', '需求分析', 'Axure', '项目管理', '数据分析'],
    highlights: ['产品思维培养', '需求挖掘方法', '原型设计实战', '面试辅导'],
    lessons: generateLessons(8),
    reviews: generateReviews(),
    createTime: '2024-03-01T00:00:00Z',
    updateTime: '2024-05-12T00:00:00Z'
  },
  {
    id: 9,
    name: 'Kubernetes云原生实战',
    categoryId: 7,
    categoryName: '云计算',
    description: '从零开始学习Docker和Kubernetes，掌握云原生应用部署与运维。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kubernetes%20cloud%20native%20docker%20course&image_size=landscape_16_9',
    price: 279,
    originalPrice: 559,
    difficulty: 'intermediate',
    duration: 52 * 3600,
    lessonCount: 138,
    studentCount: 6890,
    rating: 4.8,
    ratingCount: 1890,
    instructor: {
      id: 9,
      name: '冯运维',
      avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
      title: '云原生专家',
      description: '9年运维经验，K8s官方认证专家，擅长大规模集群管理。',
      courseCount: 4,
      totalStudents: 15000
    },
    tags: ['Docker', 'Kubernetes', 'DevOps', 'CI/CD', '云原生'],
    highlights: ['容器化技术', 'K8s集群管理', '服务编排', '自动化运维'],
    lessons: generateLessons(9),
    reviews: generateReviews(),
    createTime: '2023-08-20T00:00:00Z',
    updateTime: '2024-03-10T00:00:00Z'
  },
  {
    id: 10,
    name: '网络安全与渗透测试',
    categoryId: 8,
    categoryName: '网络安全',
    description: '系统学习网络安全知识，掌握渗透测试方法，培养安全攻防思维。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cybersecurity%20ethical%20hacking%20course&image_size=landscape_16_9',
    price: 369,
    originalPrice: 739,
    difficulty: 'advanced',
    duration: 68 * 3600,
    lessonCount: 178,
    studentCount: 5420,
    rating: 4.9,
    ratingCount: 1450,
    instructor: {
      id: 10,
      name: '陈安全',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      title: '安全研究员',
      description: '知名白帽子黑客，发现过多个高危漏洞，安全行业资深专家。',
      courseCount: 2,
      totalStudents: 12000
    },
    tags: ['网络安全', '渗透测试', 'Web安全', '漏洞挖掘', '攻防实战'],
    highlights: ['安全理论体系', '渗透测试流程', '漏洞挖掘技巧', 'CTF竞赛指导'],
    lessons: generateLessons(10),
    reviews: generateReviews(),
    createTime: '2024-02-10T00:00:00Z',
    updateTime: '2024-05-08T00:00:00Z'
  },
  {
    id: 11,
    name: '微信小程序开发实战',
    categoryId: 3,
    categoryName: '移动开发',
    description: '从零开始学习微信小程序开发，掌握小程序框架、组件、API，完成实战项目。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wechat%20mini%20program%20development%20course&image_size=landscape_16_9',
    price: 129,
    originalPrice: 259,
    difficulty: 'beginner',
    duration: 32 * 3600,
    lessonCount: 86,
    studentCount: 22560,
    rating: 4.7,
    ratingCount: 6230,
    instructor: {
      id: 11,
      name: '韩开发',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      title: '小程序开发专家',
      description: '6年小程序开发经验，开发过100+小程序项目，深谙小程序生态。',
      courseCount: 4,
      totalStudents: 28000
    },
    tags: ['微信小程序', '小程序开发', '云开发', '组件化', '实战项目'],
    highlights: ['小程序框架精通', '组件化开发', '云开发实战', '项目上线流程'],
    lessons: generateLessons(11),
    reviews: generateReviews(),
    createTime: '2023-11-15T00:00:00Z',
    updateTime: '2024-04-20T00:00:00Z'
  },
  {
    id: 12,
    name: 'Node.js后端开发实战',
    categoryId: 2,
    categoryName: '后端开发',
    description: '学习Node.js后端开发，掌握Express/Koa框架、数据库操作、API设计等技能。',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=nodejs%20backend%20development%20course&image_size=landscape_16_9',
    price: 229,
    originalPrice: 459,
    difficulty: 'intermediate',
    duration: 48 * 3600,
    lessonCount: 126,
    studentCount: 11280,
    rating: 4.8,
    ratingCount: 3120,
    instructor: {
      id: 12,
      name: '杨后端',
      avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
      title: '全栈开发工程师',
      description: '8年全栈开发经验，精通JavaScript技术栈，热衷于开源贡献。',
      courseCount: 5,
      totalStudents: 35000
    },
    tags: ['Node.js', 'Express', 'Koa', 'MongoDB', 'RESTful API'],
    highlights: ['Node.js核心原理', 'Web框架实战', '数据库设计', '高并发处理'],
    lessons: generateLessons(12),
    reviews: generateReviews(),
    createTime: '2024-01-20T00:00:00Z',
    updateTime: '2024-05-01T00:00:00Z'
  }
]

export const mockUser = {
  id: 1,
  username: 'admin',
  nickname: '学习达人',
  email: 'admin@example.com',
  phone: '13800138000',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  gender: 'male',
  birthday: '1995-06-15',
  bio: '热爱学习，热爱生活，不断进步！',
  vipLevel: 2,
  points: 2580,
  registerTime: '2023-01-01T00:00:00Z'
}

export const mockOrders = [
  {
    id: 1001,
    courseId: 1,
    courseName: 'Vue3 + TypeScript 企业级实战',
    courseCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vue3%20typescript%20course%20cover%20programming&image_size=landscape_16_9',
    price: 199,
    status: 'paid',
    createTime: '2024-03-15T10:30:00Z',
    payTime: '2024-03-15T10:35:00Z',
    payMethod: 'alipay'
  },
  {
    id: 1002,
    courseId: 2,
    courseName: 'Python全栈开发从入门到精通',
    courseCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=python%20full%20stack%20development%20course&image_size=landscape_16_9',
    price: 299,
    status: 'paid',
    createTime: '2024-02-20T14:20:00Z',
    payTime: '2024-02-20T14:25:00Z',
    payMethod: 'wechat'
  },
  {
    id: 1003,
    courseId: 5,
    courseName: 'Flutter跨平台应用开发',
    courseCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flutter%20cross%20platform%20app%20development&image_size=landscape_16_9',
    price: 0,
    status: 'paid',
    createTime: '2024-01-10T09:00:00Z',
    payTime: '2024-01-10T09:00:00Z',
    payMethod: 'free'
  }
]

export const mockFavorites = [
  {
    id: 1,
    courseId: 3,
    addTime: '2024-04-01T00:00:00Z'
  },
  {
    id: 2,
    courseId: 7,
    addTime: '2024-03-20T00:00:00Z'
  },
  {
    id: 3,
    courseId: 10,
    addTime: '2024-02-15T00:00:00Z'
  }
]

export const mockLearningRecords = [
  {
    id: 1,
    courseId: 1,
    progress: 65,
    lastLessonId: 45,
    lastStudyTime: '2024-05-15T20:30:00Z'
  },
  {
    id: 2,
    courseId: 2,
    progress: 32,
    lastLessonId: 28,
    lastStudyTime: '2024-05-14T19:00:00Z'
  },
  {
    id: 3,
    courseId: 5,
    progress: 100,
    lastLessonId: 98,
    lastStudyTime: '2024-04-28T15:20:00Z'
  }
]
