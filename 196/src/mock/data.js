export const mockUsers = [
  {
    id: 1,
    username: 'buyer',
    password: '123456',
    name: '幸福养蜂场',
    role: 'buyer',
    phone: '13800138001',
    email: 'buyer@bee.com',
    address: '浙江省杭州市西湖区转塘街道',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    farmName: '幸福养蜂场',
    farmScale: '500箱以上',
    createdAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 2,
    username: 'supplier',
    password: '123456',
    name: '蜜源设备有限公司',
    role: 'supplier',
    phone: '13900139001',
    email: 'supplier@bee.com',
    address: '江苏省苏州市工业园区',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    companyName: '蜜源设备有限公司',
    businessLicense: '91320000MA12345678',
    createdAt: '2024-01-10T00:00:00.000Z'
  }
]

export const mockCategories = [
  {
    id: 1,
    name: '蜂箱器具',
    icon: 'Box',
    description: '各类蜂箱、巢框、巢础等养蜂基础设备',
    count: 24
  },
  {
    id: 2,
    name: '采蜜工具',
    icon: 'Tools',
    description: '摇蜜机、割蜜刀、蜂蜜过滤设备等',
    count: 18
  },
  {
    id: 3,
    name: '防护装备',
    icon: 'Avatar',
    description: '防蜂服、面网、手套等个人防护用品',
    count: 12
  },
  {
    id: 4,
    name: '蜂具配套',
    icon: 'SetUp',
    description: '饲喂器、蜂王笼、巢门等配套工具',
    count: 30
  },
  {
    id: 5,
    name: '蜂蜜加工',
    icon: 'Cpu',
    description: '蜂蜜灌装、贴标、包装等加工设备',
    count: 15
  },
  {
    id: 6,
    name: '养蜂车辆',
    icon: 'Van',
    description: '养蜂专用车、转场运输车辆',
    count: 8
  }
]

