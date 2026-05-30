import { RESTORATION_STATUS } from '@/types';

export const mockBooks = [
  {
    id: 1,
    name: '资治通鉴',
    category: 'song',
    categoryLabel: '宋代刻本',
    era: '北宋',
    author: '司马光',
    description: '《资治通鉴》是北宋司马光主编的一部编年体史书，共294卷，历时19年完成。',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    status: RESTORATION_STATUS.PENDING,
    damageTypes: ['worm', 'tear'],
    damageLevel: '严重',
    collectedDate: '2023-06-15',
    currentRestorer: null,
    estimatedDays: 60,
    damageDescription: '书页存在多处虫蛀痕迹，约30页有不同程度的撕裂，书脊部分脱落。',
    restorationPlan: '需要进行杀虫处理、纸张补缀、书脊重订等工作。',
    viewCount: 1256,
    isRecommended: true
  },
  {
    id: 2,
    name: '本草纲目',
    category: 'ming',
    categoryLabel: '明代古籍',
    era: '明代',
    author: '李时珍',
    description: '《本草纲目》是明代医学家李时珍编写的药学巨著，共52卷，载药1892种。',
    cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
    status: RESTORATION_STATUS.IN_PROGRESS,
    damageTypes: ['water', 'mold'],
    damageLevel: '中度',
    collectedDate: '2023-03-20',
    currentRestorer: 2,
    currentRestorerName: '李修复师',
    estimatedDays: 45,
    progress: 65,
    damageDescription: '部分页面有水渍痕迹，少量页面存在霉变，整体保存状况尚可。',
    restorationPlan: '需要进行脱酸处理、霉菌清除、页面清洁等工作。',
    viewCount: 2341,
    isRecommended: true
  },
  {
    id: 3,
    name: '红楼梦手抄本',
    category: 'handwritten',
    categoryLabel: '手抄本',
    era: '清代',
    author: '曹雪芹',
    description: '脂批本《红楼梦》手抄本，是研究红楼梦早期版本的重要文献。',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    status: RESTORATION_STATUS.COMPLETED,
    damageTypes: ['fading', 'tear'],
    damageLevel: '轻微',
    collectedDate: '2022-11-10',
    currentRestorer: 3,
    currentRestorerName: '王修复师',
    completedDate: '2023-02-28',
    damageDescription: '部分字迹褪色，少量页边有撕裂痕迹。',
    restorationPlan: '进行字迹加固、页面补缀、保护性装订。',
    restorationResult: '已成功修复，字迹清晰度提升80%，页面完整度恢复。',
    viewCount: 5678,
    isRecommended: true
  },
  {
    id: 4,
    name: '永乐大典残卷',
    category: 'rare',
    categoryLabel: '善本孤本',
    era: '明代',
    author: '解缙',
    description: '《永乐大典》是明代永乐年间编纂的大型类书，正本已佚，残卷极为珍贵。',
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    status: RESTORATION_STATUS.PENDING,
    damageTypes: ['fire', 'worm'],
    damageLevel: '严重',
    collectedDate: '2023-08-05',
    currentRestorer: null,
    estimatedDays: 90,
    damageDescription: '卷册边缘有火烧痕迹，多处虫蛀洞穿，部分文字缺失。',
    restorationPlan: '需要进行火损修复、虫蛀补缀、文字补全研究等复杂工作。',
    viewCount: 8901,
    isRecommended: true
  },
  {
    id: 5,
    name: '芥子园画传',
    category: 'block',
    categoryLabel: '版画本',
    era: '清代',
    author: '王概',
    description: '《芥子园画传》是清代著名的绘画技法图谱，版画精美，影响深远。',
    cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    status: RESTORATION_STATUS.COMPLETED,
    damageTypes: ['water', 'fading'],
    damageLevel: '中度',
    collectedDate: '2022-08-15',
    currentRestorer: 2,
    currentRestorerName: '李修复师',
    completedDate: '2023-01-20',
    damageDescription: '版画部分色彩有褪色现象，部分页面有水渍。',
    restorationPlan: '进行色彩加固、水渍清除、版画保护处理。',
    restorationResult: '版画色彩恢复度达到90%，水渍完全清除。',
    viewCount: 3456,
    isRecommended: false
  },
  {
    id: 6,
    name: '康熙字典',
    category: 'qing',
    categoryLabel: '清代古籍',
    era: '清代',
    author: '张玉书',
    description: '《康熙字典》是清代康熙年间编纂的汉字字典，共收字47035个。',
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
    status: RESTORATION_STATUS.IN_PROGRESS,
    damageTypes: ['mold', 'tear'],
    damageLevel: '中度',
    collectedDate: '2023-05-10',
    currentRestorer: 3,
    currentRestorerName: '王修复师',
    estimatedDays: 30,
    progress: 40,
    damageDescription: '书脊有撕裂，内页少量霉变，书角磨损严重。',
    restorationPlan: '进行霉菌清除、书脊重订、书角修复。',
    viewCount: 2134,
    isRecommended: false
  },
  {
    id: 7,
    name: '史记',
    category: 'song',
    categoryLabel: '宋代刻本',
    era: '南宋',
    author: '司马迁',
    description: '《史记》南宋刻本，是现存最早的史记刻本之一，具有极高的版本价值。',
    cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
    status: RESTORATION_STATUS.PENDING,
    damageTypes: ['worm', 'fading'],
    damageLevel: '严重',
    collectedDate: '2023-09-20',
    currentRestorer: null,
    estimatedDays: 75,
    damageDescription: '大量页面存在虫蛀，部分文字模糊不清，书口开裂。',
    restorationPlan: '需要进行杀虫、脱酸、补缀、字迹修复等多道工序。',
    viewCount: 4567,
    isRecommended: false
  },
  {
    id: 8,
    name: '敦煌遗书残卷',
    category: 'rare',
    categoryLabel: '善本孤本',
    era: '唐代',
    author: '佚名',
    description: '敦煌莫高窟出土的唐代遗书残卷，内容为佛经抄写，极具历史价值。',
    cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop',
    status: RESTORATION_STATUS.COMPLETED,
    damageTypes: ['tear', 'fading'],
    damageLevel: '严重',
    collectedDate: '2022-05-18',
    currentRestorer: 2,
    currentRestorerName: '李修复师',
    completedDate: '2022-12-15',
    damageDescription: '残卷多处断裂，字迹褪色严重，部分碎片缺失。',
    restorationPlan: '进行碎片拼接、纸张加固、字迹显示处理。',
    restorationResult: '成功拼接碎片200余片，恢复可识别文字3000余字。',
    viewCount: 12345,
    isRecommended: true
  },
  {
    id: 9,
    name: '牡丹亭',
    category: 'ming',
    categoryLabel: '明代古籍',
    era: '明代',
    author: '汤显祖',
    description: '《牡丹亭》是明代戏曲家汤显祖的代表作，明万历年间刻本。',
    cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=600&fit=crop',
    status: RESTORATION_STATUS.PENDING,
    damageTypes: ['water', 'worm'],
    damageLevel: '中度',
    collectedDate: '2023-10-08',
    currentRestorer: null,
    estimatedDays: 40,
    damageDescription: '下半部分有水渍，少量虫蛀痕迹，整体保存较好。',
    restorationPlan: '进行水渍清除、虫蛀修复、脱酸处理。',
    viewCount: 1890,
    isRecommended: false
  },
  {
    id: 10,
    name: '天工开物',
    category: 'ming',
    categoryLabel: '明代古籍',
    era: '明代',
    author: '宋应星',
    description: '《天工开物》是明代科学家宋应星编写的工艺百科全书，被誉为"中国17世纪的工艺百科全书"。',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    status: RESTORATION_STATUS.IN_PROGRESS,
    damageTypes: ['mold', 'fading'],
    damageLevel: '轻微',
    collectedDate: '2023-07-12',
    currentRestorer: 3,
    currentRestorerName: '王修复师',
    estimatedDays: 20,
    progress: 80,
    damageDescription: '插图部分有轻微霉变，少量文字褪色。',
    restorationPlan: '进行霉菌清除、色彩加固、字迹修复。',
    viewCount: 2678,
    isRecommended: false
  }
];

