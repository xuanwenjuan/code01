export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: '系统管理员',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    email: 'admin@pottery.com',
    phone: '13800138000'
  },
  {
    id: 2,
    username: 'artisan',
    password: 'artisan123',
    name: '陶艺匠人',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artisan',
    email: 'artisan@pottery.com',
    phone: '13900139000',
    bio: '从事陶艺创作20年，专注于青花瓷和釉下彩工艺'
  },
  {
    id: 3,
    username: 'lover',
    password: 'lover123',
    name: '陶艺爱好者',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lover',
    email: 'lover@pottery.com',
    phone: '13700137000',
    bio: '热爱陶艺，业余时间学习陶艺制作'
  }
]

export const mockWorks = [
  {
    id: 1,
    title: '青花瓷瓶',
    description: '采用传统青花工艺，纯手工绘制缠枝莲纹，釉色温润如玉',
    category: 'qimin',
    categoryName: '器皿类',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    author: '张大师',
    kiln: '景德镇窑',
    year: 2024,
    price: 8800,
    tags: ['青花', '手工', '收藏级'],
    views: 2356,
    likes: 189
  },
  {
    id: 2,
    title: '紫砂茶壶',
    description: '宜兴原矿紫砂泥料，全手工制作，透气性极佳，适合泡养',
    category: 'qimin',
    categoryName: '器皿类',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=400&fit=crop',
    author: '李大师',
    kiln: '宜兴窑',
    year: 2023,
    price: 3200,
    tags: ['紫砂', '茶具', '实用'],
    views: 1892,
    likes: 156
  },
  {
    id: 3,
    title: '陶瓷佛像摆件',
    description: '德化白瓷材质，慈眉善目，工艺精湛，适合家居供奉',
    category: 'baijian',
    categoryName: '摆件类',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    author: '王大师',
    kiln: '德化窑',
    year: 2024,
    price: 5600,
    tags: ['白瓷', '佛像', '摆件'],
    views: 3421,
    likes: 278
  },
  {
    id: 4,
    title: '钧瓷窑变花瓶',
    description: '入窑一色出窑万彩，天然窑变纹理，每一件都是孤品',
    category: 'baijian',
    categoryName: '摆件类',
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    author: '刘大师',
    kiln: '钧窑',
    year: 2023,
    price: 12800,
    tags: ['钧瓷', '窑变', '收藏级'],
    views: 4567,
    likes: 389
  },
  {
    id: 5,
    title: '手绘陶瓷茶具套装',
    description: '文创设计，融入现代美学，一壶六杯，送礼佳品',
    category: 'wenchuang',
    categoryName: '文创类',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
    author: '陈设计',
    kiln: '景德镇窑',
    year: 2024,
    price: 1680,
    tags: ['文创', '茶具', '套装'],
    views: 2134,
    likes: 167
  },
  {
    id: 6,
    title: '陶瓷香薰炉',
    description: '造型典雅，香气氤氲，为空间增添东方韵味',
    category: 'wenchuang',
    categoryName: '文创类',
    image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&h=400&fit=crop',
    author: '周匠人',
    kiln: '龙泉窑',
    year: 2024,
    price: 580,
    tags: ['香道', '文创', '实用'],
    views: 1567,
    likes: 98
  },
  {
    id: 7,
    title: '汝窑天青釉茶盏',
    description: '雨过天青云破处，这般颜色做将来。复刻宋代汝窑工艺',
    category: 'qimin',
    categoryName: '器皿类',
    image: 'https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=400&h=400&fit=crop',
    author: '赵大师',
    kiln: '汝窑',
    year: 2023,
    price: 6800,
    tags: ['汝窑', '天青', '茶盏'],
    views: 3890,
    likes: 312
  },
  {
    id: 8,
    title: '陶瓷文房四宝套装',
    description: '笔墨纸砚瓷质套装，书法爱好者的不二之选',
    category: 'wenchuang',
    categoryName: '文创类',
    image: 'https://images.unsplash.com/photo-1606318005254-bdb2bcd14d35?w=400&h=400&fit=crop',
    author: '吴大师',
    kiln: '景德镇窑',
    year: 2024,
    price: 2580,
    tags: ['文房', '书法', '套装'],
    views: 1234,
    likes: 87
  },
  {
    id: 9,
    title: '十二生肖陶俑',
    description: '传统陶塑工艺，造型生动，民俗文化收藏',
    category: 'baijian',
    categoryName: '摆件类',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    author: '孙大师',
    kiln: '佛山窑',
    year: 2023,
    price: 4200,
    tags: ['陶塑', '生肖', '民俗'],
    views: 2789,
    likes: 234
  }
]

