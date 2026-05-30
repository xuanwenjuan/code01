export const categories = [
  { id: 'all', name: '全部', icon: '🌸' },
  { id: 'chenxiang', name: '沉香', icon: '🌳' },
  { id: 'tanxiang', name: '檀香', icon: '🌲' },
  { id: 'shexiang', name: '麝香', icon: '🦌' },
  { id: 'longxian', name: '龙涎香', icon: '🐋' },
  { id: 'ruixiang', name: '瑞香', icon: '🌺' },
  { id: 'hexing', name: '合香', icon: '🎐' }
]

export const mockIncenses = [
  {
    id: 1,
    name: '奇楠沉香',
    category: 'chenxiang',
    type: 'ancient',
    price: 2880,
    origin: '越南芽庄',
    description: '奇楠香中之王，香气层次丰富，初闻清甜，继而淡雅，最后醇厚留香。',
    coverImage: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1599637047475-7e8093e06cba?w=800&h=600&fit=crop'
    ],
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    inheritorId: 1,
    materials: [
      { name: '奇楠沉香木', origin: '越南芽庄', proportion: '85%', description: '奇楠是沉香中的极品，被誉为"香中之王"。越南芽庄所产奇楠香气层次最为丰富，初闻清甜如蜜，继而淡雅如花，最后醇厚留香，是制香的顶级原料。', originDetail: '越南芽庄位于越南中部沿海，气候湿热，是奇楠沉香的最佳产地。这里出产的奇楠香韵独特，被誉为"芽庄奇楠甲天下"。' },
      { name: '老山檀香', origin: '印度迈索尔', proportion: '10%', description: '印度迈索尔老山檀是檀香中的上品，香气醇厚温润，带有淡淡的奶香，能够调和整体香气，使香品更加饱满。', originDetail: '印度迈索尔地区拥有百年以上的檀香树种植历史，这里出产的檀香木质地致密，香气持久，是世界公认的顶级檀香产地。' },
      { name: '龙脑香', origin: '印尼苏门答腊', proportion: '3%', description: '龙脑香又名冰片，具有开窍醒神的功效，香气清凉通透，能够提升整体香气的层次感。', originDetail: '印尼苏门答腊岛热带雨林中生长着珍贵的龙脑香树，所产龙脑香品质纯正，是传统香道中不可或缺的配料。' },
      { name: '安息香', origin: '伊朗', proportion: '2%', description: '安息香具有开窍清神、行气活血的功效，香气温暖甜润，能够起到定香的作用，使香气更加持久。', originDetail: '伊朗古称波斯，是安息香的传统产地，这里出产的安息香树脂含量高，香气纯正，自古以来就是丝绸之路上的重要贸易品。' }
    ],
    craftSteps: [
      { step: 1, title: '选材', desc: '精选三十年以上奇楠沉香木，取心材部分' },
      { step: 2, title: '晾晒', desc: '自然晾晒三年以上，去除水分' },
      { step: 3, title: '研磨', desc: '传统石磨研磨，保留香气分子' },
      { step: 4, title: '调和', desc: '按古方比例调和多种香料' },
      { step: 5, title: '成型', desc: '手工制香，阴干成型' },
      { step: 6, title: '窖藏', desc: '陶瓮窖藏一年，醇化香气' }
    ],
    usage: '静坐冥想、书斋品香、待客雅集',
    effect: '安神定志、开窍醒神、净化空气',
    createTime: '2023-06-15'
  },
  {
    id: 2,
    name: '老山檀香',
    category: 'tanxiang',
    type: 'ancient',
    price: 1280,
    origin: '印度迈索尔',
    description: '产自印度迈索尔的百年老山檀，香气醇厚温润，奶香浓郁。',
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&h=600&fit=crop'
    ],
    video: '',
    inheritorId: 2,
    materials: [
      { name: '老山檀香木', origin: '印度迈索尔', proportion: '95%' },
      { name: '天然粘粉', origin: '印尼', proportion: '5%' }
    ],
    craftSteps: [
      { step: 1, title: '选材', desc: '选取百年以上老山檀木根部' },
      { step: 2, title: '切片', desc: '人工切片，厚薄均匀' },
      { step: 3, title: '研磨', desc: '低温研磨成粉' },
      { step: 4, title: '制香', desc: '加入天然粘粉，手工成型' },
      { step: 5, title: '阴干', desc: '恒温恒湿阴干45天' }
    ],
    usage: '礼佛参拜、日常熏香、办公室使用',
    effect: '舒缓压力、提神醒脑、改善睡眠',
    createTime: '2023-08-20'
  },
  {
    id: 3,
    name: '古法和香·清越',
    category: 'hexing',
    type: 'ancient',
    price: 680,
    origin: '中国杭州',
    description: '依据宋代《陈氏香谱》古法配方，融合多种名贵香料，香气清雅幽远。',
    coverImage: 'https://images.unsplash.com/photo-1599637047475-7e8093e06cba?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1599637047475-7e8093e06cba?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&h=600&fit=crop'
    ],
    video: '',
    inheritorId: 3,
    materials: [
      { name: '沉香', origin: '海南', proportion: '30%' },
      { name: '檀香', origin: '澳大利亚', proportion: '25%' },
      { name: '丁香', origin: '坦桑尼亚', proportion: '15%' },
      { name: '乳香', origin: '阿曼', proportion: '15%' },
      { name: '安息香', origin: '伊朗', proportion: '10%' },
      { name: '龙脑', origin: '印尼', proportion: '5%' }
    ],
    craftSteps: [
      { step: 1, title: '配方', desc: '依古法比例精准称量各香料' },
      { step: 2, title: '研磨', desc: '分别研磨各香料至200目' },
      { step: 3, title: '过筛', desc: '多次过筛，确保粉质细腻' },
      { step: 4, title: '调和', desc: '用炭火烧制的梨汁调和香粉' },
      { step: 5, title: '成型', desc: '手工搓制成线香' },
      { step: 6, title: '窖藏', desc: '瓷罐密封窖藏半年' }
    ],
    usage: '品香雅集、书房伴读、茶室待客',
    effect: '清心悦神、解郁宽胸、增进灵感',
    createTime: '2023-09-10'
  },
  {
    id: 4,
    name: '新中式·禅茶一味',
    category: 'hexing',
    type: 'new',
    price: 398,
    origin: '中国福建',
    description: '创新融合茶香与沉香，专为品茶场景设计，茶汤与香韵相得益彰。',
    coverImage: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1599637047475-7e8093e06cba?w=800&h=600&fit=crop'
    ],
    video: '',
    inheritorId: 1,
    materials: [
      { name: '沉香', origin: '海南', proportion: '40%' },
      { name: '铁观音茶末', origin: '福建安溪', proportion: '35%' },
      { name: '桂花', origin: '广西桂林', proportion: '15%' },
      { name: '甘草', origin: '内蒙古', proportion: '10%' }
    ],
    craftSteps: [
      { step: 1, title: '选材', desc: '精选铁观音秋茶茶末' },
      { step: 2, title: '窨制', desc: '桂花窨制茶末三次' },
      { step: 3, title: '调配', desc: '与沉香粉按比例混合' },
      { step: 4, title: '制香', desc: '现代工艺成型' },
      { step: 5, title: '烘焙', desc: '低温烘焙固化香气' }
    ],
    usage: '品茶伴香、朋友小聚、商务洽谈',
    effect: '提升品茶体验、清新口气、放松身心',
    createTime: '2024-01-05'
  },
  {
    id: 5,
    name: '海南黄熟香',
    category: 'chenxiang',
    type: 'ancient',
    price: 1880,
    origin: '中国海南',
    description: '海南沉香中的极品，黄熟香结香时间长，香气甜美温润，被誉为"蜜香"。',
    coverImage: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&h=600&fit=crop'
    ],
    video: '',
    inheritorId: 2,
    materials: [
      { name: '海南黄熟沉香', origin: '中国海南尖峰岭', proportion: '98%' },
      { name: '天然楠木粘粉', origin: '四川', proportion: '2%' }
    ],
    craftSteps: [
      { step: 1, title: '寻香', desc: '深入海南原始森林寻采沉香' },
      { step: 2, title: '清理', desc: '手工清理香材表面杂质' },
      { step: 3, title: '勾丝', desc: '传统工具人工勾取香脂' },
      { step: 4, title: '研磨', desc: '石磨研磨成粉' },
      { step: 5, title: '成型', desc: '手工制线香' },
      { step: 6, title: '陈化', desc: '自然陈化一年以上' }
    ],
    usage: '高端品香、重要场合、收藏传家',
    effect: '通窍安神、调理气血、提升气场',
    createTime: '2023-03-20'
  },
  {
    id: 6,
    name: '新中式·花间意',
    category: 'hexing',
    type: 'new',
    price: 268,
    origin: '中国云南',
    description: '融合云南多种天然花香与香料，甜美清新，适合日常家居使用。',
    coverImage: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&h=600&fit=crop'
    ],
    video: '',
    inheritorId: 3,
    materials: [
      { name: '檀香', origin: '澳大利亚', proportion: '30%' },
      { name: '茉莉花瓣', origin: '云南元江', proportion: '25%' },
      { name: '玫瑰花瓣', origin: '云南昆明', proportion: '20%' },
      { name: '薰衣草', origin: '云南大理', proportion: '15%' },
      { name: '依兰', origin: '云南西双版纳', proportion: '10%' }
    ],
    craftSteps: [
      { step: 1, title: '采花', desc: '清晨采摘半开的鲜花' },
      { step: 2, title: '阴干', desc: '阴凉通风处自然阴干' },
      { step: 3, title: '研磨', desc: '低温研磨花瓣与香料' },
      { step: 4, title: '调配', desc: '按比例混合所有香粉' },
      { step: 5, title: '成型', desc: '机械制香' }
    ],
    usage: '卧室熏香、瑜伽冥想、SPA放松',
    effect: '舒缓情绪、改善睡眠、营造浪漫氛围',
    createTime: '2024-01-10'
  },
  {
    id: 7,
    name: '澳洲檀香',
    category: 'tanxiang',
    type: 'new',
    price: 458,
    origin: '澳大利亚西澳',
    description: '澳大利亚西澳新山檀，香气清新淡雅，性价比高，适合日常使用。',
    coverImage: 'https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=800&h=600&fit=crop'
    ],
    video: '',
    inheritorId: 1,
    materials: [
      { name: '澳洲檀香木', origin: '澳大利亚西澳', proportion: '92%' },
      { name: '天然粘粉', origin: '印尼', proportion: '8%' }
    ],
    craftSteps: [
      { step: 1, title: '选材', desc: '选用树龄30年以上澳洲檀香' },
      { step: 2, title: '切片', desc: '机器切片' },
      { step: 3, title: '研磨', desc: '低温研磨' },
      { step: 4, title: '制香', desc: '自动化制香' },
      { step: 5, title: '烘干', desc: '恒温烘干' }
    ],
    usage: '日常家居、办公室、礼佛',
    effect: '清新空气、提神醒脑、舒缓压力',
    createTime: '2024-01-12'
  },
  {
    id: 8,
    name: '龙涎香合香',
    category: 'longxian',
    type: 'ancient',
    price: 5880,
    origin: '中国广东',
    description: '珍贵龙涎香与沉香、檀香等多种香料调和，留香持久，被誉为"众香之首"。',
    coverImage: 'https://images.unsplash.com/photo-1607439698614-7b1106ceb461?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1607439698614-7b1106ceb461?w=800&h=600&fit=crop'
    ],
    video: '',
    inheritorId: 3,
    materials: [
      { name: '天然龙涎香', origin: '印度洋', proportion: '5%' },
      { name: '奇楠沉香', origin: '越南', proportion: '35%' },
      { name: '老山檀香', origin: '印度', proportion: '30%' },
      { name: '麝香', origin: '中国西藏', proportion: '5%' },
      { name: '乳香', origin: '阿曼', proportion: '15%' },
      { name: '没药', origin: '索马里', proportion: '10%' }
    ],
    craftSteps: [
      { step: 1, title: '炮制', desc: '龙涎香用酒浸泡三年，每日更换新酒' },
      { step: 2, title: '研磨', desc: '所有香料分别研磨至300目' },
      { step: 3, title: '调和', desc: '依古法顺序逐次加入调和' },
      { step: 4, title: '窖藏', desc: '地窖窖藏三年' },
      { step: 5, title: '成型', desc: '手工搓制成香丸' },
      { step: 6, title: '蜡封', desc: '蜂蜡密封保存' }
    ],
    usage: '重大庆典、品香雅集、珍藏品鉴',
    effect: '通经开窍、安神定魄、香韵持久',
    createTime: '2020-05-20'
  }
]

export const getIncenseById = (id) => {
  return mockIncenses.find(incense => incense.id === parseInt(id))
}

export const getIncensesByCategory = (category) => {
  if (category === 'all') return mockIncenses
  return mockIncenses.filter(incense => incense.category === category)
}

export const getIncensesByType = (type) => {
  return mockIncenses.filter(incense => incense.type === type)
}
