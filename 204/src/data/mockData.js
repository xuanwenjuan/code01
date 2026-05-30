export const dyeMaterials = [
  {
    id: 1,
    name: '板蓝根',
    category: '蓝色系',
    color: '#1e40af',
    origin: '中国南方地区',
    season: '夏秋采收',
    description: '板蓝根是最常用的蓝色染料，染出的蓝色沉静典雅，是传统青染的主要原料。',
    properties: '清热解毒，染色牢度好',
    processing: [
      { step: 1, title: '采收', desc: '夏秋季节采收板蓝根的根部和叶片' },
      { step: 2, title: '清洗', desc: '将采收的板蓝根清洗干净，去除泥沙' },
      { step: 3, title: '浸泡', desc: '放入清水中浸泡7-10天，让其自然发酵' },
      { step: 4, title: '过滤', desc: '过滤掉残渣，得到染液原液' },
      { step: 5, title: '加碱', desc: '加入石灰水调节pH值，促进染色' }
    ]
  },
  {
    id: 2,
    name: '红花',
    category: '红色系',
    color: '#dc2626',
    origin: '中国西北地区',
    season: '夏季开花时采收',
    description: '红花染出的红色鲜艳亮丽，是古代贵妇人最喜爱的染料之一。',
    properties: '色泽鲜艳，对皮肤温和',
    processing: [
      { step: 1, title: '采收', desc: '夏季红花盛开时采摘花瓣' },
      { step: 2, title: '晾晒', desc: '阴凉处晾晒，避免阳光直射' },
      { step: 3, title: '浸泡', desc: '用温水浸泡24小时，提取红色素' },
      { step: 4, title: '发酵', desc: '加入糯米粥发酵3天' },
      { step: 5, title: '提纯', desc: '多次过滤提纯得到纯净染液' }
    ]
  },
  {
    id: 3,
    name: '栀子',
    category: '黄色系',
    color: '#eab308',
    origin: '中国长江流域',
    season: '秋季果实成熟时采收',
    description: '栀子是最古老的黄色染料，染出的黄色温润如玉，被誉为"帝王之色"。',
    properties: '色牢度高，抗菌消炎',
    processing: [
      { step: 1, title: '采收', desc: '秋季采摘成熟的栀子果实' },
      { step: 2, title: '晒干', desc: '日晒或烘干，便于储存' },
      { step: 3, title: '煎煮', desc: '加水煎煮1-2小时，提取色素' },
      { step: 4, title: '过滤', desc: '滤去果渣，取清液' },
      { step: 5, title: '浓缩', desc: '低温浓缩得到浓缩染液' }
    ]
  },
  {
    id: 4,
    name: '紫草',
    category: '紫色系',
    color: '#7c3aed',
    origin: '中国东北及华北地区',
    season: '春秋季采挖',
    description: '紫草染出的紫色高贵典雅，在古代只有皇室贵族才能使用。',
    properties: '抗菌止痒，色泽高贵',
    processing: [
      { step: 1, title: '采挖', desc: '春秋季采挖紫草的根部' },
      { step: 2, title: '洗净', desc: '去除泥土和须根' },
      { step: 3, title: '干燥', desc: '阴干或低温烘干' },
      { step: 4, title: '浸泡', desc: '用酒精浸泡提取紫色素' },
      { step: 5, title: '调配', desc: '按比例调配染液浓度' }
    ]
  },
  {
    id: 5,
    name: '苏木',
    category: '红色系',
    color: '#991b1b',
    origin: '中国云南、广西等地',
    season: '全年可采',
    description: '苏木是珍贵的红色染料，染出的红色深沉厚重，又称"苏方"。',
    properties: '色泽持久，活血化瘀',
    processing: [
      { step: 1, title: '采伐', desc: '采伐苏木树干，除去外皮' },
      { step: 2, title: '劈碎', desc: '将树干劈成小块或刨成薄片' },
      { step: 3, title: '煎煮', desc: '加水煎煮3小时以上' },
      { step: 4, title: '过滤', desc: '滤去木屑杂质' },
      { step: 5, title: '调整', desc: '加入明矾调整色光' }
    ]
  },
  {
    id: 6,
    name: '五倍子',
    category: '黑色系',
    color: '#1f2937',
    origin: '中国西南地区',
    season: '秋季采摘',
    description: '五倍子是重要的黑色染料，染出的黑色庄重典雅，色牢度极佳。',
    properties: '色牢度极佳，收敛止血',
    processing: [
      { step: 1, title: '采摘', desc: '秋季采摘未成熟的五倍子' },
      { step: 2, title: '蒸煮', desc: '沸水蒸煮杀死内部蚜虫' },
      { step: 3, title: '干燥', desc: '晒干或烘干' },
      { step: 4, title: '煎煮', desc: '加水煎煮提取单宁酸' },
      { step: 5, title: '媒染', desc: '加入铁矾进行媒染得黑色' }
    ]
  },
  {
    id: 7,
    name: '洋葱皮',
    category: '黄色系',
    color: '#f59e0b',
    origin: '全国各地均产',
    season: '全年可收集',
    description: '洋葱皮是最易获取的黄色染料，适合初学者入门使用，染出的颜色温暖柔和。',
    properties: '材料易得，操作简单',
    processing: [
      { step: 1, title: '收集', desc: '平时收集洋葱的外层干皮' },
      { step: 2, title: '清洗', desc: '清水洗净灰尘' },
      { step: 3, title: '煎煮', desc: '加水慢煮45分钟' },
      { step: 4, title: '过滤', desc: '滤去洋葱皮' },
      { step: 5, title: '染色', desc: '可直接用于染色' }
    ]
  },
  {
    id: 8,
    name: '茶叶',
    category: '棕色系',
    color: '#78350f',
    origin: '中国南方茶区',
    season: '四季均可',
    description: '茶叶染出的棕色古朴自然，非常适合棉麻面料，给人回归自然的感觉。',
    properties: '天然环保，气味芳香',
    processing: [
      { step: 1, title: '准备', desc: '使用红茶或普洱茶均可' },
      { step: 2, title: '冲泡', desc: '用沸水冲泡茶叶' },
      { step: 3, title: '煎煮', desc: '继续煎煮20-30分钟' },
      { step: 4, title: '过滤', desc: '滤去茶叶残渣' },
      { step: 5, title: '染色', desc: '控制染液浓度得到不同深浅的棕色' }
    ]
  }
]

