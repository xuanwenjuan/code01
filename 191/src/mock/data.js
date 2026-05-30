export const categories = [
  {
    id: 1,
    name: '勘探探测设备',
    icon: 'Search',
    subCategories: ['金属探测器', '地质雷达', '磁力仪', '电阻率仪']
  },
  {
    id: 2,
    name: '挖掘工具套装',
    icon: 'Tools',
    subCategories: ['考古手铲', '洛阳铲', '刷子套装', '测量工具']
  },
  {
    id: 3,
    name: '文物修复设备',
    icon: 'Cpu',
    subCategories: ['修复工作台', '精密仪器', '清洁设备', '防护工具']
  },
  {
    id: 4,
    name: '现场保护器材',
    icon: 'Box',
    subCategories: ['文物包装', '防潮设备', '记录设备', '安全防护']
  },
  {
    id: 5,
    name: '实验室分析设备',
    icon: 'Microscope',
    subCategories: ['显微镜', '光谱仪', '分析仪器', '样品制备']
  },
  {
    id: 6,
    name: '测绘记录设备',
    icon: 'Monitor',
    subCategories: ['全站仪', 'GPS设备', '3D扫描仪', '摄影测量']
  }
]

export const products = [
  {
    id: 1,
    name: '高精度地下金属探测器',
    categoryId: 1,
    categoryName: '勘探探测设备',
    subCategory: '金属探测器',
    price: 12800,
    originalPrice: 15800,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20underground%20metal%20detector%20archaeology%20equipment%20on%20white%20background&image_size=square_hd',
    description: '专业级考古勘探金属探测器，可探测地下5米深度的金属文物',
    rating: 4.8,
    sales: 1256,
    stock: 50,
    brand: '探宝科技',
    weight: '2.5kg',
    material: '航空铝合金+工程塑料',
    waterproof: true,
    warranty: '2年',
    area: '野外',
    params: {
      '探测深度': '5米',
      '探测频率': '8kHz',
      '灵敏度': '可调节',
      '工作温度': '-20°C ~ 60°C',
      '电池续航': '20小时',
      '显示屏': 'LED背光'
    },
    weatherResistance: 'IP67级防水防尘，可在雨雪天气使用',
    useYears: 8,
    scenarios: ['田野考古勘探', '遗址金属物调查', '水下考古辅助', '文化遗产普查'],
    scenariosDetail: {
      '田野考古勘探': '适合平原、丘陵等地形的考古调查工作，可快速定位地下金属文物分布范围',
      '遗址金属物调查': '针对古城址、古墓葬区进行金属遗物探查，为发掘方案制定提供数据支持',
      '水下考古辅助': '配合潜水设备进行水下遗址金属器物探测，IP67防水支持浅水环境',
      '文化遗产普查': '用于区域文化遗产资源调查，提高金属类文物发现效率'
    }
  },
  {
    id: 2,
    name: '地质雷达探测系统',
    categoryId: 1,
    categoryName: '勘探探测设备',
    subCategory: '地质雷达',
    price: 158000,
    originalPrice: 188000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ground%20penetrating%20radar%20GPR%20archaeological%20survey%20equipment&image_size=square_hd',
    description: '高性能地质雷达，可清晰成像地下15米内的墓葬、房址等遗迹',
    rating: 4.9,
    sales: 328,
    stock: 15,
    brand: '地勘科技',
    weight: '8kg',
    material: '碳纤维复合材料',
    waterproof: true,
    warranty: '3年',
    area: '野外',
    params: {
      '探测深度': '15米',
      '中心频率': '250MHz',
      '分辨率': '2cm',
      '扫描速度': '80道/秒',
      '数据存储': '64GB SSD',
      '显示屏': '10.1寸触控'
    },
    weatherResistance: 'IP65级防水，适应-10°C ~ 50°C工作环境',
    useYears: 10,
    scenarios: ['大型遗址勘探', '古墓葬探测', '地下建筑调查', '考古区域普查'],
    scenariosDetail: {
      '大型遗址勘探': '对大型聚落遗址、古城址进行全面扫描探测，生成地下遗迹分布图',
      '古墓葬探测': '精确探测墓葬形制、规模、深度，为考古发掘提供准确的位置信息',
      '地下建筑调查': '探查地下窖穴、水井、城墙基槽等遗迹的分布与结构',
      '考古区域普查': '快速完成大范围考古调查，评估区域文化遗产资源分布状况'
    }
  },
  {
    id: 3,
    name: '考古专业手铲套装',
    categoryId: 2,
    categoryName: '挖掘工具套装',
    subCategory: '考古手铲',
    price: 580,
    originalPrice: 680,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20archaeological%20trowel%20set%20excavation%20tools&image_size=square_hd',
    description: '德国进口钢材锻造，专业考古发掘必备工具，含多种规格',
    rating: 4.7,
    sales: 3560,
    stock: 200,
    brand: '考古精工',
    weight: '0.8kg',
    material: '不锈钢+榉木手柄',
    waterproof: false,
    warranty: '1年',
    area: '野外',
    params: {
      '规格': '4件套',
      '刃宽': '4cm/6cm/8cm/10cm',
      '总长': '28cm',
      '硬度': 'HRC58-62',
      '手柄材质': '榉木',
      '刃口处理': '精磨抛光'
    },
    weatherResistance: '不锈钢材质防锈，使用后需清洁擦干',
    useYears: 5,
    scenarios: ['考古发掘', '文物清理', '土方作业', '标本采集'],
    scenariosDetail: {
      '考古发掘': '用于考古发掘中的精细刮面、划线、清理遗迹边界等核心工作',
      '文物清理': '清理文物表面覆土，刀尖可剔除器物缝隙中的泥土',
      '土方作业': '开挖小型探沟、清理文化层堆积，适合精细作业',
      '标本采集': '采集土样、炭样、植物标本等考古样品'
    }
  },
  {
    id: 4,
    name: '洛阳铲套装',
    categoryId: 2,
    categoryName: '挖掘工具套装',
    subCategory: '洛阳铲',
    price: 320,
    originalPrice: 398,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Luoyang%20shovel%20archaeological%20drilling%20tool&image_size=square_hd',
    description: '传统工艺打造，考古钻探专用工具，可更换多种铲头',
    rating: 4.6,
    sales: 2890,
    stock: 150,
    brand: '中原考古',
    weight: '3.5kg',
    material: '优质碳钢',
    waterproof: false,
    warranty: '1年',
    area: '野外',
    params: {
      '杆长': '1.5m(可拼接至5m)',
      '铲头直径': '5cm/8cm/10cm',
      '材质': '65锰钢',
      '重量': '3.5kg',
      '连接方式': '螺纹拼接',
      '配套': '3个铲头+便携包'
    },
    weatherResistance: '碳钢材质需注意防锈，使用后涂抹防锈油',
    useYears: 6,
    scenarios: ['考古钻探', '土层分析', '遗址调查', '墓葬定位'],
    scenariosDetail: {
      '考古钻探': '进行考古钻探工作，通过带出土样分析地下堆积层次和包含物',
      '土层分析': '判断土层结构，观察土壤颜色、质地、包含物等信息，分析遗址文化层',
      '遗址调查': '在调查阶段钻探确认遗址范围、文化层厚度和保存状况',
      '墓葬定位': '钻探确认墓葬位置、深度、形制等信息，为发掘提供依据'
    }
  },
  {
    id: 5,
    name: '文物修复精密工作台',
    categoryId: 3,
    categoryName: '文物修复设备',
    subCategory: '修复工作台',
    price: 28000,
    originalPrice: 32000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=precision%20cultural%20relic%20restoration%20workbench%20laboratory&image_size=square_hd',
    description: '实验室级文物修复工作台，集成照明、除尘、减震系统',
    rating: 4.9,
    sales: 156,
    stock: 20,
    brand: '文保科技',
    weight: '150kg',
    material: '不锈钢+实木台面',
    waterproof: false,
    warranty: '3年',
    area: '室内',
    params: {
      '工作台尺寸': '1800x800x850mm',
      '台面材质': '耐酸碱实芯理化板',
      '照明系统': 'LED三色温可调',
      '吸尘装置': '静音除尘系统',
      '减震垫': '天然橡胶防震',
      '电源接口': '多功能插座组'
    },
    weatherResistance: '室内使用，恒温恒湿环境最佳',
    useYears: 15,
    scenarios: ['陶瓷器修复', '青铜器修复', '书画装裱', '有机质文物保护'],
    scenariosDetail: {
      '陶瓷器修复': '提供稳定的操作平台，配备专用夹具和照明系统，便于陶瓷器拼接、粘接',
      '青铜器修复': '集成除尘系统，可在除锈、补配、封护等操作中收集有害粉尘',
      '书画装裱': '台面平整，配备专用工具收纳空间，适合书画装裱和古籍修复',
      '有机质文物保护': '减震设计保护脆弱的有机质文物，适合纺织品、漆木器等文物修复'
    }
  },
  {
    id: 6,
    name: '超声波文物清洁机',
    categoryId: 3,
    categoryName: '文物修复设备',
    subCategory: '清洁设备',
    price: 15800,
    originalPrice: 18800,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ultrasonic%20cleaner%20for%20cultural%20relics%20restoration&image_size=square_hd',
    description: '专业级超声波清洗设备，可安全清洁金属、陶瓷、石器等文物',
    rating: 4.7,
    sales: 268,
    stock: 30,
    brand: '洁保科技',
    weight: '28kg',
    material: '304不锈钢',
    waterproof: true,
    warranty: '2年',
    area: '室内',
    params: {
      '容量': '10L',
      '超声波频率': '40kHz',
      '功率': '300W可调',
      '温度控制': '20-80°C可调',
      '时间设定': '1-99分钟',
      '清洗篮': '不锈钢网篮'
    },
    weatherResistance: '室内干燥环境使用，避免潮湿',
    useYears: 12,
    scenarios: ['青铜器除锈', '陶瓷器清洗', '金银器保养', '出土文物预处理'],
    scenariosDetail: {
      '青铜器除锈': '利用超声波空化效应安全去除青铜器表面锈层，不损伤文物本体',
      '陶瓷器清洗': '温和清洁陶瓷器表面的水垢、土渍等附着物，恢复器物原貌',
      '金银器保养': '清洗金银器表面的氧化物和污渍，恢复金属光泽',
      '出土文物预处理': '对刚出土的文物进行快速清洁处理，防止有害物质继续侵蚀'
    }
  },
  {
    id: 7,
    name: '考古现场记录套装',
    categoryId: 4,
    categoryName: '现场保护器材',
    subCategory: '记录设备',
    price: 2680,
    originalPrice: 3200,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=archaeological%20field%20recording%20kit%20documentation%20tools&image_size=square_hd',
    description: '考古现场完整记录工具包，含绘图、测量、拍照辅助设备',
    rating: 4.5,
    sales: 890,
    stock: 80,
    brand: '田野考古',
    weight: '4.2kg',
    material: '多种材质',
    waterproof: false,
    warranty: '1年',
    area: '野外',
    params: {
      '包含物品': '绘图板、比例尺、测量尺、放大镜、记录夹等12件',
      '记录夹': 'A4防水资料夹',
      '绘图笔': '多种规格绘图笔套装',
      '放大镜': '10倍带LED灯',
      '收纳包': '防水耐磨帆布包',
      '配套': '赠送考古记录模板'
    },
    weatherResistance: '部分配件防水，雨天需注意保护',
    useYears: 4,
    scenarios: ['田野考古记录', '遗址测绘', '文物拍照', '发掘日志'],
    scenariosDetail: {
      '田野考古记录': '用于考古发掘现场的文字记录、绘图、测量等工作',
      '遗址测绘': '配合测绘工具进行遗址平面图、剖面图的绘制',
      '文物拍照': '配备比例尺、色卡等辅助工具，便于文物拍照建档',
      '发掘日志': '包含标准化的考古记录模板，方便填写发掘日志'
    }
  },
  {
    id: 8,
    name: '文物包装缓冲材料套装',
    categoryId: 4,
    categoryName: '现场保护器材',
    subCategory: '文物包装',
    price: 1280,
    originalPrice: 1580,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cultural%20relic%20packaging%20buffer%20materials%20archaeological%20transport&image_size=square_hd',
    description: '专业文物运输包装材料，提供全方位缓冲保护',
    rating: 4.4,
    sales: 1560,
    stock: 100,
    brand: '文保包装',
    weight: '5kg',
    material: 'EVA+气泡膜+珍珠棉',
    waterproof: true,
    warranty: '长期',
    area: '通用',
    params: {
      '套装内容': '缓冲棉、气泡膜、打包带、干燥剂、标签等',
      '缓冲棉厚度': '5cm',
      '气泡膜尺寸': '50cm x 50m',
      '干燥剂': '50包硅胶干燥剂',
      '包装纸': '无酸包装纸',
      '收纳箱': '防潮收纳箱'
    },
    weatherResistance: '防水材料，适合各种环境',
    useYears: 3,
    scenarios: ['文物运输', '库房存储', '临时保护', '展览包装'],
    scenariosDetail: {
      '文物运输': '为考古发掘出土文物提供完善的缓冲包装，确保运输安全',
      '库房存储': '提供防潮、防震的包装材料，适合文物长期库房存储',
      '临时保护': '考古现场文物临时包裹保护，防止出土后受到二次损害',
      '展览包装': '专业的展览级包装材料，确保文物展览运输安全'
    }
  },
  {
    id: 9,
    name: '超景深三维显微系统',
    categoryId: 5,
    categoryName: '实验室分析设备',
    subCategory: '显微镜',
    price: 280000,
    originalPrice: 320000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=3D%20digital%20microscope%20super%20depth%20field%20laboratory%20equipment&image_size=square_hd',
    description: '科研级超景深显微镜，可进行文物表面微观分析和3D建模',
    rating: 4.9,
    sales: 45,
    stock: 5,
    brand: '光学科技',
    weight: '35kg',
    material: '铝合金+光学玻璃',
    waterproof: false,
    warranty: '3年',
    area: '室内',
    params: {
      '光学变焦': '0.5x-50x',
      '数字变焦': '最高200x',
      '分辨率': '4K高清',
      '景深合成': '自动景深扩展',
      '3D建模': '支持表面形貌测量',
      '软件': '专业分析软件'
    },
    weatherResistance: '恒温恒湿实验室环境',
    useYears: 15,
    scenarios: ['文物微观分析', '病害调查', '真伪鉴别', '修复记录'],
    scenariosDetail: {
      '文物微观分析': '对文物表面进行超高倍显微观察，分析工艺痕迹、材质组成',
      '病害调查': '观察文物病害状况，分析病害产生原因和发展趋势',
      '真伪鉴别': '通过显微特征对比，辅助文物真伪鉴定工作',
      '修复记录': '修复前后的微观状况记录，建立文物修复档案'
    }
  },
  {
    id: 10,
    name: '全站型电子速测仪',
    categoryId: 6,
    categoryName: '测绘记录设备',
    subCategory: '全站仪',
    price: 68000,
    originalPrice: 78000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=total%20station%20electronic%20theodolite%20archaeological%20surveying&image_size=square_hd',
    description: '高精度全站仪，考古遗址测绘必备，支持坐标测量、放样',
    rating: 4.8,
    sales: 128,
    stock: 12,
    brand: '测绘科技',
    weight: '5.8kg',
    material: '镁铝合金',
    waterproof: true,
    warranty: '2年',
    area: '野外',
    params: {
      '测角精度': '2秒',
      '测距精度': '2mm + 2ppm',
      '测程': '3000m(单棱镜)',
      '存储': '30000点',
      '显示屏': '彩色触控屏',
      '电池续航': '12小时'
    },
    weatherResistance: 'IP55级防水防尘，适应野外复杂环境',
    useYears: 10,
    scenarios: ['遗址测绘', '考古发掘布方', '文物坐标定位', '地形测量'],
    scenariosDetail: {
      '遗址测绘': '对考古遗址进行高精度测绘，绘制遗址平面图、地形图',
      '考古发掘布方': '精确布设探方网格，确保考古发掘工作的科学性和规范性',
      '文物坐标定位': '精确记录每件出土文物的三维坐标，建立文物空间数据库',
      '地形测量': '测量遗址所在区域的地形地貌，为遗址保护规划提供数据'
    }
  },
  {
    id: 11,
    name: '考古便携毛刷套装',
    categoryId: 2,
    categoryName: '挖掘工具套装',
    subCategory: '刷子套装',
    price: 168,
    originalPrice: 198,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=archaeological%20brush%20set%20soft%20bristle%20cleaning%20tools&image_size=square_hd',
    description: '多种硬度毛刷组合，用于文物表面精细清理',
    rating: 4.6,
    sales: 4560,
    stock: 300,
    brand: '考古精工',
    weight: '0.3kg',
    material: '马毛+猪鬃+尼龙',
    waterproof: false,
    warranty: '半年',
    area: '通用',
    params: {
      '套装数量': '8件套',
      '刷毛材质': '马毛/猪鬃/尼龙',
      '手柄': '实木手柄',
      '刷毛硬度': '软/中/硬',
      '用途': '精细清理/一般清理/顽固污渍',
      '收纳': '专用工具卷'
    },
    weatherResistance: '使用后清洁晾干',
    useYears: 3,
    scenarios: ['文物清理', '化石修复', '标本处理', '精细发掘'],
    scenariosDetail: {
      '文物清理': '不同硬度的毛刷适配不同材质文物的清理工作，保护文物安全',
      '化石修复': '精细毛刷用于化石表面清理，不损伤化石本体',
      '标本处理': '清理标本表面附着物，保持标本完整性',
      '精细发掘': '在考古发掘中清理脆弱文物周围的覆土，实现精细化发掘'
    }
  },
  {
    id: 12,
    name: '便携式X射线荧光光谱仪',
    categoryId: 5,
    categoryName: '实验室分析设备',
    subCategory: '光谱仪',
    price: 258000,
    originalPrice: 298000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portable%20XRF%20spectrometer%20elemental%20analysis%20device&image_size=square_hd',
    description: '便携式X射线荧光光谱仪，现场快速分析文物成分',
    rating: 4.9,
    sales: 32,
    stock: 8,
    brand: '分析科技',
    weight: '1.8kg',
    material: '工程塑料+金属',
    waterproof: false,
    warranty: '2年',
    area: '通用',
    params: {
      '分析元素': 'Na-U',
      '探测极限': 'ppm级',
      '检测时间': '10-60秒',
      '显示屏': '高清触控',
      '数据存储': '无限存储',
      '电池续航': '8小时'
    },
    weatherResistance: 'IP54级防尘防水',
    useYears: 10,
    scenarios: ['文物成分分析', '产地溯源', '金属器断代', '无损检测'],
    scenariosDetail: {
      '文物成分分析': '现场快速分析文物的元素组成，获取成分数据',
      '产地溯源': '通过成分比对，辅助判断文物的产地和矿料来源',
      '金属器断代': '分析金属器的合金成分，为文物断代提供科学依据',
      '无损检测': '无需取样，对文物进行完全无损的成分检测分析'
    }
  }
]