export const getRestorationProcess = (bookId) => {
  const processes = {
    2: [
      {
        step: 1,
        name: '初检登记',
        description: '对古籍破损情况进行初步检查和详细登记，建立修复档案',
        date: '2023-04-01',
        images: [
          'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=200&fit=crop',
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=200&fit=crop'
        ],
        video: null,
        completed: true
      },
      {
        step: 2,
        name: '脱酸处理',
        description: '使用专业设备对纸张进行脱酸处理，延长保存寿命。脱酸是古籍保护的重要环节，可以有效防止纸张继续酸化脆化。',
        date: '2023-04-10',
        images: [
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop'
        ],
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        completed: true
      },
      {
        step: 3,
        name: '霉菌清除',
        description: '采用物理和化学方法清除页面上的霉菌，防止霉菌继续侵蚀纸张纤维',
        date: '2023-04-20',
        images: [],
        video: null,
        completed: true
      },
      {
        step: 4,
        name: '页面清洁',
        description: '使用专业工具清洁页面污渍，包括水渍、灰尘等，恢复纸张原貌',
        date: '2023-05-01',
        images: [],
        video: null,
        completed: false
      },
      {
        step: 5,
        name: '装订复原',
        description: '按照原始装帧形式重新装订，保持古籍的历史风貌和文物价值',
        date: null,
        images: [],
        video: null,
        completed: false
      }
    ],
    3: [
      {
        step: 1,
        name: '初检登记',
        date: '2022-11-15',
        description: '详细记录手抄本破损情况，包括褪色程度、撕裂位置等',
        images: [
          'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=200&fit=crop'
        ],
        video: null,
        completed: true
      },
      {
        step: 2,
        name: '字迹加固',
        date: '2022-12-01',
        description: '对褪色字迹进行加固处理，使用专用胶料固定墨迹，防止进一步脱落',
        images: [],
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        completed: true
      },
      {
        step: 3,
        name: '页面补缀',
        date: '2022-12-20',
        description: '使用同年代、同质地的纸张修补撕裂的页面边缘，做到"修旧如旧"',
        images: [
          'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=200&fit=crop'
        ],
        video: null,
        completed: true
      },
      {
        step: 4,
        name: '保护性装订',
        date: '2023-02-10',
        description: '采用无酸材料进行保护性装订，配备函套保护',
        images: [],
        video: null,
        completed: true
      }
    ],
    8: [
      {
        step: 1,
        name: '碎片整理',
        date: '2022-05-20',
        description: '对数千片残卷碎片进行分类整理，按照纸张纹理、文字内容进行初步分组',
        images: [
          'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=200&fit=crop'
        ],
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        completed: true
      },
      {
        step: 2,
        name: '碎片拼接',
        date: '2022-07-15',
        description: '根据文字和纹理进行碎片拼接，这是最耗时也最考验耐心的环节',
        images: [],
        video: null,
        completed: true
      },
      {
        step: 3,
        name: '纸张加固',
        date: '2022-09-20',
        description: '使用蚕丝纸对脆弱纸张进行加固，增强纸张强度',
        images: [],
        video: null,
        completed: true
      },
      {
        step: 4,
        name: '字迹显示',
        date: '2022-11-01',
        description: '使用红外成像技术恢复隐没字迹，让千年文字重见天日',
        images: [],
        video: null,
        completed: true
      }
    ]
  };
  return processes[bookId] || [];
};