export const works = [
  {
    id: 1,
    title: '青花瓷韵',
    type: 'classic',
    author: '李明',
    authorId: 2,
    material: '板蓝根',
    technique: '蜡染',
    description: '采用传统蜡染技艺，以板蓝根为染料，在棉布上绘制出青花瓷般的图案，蓝白相映，清雅脱俗。',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop',
    colors: ['#1e40af', '#ffffff'],
    createTime: '2024-01-15',
    likes: 256,
    views: 1280,
    status: 'approved',
    reviewMessage: ''
  },
  {
    id: 2,
    title: '朱砂满堂',
    type: 'classic',
    author: '王芳',
    authorId: 3,
    material: '红花',
    technique: '扎染',
    description: '以红花为染料，采用精妙的扎染技法，呈现出层次丰富的红色渐变，如朝霞般绚烂。',
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=400&h=400&fit=crop',
    colors: ['#dc2626', '#fca5a5'],
    createTime: '2024-02-20',
    likes: 189,
    views: 980,
    status: 'approved',
    reviewMessage: ''
  },
  {
    id: 3,
    title: '金秋满园',
    type: 'classic',
    author: '张伟',
    authorId: 2,
    material: '栀子',
    technique: '手绘染',
    description: '栀子黄温润典雅，配合手绘技法，在丝绸上描绘出金秋时节的丰收景象。',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    colors: ['#eab308', '#fef08a'],
    createTime: '2024-03-10',
    likes: 312,
    views: 1560,
    status: 'approved',
    reviewMessage: ''
  },
  {
    id: 4,
    title: '紫气东来',
    type: 'innovation',
    author: '陈静',
    authorId: 3,
    material: '紫草',
    technique: '渐变染',
    description: '将传统紫草染与现代渐变技法结合，创造出梦幻般的紫色渐变效果，寓意祥瑞降临。',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=400&fit=crop',
    colors: ['#7c3aed', '#c4b5fd'],
    createTime: '2024-03-25',
    likes: 428,
    views: 2140,
    status: 'approved',
    reviewMessage: ''
  },
  {
    id: 5,
    title: '墨染山河',
    type: 'innovation',
    author: '刘洋',
    authorId: 2,
    material: '五倍子',
    technique: '泼染',
    description: '借鉴中国山水画的泼墨技法，以五倍子染出浓淡变化的墨色，展现大气磅礴的山河气势。',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
    colors: ['#1f2937', '#6b7280'],
    createTime: '2024-04-05',
    likes: 567,
    views: 2835,
    status: 'approved',
    reviewMessage: ''
  },
  {
    id: 6,
    title: '绿野仙踪',
    type: 'innovation',
    author: '赵雪',
    authorId: 3,
    material: '艾草',
    technique: '植物拓染',
    description: '将新鲜艾草直接拓染在布料上，保留植物的自然纹理和色彩，带来清新自然的感受。',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop',
    colors: ['#166534', '#86efac'],
    createTime: '2024-04-18',
    likes: 389,
    views: 1945,
    status: 'approved',
    reviewMessage: ''
  },
  {
    id: 7,
    title: '古韵新声',
    type: 'innovation',
    author: '孙磊',
    authorId: 2,
    material: '苏木+板蓝根',
    technique: '套色染',
    description: '巧妙运用苏木红与板蓝根蓝的套色技法，创造出传统与现代交融的独特视觉效果。',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=400&fit=crop',
    colors: ['#991b1b', '#1e40af'],
    createTime: '2024-05-01',
    likes: 456,
    views: 2280,
    status: 'approved',
    reviewMessage: ''
  },
  {
    id: 8,
    title: '大地回春',
    type: 'classic',
    author: '周婷',
    authorId: 3,
    material: '茶叶+洋葱皮',
    technique: '混染',
    description: '茶叶的古朴棕色与洋葱皮的温暖黄色相融合，呈现出大地回春的温暖意境。',
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400&h=400&fit=crop',
    colors: ['#78350f', '#f59e0b'],
    createTime: '2024-05-12',
    likes: 298,
    views: 1490,
    status: 'approved',
    reviewMessage: ''
  }
]