export const packages = [
  {
    id: 1,
    name: '田野考古入门套餐',
    price: 5800,
    originalPrice: 7200,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=basic%20archaeology%20field%20kit%20equipment%20set&image_size=square_hd',
    description: '适合初学者和小型考古项目，包含基础勘探和挖掘工具',
    items: [
      { productId: 1, name: '高精度地下金属探测器', quantity: 1 },
      { productId: 3, name: '考古专业手铲套装', quantity: 1 },
      { productId: 4, name: '洛阳铲套装', quantity: 1 },
      { productId: 7, name: '考古现场记录套装', quantity: 1 },
      { productId: 11, name: '考古便携毛刷套装', quantity: 1 }
    ],
    suitableFor: '小型遗址调查、田野考古实习、文物普查',
    rating: 4.7,
    sales: 568
  },
  {
    id: 2,
    name: '专业考古发掘套餐',
    price: 128000,
    originalPrice: 158000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20archaeological%20excavation%20equipment%20package&image_size=square_hd',
    description: '专业考古队标配，包含高精度探测设备和完整发掘工具',
    items: [
      { productId: 2, name: '地质雷达探测系统', quantity: 1 },
      { productId: 1, name: '高精度地下金属探测器', quantity: 2 },
      { productId: 3, name: '考古专业手铲套装', quantity: 5 },
      { productId: 4, name: '洛阳铲套装', quantity: 3 },
      { productId: 7, name: '考古现场记录套装', quantity: 3 },
      { productId: 8, name: '文物包装缓冲材料套装', quantity: 5 },
      { productId: 11, name: '考古便携毛刷套装', quantity: 5 }
    ],
    suitableFor: '大型遗址发掘、专业考古团队、考古工程项目',
    rating: 4.9,
    sales: 128
  },
  {
    id: 3,
    name: '文物修复实验室套餐',
    price: 368000,
    originalPrice: 428000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=complete%20cultural%20relic%20restoration%20laboratory%20equipment&image_size=square_hd',
    description: '建立标准文物修复实验室所需的全套设备',
    items: [
      { productId: 5, name: '文物修复精密工作台', quantity: 2 },
      { productId: 6, name: '超声波文物清洁机', quantity: 1 },
      { productId: 9, name: '超景深三维显微系统', quantity: 1 },
      { productId: 12, name: '便携式X射线荧光光谱仪', quantity: 1 }
    ],
    suitableFor: '博物馆修复中心、考古研究所、文保实验室',
    rating: 4.8,
    sales: 42
  },
  {
    id: 4,
    name: '考古测绘专业套餐',
    price: 85000,
    originalPrice: 98000,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=archaeological%20surveying%20and%20mapping%20equipment%20set&image_size=square_hd',
    description: '考古遗址精准测绘所需的专业设备组合',
    items: [
      { productId: 10, name: '全站型电子速测仪', quantity: 1 },
      { productId: 7, name: '考古现场记录套装', quantity: 2 }
    ],
    suitableFor: '遗址测绘、考古布方、地形测量、三维建模',
    rating: 4.7,
    sales: 86
  }
]

