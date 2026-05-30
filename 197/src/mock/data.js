export const mockCategories = [
  { id: 'all', name: '全部', icon: 'AppstoreOutlined', count: 50 },
  { id: 'folk-literature', name: '民间文学', icon: 'BookOutlined', count: 8 },
  { id: 'traditional-music', name: '传统音乐', icon: 'SoundOutlined', count: 7 },
  { id: 'traditional-dance', name: '传统舞蹈', icon: 'SmileOutlined', count: 6 },
  { id: 'traditional-theater', name: '传统戏剧', icon: 'WechatOutlined', count: 8 },
  { id: 'folk-arts', name: '传统美术', icon: 'PicLeftOutlined', count: 7 },
  { id: 'traditional-craft', name: '传统技艺', icon: 'ToolOutlined', count: 8 },
  { id: 'traditional-medicine', name: '传统医药', icon: 'MedicineBoxOutlined', count: 3 },
  { id: 'folk-custom', name: '民俗', icon: 'CoffeeOutlined', count: 3 }
]

export const mockTopics = [
  {
    id: 1,
    title: '丝绸之路非遗文化之旅',
    description: '探索古丝绸之路上的璀璨文化遗产，感受千年文明的魅力',
    cover: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
    heritageIds: [1, 3, 5, 7]
  },
  {
    id: 2,
    title: '非遗传承人匠心故事',
    description: '走近非遗传承人，聆听他们坚守与创新的感人故事',
    cover: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800',
    heritageIds: [2, 4, 6, 8]
  },
  {
    id: 3,
    title: '中国传统节日文化',
    description: '春节、端午、中秋...传统节日中的非遗元素',
    cover: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=800',
    heritageIds: [9, 10, 11]
  },
  {
    id: 4,
    title: '濒临消失的技艺',
    description: '那些亟待保护和传承的珍贵非遗技艺',
    cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    heritageIds: [1, 5, 9]
  }
]