export const tutorials = [
  {
    id: 1,
    title: '板蓝根染色入门教程',
    author: '李明',
    authorId: 101,
    level: 'beginner',
    duration: '60分钟',
    material: '板蓝根',
    description: '从零基础开始，学习如何使用板蓝根进行基础染色，掌握浸泡、染色、清洗等核心步骤。',
    cover: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=400&fit=crop',
    steps: [
      { title: '准备材料', desc: '板蓝根染液、棉布、手套、染色盆、搅拌棒' },
      { title: '布料预处理', desc: '将棉布用清水浸泡20分钟，充分润湿' },
      { title: '调制染液', desc: '将板蓝根染液按1:5比例加水稀释，搅拌均匀' },
      { title: '初次染色', desc: '将润湿的布料放入染液，浸泡15分钟，期间不断翻动' },
      { title: '氧化显色', desc: '取出布料，在空气中氧化10分钟，观察颜色变化' },
      { title: '重复染色', desc: '根据需要的颜色深浅，重复染色和氧化步骤3-5次' },
      { title: '清洗固色', desc: '用清水冲洗直到水变清，最后用淡盐水浸泡固色' },
      { title: '晾干成品', desc: '阴干避免阳光直射，完成染色' }
    ],
    videos: {
      soak: 'https://example.com/soak.mp4',
      dye: 'https://example.com/dye.mp4',
      fix: 'https://example.com/fix.mp4'
    },
    views: 5680,
    likes: 423,
    createTime: '2024-01-10'
  },
  {
    id: 2,
    title: '扎染技法详解',
    author: '王芳',
    authorId: 102,
    level: 'intermediate',
    duration: '90分钟',
    material: '红花、板蓝根',
    description: '深入学习扎染的各种捆扎技法，包括螺旋扎、放射扎、折叠扎等，创造出丰富的图案效果。',
    cover: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=600&h=400&fit=crop',
    steps: [
      { title: '图案设计', desc: '在纸上设计想要的扎染图案' },
      { title: '布料标记', desc: '用铅笔在布料上轻轻标记捆扎位置' },
      { title: '螺旋扎法', desc: '从中心点开始，将布料旋转折叠成螺旋状' },
      { title: '捆扎固定', desc: '用棉线按照标记位置紧紧捆扎' },
      { title: '染液准备', desc: '准备红花和板蓝根两种染液' },
      { title: '分区染色', desc: '不同区域浸入不同染液，创造多彩效果' },
      { title: '拆线清洗', desc: '染色完成后小心拆线，清洗浮色' },
      { title: '成品展示', desc: '展开布料，欣赏独特的扎染图案' }
    ],
    videos: {
      soak: 'https://example.com/tie-soak.mp4',
      dye: 'https://example.com/tie-dye.mp4',
      fix: 'https://example.com/tie-fix.mp4'
    },
    views: 8920,
    likes: 756,
    createTime: '2024-02-15'
  },
  {
    id: 3,
    title: '草木染媒染剂使用指南',
    author: '张伟',
    authorId: 103,
    level: 'advanced',
    duration: '45分钟',
    material: '多种染材',
    description: '了解明矾、铁矾、石灰等不同媒染剂的作用原理和使用方法，提升染色效果和色牢度。',
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    steps: [
      { title: '媒染剂认识', desc: '了解常见媒染剂的种类和特性' },
      { title: '明矾媒染', desc: '学习使用明矾作为媒染剂的标准方法' },
      { title: '铁矾变色', desc: '掌握铁矾改变颜色色调的技巧' },
      { title: '石灰固色', desc: '使用石灰水进行固色处理' },
      { title: '媒染时机', desc: '了解前媒染、后媒染、同媒染的区别' },
      { title: '安全注意', desc: '媒染剂使用的安全注意事项' }
    ],
    videos: {
      soak: 'https://example.com/mordant-soak.mp4',
      dye: 'https://example.com/mordant-dye.mp4',
      fix: 'https://example.com/mordant-fix.mp4'
    },
    views: 3450,
    likes: 289,
    createTime: '2024-03-20'
  },
  {
    id: 4,
    title: '植物拓染体验课',
    author: '赵雪',
    authorId: 106,
    level: 'beginner',
    duration: '30分钟',
    material: '艾草、树叶、花瓣',
    description: '最简单有趣的草木染方式，将植物的自然形态和色彩直接转移到布料上。',
    cover: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=400&fit=crop',
    steps: [
      { title: '采集植物', desc: '采集新鲜的艾草、树叶和花瓣' },
      { title: '布料准备', desc: '使用纯棉或真丝布料，提前润湿' },
      { title: '植物布局', desc: '在布料上设计植物的摆放位置' },
      { title: '覆盖固定', desc: '用透明胶带固定植物，防止移位' },
      { title: '敲击拓印', desc: '用木棒或鹅卵石均匀敲击' },
      { title: '揭开检查', desc: '小心揭开胶带，检查拓印效果' },
      { title: '固色处理', desc: '用淡盐水浸泡固色' },
      { title: '晾干成品', desc: '阴干后熨烫定型' }
    ],
    videos: {
      soak: 'https://example.com/eco-soak.mp4',
      dye: 'https://example.com/eco-dye.mp4',
      fix: 'https://example.com/eco-fix.mp4'
    },
    views: 12340,
    likes: 1089,
    createTime: '2024-04-10'
  }
]