export const getDamageImages = (bookId) => {
  const damageImages = {
    1: [
      { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop', desc: '虫蛀痕迹，约30页受影响' },
      { url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop', desc: '书脊部分脱落，需要重新装订' },
      { url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=300&fit=crop', desc: '页面撕裂痕迹' },
      { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop', desc: '部分文字模糊不清' }
    ],
    2: [
      { url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop', desc: '水渍痕迹，约15页受影响' },
      { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop', desc: '霉变区域，已基本清除' }
    ],
    3: [
      { url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=300&fit=crop', desc: '字迹褪色，部分笔画模糊' },
      { url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop', desc: '页边撕裂，已修复' }
    ],
    4: [
      { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop', desc: '火烧痕迹，卷册边缘碳化' },
      { url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop', desc: '虫蛀洞穿，多处页面受损' },
      { url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=300&fit=crop', desc: '部分文字缺失' }
    ],
    8: [
      { url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop', desc: '残卷多处断裂' },
      { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop', desc: '字迹褪色严重' },
      { url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop', desc: '部分碎片缺失' }
    ]
  };
  return damageImages[bookId] || [];
};

export const restorationKnowledge = [
  {
    id: 1,
    title: '什么是古籍脱酸？',
    content: '脱酸是古籍保护中最重要的环节之一。由于纸张在制造过程中会残留酸性物质，加上环境因素影响，纸张会逐渐酸化变脆。脱酸处理就是用碱性物质中和纸张中的酸性物质，使纸张pH值达到中性或弱碱性（7.5-8.5），从而延长纸张的保存寿命。现代脱酸技术包括水溶液法、有机溶剂法和气相法等。',
    category: '修复技术'
  },
  {
    id: 2,
    title: '古籍修复的"最少干预"原则',
    content: '"最少干预"是现代古籍修复的核心原则之一。指在修复过程中，只进行必要的修复工作，尽可能保留古籍的原始状态。这意味着：1）不追求"焕然一新"，保持历史痕迹；2）使用可逆性材料，便于未来再次修复；3）所有修复部位都要有可识别性，不与原件混淆；4）修复档案完整记录。',
    category: '修复理念'
  },
  {
    id: 3,
    title: '常见古籍破损类型',
    content: '古籍常见的破损类型包括：1）虫蛀：由白蚁、衣鱼等蛀食造成；2）霉蚀：在高温高湿环境下滋生霉菌；3）酸化：纸张酸性增加导致脆化；4）水渍：水浸导致的污渍和变形；5）火烧：火灾造成的碳化或脆化；6）机械损伤：撕裂、磨损、断裂等；7）光照褪色：紫外线导致的字迹和色彩褪色。',
    category: '破损知识'
  },
  {
    id: 4,
    title: '古籍修复材料的选择',
    content: '古籍修复材料的选择非常讲究，必须遵循"修旧如旧"的原则：1）补纸：应选择与原件年代相近、质地相同的纸张，最好是同期的旧纸；2）黏合剂：传统使用淀粉浆糊，现代也使用甲基纤维素等可逆性黏合剂；3）装订材料：使用蚕丝线、亚麻线等天然材料；4）函套：使用无酸纸板、丝绸等材料制作保护函套。',
    category: '修复材料'
  },
  {
    id: 5,
    title: '古籍的保存环境要求',
    content: '古籍保存的最佳环境条件：1）温度：18-22℃，避免剧烈变化；2）相对湿度：45-60%，过于干燥会使纸张脆化，过于潮湿易生霉；3）光照：避免阳光直射，使用防紫外线玻璃和灯具；4）空气质量：远离污染源，定期通风；5）防虫：保持清洁，定期检查，可使用樟脑等天然驱虫剂。',
    category: '保存知识'
  },
  {
    id: 6,
    title: '什么是"金镶玉"装订？',
    content: '"金镶玉"是中国传统古籍装订技艺中的一种，又称"衬纸"或"袍套装"。方法是将比书页稍大的白色衬纸折好，将书页夹在中间，使书页的四周露出白色衬纸，如同黄金镶嵌在白玉中。这种装订方式可以有效保护书页，延长古籍寿命，同时不影响阅读。',
    category: '传统技艺'
  }
];