export const mockProducts = [
  {
    id: 1,
    name: '标准杉木蜂箱 十框平箱',
    categoryId: 1,
    price: 189,
    originalPrice: 239,
    image: 'https://picsum.photos/seed/beebox1/400/400',
    images: [
      'https://picsum.photos/seed/beebox1/400/400',
      'https://picsum.photos/seed/beebox1-2/400/400',
      'https://picsum.photos/seed/beebox1-3/400/400'
    ],
    description: '采用优质杉木制作，经过高温烘干防腐处理，经久耐用。标准十框设计，适合中蜂和意蜂养殖。',
    stock: 500,
    sales: 2341,
    featured: true,
    tags: ['热销', '防腐'],
    specs: {
      material: '优质杉木',
      size: '510×410×260mm',
      thickness: '20mm',
      frameCount: 10,
      suitableFor: '中蜂/意蜂',
      waterproof: '是',
      anticorrosion: '是'
    },
    performance: {
      waterproof: 'IP65级防水，雨天无需遮盖',
      anticorrosion: '经过高温碳化和防腐处理，使用寿命8年以上',
      insulation: '双层中空设计，冬暖夏凉',
      ventilation: '底部通风孔设计，保持空气流通'
    },
    scenarios: ['家庭养蜂', '小型养蜂场', '山区养殖', '平原养殖'],
    supplier: '蜜源设备有限公司',
    rating: 4.9,
    reviewCount: 568,
    beeTypeInfo: {
      suitable: ['中蜂', '意蜂', '卡尼鄂拉蜂', '高加索蜂'],
      unsuitable: ['无'],
      tips: '标准十框设计，可根据蜂群大小调整巢框数量，建议强群使用10框，弱群使用5-7框'
    },
    scenarioAdaptation: [
      { name: '家庭养蜂', desc: '适合阳台、庭院小规模养殖，占地小易管理', suitability: '★★★★★' },
      { name: '小型养蜂场', desc: '可批量采购，标准化管理，提高养殖效率', suitability: '★★★★★' },
      { name: '山区养殖', desc: '防潮防腐处理，适应山区潮湿环境', suitability: '★★★★★' },
      { name: '平原养殖', desc: '通风设计良好，适合平原地区夏季高温', suitability: '★★★★☆' }
    ],
    installationGuide: {
      title: '标准杉木蜂箱安装指引',
      difficulty: '简单',
      estimatedTime: '15-20分钟',
      tools: ['螺丝刀', '锤子（可选）'],
      steps: [
        { step: 1, title: '开箱检查', desc: '打开包装，检查蜂箱各部件是否完整，包括箱体、箱盖、巢框、底板等' },
        { step: 2, title: '组装箱体', desc: '将箱体放置在平稳的支架上，确保水平稳定。建议高度为40-50cm，防止潮湿和蚂蚁入侵' },
        { step: 3, title: '安装巢框', desc: '将巢框依次放入箱体，框间距保持在8-10mm。首次使用建议放入5-7个巢框，随蜂群壮大逐步添加' },
        { step: 4, title: '安装箱盖', desc: '盖上箱盖，确保通风孔畅通。夏季可垫高箱盖增加通风，冬季可加盖保温层' },
        { step: 5, title: '放置蜂群', desc: '傍晚时分将蜂群移入蜂箱，关闭巢门1-2小时，待蜂群安定后再打开巢门' },
        { step: 6, title: '后续检查', desc: '3天后检查蜂群接受情况，观察蜜蜂进出是否正常，定期清理箱底蜡屑' }
      ],
      tips: [
        '蜂箱应放置在避风向阳、地势高燥的地方',
        '巢门朝向东南或南方，便于蜜蜂早出晚归',
        '避免放置在高压线下、化工厂附近等环境',
        '新蜂箱使用前可涂刷蜂蜡，减少木材异味，提高蜜蜂接受度'
      ],
      videoUrl: ''
    }
  },
  {
    id: 2,
    name: '全不锈钢摇蜜机 手动两框',
    categoryId: 2,
    price: 299,
    originalPrice: 359,
    image: 'https://picsum.photos/seed/honeyextractor/400/400',
    images: [
      'https://picsum.photos/seed/honeyextractor/400/400',
      'https://picsum.photos/seed/honeyextractor2/400/400'
    ],
    description: '304全不锈钢材质，食品级安全保障。手动双齿轮传动，摇蜜轻松省力。',
    stock: 200,
    sales: 1892,
    featured: true,
    tags: ['热销', '不锈钢'],
    specs: {
      material: '304不锈钢',
      capacity: '2框',
      size: '350×350×700mm',
      thickness: '1.2mm',
      weight: '8kg',
      transmission: '双齿轮传动'
    },
    performance: {
      material: '食品级304不锈钢，安全无毒',
      durability: '齿轮淬火处理，经久耐用',
      efficiency: '每分钟120转，取蜜效率高',
      cleaning: '可拆卸设计，清洗方便'
    },
    scenarios: ['家庭养蜂', '小型养蜂场', '蜂蜜加工坊'],
    supplier: '蜂具精工制造厂',
    rating: 4.8,
    reviewCount: 423,
    beeTypeInfo: {
      suitable: ['中蜂', '意蜂'],
      unsuitable: ['无'],
      tips: '两框容量适合小型蜂场，大规模养殖建议选择四框或六框机型'
    },
    scenarioAdaptation: [
      { name: '家庭养蜂', desc: '操作简单，适合家庭业余养蜂使用', suitability: '★★★★★' },
      { name: '小型养蜂场', desc: '效率适中，满足50箱以内蜂场需求', suitability: '★★★★★' },
      { name: '蜂蜜加工坊', desc: '食品级材质，符合卫生标准', suitability: '★★★★☆' },
      { name: '大型养蜂场', desc: '容量较小，效率偏低，建议选购大型机型', suitability: '★★★☆☆' }
    ],
    installationGuide: {
      title: '不锈钢摇蜜机使用与维护指引',
      difficulty: '简单',
      estimatedTime: '10分钟',
      tools: ['扳手', '润滑油'],
      steps: [
        { step: 1, title: '开箱检查', desc: '检查摇蜜机主体、齿轮、摇把、横梁等部件是否完好无损' },
        { step: 2, title: '组装调试', desc: '安装摇把，检查齿轮转动是否顺畅，如有卡顿可涂抹少量食用油润滑' },
        { step: 3, title: '放置平稳', desc: '将摇蜜机放置在平稳地面，建议铺设防滑垫，避免摇蜜时晃动' },
        { step: 4, title: '安装巢框', desc: '将切割好蜜盖的巢框放入摇蜜机内，注意两框重量平衡，避免摇晃' },
        { step: 5, title: '摇蜜操作', desc: '先慢后快，均匀用力摇动，转速控制在每分钟100-120转为宜' },
        { step: 6, title: '清洁保养', desc: '使用后用温水清洗干净，擦干水分，齿轮涂抹润滑油防锈' }
      ],
      tips: [
        '摇蜜前需将蜜盖切割干净，提高出蜜效率',
        '摇蜜速度不宜过快，避免巢脾断裂',
        '建议每年更换齿轮润滑油，延长使用寿命',
        '存放于干燥通风处，避免生锈'
      ],
      videoUrl: ''
    }
  },
  {
    id: 3,
    name: '全套防蜂服 透气型',
    categoryId: 3,
    price: 158,
    originalPrice: 198,
    image: 'https://picsum.photos/seed/beesuit/400/400',
    images: [
      'https://picsum.photos/seed/beesuit/400/400'
    ],
    description: '高密度透气面料，3D立体面网，全方位防护。轻盈舒适，夏季穿戴不闷热。',
    stock: 300,
    sales: 2567,
    featured: true,
    tags: ['热销', '透气'],
    specs: {
      material: '涤纶透气面料',
      size: 'M/L/XL/XXL',
      weight: '0.6kg',
      color: '卡其色/白色',
      faceScreen: '3D立体不锈钢网',
      gloves: '羊皮手套'
    },
    performance: {
      protection: '全方位防护，蜜蜂无法穿透',
      breathability: '透气面料，夏季不闷热',
      visibility: '高透面网，视野清晰',
      durability: '加固缝合，耐穿耐磨'
    },
    scenarios: ['日常检查', '取蜜作业', '蜂群分蜂', '转场运输'],
    supplier: '安全防护用品厂',
    rating: 4.9,
    reviewCount: 712,
    beeTypeInfo: {
      suitable: ['中蜂', '意蜂', '所有蜂种'],
      unsuitable: ['无'],
      tips: '标准尺码，建议根据身高体重选择合适的尺码'
    },
    scenarioAdaptation: [
      { name: '日常检查', desc: '轻便透气，适合日常蜂群检查', suitability: '★★★★★' },
      { name: '取蜜作业', desc: '全面防护，避免被蛰', suitability: '★★★★★' },
      { name: '蜂群分蜂', desc: '防护严密，安全性高', suitability: '★★★★★' },
      { name: '转场运输', desc: '方便穿脱，适合快速操作', suitability: '★★★★☆' }
    ],
    installationGuide: {
      title: '防蜂服穿戴与保养指引',
      difficulty: '简单',
      estimatedTime: '5分钟',
      tools: [],
      steps: [
        { step: 1, title: '检查装备', desc: '检查防蜂服是否有破损、开线等情况，面网是否完好' },
        { step: 2, title: '穿戴顺序', desc: '先穿裤子，再穿上衣，最后戴上面网和手套' },
        { step: 3, title: '密封检查', desc: '拉好拉链，将袖口、裤脚扎紧，确保没有缝隙' },
        { step: 4, title: '面网调节', desc: '调整面网位置，确保视野清晰，面网不贴脸' },
        { step: 5, title: '使用完毕', desc: '先检查身上是否有蜜蜂，再从上往下依次脱下' },
        { step: 6, title: '清洁保养', desc: '使用后清洗干净，阴干存放，避免阳光直射' }
      ],
      tips: [
        '穿戴前可在袖口、领口涂抹少量肥皂水，防止钻入',
        '发现破损及时修补或更换',
        '面网请勿折叠，避免产生折痕影响视野',
        '存放于阴凉干燥处，远离化学品'
      ],
      videoUrl: ''
    }
  },
  {
    id: 4,
    name: '塑料巢框 中意蜂通用',
    categoryId: 1,
    price: 3.5,
    originalPrice: 5,
    image: 'https://picsum.photos/seed/frame/400/400',
    images: [
      'https://picsum.photos/seed/frame/400/400'
    ],
    description: '全新PP材质，不发霉不变形，可反复使用。标准尺寸，中意蜂通用。',
    stock: 5000,
    sales: 8934,
    featured: true,
    tags: ['超值'],
    specs: {
      material: '食品级PP塑料',
      size: '488×235mm',
      weight: '120g/个',
      color: '白色/黑色',
      suitableFor: '中蜂/意蜂',
      lifespan: '5年以上'
    },
    performance: {
      durability: '不发霉不腐烂，可反复使用',
      temperature: '耐高温严寒，-30℃至120℃不变形',
      hygiene: '光滑易清洁，减少病菌滋生',
      compatibility: '与标准蜂箱完全兼容'
    },
    scenarios: ['蜂群繁殖', '蜂蜜生产', '蜂王培育', '蜂群越冬'],
    supplier: '塑蜂科技有限公司',
    rating: 4.7,
    reviewCount: 1256,
    beeTypeInfo: {
      suitable: ['中蜂', '意蜂', '所有蜂种'],
      unsuitable: ['无'],
      tips: '标准尺寸，与市面上多数蜂箱兼容，可直接替换木质巢框使用'
    },
    scenarioAdaptation: [
      { name: '蜂群繁殖', desc: '光滑无毛刺，不损伤蜜蜂，利于蜂群繁殖', suitability: '★★★★★' },
      { name: '蜂蜜生产', desc: '易清洁，不残留蜂蜜，提高蜂蜜品质', suitability: '★★★★★' },
      { name: '蜂王培育', desc: '重量轻，便于移虫操作', suitability: '★★★★☆' },
      { name: '蜂群越冬', desc: '保温性能好，利于蜂群安全越冬', suitability: '★★★★★' }
    ],
    installationGuide: {
      title: '塑料巢框使用与安装指引',
      difficulty: '简单',
      estimatedTime: '3分钟',
      tools: ['巢础', '埋线器（可选）'],
      steps: [
        { step: 1, title: '准备工作', desc: '准备好巢框、巢础和埋线器' },
        { step: 2, title: '安装巢础', desc: '将巢础嵌入巢框的卡槽中，确保平整' },
        { step: 3, title: '固定巢础', desc: '使用埋线器将巢础固定在巢框铁丝上' },
        { step: 4, title: '检查调整', desc: '检查巢础是否平整，如有变形进行调整' },
        { step: 5, title: '放入蜂箱', desc: '将装好巢础的巢框放入蜂箱，框间距8-10mm' }
      ],
      tips: [
        '巢础安装要平整，避免蜜蜂造赘脾',
        '新巢框首次使用可涂抹少量蜂蜡，提高接受度',
        '塑料巢框可反复使用，使用后清洗干净即可',
        '避免阳光直射，防止老化变形'
      ],
      videoUrl: ''
    }
  },
  {
    id: 5,
    name: '电动割蜜刀 恒温加热',
    categoryId: 2,
    price: 268,
    originalPrice: 318,
    image: 'https://picsum.photos/seed/honeyknife/400/400',
    images: [
      'https://picsum.photos/seed/honeyknife/400/400'
    ],
    description: '恒温加热设计，快速融化蜜盖。不锈钢刀片，切割顺畅。',
    stock: 150,
    sales: 1456,
    featured: false,
    tags: ['电动', '恒温'],
    specs: {
      material: '304不锈钢',
      power: '150W',
      temperature: '60-80℃可调',
      voltage: '220V',
      length: '300mm',
      weight: '0.8kg'
    },
    performance: {
      heating: '快速加热，30秒达到工作温度',
      temperature: '恒温控制，不烫伤蜂蜜',
      cutting: '锋利刀片，切割顺畅不粘蜡',
      safety: '隔热手柄，使用安全'
    },
    scenarios: ['蜂蜜采收', '蜂产品加工', '专业养蜂场'],
    supplier: '蜂具精工制造厂',
    rating: 4.8,
    reviewCount: 345,
    beeTypeInfo: {
      suitable: ['中蜂', '意蜂', '所有蜂种'],
      unsuitable: ['无'],
      tips: '恒温设计，不会烫伤蜜蜂，适合所有蜂种使用'
    },
    scenarioAdaptation: [
      { name: '蜂蜜采收', desc: '快速切割蜜盖，提高取蜜效率', suitability: '★★★★★' },
      { name: '蜂产品加工', desc: '恒温控制，保证蜂蜜品质', suitability: '★★★★★' },
      { name: '专业养蜂场', desc: '批量使用，提高工作效率', suitability: '★★★★★' },
      { name: '家庭养蜂', desc: '操作简单，适合业余爱好者', suitability: '★★★★☆' }
    ],
    installationGuide: {
      title: '电动割蜜刀使用与维护指引',
      difficulty: '简单',
      estimatedTime: '5分钟',
      tools: ['电源插座', '清洁布'],
      steps: [
        { step: 1, title: '检查设备', desc: '检查电源线、刀片是否完好，开关是否正常' },
        { step: 2, title: '预热准备', desc: '接通电源，预热3-5分钟，待指示灯亮起表示达到工作温度' },
        { step: 3, title: '切割操作', desc: '将刀片轻轻贴在蜜盖上，匀速向下移动，切割力度适中' },
        { step: 4, title: '使用完毕', desc: '关闭电源，待刀片冷却后用湿布擦拭干净' },
        { step: 5, title: '存放保养', desc: '涂抹少量食用油防锈，存放于干燥处' }
      ],
      tips: [
        '使用前确保电源接地，确保用电安全',
        '刀片温度较高，避免触碰，防止烫伤',
        '不要长时间空烧，延长加热元件使用寿命',
        '定期检查电源线，如有破损及时更换'
      ],
      videoUrl: ''
    }
  },
  {
    id: 6,
    name: '饲喂器 箱内喂糖器',
    categoryId: 4,
    price: 8.5,
    originalPrice: 12,
    image: 'https://picsum.photos/seed/feeder/400/400',
    images: [
      'https://picsum.photos/seed/feeder/400/400'
    ],
    description: '加厚塑料材质，容量1.5kg。漂浮设计，防止蜜蜂溺水。',
    stock: 2000,
    sales: 5678,
    featured: false,
    tags: ['超值'],
    specs: {
      material: '食品级塑料',
      capacity: '1.5kg',
      size: '480×80×60mm',
      weight: '120g',
      type: '箱内饲喂',
      features: '带漂浮网'
    },
    performance: {
      capacity: '大容量，减少饲喂次数',
      safety: '漂浮网设计，防止蜜蜂溺水',
      durability: '加厚材质，经久耐用',
      easy: '安装简单，使用方便'
    },
    scenarios: ['蜂群越冬', '春繁饲喂', '缺蜜期补饲'],
    supplier: '塑蜂科技有限公司',
    rating: 4.6,
    reviewCount: 892,
    beeTypeInfo: {
      suitable: ['中蜂', '意蜂', '所有蜂种'],
      unsuitable: ['无'],
      tips: '标准尺寸，适用于大多数蜂箱，漂浮网设计可防止蜜蜂溺水'
    },
    scenarioAdaptation: [
      { name: '蜂群越冬', desc: '大容量设计，减少饲喂次数', suitability: '★★★★★' },
      { name: '春繁饲喂', desc: '便于观察糖浆消耗情况', suitability: '★★★★★' },
      { name: '缺蜜期补饲', desc: '快速补充饲料，维持蜂群生存', suitability: '★★★★★' },
      { name: '日常奖励饲喂', desc: '操作简单，适合日常饲喂', suitability: '★★★★☆' }
    ],
    installationGuide: {
      title: '饲喂器安装与使用指引',
      difficulty: '简单',
      estimatedTime: '2分钟',
      tools: ['糖浆'],
      steps: [
        { step: 1, title: '准备糖浆', desc: '按比例调制好糖浆（白糖:水=1:1或2:1）' },
        { step: 2, title: '注入糖浆', desc: '将调制好的糖浆倒入饲喂器，注意不要太满' },
        { step: 3, title: '放置饲喂器', desc: '将饲喂器放入蜂箱内隔板外侧，避免挤压蜜蜂' },
        { step: 4, title: '检查情况', desc: '第二天检查糖浆消耗情况，及时补充' },
        { step: 5, title: '清洁保养', desc: '定期取出清洗，保持卫生' }
      ],
      tips: [
        '糖浆浓度根据季节调整，冬季浓度稍高',
        '饲喂时避免糖浆洒在箱外，防止盗蜂',
        '漂浮网要放好，防止蜜蜂溺水',
        '冬季饲喂注意保温，防止糖浆冻结'
      ],
      videoUrl: ''
    }
  },
  {
    id: 7,
    name: '蜂王笼 多功能塑料',
    categoryId: 4,
    price: 2.8,
    originalPrice: 4,
    image: 'https://picsum.photos/seed/queencage/400/400',
    images: [
      'https://picsum.photos/seed/queencage/400/400'
    ],
    description: '多功能蜂王笼，可用于邮寄蜂王、介绍蜂王、暂时囚王等。',
    stock: 3000,
    sales: 7890,
    featured: false,
    tags: ['超值'],
    specs: {
      material: '优质塑料',
      size: '65×45×25mm',
      weight: '10g',
      color: '白色/透明',
      type: '多功能型',
      features: '带糖仓'
    },
    performance: {
      ventilation: '多孔设计，通风良好',
      safety: '工蜂无法进入，保护蜂王',
      convenience: '带糖仓，可存放食物',
      durability: '可重复使用'
    },
    scenarios: ['蜂王邮寄', '蜂王介绍', '人工分蜂', '蜂群换王'],
    supplier: '塑蜂科技有限公司',
    rating: 4.5,
    reviewCount: 678,
    beeTypeInfo: {
      suitable: ['中蜂', '意蜂', '所有蜂种'],
      unsuitable: ['无'],
      tips: '通用设计，适用于所有蜂种的蜂王，糖仓可提供3-5天食物'
    },
    scenarioAdaptation: [
      { name: '蜂王邮寄', desc: '通风良好，带糖仓，适合长途运输', suitability: '★★★★★' },
      { name: '蜂王介绍', desc: '工蜂无法进入，保护蜂王安全', suitability: '★★★★★' },
      { name: '人工分蜂', desc: '方便控制蜂王，操作简单', suitability: '★★★★★' },
      { name: '蜂群换王', desc: '安全过渡，提高蜂王接受率', suitability: '★★★★☆' }
    ],
    installationGuide: {
      title: '蜂王笼使用与操作指引',
      difficulty: '简单',
      estimatedTime: '2分钟',
      tools: ['蜂王糖（可选）'],
      steps: [
        { step: 1, title: '准备工作', desc: '检查蜂王笼是否完好，糖仓是否有食物' },
        { step: 2, title: '放入蜂王', desc: '小心将蜂王放入蜂王笼，注意不要伤到蜂王' },
        { step: 3, title: '关闭笼门', desc: '关好蜂王笼，确保蜂王无法逃出' },
        { step: 4, title: '放置蜂群', desc: '将蜂王笼放在蜂群两脾之间，有糖仓一侧朝下' },
        { step: 5, title: '释放蜂王', desc: '2-3天后观察蜂群接受情况，然后释放蜂王' }
      ],
      tips: [
        '操作时动作要轻，避免惊吓蜂王',
        '邮寄时糖仓要放足食物，确保蜂王存活',
        '介绍蜂王时不要急于释放，让蜂群充分接受',
        '蜂王笼可重复使用，使用后清洗干净'
      ],
      videoUrl: ''
    }
  },
  {
    id: 8,
    name: '蜂蜜过滤机 双层滤网',
    categoryId: 5,
    price: 459,
    originalPrice: 559,
    image: 'https://picsum.photos/seed/honeyfilter/400/400',
    images: [
      'https://picsum.photos/seed/honeyfilter/400/400'
    ],
    description: '双层不锈钢滤网，80目+120目组合，有效过滤杂质。',
    stock: 80,
    sales: 567,
    featured: true,
    tags: ['热销'],
    specs: {
      material: '304不锈钢',
      capacity: '50kg',
      filter: '80目+120目双层',
      power: '120W',
      size: '500×500×800mm',
      weight: '25kg'
    },
    performance: {
      filtration: '双层滤网，过滤彻底',
      efficiency: '每小时过滤50kg蜂蜜',
      material: '食品级不锈钢，安全卫生',
      cleaning: '可拆卸清洗，维护方便'
    },
    scenarios: ['蜂蜜加工', '蜂产品企业', '合作社生产'],
    supplier: '蜂产品加工设备厂',
    rating: 4.9,
    reviewCount: 234,
    beeTypeInfo: {
      suitable: ['中蜂', '意蜂', '所有蜂种'],
      unsuitable: ['无'],
      tips: '蜂蜜过滤设备，与蜂种无关，适用于所有蜂蜜加工场景'
    },
    scenarioAdaptation: [
      { name: '蜂蜜加工', desc: '高效过滤，提高蜂蜜品质', suitability: '★★★★★' },
      { name: '蜂产品企业', desc: '批量处理，符合生产标准', suitability: '★★★★★' },
      { name: '合作社生产', desc: '效率高，适合集体生产', suitability: '★★★★★' },
      { name: '小型加工坊', desc: '操作简单，易于维护', suitability: '★★★★☆' }
    ],
    installationGuide: {
      title: '蜂蜜过滤机安装与使用指引',
      difficulty: '中等',
      estimatedTime: '30分钟',
      tools: ['扳手', '螺丝刀', '水平仪'],
      steps: [
        { step: 1, title: '开箱检查', desc: '检查过滤机主体、滤网、电机等部件是否完好' },
        { step: 2, title: '安装调试', desc: '将设备放置在平稳地面，使用水平仪调平' },
        { step: 3, title: '安装滤网', desc: '按照说明安装80目和120目双层滤网' },
        { step: 4, title: '连接电源', desc: '接好电源，检查电机运转是否正常' },
        { step: 5, title: '开始过滤', desc: '将蜂蜜倒入进料口，开启设备进行过滤' },
        { step: 6, title: '清洁保养', desc: '使用后及时拆卸清洗滤网，晾干存放' }
      ],
      tips: [
        '蜂蜜温度控制在38-40℃时过滤效果最好',
        '滤网要定期检查，如有破损及时更换',
        '设备运转时不要将手伸入进料口',
        '长期不用时要涂抹防锈油，存放于干燥处'
      ],
      videoUrl: ''
    }
  },
  {
    id: 9,
    name: '养蜂专用车 车厢式',
    categoryId: 6,
    price: 58000,
    originalPrice: 65000,
    image: 'https://picsum.photos/seed/beetruck/400/400',
    images: [
      'https://picsum.photos/seed/beetruck/400/400'
    ],
    description: '专业养蜂转场车辆，可装载200箱蜜蜂。配备生活区，适合长途转场。',
    stock: 5,
    sales: 23,
    featured: false,
    tags: ['大型设备'],
    specs: {
      capacity: '200箱',
      power: '130马力',
      fuel: '柴油',
      size: '6000×2200×2800mm',
      weight: '4500kg',
      features: '带生活区'
    },
    performance: {
      capacity: '大容量，一次装载200箱',
      comfort: '配备生活区，可满足2人住宿',
      durability: '加固底盘，适合各种路况',
      efficiency: '转场效率提高300%'
    },
    scenarios: ['大型养蜂场', '长途转场', '追花夺蜜'],
    supplier: '养蜂车辆制造厂',
    rating: 5.0,
    reviewCount: 12,
    beeTypeInfo: {
      suitable: ['中蜂', '意蜂', '所有蜂种'],
      unsuitable: ['无'],
      tips: '专业转场车辆，适用于所有蜂种的大规模养殖和转场运输'
    },
    scenarioAdaptation: [
      { name: '大型养蜂场', desc: '大容量，一次装载200箱', suitability: '★★★★★' },
      { name: '长途转场', desc: '性能稳定，适合长途运输', suitability: '★★★★★' },
      { name: '追花夺蜜', desc: '移动灵活，快速转场', suitability: '★★★★★' },
      { name: '小型养蜂场', desc: '成本较高，适合规模化养殖', suitability: '★★★☆☆' }
    ],
    installationGuide: {
      title: '养蜂专用车使用与维护指引',
      difficulty: '复杂',
      estimatedTime: '2小时',
      tools: ['车辆维护工具'],
      steps: [
        { step: 1, title: '车辆检查', desc: '检查车辆轮胎、刹车、机油、水箱等是否正常' },
        { step: 2, title: '装载准备', desc: '清理车厢，准备好固定绳索和缓冲材料' },
        { step: 3, title: '装载蜂箱', desc: '将蜂箱整齐码放，注意平衡，用绳索固定牢固' },
        { step: 4, title: '安全固定', desc: '检查所有蜂箱是否固定牢靠，巢门关闭' },
        { step: 5, title: '运输途中', desc: '平稳驾驶，避免急刹车，定时检查蜂箱情况' },
        { step: 6, title: '到达卸车', desc: '到达目的地后，先打开巢门，再卸车放置' }
      ],
      tips: [
        '转场前需关闭所有巢门，确保通风',
        '夏季运输选择夜间或清晨，避免高温',
        '定期维护车辆，确保行车安全',
        '长途运输需配备押运人员，定时检查蜂群'
      ],
      videoUrl: ''
    }
  },
  {
    id: 10,
    name: '意蜂专用蜂箱 高箱双层',
    categoryId: 1,
    price: 329,
    originalPrice: 399,
    image: 'https://picsum.photos/seed/beehive2/400/400',
    images: [
      'https://picsum.photos/seed/beehive2/400/400'
    ],
    description: '意蜂专用高箱，双层设计，上下共20框。适合强群饲养，提高产蜜量。',
    stock: 150,
    sales: 892,
    featured: true,
    tags: ['意蜂', '热销'],
    specs: {
      material: '优质杉木',
      size: '510×410×520mm',
      thickness: '22mm',
      frameCount: 20,
      suitableFor: '意蜂',
      layers: '双层'
    },
    performance: {
      space: '双层设计，空间充足',
      insulation: '保温效果好，利于蜂群越冬',
      productivity: '产蜜量提高40%',
      durability: '防腐处理，使用寿命10年'
    },
    scenarios: ['意蜂养殖', '大型养蜂场', '专业养蜂户'],
    supplier: '蜜源设备有限公司',
    rating: 4.9,
    reviewCount: 345,
    beeTypeInfo: {
      suitable: ['意蜂'],
      unsuitable: ['中蜂', '小型蜂种'],
      tips: '专为意蜂强群设计，空间大，不建议中蜂使用，中蜂建议选择十框平箱'
    },
    scenarioAdaptation: [
      { name: '意蜂养殖', desc: '双层设计，适合意蜂强群饲养', suitability: '★★★★★' },
      { name: '大型养蜂场', desc: '标准化设计，便于批量管理', suitability: '★★★★★' },
      { name: '专业养蜂户', desc: '产蜜量高，经济效益好', suitability: '★★★★★' },
      { name: '家庭养蜂', desc: '体积较大，适合有一定经验的养殖户', suitability: '★★★☆☆' }
    ],
    installationGuide: {
      title: '意蜂高箱双层蜂箱安装指引',
      difficulty: '中等',
      estimatedTime: '30分钟',
      tools: ['螺丝刀', '锤子', '水平仪'],
      steps: [
        { step: 1, title: '开箱检查', desc: '检查底箱、继箱、箱盖、巢框等所有部件是否完整' },
        { step: 2, title: '安装底箱', desc: '将底箱放置在40-50cm高的支架上，用水平仪调平' },
        { step: 3, title: '摆放巢框', desc: '在底箱中放入10个巢框，框间距8-10mm' },
        { step: 4, title: '安装隔王板', desc: '在底箱上方放置隔王板，将蜂王限制在底箱产卵' },
        { step: 5, title: '安装继箱', desc: '将继箱放在隔王板上方，放入10个蜜脾框' },
        { step: 6, title: '安装箱盖', desc: '盖上箱盖，确保通风孔畅通，完成安装' }
      ],
      tips: [
        '高箱重心较高，一定要放置平稳，防止倾倒',
        '流蜜期上继箱可显著提高产蜜量',
        '越冬期可取下继箱，单箱越冬更安全',
        '定期检查箱体，做好防腐防潮维护'
      ],
      videoUrl: ''
    }
  }
]