export const inheritors = [
  {
    id: 1,
    name: '李传统',
    title: '国家级非物质文化遗产传承人',
    experience: '50年',
    specialty: '板蓝根染、蜡染',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    bio: '李传统老师出生于染织世家，从12岁开始跟随祖父学习草木染技艺，至今已有50年。他的板蓝根染技艺精湛，作品多次获得国家级奖项。',
    skills: [
      '传统板蓝根发酵技艺',
      '蜡染图案设计与创作',
      '天然靛蓝提取工艺',
      '布料预处理技术'
    ],
    style: '坚守传统工艺，注重古法传承，作品典雅庄重，富有文化底蕴',
    representativeWorks: [1, 3],
    achievements: ['国家级非遗传承人', '中国工艺美术大师', '全国技术能手'],
    contact: 'lichuantong@example.com'
  },
  {
    id: 2,
    name: '王锦绣',
    title: '省级非物质文化遗产传承人',
    experience: '35年',
    specialty: '扎染、红花染',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    bio: '王锦绣老师专注扎染技艺30余年，她的作品以色彩层次丰富、图案变化万千著称，被誉为"扎染女王"。',
    skills: [
      '螺旋扎染技法',
      '放射扎染技法',
      '红花色素提取',
      '多色套染技术'
    ],
    style: '色彩大胆，图案富有创意，善于将传统技法与现代审美相结合',
    representativeWorks: [2],
    achievements: ['省级非遗传承人', '云南省工艺美术大师', '三八红旗手'],
    contact: 'wangjinxiu@example.com'
  },
  {
    id: 3,
    name: '张天然',
    title: '草木染技艺创新先锋',
    experience: '20年',
    specialty: '天然染料提取、创新染色',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    bio: '张天然老师毕业于清华大学美术学院，致力于将传统草木染与现代设计结合，开发出多种创新染色技法。',
    skills: [
      '新型天然染料开发',
      '渐变染色技术',
      '环保媒染剂研究',
      '草木染艺术创作'
    ],
    style: '追求创新，注重新材料新工艺的应用，作品时尚前卫，符合现代审美',
    representativeWorks: [4, 7],
    achievements: ['中国设计红星奖', '创新先锋人物', '高校客座教授'],
    contact: 'zhangtianran@example.com'
  }
]

