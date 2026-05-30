export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: '系统管理员',
    email: 'admin@muhuozi.com',
    phone: '13800138000',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    username: 'researcher',
    password: '123456',
    name: '李研究员',
    email: 'li@muhuozi.com',
    phone: '13900139000',
    role: 'researcher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=researcher',
    createdAt: '2024-02-15'
  },
  {
    id: 3,
    username: 'zhangxue',
    password: '123456',
    name: '张学者',
    email: 'zhang@muhuozi.com',
    phone: '13700137000',
    role: 'researcher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangxue',
    createdAt: '2024-03-20'
  }
]

export const mockTypes = [
  {
    id: 1,
    name: '宋体字',
    category: '经典活字',
    era: '宋代',
    isClassic: true,
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=300&fit=crop',
    description: '宋体字是中国传统印刷中最常用的字体之一，起源于宋代，字形方正，结构严谨，笔画横细竖粗，适合于正式印刷品使用。',
    features: ['横细竖粗', '字形方正', '结构严谨', '适合印刷'],
    materials: ['梨木', '枣木', '黄杨木'],
    difficulty: 3,
    views: 2580,
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: '楷体字',
    category: '经典活字',
    era: '唐代',
    isClassic: true,
    image: 'https://images.unsplash.com/photo-1596498005912-6b9e0e6198dd?w=300&h=300&fit=crop',
    description: '楷体字是中国书法的重要字体，字形工整规范，笔画清晰流畅，是学习书法的基础字体，也广泛应用于印刷领域。',
    features: ['工整规范', '笔画清晰', '书法美感', '易于辨认'],
    materials: ['梨木', '杏木'],
    difficulty: 2,
    views: 1890,
    createdAt: '2024-01-20'
  },
  {
    id: 3,
    name: '黑体字',
    category: '复刻活字',
    era: '现代',
    isClassic: false,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=300&fit=crop',
    description: '黑体字是现代印刷中常用的字体，笔画粗细均匀，字形醒目有力，适合用于标题和重要信息的展示。',
    features: ['笔画均匀', '醒目有力', '现代感强', '视觉冲击'],
    materials: ['榉木', '橡木'],
    difficulty: 4,
    views: 3200,
    createdAt: '2024-02-10'
  },
  {
    id: 4,
    name: '行书字',
    category: '经典活字',
    era: '东晋',
    isClassic: true,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300&h=300&fit=crop',
    description: '行书字介于楷书和草书之间，书写流畅自然，既有楷书的工整，又有草书的飘逸，是艺术性与实用性的完美结合。',
    features: ['流畅自然', '艺术性强', '书写快捷', '变化丰富'],
    materials: ['梨木', '樟木'],
    difficulty: 5,
    views: 2100,
    createdAt: '2024-02-15'
  },
  {
    id: 5,
    name: '隶书字',
    category: '经典活字',
    era: '汉代',
    isClassic: true,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop',
    description: '隶书字是汉字书法中的重要字体，字形扁平方正，笔画蚕头燕尾，具有古朴典雅的艺术风格。',
    features: ['扁平方正', '蚕头燕尾', '古朴典雅', '历史悠久'],
    materials: ['枣木', '榆木'],
    difficulty: 4,
    views: 1650,
    createdAt: '2024-02-20'
  },
  {
    id: 6,
    name: '圆体字',
    category: '复刻活字',
    era: '现代',
    isClassic: false,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    description: '圆体字是现代设计中常用的字体，笔画圆润柔和，给人以亲切温暖的感觉，适合用于轻松活泼的设计场景。',
    features: ['圆润柔和', '亲切温暖', '现代设计', '活泼可爱'],
    materials: ['椴木', '松木'],
    difficulty: 3,
    views: 2800,
    createdAt: '2024-03-01'
  },
  {
    id: 7,
    name: '草书字',
    category: '经典活字',
    era: '汉代',
    isClassic: true,
    image: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=300&h=300&fit=crop',
    description: '草书字是汉字书法中最具艺术性的字体，笔画连绵，结构简约，变化万千，是表达情感和个性的最佳选择。',
    features: ['笔画连绵', '结构简约', '变化万千', '艺术表达'],
    materials: ['黄杨木', '紫檀木'],
    difficulty: 5,
    views: 1920,
    createdAt: '2024-03-05'
  },
  {
    id: 8,
    name: '魏碑字',
    category: '经典活字',
    era: '南北朝',
    isClassic: true,
    image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=300&h=300&fit=crop',
    description: '魏碑字是南北朝时期的石刻书法，字形刚健有力，笔画方折峻整，具有雄强朴茂的艺术风格。',
    features: ['刚健有力', '方折峻整', '雄强朴茂', '石刻风格'],
    materials: ['花岗岩', '青石'],
    difficulty: 4,
    views: 1450,
    createdAt: '2024-03-10'
  },
  {
    id: 9,
    name: '小篆体',
    category: '复刻活字',
    era: '秦代',
    isClassic: false,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=300&fit=crop',
    description: '小篆体是秦始皇统一文字后的标准字体，字形修长优美，笔画圆润匀称，具有很高的装饰性和艺术价值。',
    features: ['修长优美', '圆润匀称', '装饰性强', '历史价值'],
    materials: ['玉石', '青铜'],
    difficulty: 5,
    views: 2680,
    createdAt: '2024-03-15'
  },
  {
    id: 10,
    name: 'POP字体',
    category: '复刻活字',
    era: '现代',
    isClassic: false,
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=300&h=300&fit=crop',
    description: 'POP字体是商业广告中常用的字体，造型夸张活泼，色彩鲜艳，具有很强的视觉吸引力和宣传效果。',
    features: ['夸张活泼', '色彩鲜艳', '视觉吸引', '商业宣传'],
    materials: ['KT板', '亚克力'],
    difficulty: 2,
    views: 3500,
    createdAt: '2024-03-20'
  },
  {
    id: 11,
    name: '瘦金体',
    category: '经典活字',
    era: '宋代',
    isClassic: true,
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=300&h=300&fit=crop',
    description: '瘦金体是宋徽宗赵佶创造的书法字体，笔画瘦硬挺拔，结构舒展，具有独特的艺术风格和皇家气质。',
    features: ['瘦硬挺拔', '舒展大方', '皇家气质', '独特风格'],
    materials: ['宣纸', '丝绢'],
    difficulty: 5,
    views: 2340,
    createdAt: '2024-04-01'
  },
  {
    id: 12,
    name: '手写体',
    category: '复刻活字',
    era: '现代',
    isClassic: false,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=300&fit=crop',
    description: '手写体模拟真实书写效果，自然随性，充满人情味，适合用于个性化设计和创意表达。',
    features: ['自然随性', '人情味浓', '个性化', '创意表达'],
    materials: ['各类纸张', '竹木'],
    difficulty: 3,
    views: 2100,
    createdAt: '2024-04-05'
  }
]