export const mockUsers = [
  {
    id: 1,
    username: 'buyer001',
    password: '123456',
    role: 'buyer',
    name: '张考古',
    organization: '某省考古研究院',
    phone: '13800138001',
    email: 'buyer@test.com',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: 2,
    username: 'supplier001',
    password: '123456',
    role: 'supplier',
    name: '李经理',
    organization: '探宝科技有限公司',
    phone: '13900139001',
    email: 'supplier@test.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  }
]

export const mockOrders = [
  {
    id: 'ORD20240101001',
    products: [
      { productId: 3, name: '考古专业手铲套装', price: 580, quantity: 2, image: '' },
      { productId: 11, name: '考古便携毛刷套装', price: 168, quantity: 3, image: '' }
    ],
    totalAmount: 1664,
    status: 'completed',
    createTime: '2024-01-15 10:30:00',
    payTime: '2024-01-15 10:35:00',
    shipTime: '2024-01-16 09:00:00',
    completeTime: '2024-01-19 14:30:00',
    address: '陕西省西安市雁塔区某考古研究院',
    receiver: '张考古',
    phone: '13800138001',
    logistics: {
      company: '顺丰速运',
      trackingNo: 'SF1234567890123',
      status: '已签收',
      estimatedDelivery: '2024-01-19',
      progress: [
        { time: '2024-01-19 14:30:00', status: '已签收', description: '快递已被本人签收' },
        { time: '2024-01-19 08:15:00', status: '派送中', description: '快递员正在派送中' },
        { time: '2024-01-18 22:30:00', status: '已到达', description: '快件已到达西安雁塔区网点' },
        { time: '2024-01-17 10:00:00', status: '运输中', description: '快件正在运往西安' },
        { time: '2024-01-16 09:00:00', status: '已发货', description: '商家已发货，等待快递揽收' }
      ]
    }
  },
  {
    id: 'ORD20240101002',
    products: [
      { productId: 1, name: '高精度地下金属探测器', price: 12800, quantity: 1, image: '' }
    ],
    totalAmount: 12800,
    status: 'shipping',
    createTime: '2024-01-18 14:20:00',
    payTime: '2024-01-18 14:25:00',
    shipTime: '2024-01-19 10:00:00',
    address: '陕西省西安市雁塔区某考古研究院',
    receiver: '张考古',
    phone: '13800138001',
    logistics: {
      company: '京东物流',
      trackingNo: 'JD9876543210987',
      status: '运输中',
      estimatedDelivery: '2024-01-22',
      progress: [
        { time: '2024-01-20 16:00:00', status: '运输中', description: '快件正在运往西安转运中心' },
        { time: '2024-01-19 22:00:00', status: '运输中', description: '快件已从上海发出' },
        { time: '2024-01-19 10:00:00', status: '已发货', description: '商家已发货，等待快递揽收' }
      ]
    }
  },
  {
    id: 'ORD20240101003',
    products: [
      { productId: 7, name: '考古现场记录套装', price: 2680, quantity: 2, image: '' },
      { productId: 8, name: '文物包装缓冲材料套装', price: 1280, quantity: 5, image: '' }
    ],
    totalAmount: 11760,
    status: 'pending',
    createTime: '2024-01-20 09:15:00',
    address: '陕西省西安市雁塔区某考古研究院',
    receiver: '张考古',
    phone: '13800138001'
  },
  {
    id: 'ORD20240101004',
    products: [
      { productId: 5, name: '文物修复精密工作台', price: 28000, quantity: 1, image: '' }
    ],
    totalAmount: 28000,
    status: 'exception',
    createTime: '2024-01-10 11:00:00',
    payTime: '2024-01-10 11:05:00',
    shipTime: '2024-01-11 08:00:00',
    address: '陕西省西安市雁塔区某考古研究院',
    receiver: '张考古',
    phone: '13800138001',
    isException: true,
    exceptionType: '物流异常',
    exceptionReason: '运输途中包装破损，正在处理中',
    exceptionTime: '2024-01-13 15:00:00',
    logistics: {
      company: '德邦物流',
      trackingNo: 'DP5678901234567',
      status: '异常',
      estimatedDelivery: '待确认',
      progress: [
        { time: '2024-01-13 15:00:00', status: '物流异常', description: '运输途中包装破损，已滞留处理' },
        { time: '2024-01-12 10:00:00', status: '运输中', description: '快件正在运输途中' },
        { time: '2024-01-11 08:00:00', status: '已发货', description: '商家已发货' }
      ]
    }
  },
  {
    id: 'ORD20240101005',
    products: [
      { productId: 2, name: '地质雷达探测系统', price: 158000, quantity: 1, image: '' }
    ],
    totalAmount: 158000,
    status: 'paid',
    createTime: '2024-01-21 16:30:00',
    payTime: '2024-01-21 16:35:00',
    address: '陕西省西安市雁塔区某考古研究院',
    receiver: '张考古',
    phone: '13800138001',
    remark: '需上门安装调试'
  },
  {
    id: 'ORD20240101006',
    products: [
      { productId: 10, name: '全站型电子速测仪', price: 68000, quantity: 1, image: '' }
    ],
    totalAmount: 68000,
    status: 'completed',
    createTime: '2023-12-01 10:00:00',
    payTime: '2023-12-01 10:05:00',
    shipTime: '2023-12-02 09:00:00',
    completeTime: '2023-12-06 11:00:00',
    address: '陕西省西安市雁塔区某考古研究院',
    receiver: '张考古',
    phone: '13800138001',
    logistics: {
      company: '顺丰速运',
      trackingNo: 'SF1122334455667',
      status: '已签收',
      estimatedDelivery: '2023-12-06',
      progress: [
        { time: '2023-12-06 11:00:00', status: '已签收', description: '快递已被本人签收' },
        { time: '2023-12-06 08:30:00', status: '派送中', description: '快递员正在派送中' },
        { time: '2023-12-05 20:00:00', status: '已到达', description: '快件已到达西安雁塔区网点' },
        { time: '2023-12-02 09:00:00', status: '已发货', description: '商家已发货' }
      ]
    }
  }
]

export const favoriteGroups = [
  { id: 1, name: '野外勘探设备', productIds: [1, 2, 4, 10], color: '#67c23a' },
  { id: 2, name: '文物修复设备', productIds: [5, 6, 9, 12], color: '#409eff' },
  { id: 3, name: '常用工具耗材', productIds: [3, 7, 8, 11], color: '#e6a23c' }
]

export const purchaseStatistics = {
  totalOrders: 6,
  totalAmount: 280224,
  totalProducts: 23,
  completedOrders: 2,
  pendingOrders: 1,
  shippingOrders: 1,
  exceptionOrders: 1,
  categoryStats: [
    { name: '勘探探测设备', amount: 170800, count: 2 },
    { name: '挖掘工具套装', amount: 1664, count: 2 },
    { name: '文物修复设备', amount: 28000, count: 1 },
    { name: '现场保护器材', amount: 11760, count: 2 },
    { name: '实验室分析设备', amount: 0, count: 0 },
    { name: '测绘记录设备', amount: 68000, count: 1 }
  ],
  monthlyStats: [
    { month: '2023-12', amount: 68000, orders: 1 },
    { month: '2024-01', amount: 212224, orders: 5 }
  ]
}

export const orderStatusMap = {
  pending: { label: '待付款', type: 'warning' },
  paid: { label: '已付款', type: 'info' },
  shipping: { label: '配送中', type: 'primary' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'info' },
  exception: { label: '异常订单', type: 'danger' }
}

export const exceptionTypes = ['物流异常', '商品缺货', '质量问题', '其他异常']
