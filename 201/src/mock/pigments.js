export const pigments = [
  {
    id: 1,
    name: '石青',
    chineseName: '石青',
    category: 'natural',
    color: '#1E90FF',
    colorName: '蓝色',
    origin: '云南昆明',
    description: '石青是一种天然铜矿物颜料，色泽沉稳，历久弥新，是传统山水画中不可或缺的颜料。',
    detailedDescription: '石青，古称"空青"、"曾青"，属于碱性碳酸铜矿物。其色彩清新淡雅，千年不褪，是中国传统绘画中最重要的蓝色颜料。敦煌壁画中大量使用石青，历经千年仍然光彩夺目。',
    properties: {
      lightfastness: '极佳',
      transparency: '半透明',
      toxicity: '低毒',
      grindingDifficulty: '中等'
    },
    mineSource: {
      location: '云南东川铜矿',
      latitude: 26.0,
      longitude: 103.2,
      formation: '次生氧化矿带',
      extractionHistory: '始于唐代，已有1200年开采历史'
    },
    master: {
      id: 1,
      name: '李墨白',
      title: '国家级非遗传承人',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      experience: 40,
      specialty: '石青石绿研磨技艺',
      bio: '李墨白大师从事矿物颜料制作四十余年，是国内石青研磨技艺的代表性传承人。'
    },
    productionProcess: [
      { step: 1, name: '选矿', description: '挑选高纯度蓝铜矿原石' },
      { step: 2, name: '粗碎', description: '将矿石破碎至小块' },
      { step: 3, name: '研磨', description: '水法研磨72小时以上' },
      { step: 4, name: '淘洗', description: '多次淘洗分离不同色阶' },
      { step: 5, name: '沉淀', description: '自然沉淀获取精细颜料' },
      { step: 6, name: '晾干', description: '阴干后成粉备用' }
    ],
    videos: [
      { id: 1, title: '石青研磨技艺展示', thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=225&fit=crop', duration: '15:30' },
      { id: 2, title: '传统水飞法详解', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop', duration: '22:15' }
    ],
    applications: [
      { field: '山水画', example: '千里江山图' },
      { field: '壁画', example: '敦煌莫高窟' },
      { field: '建筑彩画', example: '故宫太和殿' },
      { field: '唐卡', example: '西藏唐卡艺术' }
    ],
    historicalExamples: [
      { name: '千里江山图', artist: '王希孟', dynasty: '北宋', description: '大量使用石青渲染山水' },
      { name: '富春山居图', artist: '黄公望', dynasty: '元代', description: '石青点缀远山' }
    ],
    relatedPigments: [2, 3],
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
    views: 12580,
    likes: 892,
    isHot: true,
    createTime: '2024-01-15'
  },
  {
    id: 2,
    name: '石绿',
    chineseName: '石绿',
    category: 'natural',
    color: '#228B22',
    colorName: '绿色',
    origin: '甘肃陇南',
    description: '石绿是孔雀石研磨而成的天然绿色颜料，色彩温润典雅，是青绿山水的主要用色。',
    detailedDescription: '石绿取自孔雀石，又名"绿青"、"石绿"。其色如翠羽，清新悦目，与石青搭配使用形成了中国独有的青绿山水画派。',
    properties: {
      lightfastness: '极佳',
      transparency: '不透明',
      toxicity: '低毒',
      grindingDifficulty: '较难'
    },
    mineSource: {
      location: '甘肃陇南成县',
      latitude: 33.8,
      longitude: 105.7,
      formation: '铜矿床氧化带',
      extractionHistory: '汉代已有使用记载'
    },
    master: {
      id: 2,
      name: '王丹青',
      title: '省级非遗传承人',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      experience: 35,
      specialty: '石绿颜料制作',
      bio: '王丹青大师继承家传技艺，专注石绿制作三十余年，其作品被多家博物馆收藏。'
    },
    productionProcess: [
      { step: 1, name: '选料', description: '选取颜色翠绿的孔雀石' },
      { step: 2, name: '煅烧', description: '低温煅烧增加色彩饱和度' },
      { step: 3, name: '水磨', description: '水磨至细腻如膏' },
      { step: 4, name: '分色', description: '根据颗粒粗细分出头绿、二绿' },
      { step: 5, name: '熬胶', description: '加入明胶调和' },
      { step: 6, name: '成型', description: '阴干后制成膏状或粉状' }
    ],
    videos: [
      { id: 3, title: '石绿颜料制作全过程', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop', duration: '18:45' }
    ],
    applications: [
      { field: '青绿山水', example: '千里江山图' },
      { field: '花鸟画', example: '宋代院体画' },
      { field: '壁画', example: '永乐宫壁画' }
    ],
    historicalExamples: [
      { name: '千里江山图', artist: '王希孟', dynasty: '北宋', description: '石绿为主色描绘山峦' }
    ],
    relatedPigments: [1, 4],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    views: 9870,
    likes: 756,
    isHot: true,
    createTime: '2024-02-20'
  },
  {
    id: 3,
    name: '朱砂',
    chineseName: '朱砂',
    category: 'natural',
    color: '#E74C3C',
    colorName: '红色',
    origin: '湖南湘西',
    description: '朱砂又称丹砂，是中国最古老的红色颜料之一，色彩鲜艳纯正，千年不变。',
    detailedDescription: '朱砂是硫化汞矿物，色泽鲜红如血，是中国文化中最具象征意义的颜色。从殷墟甲骨文的朱书到历代帝王的朱批，朱砂贯穿了整个中华文明史。',
    properties: {
      lightfastness: '极佳',
      transparency: '不透明',
      toxicity: '有毒',
      grindingDifficulty: '中等'
    },
    mineSource: {
      location: '湖南湘西凤凰',
      latitude: 27.9,
      longitude: 109.6,
      formation: '低温热液矿床',
      extractionHistory: '商代已开始使用'
    },
    master: {
      id: 3,
      name: '陈红玉',
      title: '国家级非遗传承人',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      experience: 45,
      specialty: '朱砂印泥制作',
      bio: '陈红玉大师是朱砂制作技艺的代表性传承人，其研制的朱砂印泥被故宫博物院选用。'
    },
    productionProcess: [
      { step: 1, name: '采矿', description: '选取优质辰砂矿石' },
      { step: 2, name: '粉碎', description: '手工粉碎至细粒' },
      { step: 3, name: '水飞', description: '传统水飞法提纯' },
      { step: 4, name: '晾晒', description: '日光下自然晾晒' },
      { step: 5, name: '研磨', description: '加麻油反复研磨' },
      { step: 6, name: '制膏', description: '加艾绒制成印泥' }
    ],
    videos: [
      { id: 4, title: '千年朱砂制作技艺', thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=225&fit=crop', duration: '25:00' }
    ],
    applications: [
      { field: '印章', example: '传统书画印泥' },
      { field: '壁画', example: '马王堆汉墓' },
      { field: '道教符咒', example: '道教文化' },
      { field: '中药', example: '传统中医药' }
    ],
    historicalExamples: [
      { name: '甲骨文朱书', artist: '佚名', dynasty: '商代', description: '最早的朱砂使用记录' }
    ],
    relatedPigments: [5, 6],
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
    views: 15680,
    likes: 1203,
    isHot: true,
    createTime: '2024-01-10'
  },
  {
    id: 4,
    name: '赭石',
    chineseName: '赭石',
    category: 'natural',
    color: '#A0522D',
    colorName: '褐色',
    origin: '山西代县',
    description: '赭石是赤铁矿的一种，呈土黄至红棕色，是人类最早使用的天然颜料之一。',
    detailedDescription: '赭石，古称"代赭"，因产于山西代县而得名。从远古时期的岩画到现代中国画，赭石始终是画家笔下最温暖的色调。',
    properties: {
      lightfastness: '极佳',
      transparency: '半透明',
      toxicity: '无毒',
      grindingDifficulty: '容易'
    },
    mineSource: {
      location: '山西代县',
      latitude: 39.0,
      longitude: 113.0,
      formation: '沉积变质铁矿床',
      extractionHistory: '旧石器时代已使用'
    },
    master: {
      id: 4,
      name: '张黄土',
      title: '民间工艺大师',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      experience: 30,
      specialty: '矿物颜料基础色制作',
      bio: '张黄土大师从艺三十年，专注传统矿物颜料的基础色提纯工艺。'
    },
    productionProcess: [
      { step: 1, name: '采集', description: '选取优质赤铁矿' },
      { step: 2, name: '煅烧', description: '高温煅烧改变色泽' },
      { step: 3, name: '水磨', description: '水磨法细化颗粒' },
      { step: 4, name: '漂洗', description: '漂洗去杂质' },
      { step: 5, name: '沉淀', description: '分级沉淀' },
      { step: 6, name: '干燥', description: '低温干燥' }
    ],
    videos: [
      { id: 5, title: '赭石颜料制作', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop', duration: '12:30' }
    ],
    applications: [
      { field: '山水画', example: '传统水墨山水' },
      { field: '岩画', example: '贺兰山岩画' },
      { field: '彩陶', example: '仰韶文化彩陶' }
    ],
    historicalExamples: [
      { name: '贺兰山岩画', artist: '先民', dynasty: '新石器时代', description: '赭石绘制的古老岩画' }
    ],
    relatedPigments: [2, 7],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    views: 7650,
    likes: 432,
    isHot: false,
    createTime: '2024-03-05'
  },
  {
    id: 5,
    name: '胭脂',
    chineseName: '胭脂',
    category: 'compound',
    color: '#C2185B',
    colorName: '玫红色',
    origin: '传统配方',
    description: '胭脂是红蓝花与苏木等天然原料调配而成的传统红色颜料，色泽柔媚娇艳。',
    detailedDescription: '胭脂，又名"焉支"、"燕支"，相传由张骞从西域传入。以红蓝花汁、苏木、紫铆等天然原料精心调配，是古代美人妆容和绘画中不可或缺的娇美色彩。',
    properties: {
      lightfastness: '一般',
      transparency: '透明',
      toxicity: '无毒',
      grindingDifficulty: '容易'
    },
    mineSource: {
      location: '传统工艺配方',
      latitude: null,
      longitude: null,
      formation: '植物与矿物调配',
      extractionHistory: '汉代由西域传入中原'
    },
    master: {
      id: 5,
      name: '林芳菲',
      title: '传统颜料调配师',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      experience: 25,
      specialty: '植物与矿物复合颜料',
      bio: '林芳菲大师擅长古法调配胭脂、藤黄等复合颜料，作品被多位工笔画家选用。'
    },
    productionProcess: [
      { step: 1, name: '选材', description: '精选红蓝花、苏木、紫铆' },
      { step: 2, name: '捣花', description: '将红蓝花捣烂取汁' },
      { step: 3, name: '发酵', description: '自然发酵去除杂质' },
      { step: 4, name: '调配', description: '加入矿物色粉调和' },
      { step: 5, name: '过滤', description: '多层纱布过滤' },
      { step: 6, name: '阴干', description: '阴干制成膏状' }
    ],
    videos: [
      { id: 6, title: '古法胭脂制作技艺', thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=225&fit=crop', duration: '20:15' }
    ],
    applications: [
      { field: '人物画', example: '传统仕女图' },
      { field: '化妆品', example: '古代胭脂水粉' },
      { field: '漆器', example: '传统漆器装饰' }
    ],
    historicalExamples: [
      { name: '簪花仕女图', artist: '周昉', dynasty: '唐代', description: '胭脂描绘美人妆容' }
    ],
    relatedPigments: [3, 8],
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
    views: 11200,
    likes: 876,
    isHot: true,
    createTime: '2024-02-10'
  },
  {
    id: 6,
    name: '雄黄',
    chineseName: '雄黄',
    category: 'natural',
    color: '#FFA500',
    colorName: '橙色',
    origin: '湖南石门',
    description: '雄黄是一种含砷硫化物矿物，呈鲜艳的橘红色，自古用于辟邪和绘画。',
    detailedDescription: '雄黄，又名"黄金石"，颜色橙红如火焰。端午节悬雄黄、饮雄黄酒的习俗流传千年，其明亮的色彩也常用于绘画中的特殊表现。',
    properties: {
      lightfastness: '较好',
      transparency: '不透明',
      toxicity: '有毒',
      grindingDifficulty: '中等'
    },
    mineSource: {
      location: '湖南石门雄黄矿',
      latitude: 29.6,
      longitude: 111.4,
      formation: '低温热液矿床',
      extractionHistory: '战国时期已有使用记载'
    },
    master: {
      id: 6,
      name: '赵紫阳',
      title: '省级非遗传承人',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      experience: 38,
      specialty: '稀有矿物颜料制作',
      bio: '赵紫阳大师专注稀有矿物颜料研究三十余年，对雄黄、雌黄等颜料有深入研究。'
    },
    productionProcess: [
      { step: 1, name: '采矿', description: '选取纯净雄黄矿石' },
      { step: 2, name: '挑选', description: '手工挑选色泽纯正者' },
      { step: 3, name: '研磨', description: '陶瓷研钵细磨' },
      { step: 4, name: '水飞', description: '水飞法提纯精制' },
      { step: 5, name: '沉淀', description: '静置沉淀取上层细粉' },
      { step: 6, name: '晾干', description: '避光阴干' }
    ],
    videos: [
      { id: 7, title: '雄黄颜料制作工艺', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop', duration: '16:40' }
    ],
    applications: [
      { field: '宗教绘画', example: '道教神像画' },
      { field: '民俗', example: '端午节辟邪' },
      { field: '中药', example: '传统中药材' }
    ],
    historicalExamples: [
      { name: '天王送子图', artist: '吴道子', dynasty: '唐代', description: '雄黄绘制神像光环' }
    ],
    relatedPigments: [3, 9],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    views: 6540,
    likes: 387,
    isHot: false,
    createTime: '2024-03-15'
  },
  {
    id: 7,
    name: '蛤粉',
    chineseName: '蛤粉',
    category: 'compound',
    color: '#FFFAF0',
    colorName: '白色',
    origin: '渤海湾',
    description: '蛤粉是由蛤蜊壳煅烧研磨而成的白色颜料，白如霜雪，细腻温润。',
    detailedDescription: '蛤粉，又称"蛤白"，选取深海厚壳蛤蜊，经多次煅烧、水飞精制而成。其色纯白如霜，粉质细腻，是传统绘画中最重要的白色颜料。',
    properties: {
      lightfastness: '极佳',
      transparency: '不透明',
      toxicity: '无毒',
      grindingDifficulty: '较难'
    },
    mineSource: {
      location: '渤海湾山东长岛',
      latitude: 37.9,
      longitude: 120.7,
      formation: '海洋贝壳沉积',
      extractionHistory: '唐代已广泛使用'
    },
    master: {
      id: 7,
      name: '白雪松',
      title: '传统工艺大师',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      experience: 32,
      specialty: '白色颜料制作',
      bio: '白雪松大师是国内为数不多的蛤粉制作技艺传承人，其制作的蛤粉被故宫修复专家选用。'
    },
    productionProcess: [
      { step: 1, name: '选壳', description: '选取5年以上厚壳蛤蜊' },
      { step: 2, name: '清洗', description: '多次清洗去杂质' },
      { step: 3, name: '煅烧', description: '1200度高温煅烧' },
      { step: 4, name: '淬火', description: '迅速浸入冷水中' },
      { step: 5, name: '研磨', description: '水磨36小时以上' },
      { step: 6, name: '漂洗', description: '多次漂洗提纯' }
    ],
    videos: [
      { id: 8, title: '蛤粉制作工艺展示', thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=225&fit=crop', duration: '23:20' }
    ],
    applications: [
      { field: '人物画', example: '传统人物开脸' },
      { field: '花鸟画', example: '宋代院体花鸟' },
      { field: '壁画', example: '法海寺壁画' }
    ],
    historicalExamples: [
      { name: '维摩演教图', artist: '李公麟', dynasty: '宋代', description: '蛤粉渲染人物衣纹' }
    ],
    relatedPigments: [4, 10],
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
    views: 8760,
    likes: 543,
    isHot: false,
    createTime: '2024-01-25'
  },
  {
    id: 8,
    name: '藤黄',
    chineseName: '藤黄',
    category: 'compound',
    color: '#FFD700',
    colorName: '黄色',
    origin: '云南西双版纳',
    description: '藤黄是藤黄树分泌的树脂制成的黄色颜料，色如纯金，明艳动人。',
    detailedDescription: '藤黄，又名"月黄"，是热带藤黄树的天然树脂。其色如黄金般璀璨，是传统绘画中最明亮的黄色。因其有毒，使用时需格外小心。',
    properties: {
      lightfastness: '一般',
      transparency: '透明',
      toxicity: '有毒',
      grindingDifficulty: '容易'
    },
    mineSource: {
      location: '云南西双版纳',
      latitude: 22.0,
      longitude: 101.0,
      formation: '热带植物树脂',
      extractionHistory: '唐代由东南亚传入'
    },
    master: {
      id: 8,
      name: '黄金声',
      title: '传统颜料调配师',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      experience: 28,
      specialty: '树脂类颜料加工',
      bio: '黄金声大师专注植物树脂颜料加工，对藤黄、胭脂等颜料的古法制作有独到研究。'
    },
    productionProcess: [
      { step: 1, name: '采集', description: '在藤黄树皮上刻槽取汁' },
      { step: 2, name: '过滤', description: '细布过滤去除杂质' },
      { step: 3, name: '蒸发', description: '低温蒸发浓缩' },
      { step: 4, name: '凝固', description: '自然凝固成块状' },
      { step: 5, name: '研磨', description: '使用时加水研磨' },
      { step: 6, name: '调胶', description: '加入桃胶调和使用' }
    ],
    videos: [
      { id: 9, title: '藤黄采集与加工', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop', duration: '14:50' }
    ],
    applications: [
      { field: '花鸟画', example: '传统工笔花鸟' },
      { field: '建筑彩画', example: '古建筑装饰' },
      { field: '中药', example: '传统中药材' }
    ],
    historicalExamples: [
      { name: '写生珍禽图', artist: '黄荃', dynasty: '五代', description: '藤黄描绘禽鸟羽毛' }
    ],
    relatedPigments: [5, 9],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    views: 7890,
    likes: 456,
    isHot: false,
    createTime: '2024-02-28'
  },
  {
    id: 9,
    name: '石黄',
    chineseName: '石黄',
    category: 'natural',
    color: '#FFC107',
    colorName: '橙黄色',
    origin: '广东韶关',
    description: '石黄是雄黄的共生矿物雌黄，呈明亮的柠檬黄色，色彩稳定耐久。',
    detailedDescription: '石黄，即雌黄，与雄黄共生，呈鲜艳的柠檬黄色。古语"信口雌黄"便源于古人用雌黄涂改文字，可见其覆盖力之强。',
    properties: {
      lightfastness: '较好',
      transparency: '不透明',
      toxicity: '有毒',
      grindingDifficulty: '中等'
    },
    mineSource: {
      location: '广东韶关',
      latitude: 24.8,
      longitude: 113.6,
      formation: '低温热液矿床',
      extractionHistory: '汉代已使用'
    },
    master: {
      id: 6,
      name: '赵紫阳',
      title: '省级非遗传承人',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      experience: 38,
      specialty: '稀有矿物颜料制作',
      bio: '赵紫阳大师专注稀有矿物颜料研究三十余年，对雄黄、雌黄等颜料有深入研究。'
    },
    productionProcess: [
      { step: 1, name: '选矿', description: '挑选纯净雌黄矿石' },
      { step: 2, name: '粉碎', description: '捣碎成细粒' },
      { step: 3, name: '水飞', description: '水飞法反复提纯' },
      { step: 4, name: '沉淀', description: '分级沉淀取最细者' },
      { step: 5, name: '晾晒', description: '阴干去除水分' },
      { step: 6, name: '收膏', description: '加胶收膏备用' }
    ],
    videos: [
      { id: 10, title: '石黄颜料制作', thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=225&fit=crop', duration: '15:25' }
    ],
    applications: [
      { field: '壁画', example: '敦煌壁画' },
      { field: '书法', example: '古代涂改液' },
      { field: '宗教画', example: '佛教绘画' }
    ],
    historicalExamples: [
      { name: '敦煌壁画', artist: '佚名', dynasty: '北魏至元', description: '石黄大量用于壁画背景' }
    ],
    relatedPigments: [6, 8],
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
    views: 5430,
    likes: 321,
    isHot: false,
    createTime: '2024-03-20'
  },
  {
    id: 10,
    name: '墨黑',
    chineseName: '墨黑',
    category: 'compound',
    color: '#1A1A1A',
    colorName: '黑色',
    origin: '安徽徽州',
    description: '墨黑是桐油、松烟等原料烧制的炭黑与胶调和而成，是中国书法绘画的灵魂。',
    detailedDescription: '墨，中国文房四宝之首，分为松烟墨、油烟墨两类。上等墨锭"坚如玉、纹如犀、黑如漆"，书写千年不褪色，是中华文化传承的重要载体。',
    properties: {
      lightfastness: '极佳',
      transparency: '不透明',
      toxicity: '无毒',
      grindingDifficulty: '无需研磨'
    },
    mineSource: {
      location: '安徽黄山歙县',
      latitude: 29.9,
      longitude: 118.4,
      formation: '炭黑与动物胶复合',
      extractionHistory: '商代已有用墨记载'
    },
    master: {
      id: 9,
      name: '胡开文',
      title: '国家级非遗传承人',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      experience: 42,
      specialty: '徽墨制作技艺',
      bio: '胡开文大师是徽墨制作技艺的代表性传承人，继承百年老店传统工艺。'
    },
    productionProcess: [
      { step: 1, name: '烧烟', description: '桐油不完全燃烧取烟' },
      { step: 2, name: '和胶', description: '加入牛皮胶调和' },
      { step: 3, name: '加料', description: '加入麝香、冰片等药材' },
      { step: 4, name: '捣杵', description: '反复捶打万次以上' },
      { step: 5, name: '制模', description: '入模压制成型' },
      { step: 6, name: '晾墨', description: '阴干半年以上' }
    ],
    videos: [
      { id: 11, title: '千年徽墨制作技艺', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop', duration: '28:45' }
    ],
    applications: [
      { field: '书法', example: '中国书法艺术' },
      { field: '水墨画', example: '传统水墨山水' },
      { field: '版画', example: '传统木版水印' }
    ],
    historicalExamples: [
      { name: '兰亭序', artist: '王羲之', dynasty: '东晋', description: '墨书千古第一行书' }
    ],
    relatedPigments: [7, 4],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    views: 18900,
    likes: 1567,
    isHot: true,
    createTime: '2024-01-05'
  }
]