export const mockPackages = [
  {
    id: 1,
    name: '新手入门套餐',
    price: 688,
    originalPrice: 888,
    image: 'https://picsum.photos/seed/package1/400/400',
    description: '适合初次养蜂用户，包含基本养蜂设备',
    items: [
      { productId: 1, name: '标准杉木蜂箱', quantity: 5 },
      { productId: 3, name: '防蜂服', quantity: 1 },
      { productId: 4, name: '塑料巢框', quantity: 50 },
      { productId: 6, name: '饲喂器', quantity: 5 }
    ],
    suitableFor: '养蜂新手、家庭养殖',
    sales: 567,
    rating: 4.8
  },
  {
    id: 2,
    name: '专业养蜂套餐',
    price: 2588,
    originalPrice: 3288,
    image: 'https://picsum.photos/seed/package2/400/400',
    description: '适合小规模养蜂场，设备齐全性价比高',
    items: [
      { productId: 1, name: '标准杉木蜂箱', quantity: 20 },
      { productId: 2, name: '不锈钢摇蜜机', quantity: 1 },
      { productId: 3, name: '防蜂服', quantity: 2 },
      { productId: 4, name: '塑料巢框', quantity: 200 },
      { productId: 5, name: '电动割蜜刀', quantity: 1 },
      { productId: 6, name: '饲喂器', quantity: 20 }
    ],
    suitableFor: '小型养蜂场、专业养殖户',
    sales: 345,
    rating: 4.9
  },
  {
    id: 3,
    name: '蜂场升级套餐',
    price: 8888,
    originalPrice: 11888,
    image: 'https://picsum.photos/seed/package3/400/400',
    description: '适合中大型养蜂场，高效生产设备配置',
    items: [
      { productId: 10, name: '意蜂高箱', quantity: 50 },
      { productId: 2, name: '不锈钢摇蜜机', quantity: 3 },
      { productId: 3, name: '防蜂服', quantity: 5 },
      { productId: 4, name: '塑料巢框', quantity: 500 },
      { productId: 5, name: '电动割蜜刀', quantity: 3 },
      { productId: 8, name: '蜂蜜过滤机', quantity: 1 }
    ],
    suitableFor: '中型养蜂场、合作社',
    sales: 123,
    rating: 5.0
  },
  {
    id: 4,
    name: '取蜜加工套餐',
    price: 1688,
    originalPrice: 2188,
    image: 'https://picsum.photos/seed/package4/400/400',
    description: '蜂蜜采收与加工专用设备组合',
    items: [
      { productId: 2, name: '不锈钢摇蜜机', quantity: 1 },
      { productId: 5, name: '电动割蜜刀', quantity: 1 },
      { productId: 8, name: '蜂蜜过滤机', quantity: 1 }
    ],
    suitableFor: '蜂蜜加工、蜂产品生产',
    sales: 234,
    rating: 4.8
  }
]