export const comments = {
  tutorials: {
    1: [
      {
        id: 1,
        userId: 3,
        userName: '王芳',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face',
        content: '讲解非常详细，跟着教程第一次染就成功了！板蓝根的颜色真的很漂亮。',
        rating: 5,
        createTime: '2024-04-15 14:30',
        likes: 24,
        replies: [
          {
            id: 101,
            userId: 101,
            userName: '李明',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
            content: '是的，我也是第一次就成功了，老师讲得特别清楚！',
            createTime: '2024-04-15 15:20'
          }
        ]
      },
      {
        id: 2,
        userId: 2,
        userName: '李明',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        content: '作为初学者，这个教程太友好了！步骤清晰，注意事项也很全面。建议新手从这个开始。',
        rating: 5,
        createTime: '2024-04-10 09:15',
        likes: 18,
        replies: []
      },
      {
        id: 3,
        userId: 4,
        userName: '张三',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face',
        content: '染出来的颜色比预期的浅一些，可能是我浸泡的时间不够。准备再试一次！',
        rating: 4,
        createTime: '2024-04-05 16:45',
        likes: 5,
        replies: []
      }
    ],
    2: [
      {
        id: 4,
        userId: 2,
        userName: '李明',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        content: '扎染真的太神奇了，每次展开都是惊喜！老师的螺旋扎法讲解得很清楚。',
        rating: 5,
        createTime: '2024-03-20 11:30',
        likes: 42,
        replies: []
      }
    ],
    3: [],
    4: [
      {
        id: 5,
        userId: 3,
        userName: '王芳',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face',
        content: '植物拓染太有意思了！孩子也一起参与，亲子活动的好选择。',
        rating: 5,
        createTime: '2024-04-20 15:00',
        likes: 56,
        replies: []
      }
    ]
  },
  works: {
    1: [
      {
        id: 6,
        userId: 3,
        userName: '王芳',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face',
        content: '青花瓷的意境太美了，蓝白相间，清雅脱俗！',
        rating: 5,
        createTime: '2024-04-18 10:20',
        likes: 35,
        replies: []
      },
      {
        id: 7,
        userId: 4,
        userName: '张三',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face',
        content: '想知道这个蜡染的图案是怎么画的，太精致了！',
        rating: 5,
        createTime: '2024-04-16 14:50',
        likes: 12,
        replies: []
      }
    ],
    4: [
      {
        id: 8,
        userId: 2,
        userName: '李明',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        content: '紫色渐变太梦幻了，创新和传统结合得很好！',
        rating: 5,
        createTime: '2024-04-01 09:30',
        likes: 78,
        replies: []
      }
    ],
    5: [],
    2: [],
    3: [],
    6: [],
    7: [],
    8: []
  }
}