export const mockKilns = [
  {
    id: 1,
    name: '景德镇窑',
    location: '江西景德镇',
    history: '始于汉代，盛于明清，千年窑火不断',
    description: '景德镇窑是中国陶瓷史上最负盛名的窑口之一，素有"瓷都"之称。其产品以"白如玉、明如镜、薄如纸、声如磬"闻名于世。',
    specialties: ['青花瓷', '粉彩', '玲珑瓷', '颜色釉'],
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=400&fit=crop',
    famousWorks: ['元青花鬼谷子下山图罐', '清乾隆粉彩镂空转心瓶']
  },
  {
    id: 2,
    name: '钧窑',
    location: '河南禹州',
    history: '创烧于唐代，鼎盛于北宋，为宋代五大名窑之一',
    description: '钧窑以独特的窑变艺术而著称于世，"入窑一色，出窑万彩"是其最大特点。钧瓷釉色绚丽多彩，红、蓝、青、白、紫交相辉映。',
    specialties: ['窑变釉', '玫瑰紫', '海棠红', '天蓝'],
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=400&fit=crop',
    famousWorks: ['宋钧窑玫瑰紫釉花盆', '宋钧窑月白釉出戟尊']
  },
  {
    id: 3,
    name: '汝窑',
    location: '河南汝州',
    history: '北宋时期专为宫廷烧造御用瓷器，宋代五大名窑之首',
    description: '汝窑以烧制青瓷闻名，釉色如雨过天青，釉面莹润如玉，有"雨过天晴云破处"之美誉。汝窑瓷器存世极少，弥足珍贵。',
    specialties: ['天青釉', '粉青', '卵青', '虾青'],
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
    famousWorks: ['宋汝窑天青釉弦纹樽', '宋汝窑天青釉洗']
  },
  {
    id: 4,
    name: '龙泉窑',
    location: '浙江龙泉',
    history: '创烧于北宋早期，南宋中晚期进入鼎盛时期',
    description: '龙泉窑是中国陶瓷史上烧制年代最长、窑址分布最广、产品质量最高、生产规模和外销范围最大的青瓷名窑。',
    specialties: ['粉青釉', '梅子青', '哥窑开片'],
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=400&fit=crop',
    famousWorks: ['南宋龙泉窑梅子青釉鬲式炉', '元龙泉窑青瓷牡丹纹瓶']
  },
  {
    id: 5,
    name: '德化窑',
    location: '福建德化',
    history: '始于宋代，明代达到鼎盛，以白瓷著称于世',
    description: '德化白瓷瓷质致密，透光度极好，釉面为纯白色，色泽光润明亮，乳白如脂，被称为"象牙白"、"猪油白"。',
    specialties: ['白瓷', '瓷塑', '佛像'],
    image: 'https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=800&h=400&fit=crop',
    famousWorks: ['明德化窑何朝宗款白釉观音像', '明德化窑白釉达摩像']
  },
  {
    id: 6,
    name: '宜兴窑',
    location: '江苏宜兴',
    history: '始于宋代，明清时期紫砂壶制作达到顶峰',
    description: '宜兴窑以生产紫砂陶器闻名天下，紫砂器质地细腻，含铁量高，透气性能好，是制作茶具的上等材料。',
    specialties: ['紫砂', '紫砂壶', '紫砂茶宠'],
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&h=400&fit=crop',
    famousWorks: ['明供春壶', '清陈曼生铭紫砂壶']
  }
]