export const mockOrders = [
  {
    id: 1,
    orderNo: 'BEE202405150001',
    userId: 1,
    items: [
      { productId: 1, name: '标准杉木蜂箱', quantity: 10, price: 189, image: '' },
      { productId: 4, name: '塑料巢框', quantity: 100, price: 3.5, image: '' }
    ],
    totalAmount: 2240,
    status: 'completed',
    address: '浙江省杭州市西湖区转塘街道幸福养蜂场',
    receiver: '张蜂农',
    phone: '13800138001',
    createdAt: '2024-05-15T10:30:00.000Z',
    paidAt: '2024-05-15T10:35:00.000Z',
    shippedAt: '2024-05-16T09:00:00.000Z',
    completedAt: '2024-05-18T14:30:00.000Z'
  },
  {
    id: 2,
    orderNo: 'BEE202405200002',
    userId: 1,
    items: [
      { productId: 2, name: '全不锈钢摇蜜机', quantity: 1, price: 299, image: '' },
      { productId: 3, name: '全套防蜂服', quantity: 2, price: 158, image: '' }
    ],
    totalAmount: 615,
    status: 'shipped',
    address: '浙江省杭州市西湖区转塘街道幸福养蜂场',
    receiver: '张蜂农',
    phone: '13800138001',
    createdAt: '2024-05-20T14:20:00.000Z',
    paidAt: '2024-05-20T14:25:00.000Z',
    shippedAt: '2024-05-21T10:00:00.000Z'
  },
  {
    id: 3,
    orderNo: 'BEE202405220003',
    userId: 1,
    items: [
      { productId: 5, name: '电动割蜜刀', quantity: 1, price: 268, image: '' },
      { productId: 6, name: '饲喂器', quantity: 20, price: 8.5, image: '' }
    ],
    totalAmount: 438,
    status: 'pending',
    address: '浙江省杭州市西湖区转塘街道幸福养蜂场',
    receiver: '张蜂农',
    phone: '13800138001',
    createdAt: '2024-05-22T09:15:00.000Z',
    paidAt: '2024-05-22T09:20:00.000Z'
  },
  {
    id: 4,
    orderNo: 'BEE202405100004',
    userId: 1,
    items: [
      { productId: 1, name: '标准杉木蜂箱', quantity: 5, price: 189, image: '' }
    ],
    totalAmount: 945,
    status: 'completed',
    address: '浙江省杭州市西湖区转塘街道幸福养蜂场',
    receiver: '张蜂农',
    phone: '13800138001',
    createdAt: '2024-05-10T16:45:00.000Z',
    paidAt: '2024-05-10T16:50:00.000Z',
    shippedAt: '2024-05-11T08:30:00.000Z',
    completedAt: '2024-05-13T11:20:00.000Z'
  }
]

