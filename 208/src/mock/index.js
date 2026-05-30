export const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', nickname: '平台管理员' },
  { id: 2, username: 'user1', password: 'user123', role: 'user', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', nickname: '剪纸爱好者小李' },
  { id: 3, username: 'master1', password: 'master123', role: 'user', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master1', nickname: '剪纸传承人王大师' },
];

export const mockPaperCutWorks = [
  {
    id: 1,
    title: '龙凤呈祥',
    category: 'folk',
    description: '传统婚庆剪纸作品，寓意吉祥如意、百年好合',
    image: 'https://images.unsplash.com/photo-1609749893505-9091ae6f54e7?w=400&h=400&fit=crop',
    author: '王大师',
    authorId: 3,
    likes: 256,
    views: 1280,
    createdAt: '2024-01-15',
    tags: ['民俗', '婚庆', '龙凤']
  },
  {
    id: 2,
    title: '花开富贵',
    category: 'flower',
    description: '牡丹花卉剪纸，象征富贵吉祥、繁荣昌盛',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=400&fit=crop',
    author: '李老师',
    authorId: 2,
    likes: 189,
    views: 960,
    createdAt: '2024-02-20',
    tags: ['花鸟', '牡丹', '富贵']
  },
  {
    id: 3,
    title: '百鸟朝凤',
    category: 'flower',
    description: '百鸟围绕凤凰的精美剪纸，寓意德高望重、众望所归',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    author: '张师傅',
    authorId: 2,
    likes: 312,
    views: 1560,
    createdAt: '2024-03-10',
    tags: ['花鸟', '凤凰', '百鸟']
  },
  {
    id: 4,
    title: '福禄寿喜',
    category: 'folk',
    description: '传统吉祥图案，包含福、禄、寿、喜四大吉祥元素',
    image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&h=400&fit=crop',
    author: '王大师',
    authorId: 3,
    likes: 428,
    views: 2140,
    createdAt: '2024-01-25',
    tags: ['民俗', '吉祥', '福禄寿喜']
  },
  {
    id: 5,
    title: '红楼梦人物',
    category: 'figure',
    description: '《红楼梦》金陵十二钗人物剪纸系列——林黛玉',
    image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&h=400&fit=crop',
    author: '陈艺人',
    authorId: 2,
    likes: 275,
    views: 1375,
    createdAt: '2024-04-05',
    tags: ['人物', '红楼梦', '古典']
  },
  {
    id: 6,
    title: '十二生肖',
    category: 'figure',
    description: '十二生肖全套剪纸，每一个生肖都栩栩如生',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    author: '王大师',
    authorId: 3,
    likes: 512,
    views: 2560,
    createdAt: '2024-02-10',
    tags: ['人物', '生肖', '传统']
  },
  {
    id: 7,
    title: '喜鹊登梅',
    category: 'flower',
    description: '喜鹊立于梅花枝头，寓意喜上眉梢、好事将近',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop',
    author: '李老师',
    authorId: 2,
    likes: 198,
    views: 990,
    createdAt: '2024-03-18',
    tags: ['花鸟', '喜鹊', '梅花']
  },
  {
    id: 8,
    title: '年年有余',
    category: 'folk',
    description: '莲花与鲤鱼组合，寓意年年有余、生活富足',
    image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=400&h=400&fit=crop',
    author: '张师傅',
    authorId: 2,
    likes: 356,
    views: 1780,
    createdAt: '2024-04-12',
    tags: ['民俗', '鱼', '吉祥']
  }
];

export const mockMasters = [
  {
    id: 1,
    name: '王大师',
    title: '国家级非遗传承人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master1',
    description: '从事剪纸艺术50余年，擅长民俗题材剪纸，作品多次获得国家级奖项',
    specialty: ['民俗剪纸', '人物肖像', '大型剪纸'],
    achievements: '国家级非物质文化遗产代表性传承人，中国剪纸协会副会长',
    works: 128
  },
  {
    id: 2,
    name: '李老师',
    title: '省级非遗传承人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master2',
    description: '擅长花鸟题材剪纸，作品细腻精致，栩栩如生',
    specialty: ['花鸟剪纸', '彩色剪纸', '创新设计'],
    achievements: '省工艺美术大师，多次赴国外进行文化交流',
    works: 86
  },
  {
    id: 3,
    name: '张师傅',
    title: '青年剪纸艺术家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master3',
    description: '将传统剪纸与现代设计相结合，作品深受年轻人喜爱',
    specialty: ['现代剪纸', '创意设计', '数字化剪纸'],
    achievements: '全国青年剪纸大赛金奖，新媒体剪纸推广先锋',
    works: 64
  },
  {
    id: 4,
    name: '陈艺人',
    title: '民间剪纸艺术家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master4',
    description: '来自剪纸之乡的民间艺人，传承家族三代剪纸技艺',
    specialty: ['民俗剪纸', '婚庆剪纸', '传统纹样'],
    achievements: '市民间文艺家协会会员，家族剪纸技艺传承人',
    works: 95
  }
];

export const mockTools = [
  {
    id: 1,
    name: '剪纸剪刀',
    image: 'https://images.unsplash.com/photo-1582845512747-4ac99636e1a5?w=400&h=300&fit=crop',
    description: '专业剪纸剪刀，尖头设计，刃口锋利，适合精细剪刻。剪纸剪刀一般分为大、中、小三种型号，大号用于剪大轮廓，中号用于剪局部，小号用于精细部位。',
    usage: '主要用于剪纸的轮廓剪切和细节处理',
    usageMethod: [
      '握剪姿势：拇指放入剪柄的小圈，食指和中指放入大圈，无名指和小指自然弯曲抵住剪柄',
      '剪切时刀刃与纸张保持垂直，避免斜剪',
      '剪曲线时转动纸张而不是转动剪刀，保持剪刀握法不变',
      '剪尖角时剪刀尖要扎透纸张，剪至尖点后回刀再剪另一边'
    ],
    tips: '选择剪刀时要试剪几下，感觉手感舒适、刀刃开合顺畅为宜'
  },
  {
    id: 2,
    name: '刻刀',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
    description: '精细刻刀，可更换刀片，用于镂空和精细花纹雕刻。常用的有平口刀、斜口刀、圆口刀等，不同刀头用于不同的刻制效果。',
    usage: '配合垫板使用，进行镂空和细节雕刻',
    usageMethod: [
      '握刀姿势：拇指和食指捏住刀杆，中指抵住刀杆下部，类似握笔姿势',
      '刻制时运刀要稳，刀角垂直于纸面，匀速推进',
      '刻直线时刀走直线，刻曲线时转动垫板配合运刀',
      '刻制顺序：先内后外，先细后粗，先上后下'
    ],
    tips: '刀片要保持锋利，钝刀片容易划破纸张，一般刻制5-10张纸后需要更换刀片'
  },
  {
    id: 3,
    name: '剪纸垫板',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    description: '专业蜡板或橡胶垫板，保护刻刀同时便于穿透纸张。好的垫板软硬适中，既能让刻刀顺利穿透，又不会损坏刀刃。',
    usage: '垫在纸张下方进行刻制',
    usageMethod: [
      '将垫板放在平稳的桌面上，确保垫板表面平整无杂物',
      '纸张放在垫板中央，用夹子或重物固定边角',
      '刻制时保持垫板不动，转动纸张调整方向',
      '使用后清洁垫板表面，避免残留纸屑影响下次使用'
    ],
    tips: '蜡板使用一段时间后会出现刀痕，可以用电熨斗熨烫表面使其恢复平整'
  },
  {
    id: 4,
    name: '镊子',
    image: 'https://images.unsplash.com/photo-1585128119726-e6f178ab6540?w=400&h=300&fit=crop',
    description: '尖头镊子，用于夹取细小纸屑和整理剪纸细节。前端尖细，能够深入细小的镂空部位。',
    usage: '清理镂空部分纸屑，调整细节',
    usageMethod: [
      '刻完镂空后，用镊子轻轻夹住刻掉的纸屑取出',
      '整理剪纸细节时，用镊子轻轻调整变形的部位',
      '夹取细小纸屑时力度要适中，避免夹破纸张',
      '对于粘在垫板上的纸屑，可以用镊子尖轻轻挑起'
    ],
    tips: '选择不锈钢材质的镊子，不易生锈，使用寿命更长'
  },
  {
    id: 5,
    name: '折叠尺',
    image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400&h=300&fit=crop',
    description: '用于测量和折叠纸张，保证对称图案的准确性。折叠剪纸时，准确的测量和对齐是成功的关键。',
    usage: '测量尺寸，辅助折叠对称图案',
    usageMethod: [
      '根据需要的尺寸用折叠尺量取纸张大小',
      '折叠时将尺子对齐折痕，用指甲或骨刮压实折痕',
      '多次折叠时每次都要对齐边缘，保证折叠准确',
      '可以用尺子辅助画直线，保证画稿规整'
    ],
    tips: '透明塑料尺便于观察纸张对齐情况，是不错的选择'
  },
  {
    id: 6,
    name: '铅笔与橡皮',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
    description: '用于在纸上画草稿，橡皮可以擦除多余线条。HB或2B铅笔软硬适中，适合在红纸上画稿。',
    usage: '绘制剪纸图案草图',
    usageMethod: [
      '画稿时用铅笔轻轻画出图案轮廓，避免用力过猛留下深痕',
      '复杂图案可以先画辅助线，确定比例和位置',
      '画错的地方用橡皮轻轻擦除，避免擦破纸张',
      '画完后检查一遍，确认无误后再开始剪刻'
    ],
    tips: '对于红色等深色纸张，可以用白色铅笔或银笔来画稿，便于看清线条'
  }
];

export const mockTechniques = [
  {
    id: 1,
    name: '剪刻技法',
    description: '剪刻技法是剪纸最基础的技法，通过剪刀和刻刀的配合，将纸张上的图案裁剪成型。剪刻结合是剪纸艺术的核心技能。',
    coverImage: 'https://images.unsplash.com/photo-1609749893505-9091ae6f54e7?w=600&h=300&fit=crop',
    steps: [
      { 
        step: 1, 
        title: '准备材料', 
        description: '准备好剪刀、刻刀、纸张、垫板等工具。建议选择韧性好的大红纸或宣纸，剪刀要锋利，刻刀要更换新刀片。',
        image: 'https://images.unsplash.com/photo-1582845512747-4ac99636e1a5?w=400&h=250&fit=crop',
        tip: '新手建议从简单的图案开始练习，如圆形、方形等基本形状'
      },
      { 
        step: 2, 
        title: '画稿', 
        description: '在纸上画出想要的图案，可以先画简单的几何形状。用铅笔轻轻勾勒，线条要清晰但不要太用力。',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=250&fit=crop',
        tip: '复杂图案可以先在草稿纸上练习，熟练后再画到正式纸上'
      },
      { 
        step: 3, 
        title: '固定纸张', 
        description: '将画好的纸张用订书机或夹子固定在垫板上。固定点要选在图案外部，避免影响剪刻。',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
        tip: '可以在纸张和垫板之间夹一张复写纸，方便多张纸同时剪刻'
      },
      { 
        step: 4, 
        title: '剪轮廓', 
        description: '先用剪刀剪出图案的外轮廓。从纸张边缘开始，沿着画好的线条慢慢剪，注意保持线条流畅。',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop',
        tip: '剪曲线时转动纸张而不是转动剪刀，这样更容易控制线条'
      },
      { 
        step: 5, 
        title: '刻细节', 
        description: '用刻刀刻出图案内部的细节和镂空部分。刻刀要垂直于纸面，匀速推进，避免划破纸张。',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop',
        tip: '刻制顺序：先内后外，先细后粗，先上后下'
      },
      { 
        step: 6, 
        title: '整理完成', 
        description: '小心揭开剪纸，用镊子清理多余纸屑。检查是否有未剪断的地方，用剪刀修整。',
        image: 'https://images.unsplash.com/photo-1609749893505-9091ae6f54e7?w=400&h=250&fit=crop',
        tip: '完成后可以用重物压平，使剪纸更加平整美观'
      }
    ],
    tips: '剪刻时要注意力度均匀，从中间向四周刻制，避免纸张移位。剪刀和刻刀要保持锋利，钝工具容易扯破纸张。',
    difficulty: '初级',
    duration: '20分钟'
  },
  {
    id: 2,
    name: '镂空技法',
    description: '镂空技法是剪纸艺术中表现层次感和通透感的重要技法。通过刻刀将图案内部不需要的部分剔除，形成虚实对比的艺术效果。',
    coverImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=300&fit=crop',
    steps: [
      { 
        step: 1, 
        title: '设计图案', 
        description: '设计需要镂空的图案，注意连通性。镂空部分之间要有连接点，否则会散架。',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=250&fit=crop',
        tip: '初学者可以先在纸上标记出需要镂空的区域'
      },
      { 
        step: 2, 
        title: '准备材料', 
        description: '选择适合的纸张，太厚或太薄都不适合镂空。推荐使用100-120g的彩纸或宣纸。',
        image: 'https://images.unsplash.com/photo-1582845512747-4ac99636e1a5?w=400&h=250&fit=crop',
        tip: '蜡光纸表面光滑，适合精细镂空，不容易起毛边'
      },
      { 
        step: 3, 
        title: '刻制内纹', 
        description: '从最内部的花纹开始刻，逐渐向外扩展。下刀要准，收刀要稳，刻线要流畅。',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop',
        tip: '细小的圆孔可以用打孔器先打洞，再用刻刀修整'
      },
      { 
        step: 4, 
        title: '剔除废料', 
        description: '刻完后用镊子轻轻剔除刻掉的部分。对于细小的废料，可以用镊子尖轻轻挑起。',
        image: 'https://images.unsplash.com/photo-1585128119726-e6f178ab6540?w=400&h=250&fit=crop',
        tip: '如果废料粘在纸上，可以用刻刀尖轻轻挑一下'
      },
      { 
        step: 5, 
        title: '修整边缘', 
        description: '修整镂空边缘，使其光滑整齐。检查是否有毛边或未刻透的地方。',
        image: 'https://images.unsplash.com/photo-1609749893505-9091ae6f54e7?w=400&h=250&fit=crop',
        tip: '毛边可以用剪刀尖轻轻修掉，或者用刻刀再刻一遍'
      },
      { 
        step: 6, 
        title: '装裱保存', 
        description: '装裱镂空作品时注意保护精细部分。建议使用相框装裱，避免灰尘和损坏。',
        image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=400&h=250&fit=crop',
        tip: '镂空作品最好装裱在玻璃相框中，既能保护又能展示通透效果'
      }
    ],
    tips: '镂空时刀角要锋利，下刀要准，收刀要稳，讲究"刀头功夫"。刻制时手腕要放松，用整个手臂的力量而不是只靠手指。',
    difficulty: '中级',
    duration: '30分钟'
  },
  {
    id: 3,
    name: '折叠技法',
    description: '折叠技法是利用纸张折叠产生对称效果的剪纸技法。通过不同的折叠方式，可以创作出团花、花边等对称图案。',
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=300&fit=crop',
    steps: [
      { 
        step: 1, 
        title: '选择纸张', 
        description: '选择韧性好的纸张，太薄容易撕破。正方形纸张最适合折叠剪纸。',
        image: 'https://images.unsplash.com/photo-1582845512747-4ac99636e1a5?w=400&h=250&fit=crop',
        tip: '新手建议使用15x15cm的彩纸，大小适中，易于操作'
      },
      { 
        step: 2, 
        title: '基础折叠', 
        description: '将纸张对折，可多次折叠以获得对称图案。常见的有二折（2份）、四折（4份）、八折（8份）、十六折（16份）等。',
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400&h=250&fit=crop',
        tip: '折叠时边角要对齐，否则剪出来的图案不对称'
      },
      { 
        step: 3, 
        title: '画半稿', 
        description: '在折叠后的纸上画图案的一半。因为是对称图案，只需要画一半即可。',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=250&fit=crop',
        tip: '画稿时要注意图案的连续性，折叠处不能剪断'
      },
      { 
        step: 4, 
        title: '剪刻', 
        description: '沿着画好的线条剪刻，注意不要剪断折叠处。剪到折叠边缘时要特别小心。',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop',
        tip: '多层纸剪刻时，要用夹子固定好，避免纸张移位'
      },
      { 
        step: 5, 
        title: '展开', 
        description: '小心展开剪好的图案，避免撕裂。可以用镊子帮助展开细小的部分。',
        image: 'https://images.unsplash.com/photo-1609749893505-9091ae6f54e7?w=400&h=250&fit=crop',
        tip: '如果折痕太深，可以用手指轻轻按压展平'
      },
      { 
        step: 6, 
        title: '压平', 
        description: '用重物压平，使剪纸平整美观。可以夹在书本中压几个小时。',
        image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=400&h=250&fit=crop',
        tip: '压平时可以在剪纸上下各垫一张白纸，避免染色'
      }
    ],
    tips: '折叠时对齐要准确，剪刻时注意边缘的连贯性，常见的有二折、四折、八折等。折叠次数越多，图案越复杂，但也越容易剪坏。',
    difficulty: '初级',
    duration: '15分钟'
  }
];

export const mockTutorials = [
  {
    id: 1,
    title: '《喜字》创作思路解析',
    author: '王大师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master1',
    cover: 'https://images.unsplash.com/photo-1609749893505-9091ae6f54e7?w=600&h=350&fit=crop',
    content: '双喜字是中国传统婚庆中最常见的剪纸图案，它由两个"喜"字并排组合而成，寓意双喜临门。创作时首先要注意两个喜字的比例和对称，横平竖直，笔画均匀。可以在喜字的四角添加装饰性的花纹，如祥云、花朵等，增加美观度。',
    difficulty: '初级',
    duration: '30分钟',
    views: 1250,
    designConcept: [
      '整体造型：采用对称构图，两个"喜"字左右并排，体现"双喜临门"的美好寓意',
      '比例控制：喜字整体呈正方形，两个喜字各占一半宽度，比例协调',
      '笔画处理：横平竖直，笔画粗细均匀，转角处圆润流畅',
      '装饰元素：四角添加祥云或花朵装饰，边缘可添加花边，增加喜庆气氛'
    ],
    technicalHighlights: [
      '对称剪法：将纸张对折后剪半稿，展开后自然形成对称图案',
      '镂空技巧：喜字内部的"口"字采用镂空技法，注意边缘整齐',
      '线条流畅：剪直线时一气呵成，剪曲线时转动纸张保持剪刀角度不变',
      '完整性：注意笔画之间的连接，确保剪完后不会散架'
    ],
    tools: ['剪刀', '刻刀', '垫板', '铅笔', '尺子'],
    materials: ['大红纸']
  },
  {
    id: 2,
    title: '《牡丹》剪纸创作技法',
    author: '李老师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master2',
    cover: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=350&fit=crop',
    content: '牡丹是中国传统文化中的富贵之花，剪纸牡丹要表现出花瓣的层次感和雍容华贵的气质。可以从中心花瓣开始，层层向外扩展，注意花瓣的大小变化和自然弯曲。叶片的剪制要注意叶脉的表现，使整体造型更加生动。',
    difficulty: '中级',
    duration: '45分钟',
    views: 890,
    designConcept: [
      '花头造型：采用层叠式构图，从中心向外逐层扩展，形成饱满的花头',
      '花瓣层次：中心花瓣小而紧凑，外层花瓣大而舒展，体现层次感',
      '叶片搭配：在花朵下方添加叶片，注意叶片的大小和位置分布',
      '枝干处理：用流畅的曲线表现枝干，连接花朵和叶片'
    ],
    technicalHighlights: [
      '花瓣剪法：每片花瓣从基部向尖端剪，边缘可剪出波浪形增加动感',
      '镂空技巧：花瓣之间的缝隙采用镂空处理，增强通透感',
      '叶脉刻制：用刻刀刻出叶脉纹理，增加叶片的真实感',
      '虚实结合：花瓣密实，叶脉镂空，形成虚实对比'
    ],
    tools: ['剪刀', '刻刀', '垫板', '镊子'],
    materials: ['彩纸（红、粉、绿等）']
  },
  {
    id: 3,
    title: '《生肖鼠》创作过程',
    author: '张师傅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master3',
    cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=350&fit=crop',
    content: '生肖剪纸是中国传统剪纸的重要题材。创作生肖鼠时，要抓住老鼠机灵、可爱的特点，突出其胡须、耳朵和尾巴等特征。可以适当夸张某些特征，如大大的耳朵、细长的尾巴，使形象更加生动有趣。同时可以添加一些装饰元素，如铜钱、花生等，寓意吉祥。',
    difficulty: '中级',
    duration: '40分钟',
    views: 1120,
    designConcept: [
      '形象塑造：抓住老鼠机灵可爱的特点，适当夸张耳朵和尾巴',
      '特征突出：重点表现胡须、眼睛、爪子等细节',
      '动态设计：采用坐姿或奔跑姿态，使形象更加生动',
      '装饰元素：添加铜钱、花生、元宝等吉祥元素，丰富寓意'
    ],
    technicalHighlights: [
      '轮廓剪法：先剪出整体轮廓，注意线条流畅自然',
      '细节刻制：用刻刀刻出眼睛、胡须等精细部位',
      '毛发表现：在身体边缘剪出细小的锯齿纹，表现毛发质感',
      '组合技巧：将主体与装饰元素巧妙结合，注意整体协调'
    ],
    tools: ['剪刀', '刻刀', '垫板', '镊子'],
    materials: ['彩纸']
  }
];

export const mockQuestions = [
  {
    id: 1,
    title: '剪纸时如何防止纸张破裂？',
    author: '初学者小王',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=q1',
    content: '我是剪纸新手，每次剪到细节部分时纸张总是容易破裂，请问有什么技巧吗？',
    answers: [
      {
        id: 1,
        author: '王大师',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master1',
        content: '新手剪剪纸容易破纸是正常的，建议：1. 选择韧性好的纸张，如大红纸、宣纸；2. 剪刀要锋利，钝剪刀容易扯破纸张；3. 剪的时候手要稳，慢慢剪，不要着急；4. 细小部分可以先用刻刀刻出轮廓再剪。',
        isBest: true,
        createdAt: '2024-04-15'
      },
      {
        id: 2,
        author: '李老师',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master2',
        content: '补充一点：剪曲线的时候要转动纸张而不是转动剪刀，这样更容易控制线条，也不容易破纸。',
        createdAt: '2024-04-16'
      }
    ],
    createdAt: '2024-04-14',
    views: 328
  },
  {
    id: 2,
    title: '如何保存剪纸作品？',
    author: '收藏爱好者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=q2',
    content: '我收藏了一些剪纸作品，担心时间长了会褪色或损坏，请问应该如何保存？',
    answers: [
      {
        id: 1,
        author: '张师傅',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master3',
        content: '剪纸保存要注意几点：1. 避免阳光直射，会导致褪色；2. 保持干燥，潮湿环境容易发霉；3. 可以装裱起来，使用无酸卡纸；4. 定期检查，发现问题及时处理；5. 珍贵作品可以做塑封处理。',
        isBest: true,
        createdAt: '2024-04-10'
      }
    ],
    createdAt: '2024-04-08',
    views: 256
  },
  {
    id: 3,
    title: '剪纸入门应该先练什么？',
    author: '零基础学员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=q3',
    content: '我完全没有基础，想学习剪纸，应该从什么开始练习？有没有推荐的入门图案？',
    answers: [
      {
        id: 1,
        author: '陈艺人',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master4',
        content: '入门建议从简单的对称图案开始练习：1. 先练折叠剪纸，如双喜字、团花；2. 从简单的几何图形开始，如圆形、方形的组合；3. 练习剪直线、曲线、锯齿纹等基本线条；4. 可以先在废纸上多练习手感。推荐入门图案：双喜字、小花朵、简单的动物轮廓。',
        isBest: true,
        createdAt: '2024-04-05'
      },
      {
        id: 2,
        author: '王大师',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master1',
        content: '建议先学习"剪"的基本功，再学习"刻"。剪刀的使用是基础，可以用旧报纸练习剪各种线条，熟能生巧。',
        createdAt: '2024-04-06'
      }
    ],
    createdAt: '2024-04-03',
    views: 412
  }
];

export const mockComments = [
  { id: 1, workId: 1, userId: 2, username: '剪纸爱好者小李', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', content: '王大师的作品真是太精美了，龙凤的细节处理得非常到位！', createdAt: '2024-04-20', likes: 12 },
  { id: 2, workId: 1, userId: 3, username: '张师傅', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master3', content: '学习了，这个线条处理太流畅了，佩服！', createdAt: '2024-04-21', likes: 8 },
  { id: 3, workId: 2, userId: 1, username: '平台管理员', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', content: '牡丹的层次感很强，收藏了！', createdAt: '2024-04-18', likes: 15 },
  { id: 4, workId: 5, userId: 2, username: '剪纸爱好者小李', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', content: '林黛玉的神态剪得太传神了！', createdAt: '2024-04-15', likes: 20 },
];

export const mockCollections = [
  { id: 1, userId: 2, name: '我的收藏', works: [1, 2, 5], createdAt: '2024-03-01' },
  { id: 2, userId: 2, name: '民俗精品', works: [1, 4, 8], createdAt: '2024-03-15' },
  { id: 3, userId: 3, name: '花鸟专辑', works: [2, 3, 7], createdAt: '2024-04-01' },
];