export const mockWorks = [
  {
    id: 1,
    title: '《兰亭集序》木活字印刷版',
    type: '书法作品',
    image: 'https://images.unsplash.com/photo-1609902726285-00668009f004?w=400&h=300&fit=crop',
    description: '以王羲之《兰亭集序》为蓝本，采用传统木活字印刷技艺复刻，完整呈现原作的书法神韵。',
    content: '永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。群贤毕至，少长咸集...',
    artisan: '李传承',
    artisanId: 1,
    year: '2023',
    materials: ['梨木活字', '宣纸', '徽墨'],
    size: '60cm × 180cm',
    recommended: true,
    views: 5680,
    likes: 320,
    createdAt: '2024-01-10'
  },
  {
    id: 2,
    title: '《百家姓》活字印刷长卷',
    type: '经典复刻',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
    description: '收录中国常见姓氏500余个，采用宋体活字排版印刷，是了解中华姓氏文化的重要载体。',
    content: '赵钱孙李，周吴郑王。冯陈褚卫，蒋沈韩杨。朱秦尤许，何吕施张...',
    artisan: '王匠人',
    artisanId: 2,
    year: '2023',
    materials: ['枣木活字', '夹江纸', '松烟墨'],
    size: '45cm × 500cm',
    recommended: true,
    views: 4200,
    likes: 280,
    createdAt: '2024-01-25'
  },
  {
    id: 3,
    title: '《心经》木活字印刷',
    type: '宗教文化',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=300&fit=crop',
    description: '《般若波罗蜜多心经》木活字印刷作品，字体端庄秀丽，印刷精美，是收藏与馈赠的佳品。',
    content: '观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄...',
    artisan: '陈大师',
    artisanId: 3,
    year: '2024',
    materials: ['黄杨木活字', '宣纸', '朱砂墨'],
    size: '35cm × 120cm',
    recommended: true,
    views: 3800,
    likes: 450,
    createdAt: '2024-02-05'
  },
  {
    id: 4,
    title: '唐诗三百首精选',
    type: '文学作品',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop',
    description: '精选唐代著名诗人代表作品50首，采用楷体活字排版，配以精美插图，兼具文学与艺术价值。',
    content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。——李白《静夜思》',
    artisan: '李传承',
    artisanId: 1,
    year: '2024',
    materials: ['梨木活字', '宣纸', '徽墨'],
    size: '21cm × 28cm（线装本）',
    recommended: true,
    views: 6200,
    likes: 520,
    createdAt: '2024-02-15'
  },
  {
    id: 5,
    title: '《清明上河图》题跋',
    type: '书画合璧',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop',
    description: '以《清明上河图》为主题，将历代名家题跋用木活字印刷呈现，图文并茂，相得益彰。',
    content: '翰林图画院臣张择端进画...',
    artisan: '王匠人',
    artisanId: 2,
    year: '2023',
    materials: ['樟木活字', '绢本', '国画颜料'],
    size: '80cm × 200cm',
    recommended: false,
    views: 3100,
    likes: 190,
    createdAt: '2024-02-25'
  },
  {
    id: 6,
    title: '二十四节气活字版画',
    type: '民俗文化',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=300&fit=crop',
    description: '将二十四节气与木活字印刷相结合，每个节气配以对应的汉字和图案，展现中华民俗文化之美。',
    content: '立春、雨水、惊蛰、春分、清明、谷雨...',
    artisan: '陈大师',
    artisanId: 3,
    year: '2024',
    materials: ['梨木活字', '彩纸', '植物染料'],
    size: '30cm × 40cm × 24幅',
    recommended: true,
    views: 4800,
    likes: 380,
    createdAt: '2024-03-05'
  },
  {
    id: 7,
    title: '《论语》精选',
    type: '经典复刻',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    description: '精选《论语》中的名言警句，采用宋体活字印刷，字体古朴庄重，是传承儒家文化的重要载体。',
    content: '子曰：学而时习之，不亦说乎？有朋自远方来，不亦乐乎？',
    artisan: '李传承',
    artisanId: 1,
    year: '2023',
    materials: ['枣木活字', '毛边纸', '徽墨'],
    size: '25cm × 35cm',
    recommended: false,
    views: 2900,
    likes: 210,
    createdAt: '2024-03-10'
  },
  {
    id: 8,
    title: '十二生肖活字印章',
    type: '创意作品',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
    description: '以十二生肖为主题，设计制作的活字印章套装，每个生肖对应一个汉字，兼具实用性与收藏价值。',
    content: '子鼠、丑牛、寅虎、卯兔、辰龙、巳蛇、午马、未羊、申猴、酉鸡、戌狗、亥猪',
    artisan: '王匠人',
    artisanId: 2,
    year: '2024',
    materials: ['黄杨木', '印泥'],
    size: '3cm × 3cm × 12枚',
    recommended: true,
    views: 5500,
    likes: 620,
    createdAt: '2024-03-15'
  }
]