export const mockMaintenanceRecords = [
  {
    id: 1,
    userId: 1,
    productId: 1,
    productName: '标准杉木蜂箱',
    type: 'clean',
    description: '定期清洁蜂箱内部，清除蜡屑和杂物',
    date: '2024-05-10T00:00:00.000Z',
    cost: 0,
    status: 'completed'
  },
  {
    id: 2,
    userId: 1,
    productId: 2,
    productName: '全不锈钢摇蜜机',
    type: 'lubricate',
    description: '齿轮润滑保养，使用食品级润滑油',
    date: '2024-05-05T00:00:00.000Z',
    cost: 50,
    status: 'completed'
  },
  {
    id: 3,
    userId: 1,
    productId: 1,
    productName: '标准杉木蜂箱',
    type: 'repair',
    description: '更换损坏的箱盖合页',
    date: '2024-04-20T00:00:00.000Z',
    cost: 80,
    status: 'completed'
  },
  {
    id: 4,
    userId: 1,
    productId: 5,
    productName: '电动割蜜刀',
    type: 'check',
    description: '检查加热元件和电源线',
    date: '2024-05-15T00:00:00.000Z',
    cost: 0,
    status: 'completed'
  },
  {
    id: 5,
    userId: 1,
    productId: 1,
    productName: '标准杉木蜂箱',
    type: 'anticorrosion',
    description: '重新涂刷防腐蜂蜡',
    date: '2024-06-01T00:00:00.000Z',
    cost: 120,
    status: 'pending'
  },
  {
    id: 6,
    userId: 1,
    productId: 2,
    productName: '全不锈钢摇蜜机',
    type: 'clean',
    description: '深度清洁齿轮和轴承',
    date: '2024-06-10T00:00:00.000Z',
    cost: 0,
    status: 'pending'
  }
]