export const ecoKnowledge = [
  {
    id: 1,
    title: '草木染的环保优势',
    content: '草木染使用天然植物染料，不含任何化学添加剂，染色过程中产生的废水可以自然降解，对环境友好。相比化学染色，草木染可以减少80%以上的水污染。',
    icon: '🌿'
  },
  {
    id: 2,
    title: '可生物降解的天然染料',
    content: '植物染料来源于大自然，染色后的织物在废弃后可以完全生物降解，不会产生微塑料污染，真正做到从自然中来，回到自然中去。',
    icon: '♻️'
  },
  {
    id: 3,
    title: '对肌肤友好的草木染',
    content: '草木染使用纯天然原料，染出的织物对皮肤零刺激，特别适合敏感肌肤人群和婴幼儿使用。部分染料如板蓝根、艾草等还具有抗菌消炎的功效。',
    icon: '🧴'
  },
  {
    id: 4,
    title: '可持续的染色工艺',
    content: '传统草木染技艺强调循环利用，染液可以多次使用，废渣可以作为肥料回归土壤，形成完整的生态循环，是真正可持续的生产方式。',
    icon: '🔄'
  },
  {
    id: 5,
    title: '保护生物多样性',
    content: '草木染的发展带动了染料植物的种植，有助于保护当地植物多样性，同时为农户提供了新的收入来源，实现生态保护与经济发展的双赢。',
    icon: '🌍'
  },
  {
    id: 6,
    title: '节能减排的智慧',
    content: '传统草木染多采用常温染色，无需高温加热，大大降低了能源消耗。据统计，草木染的能耗仅为化学染色的30%左右。',
    icon: '💡'
  }
]

export const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: '系统管理员',
    email: 'admin@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createTime: '2023-01-01',
    status: 'active',
    favorites: [1, 2, 4],
    favoriteWorks: [1, 2, 3],
    browseHistory: [1, 2, 3, 4],
    myWorks: []
  },
  {
    id: 2,
    username: 'user1',
    password: 'user123',
    role: 'user',
    name: '李明',
    email: 'liming@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    createTime: '2023-03-15',
    status: 'active',
    favorites: [1, 3],
    favoriteWorks: [1, 4, 5],
    browseHistory: [1, 2, 3],
    myWorks: [1]
  },
  {
    id: 3,
    username: 'user2',
    password: 'user123',
    role: 'user',
    name: '王芳',
    email: 'wangfang@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    createTime: '2023-05-20',
    status: 'active',
    favorites: [2, 4],
    favoriteWorks: [2, 6],
    browseHistory: [2, 4],
    myWorks: [2]
  }
]

export const categories = [
  { id: 'all', name: '全部染材' },
  { id: '蓝色系', name: '蓝色系' },
  { id: '红色系', name: '红色系' },
  { id: '黄色系', name: '黄色系' },
  { id: '紫色系', name: '紫色系' },
  { id: '黑色系', name: '黑色系' },
  { id: '棕色系', name: '棕色系' }
]