export const mockArtisans = [
  {
    id: 1,
    name: '李传承',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lichengchuan',
    title: '国家级非遗传承人',
    experience: 40,
    region: '浙江瑞安',
    specialty: ['宋体字雕刻', '古籍复刻', '传统印刷工艺'],
    bio: '李传承先生出生于木活字印刷世家，是浙江瑞安木活字印刷术的第32代传人。从事木活字雕刻与印刷40余年，精通古法造纸、刻字、排版、印刷等全套工艺。其作品曾被中国国家博物馆、故宫博物院等机构收藏。',
    achievements: [
      '2010年 荣获"中国非遗年度人物"称号',
      '2015年 完成《四库全书》部分卷目的木活字复刻',
      '2020年 出版《木活字印刷技艺大全》专著',
      '2023年 获颁"大国工匠"荣誉证书'
    ],
    works: [1, 4, 7],
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 8500
  },
  {
    id: 2,
    name: '王匠人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangjiangren',
    title: '省级非遗传承人',
    experience: 25,
    region: '福建宁化',
    specialty: ['楷体字雕刻', '家谱印制', '活字创意设计'],
    bio: '王匠人师傅是福建宁化木活字印刷的代表性传承人，25年来专注于家谱族谱的木活字印制，技艺精湛，刀法细腻。他积极探索传统技艺与现代设计的融合，创作了许多受年轻人喜爱的创意作品。',
    achievements: [
      '2018年 福建省工艺美术大师',
      '2021年 完成《中华姓氏大族谱》印制工程',
      '2022年 获"全国技术能手"称号'
    ],
    works: [2, 5, 8],
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 6200
  },
  {
    id: 3,
    name: '陈大师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chendashi',
    title: '市级非遗传承人',
    experience: 18,
    region: '江西婺源',
    specialty: ['艺术字雕刻', '彩印工艺', '文创产品开发'],
    bio: '陈大师是江西婺源木活字印刷技艺的年轻一代传承人，18岁开始跟随父亲学习木活字雕刻，后进修于中央美术学院。他将传统技艺与现代艺术设计相结合，开创了木活字彩印新工艺，为传统技艺注入新的活力。',
    achievements: [
      '2019年 全国大学生文创设计大赛金奖',
      '2021年 创办"活色生香"木活字文创品牌',
      '2023年 作品入选"中国设计智造大奖"'
    ],
    works: [3, 6],
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 7800
  }
]