export const mockEquipmentStatus = [
  {
    userId: 1,
    productId: 1,
    productName: '标准杉木蜂箱',
    purchaseDate: '2024-01-15T00:00:00.000Z',
    totalQuantity: 15,
    inUse: 12,
    available: 3,
    wearLevel: 15,
    lastMaintenance: '2024-05-10T00:00:00.000Z',
    nextMaintenance: '2024-06-10T00:00:00.000Z'
  },
  {
    userId: 1,
    productId: 2,
    productName: '全不锈钢摇蜜机',
    purchaseDate: '2024-02-20T00:00:00.000Z',
    totalQuantity: 1,
    inUse: 1,
    available: 0,
    wearLevel: 8,
    lastMaintenance: '2024-05-05T00:00:00.000Z',
    nextMaintenance: '2024-06-05T00:00:00.000Z'
  },
  {
    userId: 1,
    productId: 3,
    productName: '全套防蜂服',
    purchaseDate: '2024-03-01T00:00:00.000Z',
    totalQuantity: 2,
    inUse: 2,
    available: 0,
    wearLevel: 25,
    lastMaintenance: '2024-04-15T00:00:00.000Z',
    nextMaintenance: '2024-05-30T00:00:00.000Z'
  },
  {
    userId: 1,
    productId: 5,
    productName: '电动割蜜刀',
    purchaseDate: '2024-03-10T00:00:00.000Z',
    totalQuantity: 1,
    inUse: 1,
    available: 0,
    wearLevel: 12,
    lastMaintenance: '2024-05-15T00:00:00.000Z',
    nextMaintenance: '2024-06-15T00:00:00.000Z'
  },
  {
    userId: 1,
    productId: 8,
    productName: '蜂蜜过滤机',
    purchaseDate: '2024-04-01T00:00:00.000Z',
    totalQuantity: 1,
    inUse: 0,
    available: 1,
    wearLevel: 5,
    lastMaintenance: '2024-04-20T00:00:00.000Z',
    nextMaintenance: '2024-05-20T00:00:00.000Z'
  }
]
