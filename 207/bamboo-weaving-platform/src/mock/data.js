export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    nickname: '竹编管理员',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    phone: '13800138000',
    email: 'admin@bamboo.com',
    createTime: '2024-01-01'
  },
  {
    id: 2,
    username: 'learner1',
    password: '123456',
    nickname: '竹编爱好者',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=learner1',
    phone: '13900139000',
    email: 'learner1@bamboo.com',
    createTime: '2024-02-15'
  },
  {
    id: 3,
    username: 'artisan1',
    password: '123456',
    nickname: '竹编匠人',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artisan1',
    phone: '13700137000',
    email: 'artisan1@bamboo.com',
    createTime: '2024-03-10'
  }
]

export const mockCategories = [
  { id: 'practical', name: '实用类', description: '日常使用的竹编器具', icon: '🏠', count: 28 },
  { id: 'ornamental', name: '观赏类', description: '装饰性竹编艺术品', icon: '🎨', count: 16 },
  { id: 'cultural', name: '文创类', description: '文化创意竹编产品', icon: '✨', count: 22 }
]

export const mockWorks = [
  {
    id: 1,
    title: '传统竹编花篮',
    category: 'practical',
    author: '竹编匠人',
    authorId: 3,
    description: '采用传统编织技法，纯手工制作，结实耐用，适合日常生活使用。',
    images: ['https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=300&fit=crop'],
    tags: ['花篮', '传统技法', '实用'],
    difficulty: '中级',
    createTime: '2024-03-15',
    likes: 128,
    views: 856,
    status: 'approved',
    creationProcess: [
      { step: 1, title: '选材', description: '选用三年以上的毛竹，竹节均匀，无虫蛀。', image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300&h=200&fit=crop' },
      { step: 2, title: '破竹', description: '将竹子劈成均匀的竹篾，宽度约5mm。', image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300&h=200&fit=crop' },
      { step: 3, title: '编织', description: '采用十字编织法打底，然后逐渐收边。', image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=300&h=200&fit=crop' }
    ]
  },
  {
    id: 2,
    title: '竹编装饰画-山水',
    category: 'ornamental',
    author: '竹编爱好者',
    authorId: 2,
    description: '以竹为墨，以编为笔，绘就山水意境。采用精细编织技法，展现中国传统山水画之美。',
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'],
    tags: ['装饰画', '山水', '精细编织'],
    difficulty: '高级',
    createTime: '2024-04-20',
    likes: 256,
    views: 1208,
    status: 'approved',
    creationProcess: [
      { step: 1, title: '设计图案', description: '先在纸上设计好山水图案，确定色彩搭配。', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&h=200&fit=crop' },
      { step: 2, title: '染色处理', description: '将竹篾进行天然染色处理。', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop' }
    ]
  },
  {
    id: 3,
    title: '竹编书签套装',
    category: 'cultural',
    author: '竹编匠人',
    authorId: 3,
    description: '创意竹编书签，传统文化与现代设计的完美结合，是送友佳品。',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop'],
    tags: ['书签', '文创', '礼品'],
    difficulty: '初级',
    createTime: '2024-05-10',
    likes: 89,
    views: 567,
    status: 'approved',
    creationProcess: []
  },
  {
    id: 4,
    title: '竹编茶叶罐',
    category: 'practical',
    author: '竹编爱好者',
    authorId: 2,
    description: '密封性好，防潮保鲜，是茶叶收藏的最佳选择。',
    images: ['https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=400&h=300&fit=crop'],
    tags: ['茶叶罐', '实用', '密封'],
    difficulty: '中级',
    createTime: '2024-05-15',
    likes: 67,
    views: 345,
    status: 'approved',
    creationProcess: []
  },
  {
    id: 5,
    title: '竹编花瓶摆件',
    category: 'ornamental',
    author: '竹编匠人',
    authorId: 3,
    description: '造型优雅，线条流畅，为家居增添一抹自然之美。',
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'],
    tags: ['花瓶', '摆件', '家居装饰'],
    difficulty: '高级',
    createTime: '2024-06-01',
    likes: 198,
    views: 892,
    status: 'approved',
    creationProcess: []
  },
  {
    id: 6,
    title: '竹编笔记本',
    category: 'cultural',
    author: '竹编爱好者',
    authorId: 2,
    description: '竹编封面笔记本，手感独特，记录生活点滴。',
    images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=300&fit=crop'],
    tags: ['笔记本', '文创', '文具'],
    difficulty: '初级',
    createTime: '2024-06-05',
    likes: 76,
    views: 423,
    status: 'approved',
    creationProcess: []
  }
]

export const mockTutorials = [
  {
    id: 1,
    title: '竹编入门：基础起底技法',
    category: 'practical',
    level: '入门',
    duration: '45分钟',
    author: '竹编大师-李师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master1',
    description: '学习竹编最基础的起底技法，掌握十字编、人字编等核心编织方法。起底是竹编的基础，决定了整个作品的形状和稳定性。',
    cover: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=600&h=400&fit=crop',
    views: 3560,
    likes: 234,
    rating: 4.8,
    createTime: '2024-01-15',
    isRecommended: true,
    commonMistakes: [
      '竹篾浸泡时间不足，导致韧性不够容易断裂',
      '交叉点没有对齐，造成格子大小不一',
      '中心点固定过紧，无法进行后续调整',
      '编织时用力不均，导致成品变形',
      '竹篾选择不当，粗细不一致影响美观'
    ],
    tools: ['竹篾（宽5mm，厚1mm）', '剪刀', '尺子', '水盆', '毛巾', '细绳'],
    steps: [
      {
        id: 1,
        title: '准备材料',
        description: '准备好竹篾、剪刀、尺子等工具。将竹篾放入水盆中浸泡30-60分钟，使其充分软化。取出后用毛巾擦干表面水分，增加韧性便于编织。',
        keyPoint: '竹篾浸泡时间根据粗细而定，一般30分钟至1小时。浸泡不足会导致断裂，过久则容易发霉。',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop',
        duration: '5分钟',
        commonMistakes: '浸泡时间过长或过短都会影响竹篾的韧性'
      },
      {
        id: 2,
        title: '十字打底',
        description: '取6根竹篾，横竖各3根，交叉叠放，形成十字基础。确保每根竹篾的中心点对齐，形成9个大小相等的方格。用手指轻轻按压交叉点，使其平整。',
        keyPoint: '交叉点要对齐，确保每个格子大小一致。可以用尺子辅助测量，保证间距均匀。',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=300&fit=crop',
        duration: '10分钟',
        isDifficult: true,
        commonMistakes: '交叉点偏移导致格子大小不一，影响后续编织'
      },
      {
        id: 3,
        title: '固定中心点',
        description: '用细绳或细竹篾将中心点固定，防止移位。先在中心点缠绕2-3圈，然后轻轻打结固定。注意不要过紧，留出后续调整的空间。',
        keyPoint: '固定时不要过紧，留出调整空间。过紧会导致竹篾变形，影响编织效果。',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=300&fit=crop',
        duration: '5分钟',
        commonMistakes: '固定过紧导致竹篾变形，或过松导致中心点移位'
      },
      {
        id: 4,
        title: '开始编织',
        description: '从中心开始，采用挑一压一的方法进行编织。取一根新的竹篾，从中心点下方穿过，然后依次挑一根压一根，围绕中心点编织。每编织一圈，轻轻拉紧竹篾，保持平整。',
        keyPoint: '每一圈都要拉紧，但不要用力过猛导致竹篾断裂。保持编织的松紧度一致，成品才会平整美观。',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=300&fit=crop',
        duration: '20分钟',
        isDifficult: true,
        commonMistakes: '用力过猛导致竹篾断裂，或松紧不均导致成品凹凸不平'
      },
      {
        id: 5,
        title: '整理成型',
        description: '编织完成后，整理形状，修剪多余的竹篾。用剪刀将边缘的竹篾修剪整齐，留出约1cm的余量，便于后续收边工序。用手轻轻调整形状，使其平整圆润。',
        keyPoint: '修剪时要留出约1cm的余量，便于后续收边。修剪过短会导致收边困难，过长则影响美观。',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=300&fit=crop',
        duration: '5分钟',
        commonMistakes: '修剪过短导致收边时竹篾脱出，或修剪不齐影响美观'
      }
    ]
  },
  {
    id: 2,
    title: '进阶教程：编结技法详解',
    category: 'practical',
    level: '中级',
    duration: '60分钟',
    author: '竹编大师-王师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master2',
    description: '深入学习各种编结技法，包括平结、双钱结、吉祥结等传统结艺。编结技法可以用于装饰和固定，是竹编作品的重要组成部分。',
    cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    views: 2340,
    likes: 189,
    rating: 4.9,
    createTime: '2024-02-20',
    isRecommended: true,
    commonMistakes: [
      '编结时拉力不均，导致结形不美观',
      '竹篾方向搞错，形成错误的结形',
      '收尾处理不当，结容易散开',
      '选择的竹篾太粗，编出的结不够精致',
      '没有预留足够的竹篾长度，导致编到一半不够用'
    ],
    tools: ['细竹篾（宽2mm，厚0.5mm）', '剪刀', '镊子', '尺子', '打火机（烧毛边用）'],
    steps: [
      {
        id: 1,
        title: '平结技法',
        description: '平结是最基础的结艺，常用于固定和装饰。取两根竹篾，交叉成十字形。左边的竹篾从上方绕过右边的竹篾，然后从下方穿回。右边的竹篾用同样的方法交叉编织。',
        keyPoint: '左右交替，保持松紧一致。每编完一个结都要拉紧，确保结形平整。',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        duration: '15分钟',
        isDifficult: true,
        commonMistakes: '左右交叉顺序错误，或松紧不均导致结形歪斜'
      },
      {
        id: 2,
        title: '双钱结',
        description: '双钱结形似古铜钱，寓意吉祥如意。先编一个简单的环，然后将竹篾穿过环，形成第二个环。注意两个环的大小要一致，形成两个相连的圆形，如同两枚重叠的铜钱。',
        keyPoint: '注意线条的走向，形成两个相连的圆。调整时要耐心，逐步收紧，保持两个圆的大小一致。',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        duration: '20分钟',
        isDifficult: true,
        commonMistakes: '两个圆大小不一，或线条交叉错误导致结形变形'
      },
      {
        id: 3,
        title: '吉祥结',
        description: '吉祥结是中国传统结艺中的经典，象征吉祥如意。先编一个十字基础，然后按照特定的顺序编织出七个耳朵。每个耳朵的大小要均匀，最后收紧整理成型。',
        keyPoint: '七个耳朵要大小均匀，造型美观。编织时要注意竹篾的走向，避免交叉错误。',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        duration: '25分钟',
        isDifficult: true,
        commonMistakes: '耳朵大小不一，或收紧时用力过猛导致竹篾断裂'
      }
    ]
  },
  {
    id: 3,
    title: '收边技巧大全',
    category: 'practical',
    level: '中级',
    duration: '50分钟',
    author: '竹编大师-李师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master1',
    description: '学习多种收边技法，让你的作品更加精致完美。收边是竹编作品的最后一道工序，直接影响作品的美观度和耐用性。',
    cover: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=600&h=400&fit=crop',
    views: 1890,
    likes: 156,
    rating: 4.7,
    createTime: '2024-03-10',
    isRecommended: true,
    commonMistakes: [
      '收边时竹篾留得过短，无法插入缝隙',
      '插入角度不对，导致竹篾弹出',
      '收边顺序错误，造成边缘不整齐',
      '没有修剪整齐，边缘有毛刺',
      '收边过紧导致作品变形'
    ],
    tools: ['剪刀', '镊子', '锉刀', '细砂纸'],
    steps: [
      {
        id: 1,
        title: '简单收边',
        description: '最基础的收边方法，适合初学者。将边缘的竹篾向内弯折45度，然后用镊子将其插入相邻的编织缝隙中。确保插入深度足够，一般插入2-3个格子。',
        keyPoint: '将竹篾向内弯折，插入编织缝隙中。弯折角度要适中，插入后轻轻拉紧，确保牢固。',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=300&fit=crop',
        duration: '15分钟',
        commonMistakes: '插入深度不够导致竹篾弹出，或弯折角度过大导致断裂'
      },
      {
        id: 2,
        title: '花式收边',
        description: '装饰性收边，让作品更具艺术感。可以编出波浪形、锯齿形等多种图案。先设计好图案，然后按照图案逐段收边。注意图案的重复性和对称性。',
        keyPoint: '注意图案的规律性和一致性。每完成一个图案单元都要检查，确保与前一个单元保持一致。',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=300&fit=crop',
        duration: '20分钟',
        isDifficult: true,
        commonMistakes: '图案不对称，或收边力度不均导致边缘波浪形'
      },
      {
        id: 3,
        title: '加固收边',
        description: '增加边缘强度，延长使用寿命。先用细线沿边缘缝制一圈加固，然后再进行收边。也可以在收边后在边缘涂抹一层透明的保护漆。',
        keyPoint: '可以用细线辅助加固。缝制时针脚要细密均匀，不要影响外观。',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=300&fit=crop',
        duration: '15分钟',
        commonMistakes: '细线外露影响美观，或加固过紧导致边缘变形'
      }
    ]
  },
  {
    id: 4,
    title: '竹编染色工艺',
    category: 'cultural',
    level: '高级',
    duration: '90分钟',
    author: '竹编大师-陈师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master3',
    description: '学习传统天然染色技法，为竹编作品增添丰富色彩。',
    cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    views: 1230,
    likes: 98,
    rating: 4.9,
    createTime: '2024-04-05',
    isRecommended: true,
    steps: [
      {
        id: 1,
        title: '天然染料制备',
        description: '使用植物、矿物等天然材料制作染料。',
        keyPoint: '不同材料的熬制时间和方法不同。',
        videoUrl: '',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        duration: '30分钟',
        isDifficult: true
      },
      {
        id: 2,
        title: '染色工艺',
        description: '掌握染色的温度、时间和浓度控制。',
        keyPoint: '染色过程中要不停翻动，保证上色均匀。',
        videoUrl: '',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        duration: '40分钟',
        isDifficult: true
      },
      {
        id: 3,
        title: '固色处理',
        description: '使用天然固色剂，保持色彩持久。',
        keyPoint: '固色后要阴干，避免阳光直射。',
        videoUrl: '',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        duration: '20分钟'
      }
    ]
  }
]

export const mockComments = [
  {
    id: 1,
    tutorialId: 1,
    userId: 2,
    username: '竹编爱好者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=learner1',
    content: '讲解非常详细，跟着做成功了！感谢老师！',
    createTime: '2024-03-20 14:30',
    likes: 12
  },
  {
    id: 2,
    tutorialId: 1,
    userId: 3,
    username: '竹编匠人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artisan1',
    content: '十字打底那部分讲得特别好，以前一直不知道怎么对齐。',
    createTime: '2024-03-21 09:15',
    likes: 8
  },
  {
    id: 3,
    tutorialId: 1,
    userId: 2,
    username: '竹编爱好者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=learner1',
    content: '请问老师，竹篾容易断是什么原因？',
    createTime: '2024-03-22 16:45',
    likes: 3,
    isQuestion: true,
    reply: {
      content: '可能是竹篾太干了，可以适当延长浸泡时间，或者选择更年轻的竹子。',
      replyTime: '2024-03-22 18:30',
      replier: '竹编大师-李师傅'
    }
  },
  {
    id: 4,
    tutorialId: 2,
    userId: 3,
    username: '竹编匠人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artisan1',
    content: '双钱结太难了，练了好多遍才学会，不过成品真的很好看！',
    createTime: '2024-04-10 11:20',
    likes: 15
  }
]

export const mockTags = ['花篮', '传统技法', '实用', '装饰画', '山水', '精细编织', '书签', '文创', '礼品', '茶叶罐', '密封', '花瓶', '摆件', '家居装饰', '笔记本', '文具']