export const mockProcessSteps = [
  {
    id: 1,
    title: '选材',
    description: '选择质地坚硬、纹理细腻的木材，如梨木、枣木、黄杨木等。木材需经过充分干燥处理，防止变形开裂。',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    duration: '7-15天',
    tools: ['斧头', '锯子', '刨子'],
    tips: '选择冬季砍伐的木材，质地更细密；避免使用有结疤、裂纹的木材。'
  },
  {
    id: 2,
    title: '写字',
    description: '在裁好的木板上用毛笔书写反字。要求书写工整规范，笔画清晰，字的大小要一致，字间距均匀。',
    image: 'https://images.unsplash.com/photo-1596498005912-6b9e0e6198dd?w=400&h=300&fit=crop',
    duration: '1-2天/百字',
    tools: ['毛笔', '墨汁', '宣纸', '拓包'],
    tips: '初学者可以先用铅笔打稿，再用毛笔描边；反字书写需要反复练习才能熟练掌握。'
  },
  {
    id: 3,
    title: '雕刻',
    description: '使用刻刀沿着墨迹雕刻，先刻横画，再刻竖画，最后刻撇捺等笔画。要求刀工精准，深浅一致，线条流畅。',
    image: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=400&h=300&fit=crop',
    duration: '3-5天/百字',
    tools: ['平刀', '斜刀', '圆刀', '三角刀'],
    tips: '雕刻时刀身要与木板保持45度角；力度要均匀，避免刻得过深或过浅。'
  },
  {
    id: 4,
    title: '排版',
    description: '将刻好的活字按照文稿内容排列在印版上，用木楔固定。排版时要注意字的顺序、行距、字距的准确性。',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    duration: '1-3天',
    tools: ['印版', '木楔', '木槌', '界尺'],
    tips: '排版前要先校对文稿；排版后要反复检查，确保没有错字、漏字。'
  },
  {
    id: 5,
    title: '刷墨',
    description: '用墨辊在排好的活字上均匀滚涂油墨。墨量要适中，过多会造成字迹模糊，过少则字迹不清晰。',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
    duration: '依作品大小而定',
    tools: ['墨辊', '墨盘', '油墨'],
    tips: '刷墨前要将油墨搅拌均匀；刷墨时力度要轻，速度要快，避免油墨渗入字缝。'
  },
  {
    id: 6,
    title: '拓印',
    description: '将纸张覆盖在刷好墨的印版上，用擦子或棕刷均匀擦拭纸张背面，使油墨均匀转印到纸张上。',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop',
    duration: '依作品大小而定',
    tools: ['宣纸', '擦子', '棕刷', '镇纸'],
    tips: '纸张要平铺，不能有褶皱；擦拭力度要均匀，确保每个字都清晰转印。'
  },
  {
    id: 7,
    title: '揭纸',
    description: '将印好的纸张轻轻揭下，平铺在阴凉处晾干。注意不能拉扯纸张，以免造成字迹模糊或纸张破损。',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=300&fit=crop',
    duration: '1-3天（晾干）',
    tools: ['晾纸架', '吸水纸'],
    tips: '揭纸时要从一角开始，慢慢掀起；晾干时要避免阳光直射和风吹。'
  },
  {
    id: 8,
    title: '装帧',
    description: '将印好的散页进行装订，可以做成线装书、册页、卷轴等形式。装帧要工整美观，便于保存和翻阅。',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
    duration: '2-5天',
    tools: ['针线', '绫绢', '骨签', '浆糊'],
    tips: '装帧前要将印页按顺序整理好；线装书的针脚要均匀整齐。'
  }
]