export const mockTechniques = [
  {
    id: 1,
    name: '拉坯',
    description: '最古老也是最具代表性的陶艺成型技法，利用轮车旋转产生的离心力，配合双手的控制，将泥料塑造成所需的器型。',
    difficulty: '高级',
    duration: '2-3小时',
    tools: ['轮车', '泥料', '水', '割线'],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    steps: [
      {
        order: 1,
        title: '揉泥',
        description: '将泥料反复揉压，排除气泡，使泥料均匀一致，软硬适中。可采用菊花揉或羊头揉的方法。',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=300&fit=crop'
      },
      {
        order: 2,
        title: '定中心',
        description: '将揉好的泥团放在轮车中心，双手湿润，用掌根将泥团压实固定。轮车转动时，双手抱住泥团，保持稳定。',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=300&fit=crop'
      },
      {
        order: 3,
        title: '开孔',
        description: '双手拇指在泥团中心向下按压，开出一个深洞，注意保持壁厚均匀。开孔深度约为泥团高度的2/3。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=300&fit=crop'
      },
      {
        order: 4,
        title: '拉高',
        description: '双手内外配合，一边旋转一边向上提拉，使器型逐渐升高。力度要均匀，速度要缓慢。',
        image: 'https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=600&h=300&fit=crop'
      },
      {
        order: 5,
        title: '塑形',
        description: '根据需要调整器型，收口、扩腹、修型，使造型美观匀称。可使用工具辅助整形。',
        image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&h=300&fit=crop'
      },
      {
        order: 6,
        title: '下线',
        description: '用割线沿轮面将坯体与泥料分离，待稍干后取下。动作要快而稳。',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=300&fit=crop'
      }
    ],
    errorPoints: [
      {
        problem: '泥料太软容易坍塌，太硬则难以塑形',
        solution: '控制好泥料的湿度，理想状态是手指按压有轻微凹陷但不粘手。夏季可适当喷水保湿，冬季可提前准备泥料。'
      },
      {
        problem: '双手力度不均会导致器型歪斜',
        solution: '保持身体端正，双肘支撑在腿上或工作台上，双手用力要对称。练习时可闭上眼睛感受泥料的转动。'
      },
      {
        problem: '开孔太浅无法拉高，太深则底部太薄',
        solution: '开孔深度控制在泥团高度的2/3左右，留约1-2cm作为底部厚度。初学者可在拇指上做标记。'
      },
      {
        problem: '提拉速度过快容易拉破坯体',
        solution: '提拉速度要慢，双手配合要协调。每次提拉高度不超过5cm，分多次拉高。'
      }
    ],
    tips: '初学者可先从小件器物练起，如水杯、小碗等，掌握好力度和节奏。练习时不要追求完美，重点是感受泥性和轮车的配合。建议每次练习时间控制在1-2小时，避免手部疲劳。'
  },
  {
    id: 2,
    name: '修坯',
    description: '待坯体干燥到一定程度（通常为半干状态，俗称"阴干"），对坯体进行修整，使其外形规整、壁厚均匀。',
    difficulty: '中级',
    duration: '1-2小时',
    tools: ['修坯刀', '轮车', '海绵', '卡尺'],
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    steps: [
      {
        order: 1,
        title: '固定坯体',
        description: '将阴干的坯体倒扣在轮车上，用泥条固定，调整至中心位置。转动轮车检查是否偏心。',
        image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=300&fit=crop'
      },
      {
        order: 2,
        title: '修底足',
        description: '用修坯刀修整坯体底部，挖出底足，使器物放置平稳。底足高度根据器物大小而定。',
        image: 'https://images.unsplash.com/photo-1606318005254-bdb2bcd14d35?w=600&h=300&fit=crop'
      },
      {
        order: 3,
        title: '修外壁',
        description: '刀身与坯体成一定角度，从下往上修整外壁，使线条流畅。进刀要轻，逐层修整。',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=300&fit=crop'
      },
      {
        order: 4,
        title: '修内壁',
        description: '小心修整内壁，控制壁厚，一般保持3-5mm为宜。可用手指感觉壁厚。',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=300&fit=crop'
      },
      {
        order: 5,
        title: '修整口沿',
        description: '修整口沿，使其平整圆滑，可根据设计做不同造型的口部处理。如撇口、直口、敛口等。',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=300&fit=crop'
      },
      {
        order: 6,
        title: '打磨',
        description: '用湿润的海绵轻轻擦拭，使坯体表面光滑细腻。注意不要用力过猛以免坯体变形。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=300&fit=crop'
      }
    ],
    errorPoints: [
      {
        problem: '坯体太湿修坯容易变形，太干则容易崩裂',
        solution: '掌握最佳修坯时机：坯体阴干至指甲轻划有痕迹但不粘手为宜，通常需要1-2天（视天气而定）。'
      },
      {
        problem: '修坯刀不够锋利会导致表面不光滑',
        solution: '定期打磨修坯刀，保持刀刃锋利。进刀方向要与坯体旋转方向相反，形成切削效果。'
      },
      {
        problem: '壁修太薄容易在烧制过程中变形或开裂',
        solution: '保留适当壁厚，小型器物3-4mm，大型器物5-8mm。可用卡尺或手指定期测量。'
      },
      {
        problem: '底足不平会导致器物放置不稳',
        solution: '修完底足后将器物正放在平面上检查，如不稳继续修整。底足接触面要平整。'
      }
    ],
    tips: '修坯时要耐心细致，宁少勿多，逐步修整，避免一次修太多。准备不同形状的修坯刀以适应不同部位的修整。修坯过程中可不断用手抚摸感受坯体表面是否光滑。'
  },
  {
    id: 3,
    name: '上釉',
    description: '在修整好的坯体表面施加釉料，经过烧制后形成光滑亮丽的釉面。上釉方法有浸釉、淋釉、刷釉、喷釉等多种。',
    difficulty: '中级',
    duration: '30-60分钟',
    tools: ['釉料', '釉桶', '刷子', '喷枪', '海绵'],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    steps: [
      {
        order: 1,
        title: '准备釉料',
        description: '将釉料按比例调配，搅拌均匀，过筛去除杂质，调整至合适的浓度。可用比重计测量釉浆密度。',
        image: 'https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=600&h=300&fit=crop'
      },
      {
        order: 2,
        title: '清洁坯体',
        description: '用干净的布或海绵擦拭坯体表面，去除灰尘和油污，保持干燥。素烧坯可先喷水湿润。',
        image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&h=300&fit=crop'
      },
      {
        order: 3,
        title: '施釉（浸釉法）',
        description: '手持坯体，快速浸入釉桶后立即取出，注意控制时间和速度。浸入时间1-3秒，保持匀速。',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=300&fit=crop'
      },
      {
        order: 4,
        title: '修整釉层',
        description: '用海绵擦去底部多余的釉料，检查釉层是否均匀，有无漏釉。釉面不均处可补釉。',
        image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=300&fit=crop'
      },
      {
        order: 5,
        title: '阴干',
        description: '将上好釉的坯体放在通风处阴干，避免灰尘和碰擦。釉层干透后才能入窑烧制。',
        image: 'https://images.unsplash.com/photo-1606318005254-bdb2bcd14d35?w=600&h=300&fit=crop'
      }
    ],
    errorPoints: [
      {
        problem: '釉料太稠会导致釉层太厚，烧制时容易流釉',
        solution: '调整釉料浓度，加水稀释。标准是用手指蘸取后能均匀覆盖，流下时不中断。'
      },
      {
        problem: '釉料太稀则釉层太薄，颜色不够饱满',
        solution: '可添加釉粉增加浓度，或采用多次施釉的方法（每次施釉后需阴干）。'
      },
      {
        problem: '浸釉时间过长会导致釉层过厚或坯体吸釉过多开裂',
        solution: '控制浸釉时间在1-3秒，熟练后可根据需要调整。坯体吸水率高时适当缩短时间。'
      },
      {
        problem: '坯体不干净会导致釉面出现针孔或气泡',
        solution: '施釉前彻底清洁坯体，素烧坯可用清水冲洗后阴干。工作环境保持清洁。'
      }
    ],
    tips: '施釉前可先在素烧坯上试釉，确认釉色和釉层厚度符合预期。不同的施釉方法会产生不同的釉面效果，建议多尝试。釉料使用前要充分搅拌，使用过程中也要定期搅拌防止沉淀。'
  },
  {
    id: 4,
    name: '烧制',
    description: '将干燥后的坯体放入窑中，在高温下烧结成瓷。烧制是陶艺制作的最后一步，也是最关键的一步。',
    difficulty: '高级',
    duration: '12-24小时',
    tools: ['窑炉', '窑具', '测温器', '耐火泥'],
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    steps: [
      {
        order: 1,
        title: '装窑',
        description: '将阴干的坯体小心放入窑中，合理安排位置，注意坯体之间要有足够的间距。使用窑具支撑，避免粘连。',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=300&fit=crop'
      },
      {
        order: 2,
        title: '素烧（可选）',
        description: '第一次低温烧制（约800-900℃），使坯体定型，便于后续上釉操作。升温速度控制在每小时100-150℃。',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=300&fit=crop'
      },
      {
        order: 3,
        title: '釉烧',
        description: '上釉后的坯体进行高温烧制，根据釉料和泥料的不同，温度通常在1200-1400℃之间。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=300&fit=crop'
      },
      {
        order: 4,
        title: '升温',
        description: '控制升温速度，避免过快导致坯体开裂，通常需要8-12小时。低温阶段缓慢升温，高温阶段可适当加快。',
        image: 'https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=600&h=300&fit=crop'
      },
      {
        order: 5,
        title: '保温',
        description: '达到最高温度后保温一段时间，使釉料充分熔融。保温时间根据窑炉大小和作品数量而定，通常30-60分钟。',
        image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&h=300&fit=crop'
      },
      {
        order: 6,
        title: '冷却',
        description: '自然冷却，这个过程同样需要缓慢进行，避免温度骤降导致炸裂。冷却时间通常需要12-24小时。',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=300&fit=crop'
      },
      {
        order: 7,
        title: '开窑',
        description: '待窑温降至室温（通常需要12-24小时），即可开窑取出成品。开窑时注意防尘和安全。',
        image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=300&fit=crop'
      }
    ],
    errorPoints: [
      {
        problem: '升温过快会导致坯体开裂',
        solution: '制定合理的升温曲线，低温阶段（0-600℃）每小时升温不超过100℃，尤其是水分蒸发阶段要缓慢。'
      },
      {
        problem: '冷却过快会导致釉面惊裂或器物炸裂',
        solution: '高温阶段（1000℃以上）降温速度控制在每小时100-150℃，573℃石英晶型转变点附近要特别缓慢。'
      },
      {
        problem: '温度不够会导致生烧，釉面无光',
        solution: '准确测温，使用测温锥或测温环辅助判断。根据泥料和釉料的烧结温度调整最高温。'
      },
      {
        problem: '温度过高会导致过烧，器物变形或粘连',
        solution: '严格控制最高温度和保温时间。不同窑炉温差不同，要摸索自己窑炉的特性。'
      },
      {
        problem: '窑位安排不当会导致釉面污染或器物坍塌',
        solution: '合理装窑，釉坯之间保持足够间距，上下层使用窑具分隔。大件作品放在下层，小件在上层。'
      }
    ],
    tips: '烧制过程中要密切关注温度变化，做好记录，积累经验。不同的窑炉和釉料需要不同的烧制曲线。建议每次烧制都记录下完整的温度曲线和作品情况，便于后续分析改进。新釉料或新器型可先小批量试烧，确认效果后再大批量生产。'
  }
]