export const adminData = {
  statistics: {
    totalUsers: 1256,
    totalWorks: 368,
    totalTutorials: 48,
    totalMaterials: 25,
    newUsersToday: 28,
    newWorksToday: 12,
    activeUsers: 856
  },
  pendingWorks: [
    { id: 101, title: '春意盎然', author: '新手染者', submitTime: '2024-05-20 10:30' },
    { id: 102, title: '夏日荷香', author: '布艺爱好者', submitTime: '2024-05-20 14:20' },
    { id: 103, title: '秋叶飘零', author: '草木染学徒', submitTime: '2024-05-19 09:15' }
  ],
  pendingTutorials: [
    { id: 201, title: '新手入门：洋葱皮染色', author: '李明', submitTime: '2024-05-20 11:00' },
    { id: 202, title: '高级技法：多色套染', author: '王芳', submitTime: '2024-05-20 13:30' }
  ]
}

export const favorites = [
  { id: 1, userId: 2, name: '入门教程', description: '适合初学者的基础教程', tutorials: [1, 4], createTime: '2024-03-01', isDefault: true },
  { id: 2, userId: 2, name: '进阶学习', description: '提升技艺的进阶教程', tutorials: [2, 3], createTime: '2024-04-15', isDefault: false },
  { id: 3, userId: 3, name: '我的收藏', description: '喜欢的教程合集', tutorials: [1, 2, 3, 4], createTime: '2024-02-10', isDefault: true }
]

export const notifications = [
  { id: 1, userId: 2, type: 'review', title: '作品审核通过', content: '您的作品"青花瓷韵"已通过审核，已在平台展示。', read: false, createTime: '2024-05-19 10:30' },
  { id: 2, userId: 2, type: 'comment', title: '收到新评论', content: '用户"王芳"评论了您的作品"青花瓷韵"。', read: false, createTime: '2024-05-18 14:20' },
  { id: 3, userId: 2, type: 'like', title: '作品获赞', content: '您的作品"青花瓷韵"获得了20个新点赞。', read: true, createTime: '2024-05-17 09:15' },
  { id: 4, userId: 3, type: 'review', title: '作品审核结果', content: '您的作品"夏日荷香"未通过审核，请修改后重新提交。', read: false, createTime: '2024-05-19 15:45' },
  { id: 5, userId: 3, type: 'follow', title: '新粉丝关注', content: '用户"李明"关注了您。', read: true, createTime: '2024-05-16 11:00' }
]

export const tutorialMaterials = {
  1: [
    { id: 1, title: '板蓝根染色工具清单.pdf', size: '1.2MB', type: 'pdf', segment: '准备阶段' },
    { id: 2, title: '染液配比参考表.xlsx', size: '85KB', type: 'excel', segment: '调制染液' },
    { id: 3, title: '染色步骤演示视频.mp4', size: '45MB', type: 'video', segment: '染色过程' },
    { id: 4, title: '常见问题解答.docx', size: '56KB', type: 'doc', segment: '通用' }
  ],
  2: [
    { id: 5, title: '扎染图案设计模板.pdf', size: '2.1MB', type: 'pdf', segment: '图案设计' },
    { id: 6, title: '捆扎技法教程.mp4', size: '68MB', type: 'video', segment: '捆扎技巧' },
    { id: 7, title: '配色参考表.xlsx', size: '120KB', type: 'excel', segment: '染色过程' }
  ],
  3: [
    { id: 8, title: '媒染剂安全使用指南.pdf', size: '890KB', type: 'pdf', segment: '安全须知' },
    { id: 9, title: '媒染剂配比表.xlsx', size: '65KB', type: 'excel', segment: '媒染技法' }
  ],
  4: [
    { id: 10, title: '植物拓染材料清单.pdf', size: '450KB', type: 'pdf', segment: '材料准备' },
    { id: 11, title: '植物采集指南.docx', size: '78KB', type: 'doc', segment: '材料准备' },
    { id: 12, title: '拓印技巧演示.mp4', size: '32MB', type: 'video', segment: '拓印过程' }
  ]
}