export const mockCarouselData = [
  {
    id: 1,
    title: '千年技艺 活字传承',
    subtitle: '探索中国木活字印刷的奥秘',
    image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1600&h=600&fit=crop',
    link: '/technique'
  },
  {
    id: 2,
    title: '经典复刻 匠心独运',
    subtitle: '感受传统与现代的完美融合',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1600&h=600&fit=crop',
    link: '/types?category=经典活字'
  },
  {
    id: 3,
    title: '非遗传承人 守正创新',
    subtitle: '走近技艺大师的匠心世界',
    image: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=1600&h=600&fit=crop',
    link: '/artisans'
  }
]

export const mockKnowledgePoints = [
  {
    id: 1,
    keyword: '活字印刷',
    title: '活字印刷术的发明',
    content: '北宋庆历年间（1041-1048年），毕昇发明了泥活字印刷术，这是世界上最早的活字印刷技术。毕昇的方法是用胶泥刻字，火烧使坚，成为陶质字模。排版时用两块铁板，一版印刷，一版排字，交替使用，提高了印刷效率。',
    position: 'header'
  },
  {
    id: 2,
    keyword: '木活字',
    title: '木活字的历史',
    content: '木活字印刷术是活字印刷的重要分支。元代农学家王祯在《农书》中详细记载了木活字印刷技术，包括刻字、排版、印刷等工艺流程。木活字相比泥活字更加耐用，适合大批量印刷使用。',
    position: 'process'
  },
  {
    id: 3,
    keyword: '王祯',
    title: '王祯与转轮排字盘',
    content: '元代科学家王祯发明了转轮排字盘，将活字按韵分类放在两个转轮盘上，排版时转动轮盘，以字就人，大大提高了排版效率。这是世界上最早的排字机械装置。',
    position: 'process'
  },
  {
    id: 4,
    keyword: '梨木',
    title: '为什么选用梨木？',
    content: '梨木材质地坚硬细腻，纹理均匀，不易变形开裂，是雕刻木活字的最佳材料之一。梨木刻字清晰，经久耐用，一块梨木活字可以反复使用数千次。',
    position: 'material'
  },
  {
    id: 5,
    keyword: '反字',
    title: '反字雕刻',
    content: '木活字需要雕刻反字，这样印出来才是正字。反字书写和雕刻需要很高的技艺，工匠需要经过长期训练才能熟练掌握。这也是木活字印刷的核心技术之一。',
    position: 'carving'
  },
  {
    id: 6,
    keyword: '松烟墨',
    title: '传统油墨',
    content: '传统木活字印刷使用松烟墨，由松木燃烧后收集的烟灰制成。松烟墨色黑质细，附着力强，经久不褪，是中国传统印刷的主要用墨。',
    position: 'ink'
  },
  {
    id: 7,
    keyword: '宣纸',
    title: '宣纸的作用',
    content: '宣纸有"纸寿千年"的美誉，质地绵韧，光洁如玉，是木活字印刷的最佳用纸。宣纸产于安徽泾县，因历史上属于宣州府而得名。',
    position: 'paper'
  },
  {
    id: 8,
    keyword: '非遗',
    title: '木活字印刷非遗',
    content: '2010年，中国活字印刷术被联合国教科文组织列入《急需保护的非物质文化遗产名录》。浙江瑞安、福建宁化等地至今仍保留着传统木活字印刷技艺。',
    position: 'footer'
  }
]