export const mockTools = [
  {
    id: 1,
    name: '拉坯机',
    category: '成型工具',
    description: '陶艺制作的核心设备，通过电机带动转盘旋转，配合双手进行拉坯成型。',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=300&fit=crop',
    usage: '将揉好的泥团放在转盘中心，启动机器，双手配合控制泥料塑形。',
    skills: [
      '启动前检查转盘是否平稳，有无异响',
      '根据需要调整转速，初学者使用低速（50-80转/分）',
      '保持工作区域清洁，及时清理滴落的泥料',
      '使用后及时清洁转盘和机体，防止泥料干固',
      '定期在转动部位加注润滑油，保养机器'
    ],
    maintenance: '每次使用后清洁转盘，每周检查传动带松紧，每月润滑轴承。长期不用时加盖防尘罩。',
    safety: '操作时长发要束起，不要穿戴宽松衣物；机器运转时不要将手靠近传动部位；不要在机器上放置工具或其他物品。'
  },
  {
    id: 2,
    name: '修坯刀',
    category: '修整工具',
    description: '用于修整半干坯体的工具，有各种形状和尺寸，适应不同部位的修整需求。',
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
    usage: '手持修坯刀，在旋转的坯体上修整，去除多余泥料，使器型规整。',
    skills: [
      '根据修整部位选择合适的刀型：平刀修平面，弯刀修弧面',
      '刀刃与坯体成15-30度角进刀，角度太小容易打滑',
      '进刀力度要轻，逐层修整，不要一次切削太多',
      '保持刀刃锋利，定期用磨刀石打磨',
      '修坯时左手扶住坯体，右手持刀，双手配合'
    ],
    maintenance: '使用后及时清理刀上的泥料并擦干；长期存放时涂抹防锈油；刀刃朝上放置，避免磕碰损坏。',
    safety: '传递刀具时手柄朝向对方；不要将刀具放在工作台边缘；打磨时注意手部安全。'
  },
  {
    id: 3,
    name: '泥板机',
    category: '成型工具',
    description: '用于将泥料压制成均匀厚度的泥板，是制作方形、扁平器物的必备工具。',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    usage: '将泥料放在两个滚筒之间，通过调节滚筒间距，压出所需厚度的泥板。',
    skills: [
      '根据需要的泥板厚度调整滚筒间距，两边要调节一致',
      '泥料要揉匀，分成适当大小的块',
      '在滚筒和泥料表面撒少量干泥粉或铺帆布，防止粘连',
      '泥料厚度超过10mm时，分多次滚压，每次减少间距2-3mm',
      '滚压时用力均匀，速度适中，避免泥板厚薄不均'
    ],
    maintenance: '使用后清洁滚筒表面，擦干水分；活动部位定期润滑；调整机构保持灵活。',
    safety: '操作时手指不要靠近滚筒间隙；不要用力过猛压摇手柄；两人配合时注意协调。'
  },
  {
    id: 4,
    name: '擀泥杖',
    category: '成型工具',
    description: '手工擀制泥板的工具，类似擀面杖，用于小批量泥板制作。',
    image: 'https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=300&h=300&fit=crop',
    usage: '在泥料两侧放置厚度条，用擀泥杖来回滚动，得到均匀厚度的泥板。',
    skills: [
      '选择合适长度的擀泥杖，比泥板宽度长10-15cm为宜',
      '工作台面要平整，可铺帆布或石膏板',
      '泥料两侧放置厚度条（可用木板或硬纸板），厚度一致',
      '擀压时从中间向两边推进，用力均匀',
      '经常翻动泥料，防止粘在工作台面上'
    ],
    maintenance: '使用后擦净泥料，晾干存放；木质擀泥杖避免长时间泡水，防止变形。',
    safety: '擀压时注意手部位置，避免擀到手指。'
  },
  {
    id: 5,
    name: '刻刀',
    category: '装饰工具',
    description: '用于在坯体上进行刻划、雕刻装饰的工具，有各种不同的刀尖形状。',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=300&h=300&fit=crop',
    usage: '在半干的坯体上用刻刀刻画出图案或文字，可填色或留白形成装饰效果。',
    skills: [
      '根据图案精细度选择刻刀：尖刀刻细线，平刀刻大面积',
      '坯体湿度要适中，太湿容易粘刀，太干容易崩裂',
      '下刀力度均匀，深浅一致，线条流畅',
      '复杂图案可先用铅笔轻轻打底稿',
      '刻好后用毛刷或吹气球清除凹槽内的泥屑'
    ],
    maintenance: '使用后擦净擦干，刀尖涂抹防锈油；避免刀尖磕碰硬物；定期打磨保持锋利。',
    safety: '雕刻时坯体要固定好；下刀方向远离身体；刀具不用时插入刀套。'
  },
  {
    id: 6,
    name: '釉刷',
    category: '施釉工具',
    description: '用于涂刷釉料的刷子，有不同大小和材质，适应不同的施釉需求。',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
    usage: '蘸取调好的釉料，均匀涂刷在坯体表面，适合小面积施釉或局部补釉。',
    skills: [
      '根据施釉面积选择刷子大小，大面积用宽刷，细节用小笔',
      '釉料要搅拌均匀，蘸釉量适中，避免滴落',
      '涂刷方向一致，不要来回反复刷，以免起皱',
      '刷涂2-3遍效果更佳，每遍干透后再刷下一遍',
      '釉层要均匀，不要漏刷，也不要积釉'
    ],
    maintenance: '使用后立即用清水清洗干净，梳顺刷毛后悬挂晾干；不同颜色釉料专用刷子，不要混用。',
    safety: '釉料可能含有害物质，使用时戴手套，避免接触皮肤和口鼻。'
  },
  {
    id: 7,
    name: '海绵',
    category: '辅助工具',
    description: '用于清洁坯体、吸收多余水分、修整坯体表面等，是陶艺必备的辅助工具。',
    image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=300&h=300&fit=crop',
    usage: '湿润后用于擦拭坯体表面，使其光滑，或吸干坯体表面多余的水分。',
    skills: [
      '根据用途选择不同密度的海绵：高密度用于吸水，低密度用于清洁',
      '使用前充分浸湿后挤干，以不滴水为宜',
      '擦拭坯体时动作要轻，沿一个方向擦拭，避免来回摩擦',
      '可将海绵剪成小块，用于不同部位的修整',
      '拉坯时用海绵吸水，保持双手和泥料的湿度适中'
    ],
    maintenance: '使用后清洗干净，挤干水分后通风晾干；定期更换新海绵，避免滋生细菌。',
    safety: '保持海绵清洁，不要使用发霉的海绵。'
  },
  {
    id: 8,
    name: '窑炉',
    category: '烧制设备',
    description: '陶艺制作的关键设备，用于高温烧制坯体，有电窑、气窑、柴窑等多种类型。',
    image: 'https://images.unsplash.com/photo-1606318005254-bdb2bcd14d35?w=300&h=300&fit=crop',
    usage: '将干燥的坯体放入窑内，按照设定的烧制曲线升温、保温、冷却，最终烧成陶瓷。',
    skills: [
      '装窑前检查窑炉状况，确认加热元件正常',
      '作品之间保持足够间距，避免烧制过程中粘连',
      '根据釉料和泥料特性制定合理的烧制曲线',
      '烧制过程中监控温度变化，做好记录',
      '冷却到室温后才能开窑，避免温差过大导致作品开裂'
    ],
    maintenance: '每次烧制后清理窑内灰尘和窑渣；定期检查加热元件和热电偶；保持窑门密封件完好。',
    safety: '高温时不要打开窑门；开窑时戴隔热手套；注意用电用气安全；保持工作环境通风。'
  }
]