export const mockHeritages = [
  {
    id: 1,
    name: '昆曲',
    category: 'traditional-theater',
    categoryName: '传统戏剧',
    level: '世界级',
    isEndangered: true,
    isHot: true,
    cover: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600',
    description: '昆曲是中国最古老的戏曲剧种之一，被誉为"百戏之祖"，发源于江苏昆山，至今已有600多年历史。',
    origin: '江苏省苏州市',
    heritageTime: '元末明初',
    views: 12580,
    backgroundDetail: '昆曲原名"昆山腔"或简称"昆腔"，是中国古老的戏曲声腔、剧种，现又被称为"昆剧"。昆曲是汉族传统戏曲中最古老的剧种之一，也是中国汉族传统文化艺术，特别是戏曲艺术中的珍品，被称为百花园中的一朵"兰花"。昆曲以鼓、板控制演唱节奏，以曲笛、三弦等为主要伴奏乐器，其唱念语音为"中州韵"。',
    history: [
      { year: '元末明初', content: '昆曲起源于江苏昆山一带，最初称为"昆山腔"。' },
      { year: '明代嘉靖年间', content: '魏良辅对昆山腔进行改革，创立了"水磨调"，昆曲逐渐走向成熟。' },
      { year: '明代万历年间', content: '昆曲进入鼎盛时期，成为全国性的戏曲剧种。' },
      { year: '清代', content: '昆曲继续发展，但开始受到京剧等新兴剧种的冲击。' },
      { year: '2001年', content: '昆曲被联合国教科文组织列入"人类口述和非物质遗产代表作"。' }
    ],
    inheritance: [
      { name: '俞振飞', period: '1902-1993', school: '俞派', description: '著名昆曲表演艺术家，工小生，被誉为"昆曲泰斗"。' },
      { name: '言慧珠', period: '1919-1966', school: '言派', description: '著名昆曲、京剧表演艺术家，工旦角。' },
      { name: '王芳', period: '1963-', school: '苏昆派', description: '当代昆曲表演艺术家，国家一级演员，梅花奖得主。' }
    ],
    media: [
      { id: 'm1_1', type: 'image', url: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600', title: '昆曲表演', description: '昆曲《牡丹亭》舞台表演剧照' },
      { id: 'm1_2', type: 'image', url: 'https://images.unsplash.com/photo-1514533212735-5df27d970db0?w=600', title: '昆曲妆容', description: '昆曲旦角精致的面部妆容' },
      { id: 'm1_3', type: 'image', url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600', title: '昆曲服饰', description: '昆曲传统戏服展示' },
      { id: 'm1_4', type: 'video', url: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600', title: '昆曲《牡丹亭》选段', description: '昆曲经典剧目《牡丹亭·惊梦》片段' }
    ],
    knowledge: [
      { question: '昆曲为什么被称为"百戏之祖"？', answer: '昆曲是中国现存最古老的戏曲剧种之一，其艺术形式对后来的京剧、川剧、越剧等剧种都产生了深远影响，许多剧种都借鉴了昆曲的表演程式、唱腔和剧目，因此被誉为"百戏之祖"。' },
      { question: '昆曲的"水磨调"是什么意思？', answer: '"水磨调"是昆曲的主要唱腔，因其曲调细腻婉转，如同江南的水磨漆器般温润光滑而得名。它由明代戏曲音乐家魏良辅改革创立，讲究"字正腔圆"，是昆曲艺术的核心特征。' },
      { question: '昆曲的四大行当是什么？', answer: '昆曲的四大行当是生、旦、净、丑。"生"是男性角色，"旦"是女性角色，"净"是花脸角色，"丑"是滑稽角色。每个行当又有更细致的分工。' }
    ]
  },
  {
    id: 2,
    name: '京剧',
    category: 'traditional-theater',
    categoryName: '传统戏剧',
    level: '国家级',
    isEndangered: false,
    isHot: true,
    cover: 'https://images.unsplash.com/photo-1514533212735-5df27d970db0?w=600',
    description: '京剧是中国影响最大的戏曲剧种，被称为中国的"国粹"，以北京为中心，遍及全国各地。',
    origin: '北京市',
    heritageTime: '清代乾隆年间',
    views: 28960,
    backgroundDetail: '京剧又称平剧、京戏，是中国影响最大的戏曲剧种，分布地以北京为中心，遍及全国各地。清代乾隆五十五年起，原在南方演出的三庆、四喜、春台、和春四大徽班陆续进入北京，与来自湖北的汉调艺人合作，同时接受了昆曲、秦腔的部分剧目、曲调和表演方法，又吸收了一些地方民间曲调，通过不断的交流、融合，最终形成京剧。',
    history: [
      { year: '1790年', content: '四大徽班进京，为京剧的形成奠定了基础。' },
      { year: '道光年间', content: '汉调艺人进京，徽汉合流，京剧逐渐形成。' },
      { year: '同治光绪年间', content: '京剧进入鼎盛时期，出现了"同光十三绝"等著名艺人。' },
      { year: '民国时期', content: '京剧继续发展，出现了"四大名旦"、"四大须生"等流派。' },
      { year: '2010年', content: '京剧被联合国教科文组织列入"人类非物质文化遗产代表作名录"。' }
    ],
    inheritance: [
      { name: '梅兰芳', period: '1894-1961', school: '梅派', description: '著名京剧表演艺术家，"四大名旦"之首，创立了"梅派"。' },
      { name: '程砚秋', period: '1904-1958', school: '程派', description: '著名京剧表演艺术家，"四大名旦"之一，创立了"程派"。' },
      { name: '于魁智', period: '1961-', school: '杨派', description: '当代京剧表演艺术家，国家一级演员，工老生。' }
    ],
    media: [
      { id: 'm2_1', type: 'image', url: 'https://images.unsplash.com/photo-1514533212735-5df27d970db0?w=600', title: '京剧表演', description: '京剧《贵妃醉酒》舞台表演' },
      { id: 'm2_2', type: 'image', url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600', title: '京剧脸谱', description: '京剧脸谱艺术展示' },
      { id: 'm2_3', type: 'video', url: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600', title: '京剧《霸王别姬》选段', description: '京剧经典剧目《霸王别姬》片段' }
    ],
    knowledge: [
      { question: '京剧的"四大名旦"是谁？', answer: '京剧的"四大名旦"是指梅兰芳、程砚秋、尚小云、荀慧生四位著名的京剧旦角表演艺术家，他们各创一派，对京剧艺术的发展做出了重要贡献。' },
      { question: '京剧脸谱的颜色代表什么含义？', answer: '京剧脸谱的颜色有特定的象征意义：红色代表忠义、黑色代表刚直、白色代表奸诈、黄色代表凶猛、蓝色代表粗豪、绿色代表鲁莽、金色和银色代表神佛鬼怪。' },
      { question: '京剧的"四大行当"是什么？', answer: '京剧的四大行当是生、旦、净、丑。"生"是男性正面角色，"旦"是女性正面角色，"净"是性格鲜明的男性配角，"丑"是幽默滑稽或反面角色。' }
    ]
  },
  {
    id: 3,
    name: '刺绣',
    category: 'folk-arts',
    categoryName: '传统美术',
    level: '国家级',
    isEndangered: false,
    isHot: true,
    cover: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600',
    description: '刺绣是中国优秀的民族传统工艺之一，其中苏绣、湘绣、粤绣、蜀绣被称为中国四大名绣。',
    origin: '江苏省苏州市',
    heritageTime: '春秋战国时期',
    views: 18750,
    backgroundDetail: '刺绣是针线在织物上绣制的各种装饰图案的总称。中国刺绣主要有苏绣、湘绣、粤绣、蜀绣四大名绣。刺绣的技法有：错针绣、乱针绣、网绣、满地绣、锁丝、纳丝、纳锦、平金、影金、盘金、铺绒、刮绒、戳纱、洒线、挑花等等。刺绣的用途主要包括生活和艺术装饰，如服装、床上用品、台布、舞台、艺术品装饰。',
    history: [
      { year: '春秋战国时期', content: '刺绣工艺已经出现，湖北江陵马山一号楚墓出土了大量精美的刺绣品。' },
      { year: '汉代', content: '刺绣工艺进一步发展，出现了"信期绣"、"长寿绣"等著名品种。' },
      { year: '唐代', content: '刺绣工艺达到很高水平，出现了佛像刺绣等新题材。' },
      { year: '宋代', content: '书画刺绣兴起，刺绣与书画艺术相结合。' },
      { year: '明清时期', content: '四大名绣形成，刺绣工艺进入鼎盛时期。' }
    ],
    inheritance: [
      { name: '沈寿', period: '1874-1921', school: '仿真绣派', description: '著名苏绣艺术家，创立了"仿真绣"。' },
      { name: '杨守玉', period: '1896-1981', school: '乱针绣派', description: '著名苏绣艺术家，创立了"乱针绣"。' },
      { name: '姚建萍', period: '1967-', school: '苏绣当代派', description: '当代苏绣艺术家，国家级非物质文化遗产传承人。' }
    ],
    media: [
      { id: 'm3_1', type: 'image', url: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600', title: '苏绣作品', description: '精美的苏绣花鸟作品' },
      { id: 'm3_2', type: 'image', url: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600', title: '刺绣工艺', description: '刺绣艺人正在进行刺绣创作' },
      { id: 'm3_3', type: 'image', url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', title: '刺绣细节', description: '刺绣作品的精细针脚展示' }
    ],
    knowledge: [
      { question: '中国四大名绣是什么？', answer: '中国四大名绣指的是苏绣、湘绣、粤绣、蜀绣。苏绣以精细雅致著称，湘绣以写实风格见长，粤绣色彩华丽，蜀绣针法严谨。' },
      { question: '刺绣的基本针法有哪些？', answer: '刺绣的基本针法包括平针、长短针、打籽针、乱针、盘金、锁绣等。不同的针法可以创造出不同的质感和效果。' },
      { question: '苏绣的特点是什么？', answer: '苏绣具有图案秀丽、构思巧妙、绣工细致、针法活泼、色彩清雅的独特风格，地方特色浓郁。绣技具有"平、齐、和、光、顺、匀"的特点。' }
    ]
  },
  {
    id: 4,
    name: '剪纸',
    category: 'folk-arts',
    categoryName: '传统美术',
    level: '世界级',
    isEndangered: false,
    isHot: true,
    cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
    description: '剪纸是中国最古老的民间艺术之一，作为一种镂空艺术，它能给人以视觉上以透空的感觉和艺术享受。',
    origin: '中国各地',
    heritageTime: '汉代',
    views: 15680,
    backgroundDetail: '剪纸是一种用剪刀或刻刀在纸上剪刻花纹，用于装点生活或配合其他民俗活动的民间艺术。在中国，剪纸具有广泛的群众基础，交融于各族人民的社会生活，是各种民俗活动的重要组成部分。其传承赓续的视觉形象和造型格式，蕴涵了丰富的文化历史信息，表达了广大民众的社会认以、道德观念、实践经验、生活理想和审美情趣。',
    history: [
      { year: '汉代', content: '剪纸艺术的雏形出现，人们用金箔、银箔等材料剪刻图案。' },
      { year: '魏晋南北朝时期', content: '剪纸艺术进一步发展，出现了用彩纸剪制的图案。' },
      { year: '唐代', content: '剪纸艺术进入兴盛期，出现了"剪纸人"、"剪纸花"等习俗。' },
      { year: '宋代', content: '剪纸技艺更加精湛，出现了专门的剪纸艺人。' },
      { year: '2009年', content: '中国剪纸被联合国教科文组织列入"人类非物质文化遗产代表作名录"。' }
    ],
    inheritance: [
      { name: '王老赏', period: '1890-1951', school: '蔚县剪纸派', description: '著名剪纸艺术家，河北蔚县剪纸代表人物。' },
      { name: '库淑兰', period: '1920-2004', school: '旬邑剪纸派', description: '著名剪纸艺术家，被誉为"剪花娘子"。' },
      { name: '郭梅花', period: '1959-', school: '中阳剪纸派', description: '当代剪纸艺术家，国家级非物质文化遗产传承人。' }
    ],
    media: [
      { id: 'm4_1', type: 'image', url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', title: '剪纸作品', description: '精美的传统剪纸作品' },
      { id: 'm4_2', type: 'image', url: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=600', title: '红色剪纸', description: '春节喜庆红色剪纸' },
      { id: 'm4_3', type: 'video', url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600', title: '剪纸技艺展示', description: '剪纸艺人现场创作展示' }
    ],
    knowledge: [
      { question: '剪纸的用途有哪些？', answer: '剪纸的用途非常广泛，包括：岁时节日装饰（如春节贴窗花）、婚丧嫁娶礼仪、宗教祭祀、刺绣花样模板、戏曲脸谱、儿童玩具装饰等。' },
      { question: '剪纸的基本纹样有哪些？', answer: '剪纸的基本纹样包括：圆孔纹、月牙纹、锯齿纹、鱼鳞纹、柳叶纹、云朵纹、水波纹、漩涡纹、云雷纹等。这些基本技法包括：折叠剪、刻、刺孔、折叠刻等。' },
      { question: '中国有哪些著名的剪纸流派？', answer: '中国著名的剪纸流派有：陕西剪纸、河北蔚县剪纸、江苏扬州剪纸、广东佛山剪纸、福建漳浦剪纸等，各地剪纸各具特色。' }
    ]
  },
  {
    id: 5,
    name: '宣纸制作技艺',
    category: 'traditional-craft',
    categoryName: '传统技艺',
    level: '世界级',
    isEndangered: true,
    isHot: false,
    cover: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600',
    description: '宣纸是中国传统的书画用纸，原产于安徽泾县，因其"薄如蝉翼、韧比丝绵、光而不滑、白而不艳"的特点而闻名。',
    origin: '安徽省泾县',
    heritageTime: '唐代',
    views: 8920,
    backgroundDetail: '宣纸是中国传统的高级书画用纸，原产于安徽省泾县。宣纸"始于唐代，产于泾县"，因唐代泾县隶属宣州府管辖，故因地得名宣纸，迄今已有1500余年历史。宣纸以青檀皮为主要原料，以泾县境内的沙田稻草为辅料，采用传统手工工艺制作，具有"薄如蝉翼、韧比丝绵、光而不滑、白而不艳、蛀蚀不蠹、墨韵万变"等特点。',
    history: [
      { year: '唐代', content: '宣纸开始出现，因产于宣州府而得名。' },
      { year: '宋代', content: '宣纸制作技艺逐渐成熟，成为书画用纸的首选。' },
      { year: '明清时期', content: '宣纸制作技艺达到顶峰，出现了许多著名的宣纸品牌。' },
      { year: '1915年', content: '宣纸在巴拿马万国博览会上获得金奖。' },
      { year: '2009年', content: '宣纸制作技艺被联合国教科文组织列入"人类非物质文化遗产代表作名录"。' }
    ],
    inheritance: [
      { name: '曹光华', period: '1898-1968', school: '曹氏宣纸', description: '著名宣纸制作艺人，对宣纸制作技艺有重要贡献。' },
      { name: '邢春荣', period: '1954-', school: '泾县宣纸', description: '国家级非物质文化遗产传承人，宣纸制作技艺大师。' }
    ],
    media: [
      { id: 'm5_1', type: 'image', url: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600', title: '宣纸制作', description: '传统宣纸制作工艺' },
      { id: 'm5_2', type: 'image', url: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600', title: '宣纸成品', description: '成品宣纸展示' },
      { id: 'm5_3', type: 'video', url: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600', title: '宣纸制作流程', description: '宣纸制作工艺流程' }
    ],
    knowledge: [
      { question: '宣纸为什么能保存千年不腐？', answer: '宣纸采用纯自然的选料和独特的制作工艺，使其具有很强的抗虫性和耐久性。宣纸的PH值呈弱碱性，能够抵御空气中的酸性物质，同时青檀皮纤维结构特殊，不易被微生物分解，因此有"纸寿千年"的美誉。' },
      { question: '宣纸的主要原料是什么？', answer: '宣纸的主要原料是青檀树皮和沙田稻草。青檀树皮提供宣纸的韧性，沙田稻草提供宣纸的柔性，两者按一定比例配合，经过浸泡、蒸煮、漂洗、打浆、抄造、焙干等108道工序，历时一年多才能制成成品宣纸。' },
      { question: '宣纸有哪些著名品牌？', answer: '著名的宣纸品牌有红星、汪六吉、汪同和、曹光华等。其中红星牌宣纸是中国宣纸集团生产的，是国家地理标志保护产品。' }
    ]
  },
  {
    id: 6,
    name: '景德镇陶瓷',
    category: 'traditional-craft',
    categoryName: '传统技艺',
    level: '国家级',
    isEndangered: false,
    isHot: true,
    cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
    description: '景德镇陶瓷是中国传统陶瓷的杰出代表，景德镇被誉为"世界瓷都"，其制瓷历史长达两千年。',
    origin: '江西省景德镇市',
    heritageTime: '汉代',
    views: 22340,
    backgroundDetail: '景德镇陶瓷是江西省景德镇市的传统特产，中国国家地理标志产品。景德镇陶瓷历史悠久，素有"白如玉、明如镜、薄如纸、声如磬"的美誉。景德镇陶瓷以高岭土为主要原料，经过练泥、拉坯、利坯、施釉、烧窑等数十道工序制成。景德镇陶瓷品种繁多，有青花瓷、玲珑瓷、粉彩瓷、颜色釉瓷等四大名瓷。',
    history: [
      { year: '汉代', content: '景德镇开始烧制陶瓷。' },
      { year: '宋代', content: '景德镇陶瓷闻名天下，宋真宗赐名"景德镇"。' },
      { year: '元代', content: '景德镇成功烧制青花瓷，开创了陶瓷新纪元。' },
      { year: '明清时期', content: '景德镇成为全国制瓷中心，御窑厂设立，陶瓷工艺达到顶峰。' }
    ],
    inheritance: [
      { name: '王步', period: '1898-1968', school: '青花派', description: '著名陶瓷艺术家，被誉为"青花大王"。' },
      { name: '周国桢', period: '1931-', school: '现代陶艺派', description: '当代陶瓷艺术家，中国陶瓷艺术大师。' }
    ],
    media: [
      { id: 'm6_1', type: 'image', url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', title: '景德镇瓷器', description: '精美景德镇陶瓷作品' },
      { id: 'm6_2', type: 'image', url: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600', title: '陶瓷制作', description: '传统陶瓷制作工艺' },
      { id: 'm6_3', type: 'image', url: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600', title: '青花瓷', description: '青花瓷精品展示' }
    ],
    knowledge: [
      { question: '景德镇四大名瓷是什么？', answer: '景德镇四大名瓷是青花瓷、玲珑瓷、粉彩瓷和颜色釉瓷。青花瓷色彩清新淡雅，玲珑瓷晶莹剔透，粉彩瓷柔和绚丽，颜色釉瓷色彩斑斓。' },
      { question: '景德镇陶瓷的主要原料是什么？', answer: '景德镇陶瓷的主要原料是高岭土，因最早在景德镇高岭村发现而得名。高岭土质地纯净，是烧制高品质瓷器的理想原料。' },
      { question: '景德镇为什么被称为"瓷都"？', answer: '景德镇制瓷历史悠久，从汉代开始烧制瓷器，至今已有两千多年历史。景德镇陶瓷工艺精湛，品种繁多，质量上乘，在国内外享有盛誉，因此被誉为"世界瓷都"。' }
    ]
  },
  {
    id: 7,
    name: '中医针灸',
    category: 'traditional-medicine',
    categoryName: '传统医药',
    level: '世界级',
    isEndangered: false,
    isHot: true,
    cover: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600',
    description: '针灸是中医的重要组成部分，通过刺激特定穴位来调节人体功能、防治疾病，是中国古代劳动人民创造的独特治疗方法。',
    origin: '中国各地',
    heritageTime: '新石器时代',
    views: 32150,
    backgroundDetail: '针灸是针法和灸法的总称。针法是指在中医理论的指导下把针具按照一定的角度刺入患者体内，运用捻转与提插等针刺手法来对人体特定部位进行刺激从而达到治疗疾病的目的。灸法是以预制的灸炷或灸草在体表一定的穴位上烧灼、熏熨，利用热的刺激来预防和治疗疾病。',
    history: [
      { year: '新石器时代', content: '针灸的雏形"砭石"出现。' },
      { year: '战国至汉代', content: '《黄帝内经》成书，奠定了针灸理论基础。' },
      { year: '晋代', content: '皇甫谧著《针灸甲乙经》，是我国第一部针灸专著。' },
      { year: '明代', content: '杨继洲著《针灸大成》，集历代针灸学之大成。' },
      { year: '2010年', content: '中医针灸被联合国教科文组织列入"人类非物质文化遗产代表作名录"。' }
    ],
    inheritance: [
      { name: '皇甫谧', period: '215-282', school: '古代针灸派', description: '晋代医学家，著《针灸甲乙经》。' },
      { name: '杨继洲', period: '1522-1620', school: '明代针灸派', description: '明代针灸学家，著《针灸大成》。' },
      { name: '程莘农', period: '1921-2015', school: '当代针灸派', description: '当代针灸学家，中国工程院院士。' }
    ],
    media: [
      { id: 'm7_1', type: 'image', url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600', title: '针灸治疗', description: '中医针灸治疗' },
      { id: 'm7_2', type: 'image', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600', title: '针灸穴位', description: '人体穴位模型' },
      { id: 'm7_3', type: 'video', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', title: '针灸演示', description: '针灸手法演示' }
    ],
    knowledge: [
      { question: '针灸的理论基础是什么？', answer: '针灸的理论基础是中医的经络学说。中医认为人体有12条主要经脉和8条奇经，穴位分布在这些经络上。通过刺激穴位，可以调节气血运行，平衡阴阳，达到防治疾病的目的。' },
      { question: '针灸能治疗哪些疾病？', answer: '针灸对疼痛类疾病（如颈椎病、腰椎病、头痛）、神经系统疾病（如面瘫、中风后遗症）、消化系统疾病（如胃痛、便秘）、妇科疾病（如月经不调、痛经）等都有较好的疗效。' },
      { question: '针灸穴位是如何确定的？', answer: '针灸穴位是古人在长期的医疗实践中发现和总结的。穴位的确定主要基于三个方面：一是经络理论，二是临床疗效，三是解剖位置。人体共有361个经穴和众多的经外奇穴。' }
    ]
  },
  {
    id: 8,
    name: '端午节',
    category: 'folk-custom',
    categoryName: '民俗',
    level: '世界级',
    isEndangered: false,
    isHot: true,
    cover: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=600',
    description: '端午节是中国最重要的传统节日之一，在每年农历五月初五，有吃粽子、赛龙舟、挂艾草等习俗。',
    origin: '中国各地',
    heritageTime: '春秋战国时期',
    views: 28760,
    backgroundDetail: '端午节，又称端阳节、龙舟节、重午节、龙节、正阳节、天中节等，是中国民间的传统节日。端午节与春节、清明节、中秋节并称为中国四大传统节日。端午节的起源涵盖了古老星象文化、人文哲学等方面内容，蕴含着深邃丰厚的文化内涵。',
    history: [
      { year: '春秋战国时期', content: '端午节的雏形出现，最初是祛病防疫的节日。' },
      { year: '战国时期', content: '纪念屈原的传说逐渐融入端午节。' },
      { year: '汉代', content: '端午节的习俗逐渐定型。' },
      { year: '唐宋时期', content: '端午节成为重要的民俗节日，习俗更加丰富。' },
      { year: '2009年', content: '端午节被联合国教科文组织列入"人类非物质文化遗产代表作名录"。' }
    ],
    inheritance: [],
    media: [
      { id: 'm8_1', type: 'image', url: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=600', title: '粽子', description: '端午节传统美食粽子' },
      { id: 'm8_2', type: 'image', url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600', title: '赛龙舟', description: '端午节赛龙舟活动' },
      { id: 'm8_3', type: 'image', url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', title: '端午习俗', description: '端午节传统习俗' }
    ],
    knowledge: [
      { question: '端午节为什么要吃粽子？', answer: '端午节吃粽子是为了纪念战国时期的爱国诗人屈原。相传屈原投江后，百姓为了不让鱼虾啃食他的身体，就用粽叶包裹糯米投入江中，后来逐渐演变成端午节吃粽子的习俗。' },
      { question: '端午节有哪些传统习俗？', answer: '端午节的传统习俗有：吃粽子、赛龙舟、挂艾草与菖蒲、佩香囊、饮雄黄酒、系五彩绳、贴午时符等。不同地区的习俗略有差异。' },
      { question: '端午节除了纪念屈原还有哪些传说？', answer: '除了纪念屈原，端午节还有纪念伍子胥、曹娥、介子推等传说。不同地区可能有不同的纪念对象，但纪念屈原的说法最为广泛。' }
    ]
  },
  {
    id: 9,
    name: '木版水印技艺',
    category: 'traditional-craft',
    categoryName: '传统技艺',
    level: '国家级',
    isEndangered: true,
    isHot: false,
    cover: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600',
    description: '木版水印是中国传统的特种印刷工艺，集绘画、雕刻和印刷于一体，被誉为"再创造的艺术"。',
    origin: '北京市、浙江省杭州市',
    heritageTime: '唐代',
    views: 5680,
    backgroundDetail: '木版水印技艺是中国特有的一种手工印刷技艺，它依据水墨原理，采用木版分色套印的方法，能够逼真地复制中国书画作品。北京荣宝斋的木版水印技艺最为著名，被誉为"再创造的艺术"，其复制的作品可以达到乱真的程度。',
    history: [
      { year: '唐代', content: '木版水印技艺的雏形出现。' },
      { year: '宋代', content: '木版水印技艺逐渐成熟，出现了精美的版画作品。' },
      { year: '明代', content: '木版水印技艺达到顶峰，出现了"饾版"和"拱花"技术。' },
      { year: '近现代', content: '北京荣宝斋继承和发展了木版水印技艺。' }
    ],
    inheritance: [
      { name: '崇广义', period: '清代', school: '荣宝斋派', description: '著名木版水印艺人。' },
      { name: '张延洲', period: '1914-1992', school: '荣宝斋派', description: '荣宝斋木版水印技艺传承人。' }
    ],
    media: [
      { id: 'm9_1', type: 'image', url: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600', title: '木版水印', description: '木版水印作品展示' },
      { id: 'm9_2', type: 'image', url: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600', title: '木版雕刻', description: '木版雕刻过程' },
      { id: 'm9_3', type: 'video', url: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600', title: '水印过程', description: '木版水印工艺流程' }
    ],
    knowledge: [
      { question: '木版水印的主要工艺有哪些？', answer: '木版水印的主要工艺包括：勾描、刻版、印刷、装裱四道工序。勾描是将原作勾成墨线稿；刻版是将墨线稿刻成木版；印刷是用水墨颜料在木版上印刷；装裱是将印好的作品装裱成卷轴或册页。' },
      { question: '什么是"饾版"和"拱花"技术？', answer: '"饾版"是将彩色画稿按不同颜色分别勾摹下来，刻成一块一块的小木版，然后逐色依次套印。"拱花"是用凹凸两块木版，将纸夹在中间压印，使纸面拱起花纹，是一种不用墨色的印刷技术。' },
      { question: '木版水印为什么被誉为"再创造的艺术"？', answer: '木版水印虽然是复制技术，但每一道工序都需要艺术家的参与和创造。刻版工匠需要理解原作的笔墨神韵，印刷工匠需要掌握水墨的浓淡干湿，因此木版水印作品不是简单的复制，而是一种再创造的艺术。' }
    ]
  },
  {
    id: 10,
    name: '蒙古族长调民歌',
    category: 'traditional-music',
    categoryName: '传统音乐',
    level: '世界级',
    isEndangered: false,
    isHot: false,
    cover: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600',
    description: '蒙古族长调民歌是蒙古族民歌的一种形式，具有鲜明的游牧文化特征和独特的演唱风格。',
    origin: '内蒙古自治区',
    heritageTime: '古代',
    views: 7890,
    backgroundDetail: '蒙古族长调民歌是蒙古民族在长期的游牧生产生活中创造的一种独特的民歌形式。长调民歌具有鲜明的游牧文化特征，其特点是曲调悠长，节奏自由，音域宽广，情感真挚。长调民歌的内容主要是赞美草原、山川、河流、爱情和友谊等。',
    history: [
      { year: '古代', content: '蒙古族长调民歌在游牧生活中逐渐形成。' },
      { year: '元代', content: '长调民歌得到进一步发展。' },
      { year: '近现代', content: '长调民歌逐渐被外界认识和喜爱。' },
      { year: '2005年', content: '蒙古族长调民歌被联合国教科文组织列入"人类口头和非物质遗产代表作"。' }
    ],
    inheritance: [
      { name: '哈扎布', period: '1922-2005', school: '内蒙古长调派', description: '著名长调歌唱家，被誉为"长调歌王"。' },
      { name: '德德玛', period: '1947-', school: '内蒙古长调派', description: '著名蒙古族女中音歌唱家。' }
    ],
    media: [
      { id: 'm10_1', type: 'image', url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600', title: '蒙古族草原', description: '美丽的内蒙古草原' },
      { id: 'm10_2', type: 'video', url: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600', title: '长调演唱', description: '蒙古族长调演唱' }
    ],
    knowledge: [
      { question: '蒙古族长调民歌有什么特点？', answer: '蒙古族长调民歌的特点是曲调悠长、节奏自由、音域宽广、情感真挚。长调民歌一般由上下两个乐句构成，旋律起伏跌宕，犹如草原的辽阔宽广，体现了蒙古族人民粗犷豪放的性格。' },
      { question: '长调民歌的演唱技巧有哪些？', answer: '长调民歌的演唱技巧包括：颤音、滑音、装饰音等。其中最具特色的是"诺古拉"（颤音技巧，使歌声悠扬婉转，富有草原气息。' },
      { question: '长调民歌的经典曲目有哪些？', answer: '著名的长调民歌有《鸿雁》、《草原上升起不落的太阳》、《辽阔的草原》、《小黄马》等。这些歌曲都是蒙古族人民长期以来口口相传的经典之作。' }
    ]
  },
  {
    id: 11,
    name: '陕北说书',
    category: 'folk-literature',
    categoryName: '民间文学',
    level: '国家级',
    isEndangered: false,
    isHot: false,
    cover: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600',
    description: '陕北说书是陕西省的传统说唱艺术，主要流行于陕北地区，是一种非常古老的汉族曲艺形式。',
    origin: '陕西省延安市',
    heritageTime: '清代',
    views: 4560,
    backgroundDetail: '陕北说书是陕西省的传统说唱艺术，主要流行于陕北地区。它是一种非常古老的汉族曲艺形式，最初是由穷苦盲人运用陕北的民歌小调演唱一些传说故事，后来吸收了眉户、秦腔、道情、信天游的曲调，逐步形成为说唱表演长篇故事的说书形式。',
    history: [
      { year: '清代', content: '陕北说书逐渐形成。' },
      { year: '民国时期', content: '陕北说书得到发展。' },
      { year: '20世纪40年代', content: '韩起祥对陕北说书进行改革，使其更加通俗易懂。' }
    ],
    inheritance: [
      { name: '韩起祥', period: '1915-1989', school: '韩派', description: '著名陕北说书表演艺术家。' },
      { name: '张俊功', period: '1932-2008', school: '张派', description: '著名陕北说书表演艺术家。' }
    ],
    media: [
      { id: 'm11_1', type: 'image', url: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600', title: '陕北说书', description: '陕北说书表演' },
      { id: 'm11_2', type: 'video', url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600', title: '说书表演', description: '说书现场表演' }
    ],
    knowledge: [
      { question: '陕北说书的伴奏乐器有哪些？', answer: '陕北说书的伴奏乐器主要有三弦、二胡、竹板、耍板等。其中最主要的是三弦，说书艺人通常自弹自唱，用三弦伴奏，同时用腿上绑的甩板和手上的蚂蚱板打节奏。' },
      { question: '陕北说书有哪些传统曲目？', answer: '陕北说书的传统曲目非常丰富，有《杨家将》、《说岳全传》、《三国演义》、《水浒传》等长篇大书，也有《王二小》、《翻身记》等现代曲目。' },
      { question: '陕北说书的表演形式是什么？', answer: '陕北说书的表演形式是一人自弹自唱，说唱结合，以唱为主。演唱者坐在凳子上，左腿绑甩板，右手弹三弦，左手打蚂蚱板，边弹边唱边打板，同时用声音塑造各种人物形象。' }
    ]
  },
  {
    id: 12,
    name: '安塞腰鼓',
    category: 'traditional-dance',
    categoryName: '传统舞蹈',
    level: '国家级',
    isEndangered: false,
    isHot: true,
    cover: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=600',
    description: '安塞腰鼓是陕西省延安市安塞区的传统舞蹈，是陕北腰鼓的代表，被誉为"天下第一鼓"。',
    origin: '陕西省延安市安塞区',
    heritageTime: '秦汉时期',
    views: 15670,
    backgroundDetail: '安塞腰鼓是陕西省延安市安塞区的传统舞蹈，是陕北腰鼓的代表。安塞腰鼓历史悠久，具有2000多年的历史，它是陕北劳动人民在长期的生产生活中创造的一种民间舞蹈形式。安塞腰鼓以其粗犷豪放、气势磅礴的风格著称，被誉为"天下第一鼓"。',
    history: [
      { year: '秦汉时期', content: '安塞腰鼓的雏形出现。' },
      { year: '明清时期', content: '安塞腰鼓逐渐发展成熟。' },
      { year: '近现代', content: '安塞腰鼓成为陕北地区重要的民俗活动。' }
    ],
    inheritance: [],
    media: [
      { id: 'm12_1', type: 'image', url: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=600', title: '安塞腰鼓', description: '安塞腰鼓表演' },
      { id: 'm12_2', type: 'video', url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600', title: '腰鼓表演', description: '腰鼓表演现场' }
    ],
    knowledge: [
      { question: '安塞腰鼓的特点是什么？', answer: '安塞腰鼓的特点是粗犷豪放、气势磅礴、刚劲有力。舞者通常头扎白毛巾，腰系红绸带，边舞边击鼓，动作矫健，节奏明快，展现了陕北人民豪迈奔放的性格。' },
      { question: '安塞腰鼓的表演形式有哪些？', answer: '安塞腰鼓的表演形式有"路鼓"和"场地鼓"两种。"路鼓"是在行进中表演，动作比较简单；"场地鼓"是在固定的场地上表演，动作复杂，技巧性强，通常由几十人甚至上百人集体表演。' },
      { question: '安塞腰鼓为什么被称为"天下第一鼓"？', answer: '安塞腰鼓历史悠久，艺术水平高，影响广泛。它不仅是陕北地区最具代表性的民间舞蹈，而且在全国乃至世界都享有盛誉。安塞腰鼓曾多次参加国内外重大活动，被誉为"中国一绝"、"天下第一鼓"。' }
    ]
  }
]

export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: '系统管理员',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    email: 'admin@heritage.com',
    phone: '13800138000',
    favorites: [1, 3, 5, 7],
    viewHistory: [1, 2, 3, 4, 5]
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    name: '文化爱好者',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    email: 'user@heritage.com',
    phone: '13900139000',
    favorites: [2, 4, 6, 8, 12],
    viewHistory: [2, 4, 6, 8, 10, 12]
  }
]