export const mockComments = [
  {
    id: 1,
    userId: 2,
    userName: '李研究员',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=researcher',
    content: '请问木活字印刷和雕版印刷有什么区别？哪种工艺更适合小规模印刷？',
    type: 'question',
    createdAt: '2024-05-10 14:30',
    replies: [
      {
        id: 1,
        userId: 1,
        userName: '系统管理员',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        content: '木活字和雕版印刷的主要区别在于：雕版是整版雕刻，一次雕刻完成后不能改动；而木活字是单个字模，可以灵活排版。对于小规模印刷，木活字更加灵活经济。',
        createdAt: '2024-05-10 15:20'
      }
    ]
  },
  {
    id: 2,
    userId: 3,
    userName: '张学者',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangxue',
    content: '这个平台的视频教程非常详细，学习了很多知识！请问梨木和枣木在使用上有什么区别？',
    type: 'comment',
    createdAt: '2024-05-12 09:15',
    replies: []
  },
  {
    id: 3,
    userId: 2,
    userName: '李研究员',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=researcher',
    content: '建议可以增加一些关于活字印刷在民间应用的案例展示，让更多人了解这项技艺的实际应用。',
    type: 'suggestion',
    createdAt: '2024-05-15 16:45',
    replies: [
      {
        id: 2,
        userId: 1,
        userName: '系统管理员',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        content: '感谢您的建议！我们会在后续版本中增加更多民间应用案例。',
        createdAt: '2024-05-15 17:30'
      }
    ]
  }
]

export const mockMaterialKnowledge = [
  {
    id: 1,
    name: '梨木',
    origin: '主要产于中国北方地区',
    hardness: '坚硬',
    texture: '纹理细腻均匀',
    advantages: ['刻字清晰', '不易变形', '经久耐用'],
    usage: '最常用的木活字材料，适合雕刻精细字体',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    description: '梨木是木活字印刷最经典的材料，质地坚硬细腻，纹理均匀，是雕刻木活字的最佳选择。'
  },
  {
    id: 2,
    name: '枣木',
    origin: '河北、山东等地',
    hardness: '极硬',
    texture: '纹理较粗',
    advantages: ['耐磨损', '寿命长', '适合粗体字'],
    usage: '适合雕刻较大字号和粗体字',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    description: '枣木材质比梨木更硬更重，耐磨损，使用寿命更长，适合印刷量较大的情况。'
  },
  {
    id: 3,
    name: '黄杨木',
    origin: '中国南方地区',
    hardness: '坚硬细腻',
    texture: '纹理极其细腻',
    advantages: ['雕刻精细', '字体美观', '适合小字'],
    usage: '雕刻精细小字和艺术字体',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    description: '黄杨木是雕刻精细小字的最佳材料，木质极其细腻，可以雕刻出非常精美的字体。'
  },
  {
    id: 4,
    name: '樟木',
    origin: '江南地区',
    hardness: '适中',
    texture: '有香气',
    advantages: ['防虫防蛀', '气味芳香', '保存持久'],
    usage: '适合需要长期保存的活字',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    description: '樟木具有天然的防虫防蛀特性，特别适合需要长期保存的家谱、古籍等重要文献的印刷。'
  }
]