export const mockVideos = [
  {
    id: 1,
    title: '拉坯基础教学',
    technique: '拉坯',
    techniqueId: 1,
    duration: '15:30',
    instructor: '张大师',
    description: '从零开始学习拉坯技法，掌握定中心、开孔、拉高的基本要领',
    thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=225&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 12568,
    level: '入门'
  },
  {
    id: 2,
    title: '修坯技巧详解',
    technique: '修坯',
    techniqueId: 2,
    duration: '12:45',
    instructor: '李大师',
    description: '学习如何修整坯体，使其造型规整，壁厚均匀',
    thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=225&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    views: 8934,
    level: '进阶'
  },
  {
    id: 3,
    title: '青花瓷绘制技法',
    technique: '装饰',
    techniqueId: null,
    duration: '20:15',
    instructor: '王大师',
    description: '传统青花工艺详解，学习如何在坯体上绘制精美图案',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 15678,
    level: '高级'
  },
  {
    id: 4,
    title: '釉料调配与施釉',
    technique: '上釉',
    techniqueId: 3,
    duration: '18:20',
    instructor: '刘大师',
    description: '了解釉料基础知识，学习各种施釉方法',
    thumbnail: 'https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=400&h=225&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    views: 10234,
    level: '进阶'
  },
  {
    id: 5,
    title: '陶艺烧制全流程',
    technique: '烧制',
    techniqueId: 4,
    duration: '25:00',
    instructor: '赵大师',
    description: '从装窑到开窑，全面了解陶艺烧制过程',
    thumbnail: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=225&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 18456,
    level: '高级'
  },
  {
    id: 6,
    title: '泥板成型技法',
    technique: '成型',
    techniqueId: null,
    duration: '14:50',
    instructor: '陈大师',
    description: '学习用泥板制作方形器物的方法和技巧',
    thumbnail: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=225&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    views: 7890,
    level: '入门'
  }
]

export const mockCreationRecords = [
  {
    id: 1,
    userId: 2,
    title: '我的第一只手拉坯茶杯',
    description: '学习陶艺三个月，终于做出了一个比较满意的茶杯',
    coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop',
    tags: ['拉坯', '茶杯', '处女作'],
    status: 'completed',
    createdAt: '2024-03-15T10:30:00Z',
    views: 128,
    process: [
      {
        date: '2024-03-10',
        title: '揉泥与定中心',
        content: '今天主要练习揉泥和定中心，花了两个小时，终于能比较稳定地把泥定在中心了。师傅说这是拉坯的基础，一定要练好。',
        images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=200&fit=crop']
      },
      {
        date: '2024-03-12',
        title: '第一次拉坯成型',
        content: '今天尝试拉坯，虽然歪歪扭扭的，但是终于做出了一个杯子的形状。虽然不太完美，但很有成就感！',
        images: ['https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop']
      },
      {
        date: '2024-03-15',
        title: '修坯完成',
        content: '今天把杯子修好了，虽然还是有点不圆，但比之前好多了。等待阴干后就可以上釉烧制了。',
        images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop']
      }
    ]
  },
  {
    id: 2,
    userId: 2,
    title: '青花瓷小碟创作',
    description: '尝试在小碟子上绘制青花图案，虽然简单但很用心',
    coverImage: 'https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=400&h=300&fit=crop',
    tags: ['青花', '彩绘', '碟子'],
    status: 'completed',
    createdAt: '2024-04-20T14:00:00Z',
    views: 85,
    process: [
      {
        date: '2024-04-18',
        title: '素烧完成',
        content: '小碟子已经素烧完成，现在可以开始绘制青花图案了。',
        images: ['https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=300&h=200&fit=crop']
      },
      {
        date: '2024-04-19',
        title: '绘制图案',
        content: '用青花料在素烧坯上绘制了简单的缠枝纹，第一次画，手有点抖。',
        images: ['https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=300&h=200&fit=crop']
      },
      {
        date: '2024-04-20',
        title: '施釉烧制',
        content: '上好透明釉，已经入窑烧制了，期待开窑的效果！',
        images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop']
      }
    ]
  },
  {
    id: 3,
    userId: 3,
    title: '陶艺入门 - 泥条盘筑小花盆',
    description: '作为初学者，从最简单的泥条盘筑开始学习',
    coverImage: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&h=300&fit=crop',
    tags: ['泥条盘筑', '花盆', '入门'],
    status: 'in_progress',
    createdAt: '2024-05-05T09:00:00Z',
    views: 52,
    process: [
      {
        date: '2024-05-05',
        title: '制作泥条',
        content: '今天学习搓泥条，看起来简单，做起来真不容易。要搓得粗细均匀真的需要练习。',
        images: ['https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=300&h=200&fit=crop']
      },
      {
        date: '2024-05-06',
        title: '开始盘筑',
        content: '用搓好的泥条开始盘筑花盆的形状，每一层都要衔接好。',
        images: ['https://images.unsplash.com/photo-1606318005254-bdb2bcd14d35?w=300&h=200&fit=crop']
      }
    ]
  },
  {
    id: 4,
    userId: 2,
    title: '紫砂茶壶创作',
    description: '尝试制作一把紫砂茶壶，从打泥片开始',
    coverImage: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=300&fit=crop',
    tags: ['紫砂', '茶壶', '手工'],
    status: 'completed',
    createdAt: '2024-04-10T11:00:00Z',
    views: 215,
    process: [
      {
        date: '2024-04-05',
        title: '打泥片',
        content: '用泥拍子将泥料打成均匀厚度的泥片，这是做紫砂壶的第一步。',
        images: ['https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=300&h=200&fit=crop']
      },
      {
        date: '2024-04-08',
        title: '围身筒',
        content: '将泥片围成壶身的形状，用脂泥粘接。',
        images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop']
      }
    ]
  },
  {
    id: 5,
    userId: 3,
    title: '陶艺小摆件 - 小兔子',
    description: '做一个可爱的小兔子摆件送给朋友',
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    tags: ['雕塑', '摆件', '可爱'],
    status: 'in_progress',
    createdAt: '2024-05-15T16:00:00Z',
    views: 38,
    process: [
      {
        date: '2024-05-15',
        title: '捏塑雏形',
        content: '用手捏出小兔子的基本形状，虽然有点丑，但慢慢调整。',
        images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop']
      }
    ]
  }
]

export const mockCreationTags = [
  { id: 1, name: '拉坯', color: '#1890ff', createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: '修坯', color: '#52c41a', createdAt: '2024-01-01T00:00:00Z' },
  { id: 3, name: '上釉', color: '#722ed1', createdAt: '2024-01-01T00:00:00Z' },
  { id: 4, name: '烧制', color: '#fa8c16', createdAt: '2024-01-01T00:00:00Z' },
  { id: 5, name: '青花', color: '#13c2c2', createdAt: '2024-01-01T00:00:00Z' },
  { id: 6, name: '彩绘', color: '#eb2f96', createdAt: '2024-01-01T00:00:00Z' },
  { id: 7, name: '雕塑', color: '#faad14', createdAt: '2024-01-01T00:00:00Z' },
  { id: 8, name: '茶具', color: '#2f54eb', createdAt: '2024-01-01T00:00:00Z' },
  { id: 9, name: '花瓶', color: '#f5222d', createdAt: '2024-01-01T00:00:00Z' },
  { id: 10, name: '摆件', color: '#a0d911', createdAt: '2024-01-01T00:00:00Z' },
  { id: 11, name: '处女作', color: '#fa541c', createdAt: '2024-01-01T00:00:00Z' },
  { id: 12, name: '紫砂', color: '#8c8c8c', createdAt: '2024-01-01T00:00:00Z' },
  { id: 13, name: '泥条盘筑', color: '#595959', createdAt: '2024-01-01T00:00:00Z' },
  { id: 14, name: '入门', color: '#b7eb8f', createdAt: '2024-01-01T00:00:00Z' },
  { id: 15, name: '手工', color: '#ffc069', createdAt: '2024-01-01T00:00:00Z' },
  { id: 16, name: '花盆', color: '#95de64', createdAt: '2024-01-01T00:00:00Z' },
  { id: 17, name: '可爱', color: '#ffadd2', createdAt: '2024-01-01T00:00:00Z' }
]

export const getStoredMessages = (techniqueId) => {
  const stored = localStorage.getItem(`technique_messages_${techniqueId}`)
  if (stored) return JSON.parse(stored)
  
  const initialMessages = {
    1: [
      {
        id: 1001,
        userId: 3,
        userName: '陶艺爱好者',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lover',
        content: '请问老师，拉坯时泥总是往一边偏，定不住中心是什么原因？',
        likes: 12,
        createdAt: '2024-05-15T10:30:00Z',
        replies: [
          {
            id: 10011,
            userId: 2,
            userName: '陶艺匠人',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artisan',
            content: '定不住中心主要有几个原因：1. 泥团本身不是正圆形；2. 双手用力不均衡；3. 身体姿势不对。建议先把泥团揉成正圆形，放在转盘中心时仔细对准，双手抱泥时力度要对称。',
            createdAt: '2024-05-15T11:00:00Z'
          }
        ]
      },
      {
        id: 1002,
        userId: 2,
        userName: '陶艺匠人',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artisan',
        content: '分享一个小技巧：拉坯时如果感觉泥料开始晃动，可以稍微减小转盘速度，同时双手轻轻扶住泥料，等稳定后再继续操作。不要急于求成，稳定是第一位的。',
        likes: 28,
        createdAt: '2024-05-14T15:20:00Z',
        replies: []
      }
    ],
    2: [
      {
        id: 2001,
        userId: 3,
        userName: '陶艺爱好者',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lover',
        content: '修坯时总是把坯体修破，请问有什么诀窍吗？',
        likes: 8,
        createdAt: '2024-05-16T09:00:00Z',
        replies: []
      }
    ],
    3: [],
    4: []
  }
  
  return initialMessages[techniqueId] || []
}
