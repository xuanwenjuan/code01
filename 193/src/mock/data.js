export const categories = [
  {
    id: 1,
    name: '采集工具',
    icon: 'Collection',
    description: '野外植物标本采集必备工具',
    count: 12
  },
  {
    id: 2,
    name: '压制器材',
    icon: 'Grid',
    description: '植物标本脱水压制成套设备',
    count: 8
  },
  {
    id: 3,
    name: '防腐保存',
    icon: 'Box',
    description: '标本防腐处理与长期保存器材',
    count: 15
  },
  {
    id: 4,
    name: '装帧工具',
    icon: 'Document',
    description: '标本台纸装帧与标签制作',
    count: 10
  },
  {
    id: 5,
    name: '鉴定仪器',
    icon: 'View',
    description: '植物种类鉴定专业仪器',
    count: 6
  },
  {
    id: 6,
    name: '存储设备',
    icon: 'Folder',
    description: '标本柜、干燥剂等存储设备',
    count: 9
  }
]

export const equipments = [
  {
    id: 1,
    name: '专业植物标本夹',
    categoryId: 2,
    price: 299,
    originalPrice: 399,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/196783/22/25709/123456/abc123def.jpg',
    description: '采用优质硬木制作，不锈钢弹簧设计，压力均匀，适合各类植物标本压制',
    specifications: {
      '规格': '42×30cm',
      '材质': '硬木+不锈钢',
      '重量': '1.8kg',
      '最大压力': '50kg',
      '包含配件': '夹板2块、弹簧4根、绑带2条'
    },
    materialParams: {
      '夹板材质': '东北硬木（经过防腐处理）',
      '弹簧材质': '304不锈钢',
      '绑带材质': '高密度尼龙',
      '表面处理': '原木抛光，环保清漆'
    },
    serviceLife: '正常使用5年以上',
    specimenTypes: ['草本植物', '木本植物叶片', '花卉标本', '蕨类植物', '苔藓植物'],
    operationGuide: {
      steps: [
        '将采集的新鲜植物标本整理平整，去除多余叶片',
        '打开标本夹，在下层夹板上放置吸水纸',
        '将植物标本平放在吸水纸上，注意保持形态',
        '盖上另一层吸水纸和上层夹板',
        '均匀拧紧弹簧螺丝，调整压力适中',
        '放置在通风干燥处，每日更换吸水纸',
        '3-5天后标本即可干燥定型'
      ],
      tips: [
        '压制时注意叶片不要重叠',
        '对于较厚的植物材料可多放几层吸水纸',
        '避免阳光直射，防止植物变色',
        '定期检查标本干燥情况',
        '使用后清洁干净，存放于干燥处'
      ]
    },
    relatedEquipments: [5, 8],
    performance: '耐腐蚀性：★★★★★\n耐用性：★★★★☆\n环保性：★★★★★',
    scenarios: ['草本植物压制', '木本植物叶片压制', '花卉标本制作', '教学实验'],
    tags: ['脱水压制', '热销', '精选'],
    stock: 156,
    sales: 2341,
    rating: 4.9,
    supplier: '华茂科教仪器有限公司'
  },
  {
    id: 2,
    name: '植物标本干燥机',
    categoryId: 2,
    price: 1299,
    originalPrice: 1599,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/187654/11/26789/987654/def456ghi.jpg',
    description: '智能控温干燥系统，快速脱水，保持植物原色，提高标本制作效率',
    specifications: {
      '功率': '800W',
      '温度范围': '35-75℃',
      '容量': '20层',
      '定时功能': '0-24小时',
      '尺寸': '50×40×60cm'
    },
    materialParams: {
      '外壳材质': '冷轧钢板喷塑',
      '内胆材质': '304不锈钢',
      '加热方式': 'PTC陶瓷加热',
      '风机类型': '离心式风机',
      '温控元件': 'PT100铂电阻'
    },
    serviceLife: '正常使用8年以上',
    specimenTypes: ['各类植物标本', '中草药标本', '花卉标本', '果实标本'],
    operationGuide: {
      steps: [
        '将压制好的植物标本从标本夹中取出',
        '放置在干燥机的网架上，注意标本间留有空隙',
        '关闭箱门，设置温度（建议45-55℃）',
        '设置干燥时间（根据标本厚度3-8小时）',
        '启动干燥程序',
        '干燥完成后等待箱内温度降至室温后取出'
      ],
      tips: [
        '干燥过程中不要频繁开箱门，以免影响干燥效率',
        '对于含水量高的植物，建议先自然风干24小时',
        '定期清洁过滤网，保持风道畅通',
        '避免将滴水的标本直接放入干燥',
        '长时间不使用时请切断电源'
      ]
    },
    relatedEquipments: [1, 5, 8],
    performance: '干燥效率：★★★★★\n温控精度：★★★★★\n节能等级：★★★★☆',
    scenarios: ['批量标本制作', '科研机构', '高校实验室', '植物研究所'],
    tags: ['脱水压制', '新品'],
    stock: 45,
    sales: 567,
    rating: 4.8,
    supplier: '科仪实验设备厂'
  },
  {
    id: 3,
    name: '标本防腐处理液',
    categoryId: 3,
    price: 158,
    originalPrice: 198,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/176543/33/27890/456789/ghi789jkl.jpg',
    description: '环保型防腐配方，无毒无刺激性气味，有效延长标本保存时间至10年以上',
    specifications: {
      '容量': '500ml',
      '保质期': '3年',
      '主要成分': '丙三醇、乙醇、天然防腐剂',
      '适用对象': '植物标本',
      '保存期限': '处理后标本可保存10年以上'
    },
    materialParams: {
      '主要成分': '丙三醇（食品级）、乙醇（分析纯）、天然植物提取物',
      'pH值': '6.5-7.5（中性）',
      '密度': '1.05-1.10g/cm³',
      '外观': '无色透明液体',
      '气味': '轻微酒精气味'
    },
    serviceLife: '未开封3年，开封后1年',
    specimenTypes: ['被子植物', '裸子植物', '蕨类植物', '苔藓植物', '藻类标本'],
    operationGuide: {
      steps: [
        '确保植物标本完全干燥后再进行防腐处理',
        '将处理液倒入专用容器中',
        '将标本完全浸入处理液中',
        '浸泡时间：草本植物24小时，木本植物48小时',
        '取出后沥干多余处理液',
        '放置在通风处自然晾干',
        '晾干后即可装订上台纸'
      ],
      tips: [
        '操作时请佩戴手套，避免接触皮肤',
        '避免接触眼睛，如不慎接触请立即用清水冲洗',
        '处理液可重复使用2-3次',
        '远离儿童存放',
        '使用后盖紧瓶盖，存放于阴凉处'
      ]
    },
    relatedEquipments: [5, 7, 11],
    performance: '防腐效果：★★★★★\n环保等级：★★★★★\n安全性：★★★★★',
    scenarios: ['标本长期保存', '博物馆陈列', '教学标本', '科研标本'],
    tags: ['防腐保存', '热销'],
    stock: 320,
    sales: 4521,
    rating: 4.9,
    supplier: '绿源生物科技'
  },
  {
    id: 4,
    name: '便携式野外采集箱',
    categoryId: 1,
    price: 459,
    originalPrice: 559,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/165432/22/28901/234567/jkl012mno.jpg',
    description: '专业野外采集工具箱，内置多种采集工具，轻便耐用，适合户外考察',
    specifications: {
      '尺寸': '45×32×18cm',
      '重量': '3.5kg',
      '材质': 'ABS工程塑料',
      '包含工具': '枝剪、小刀、放大镜、镊子、卷尺等12件',
      '防水等级': 'IPX5'
    },
    materialParams: {
      '箱体材质': '高强度ABS工程塑料',
      '内衬材质': 'EVA防震缓冲材料',
      '工具材质': '不锈钢+铝合金',
      '锁扣材质': '优质不锈钢',
      '提手材质': '防滑橡胶'
    },
    serviceLife: '正常使用6年以上',
    specimenTypes: ['高等植物', '低等植物', '苔藓植物', '蕨类植物'],
    operationGuide: {
      steps: [
        '出发前检查所有工具是否齐全',
        '到达采集地点后，先观察环境，选择有代表性的植物',
        '用枝剪采集植物枝条或整株',
        '用小刀修整标本，去除腐烂部分',
        '将采集的标本放入标本夹或采集袋中',
        '做好采集记录（地点、时间、生境等）',
        '采集完成后整理工具，清洁后放回采集箱'
      ],
      tips: [
        '注意保护野生植物资源，不要过度采集',
        '携带必要的防护用品（手套、帽子、水壶等）',
        '注意天气变化，做好防晒防雨',
        '遵守当地自然保护区规定',
        '采集后尽快压制，保持植物新鲜度'
      ]
    },
    relatedEquipments: [1, 10],
    performance: '耐用性：★★★★★\n便携性：★★★★☆\n功能性：★★★★★',
    scenarios: ['野外考察', '植物资源调查', '教学实习', '科普活动'],
    tags: ['采集工具', '精选'],
    stock: 89,
    sales: 1234,
    rating: 4.7,
    supplier: '探险家户外用品'
  },
  {
    id: 5,
    name: '无酸标本台纸',
    categoryId: 4,
    price: 128,
    originalPrice: 168,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/154321/11/29012/345678/mno345pqr.jpg',
    description: '进口无酸纸材质，pH值中性，长期保存不发黄不变质，适合永久标本制作',
    specifications: {
      '规格': '29.7×42cm (A3)',
      '厚度': '250g/㎡',
      '数量': '100张/包',
      'pH值': '7.0-7.5',
      '保质期': '50年以上'
    },
    materialParams: {
      '原料': '100%纯木浆',
      '施胶方式': '中性施胶',
      '填料': '碳酸钙',
      '表面处理': '哑光处理',
      '白度': '85-90%ISO'
    },
    serviceLife: '正常保存50年以上',
    specimenTypes: ['所有植物标本', '昆虫标本', '动物标本', '档案文件'],
    operationGuide: {
      steps: [
        '将干燥好的植物标本放置在台纸中央位置',
        '调整标本姿态，使其美观自然',
        '用纸条或胶带固定标本',
        '在右下角贴上标签（标签内容包括：植物名称、采集地点、采集时间、采集人）',
        '盖上透明保护膜（可选）',
        '放入标本柜中保存'
      ],
      tips: [
        '操作时双手清洁，避免污渍污染台纸',
        '避免在潮湿环境中操作',
        '保存时注意防潮防虫',
        '避免阳光直射，防止褪色',
        '定期检查保存状况'
      ]
    },
    relatedEquipments: [3, 9, 11],
    performance: '保存期限：★★★★★\n纸张质量：★★★★★\n印刷适配：★★★★☆',
    scenarios: ['永久标本制作', '博物馆馆藏', '科研档案', '教学标本'],
    tags: ['装帧工具', '热销'],
    stock: 560,
    sales: 6789,
    rating: 4.9,
    supplier: '优纸纸业'
  },
  {
    id: 6,
    name: '数码体视显微镜',
    categoryId: 5,
    price: 3580,
    originalPrice: 4280,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/143210/33/30123/567890/pqr678stu.jpg',
    description: '高清数码成像系统，支持拍照录像测量，用于植物微观结构观察与鉴定',
    specifications: {
      '放大倍数': '7-45倍连续变倍',
      '目镜': 'WF10X/20',
      '物镜': '0.7-4.5X',
      '像素': '500万像素',
      '接口': 'USB3.0'
    },
    materialParams: {
      '镜身材质': '铝合金+工程塑料',
      '光学镜片': '多层镀膜光学玻璃',
      '底座材质': '铸铁+ABS',
      '光源类型': 'LED冷光源',
      '调焦机构': '齿轮齿条传动'
    },
    serviceLife: '正常使用10年以上',
    specimenTypes: ['植物细胞观察', '花粉鉴定', '种子鉴定', '叶片表皮观察', '解剖结构观察'],
    operationGuide: {
      steps: [
        '将显微镜放置在平稳的工作台面上',
        '连接电源和USB数据线到电脑',
        '打开电源开关，启动配套软件',
        '将标本放置在载物台上',
        '旋转调焦手轮，使图像清晰',
        '调节放大倍数至合适倍率',
        '使用软件进行拍照、测量、保存'
      ],
      tips: [
        '镜头请用专用擦镜纸清洁',
        '避免阳光直射镜头',
        '长期不用请盖上防尘罩',
        '存放在干燥通风处',
        '定期进行维护保养'
      ]
    },
    relatedEquipments: [12],
    performance: '成像质量：★★★★★\n操作便捷：★★★★☆\n功能丰富：★★★★★',
    scenarios: ['植物微观观察', '物种鉴定', '科学研究', '教学演示'],
    tags: ['鉴定仪器', '精选'],
    stock: 23,
    sales: 78,
    rating: 4.9,
    supplier: '奥特光学仪器'
  },
  {
    id: 7,
    name: '智能恒温恒湿标本柜',
    categoryId: 6,
    price: 5680,
    originalPrice: 6880,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/132109/22/31234/678901/stu901vwx.jpg',
    description: '精准控温控湿，防虫防霉，为珍贵标本提供博物馆级存储环境',
    specifications: {
      '容积': '380L',
      '温度范围': '15-25℃',
      '湿度范围': '40-60%RH',
      '层板': '5层可调',
      '材质': '冷轧钢喷塑'
    },
    materialParams: {
      '外壳': '1.2mm优质冷轧钢板',
      '内胆': '304不锈钢',
      '保温层': '聚氨酯发泡',
      '密封材料': '硅橡胶密封条',
      '涂层': '静电喷塑'
    },
    serviceLife: '正常使用15年以上',
    specimenTypes: ['植物标本', '昆虫标本', '动物标本', '化石标本', '珍贵文物'],
    operationGuide: {
      steps: [
        '将标本柜放置在通风、远离热源的地方',
        '接通电源，设置温度20℃、湿度50%RH',
        '待温湿度稳定后放入标本',
        '标本分类放置在层板上',
        '关闭柜门，确保密封良好',
        '定期检查温湿度显示',
        '定期清洁柜内和过滤网'
      ],
      tips: [
        '避免频繁开关柜门',
        '不要放置过多标本，保持空气流通',
        '定期更换干燥剂（如配备）',
        '注意防虫，定期检查',
        '停电时尽量不开柜门，保持内部环境'
      ]
    },
    relatedEquipments: [8],
    performance: '控温精度：★★★★★\n控湿精度：★★★★★\n防虫防霉：★★★★★',
    scenarios: ['博物馆馆藏', '标本室存储', '珍贵标本保存', '科研机构'],
    tags: ['存储设备', '新品'],
    stock: 15,
    sales: 78,
    rating: 4.9,
    supplier: '科瑞存储设备'
  },
  {
    id: 8,
    name: '硅胶干燥剂',
    categoryId: 6,
    price: 68,
    originalPrice: 88,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/121098/11/32345/123456/vwx234yza.jpg',
    description: '高效变色硅胶干燥剂，快速吸湿，可重复使用，适合标本干燥保存',
    specifications: {
      '重量': '1kg/包',
      '颗粒大小': '2-4mm',
      '吸湿率': '≥30%',
      '变色指示': '蓝色变粉红色',
      '可重复使用': '是（120℃烘烤即可）'
    },
    materialParams: {
      '主要成分': '二氧化硅（SiO₂）',
      '孔径': '2-3nm',
      '外观': '蓝色球形颗粒',
      '包装': '无纺布透气袋',
      '含水率': '≤5%'
    },
    serviceLife: '可重复使用，变色后可再生',
    specimenTypes: ['植物标本', '种子保存', '电子产品防潮', '食品防潮'],
    operationGuide: {
      steps: [
        '将干燥剂放入标本柜或密封容器中',
        '根据空间大小放置适量干燥剂',
        '定期观察颜色变化',
        '当硅胶变为粉红色时取出',
        '放入烘箱中120℃烘烤2-3小时',
        '冷却后可重复使用'
      ],
      tips: [
        '避免直接接触标本，用透气袋包装',
        '烘烤时温度不要超过150℃',
        '远离儿童，避免误食',
        '不要用于食品直接接触',
        '存放在阴凉干燥处'
      ]
    },
    relatedEquipments: [7],
    performance: '吸湿效率：★★★★★\n性价比：★★★★★\n可重复使用：★★★★★',
    scenarios: ['标本干燥', '标本保存', '防潮存储', '实验室除湿'],
    tags: ['存储设备', '热销', '防腐保存'],
    stock: 890,
    sales: 8901,
    rating: 4.8,
    supplier: '干燥剂专业厂'
  },
  {
    id: 9,
    name: '标本标签打印机',
    categoryId: 4,
    price: 1299,
    originalPrice: 1599,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/109987/33/33456/234567/yza567bcd.jpg',
    description: '热转印标签打印机，支持多种标签格式，打印清晰耐保存',
    specifications: {
      '打印方式': '热转印',
      '分辨率': '300dpi',
      '打印宽度': '108mm',
      '连接方式': 'USB+蓝牙',
      '支持系统': 'Windows/Mac'
    },
    materialParams: {
      '外壳': 'ABS工程塑料',
      '打印头': '日本进口打印头',
      '接口': 'USB2.0+蓝牙4.0',
      '电源': 'DC 24V/2.5A',
      '操作温度': '5-40℃'
    },
    serviceLife: '正常使用5年以上',
    specimenTypes: ['植物标本标签', '档案标签', '库存标签', '实验室标识'],
    operationGuide: {
      steps: [
        '安装标签纸和碳带',
        '连接电源和USB线',
        '打开电源开关',
        '安装驱动程序和编辑软件',
        '在软件中设计标签内容',
        '设置打印参数',
        '点击打印'
      ],
      tips: [
        '使用原厂标签纸和碳带',
        '打印头定期清洁',
        '避免在潮湿多尘环境中使用',
        '长时间不用请关闭电源',
        '存放于干燥通风处'
      ]
    },
    relatedEquipments: [5, 11],
    performance: '打印质量：★★★★★\n速度：★★★★☆\n易用性：★★★★★',
    scenarios: ['标本标签制作', '档案管理', '库存管理', '实验室标识'],
    tags: ['装帧工具'],
    stock: 67,
    sales: 456,
    rating: 4.7,
    supplier: '佳博打印设备'
  },
  {
    id: 10,
    name: '植物标本采集刀',
    categoryId: 1,
    price: 89,
    originalPrice: 129,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/98876/22/34567/345678/bcd890efg.jpg',
    description: '进口不锈钢刀片，锋利耐用，专业植物采集设计，携带安全',
    specifications: {
      '全长': '21cm',
      '刃长': '9cm',
      '材质': '440C不锈钢',
      '手柄': '防滑橡胶',
      '重量': '120g'
    },
    materialParams: {
      '刀身': '440C高碳不锈钢',
      '硬度': 'HRC58-60',
      '刀柄': '防滑橡胶+铝合金',
      '刀鞘': '尼龙护套',
      '表面处理': '镜面抛光'
    },
    serviceLife: '正常使用3年以上',
    specimenTypes: ['草本植物', '木本植物', '花卉植物'],
    operationGuide: {
      steps: [
        '手持采集刀，注意刀刃朝外',
        '选择需要采集的植物部位',
        '用刀刃快速切割，保持切口平整',
        '将采集的标本放入采集袋中',
        '使用后清洁刀刃',
        '套上刀鞘，妥善存放'
      ],
      tips: [
        '使用时注意安全，避免割伤',
        '保持刀刃锋利，定期打磨',
        '避免切割坚硬物体',
        '存放于儿童接触不到的地方',
        '定期涂抹防锈油'
      ]
    },
    relatedEquipments: [4],
    performance: '锋利度：★★★★★\n耐用性：★★★★★\n便携性：★★★★★',
    scenarios: ['野外采集', '植物标本制作', '园艺修剪', '教学实习'],
    tags: ['采集工具', '热销'],
    stock: 450,
    sales: 3456,
    rating: 4.8,
    supplier: '利刃刀具'
  },
  {
    id: 11,
    name: '标本透明保护膜',
    categoryId: 4,
    price: 45,
    originalPrice: 65,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/87765/11/35678/456789/efg123hij.jpg',
    description: '高清透明保护膜，防刮防尘，不影响标本观察，延长使用寿命',
    specifications: {
      '规格': '30×45cm',
      '厚度': '0.05mm',
      '数量': '50张/包',
      '透明度': '99%',
      '粘性': '低粘可移除'
    },
    materialParams: {
      '材质': 'PET聚酯薄膜',
      '涂层': '防静电涂层',
      '胶粘剂': '丙烯酸低粘胶',
      '透光率': '≥99%',
      '雾度': '≤1%'
    },
    serviceLife: '正常使用10年以上',
    specimenTypes: ['植物标本', '昆虫标本', '照片', '文件'],
    operationGuide: {
      steps: [
        '将标本装订在台纸上',
        '撕去保护膜背纸',
        '从一侧开始，慢慢覆盖在标本上',
        '用刮刀或银行卡）赶出气泡',
        '确保平整无褶皱'
      ],
      tips: [
        '在清洁无尘的环境中操作',
        '避免产生气泡',
        '可反复粘贴，如有气泡可针刺排出',
        '避免阳光直射'
      ]
    },
    relatedEquipments: [5, 9],
    performance: '透明度：★★★★★\n保护性：★★★★☆\n易用性：★★★★★',
    scenarios: ['标本保护', '展览陈列', '长期保存', '教学标本'],
    tags: ['装帧工具'],
    stock: 780,
    sales: 5678,
    rating: 4.7,
    supplier: '薄膜科技'
  },
  {
    id: 12,
    name: '植物解剖镜',
    categoryId: 5,
    price: 1899,
    originalPrice: 2299,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/76654/33/36789/567890/hij456klm.jpg',
    description: '双目体视解剖镜，大视野长工作距离，适合植物解剖操作与观察',
    specifications: {
      '放大倍数': '10-40倍',
      '目镜': 'WF10X/22',
      '工作距离': '110mm',
      '视场直径': '22-5.5mm',
      '照明': '上下双LED光源'
    },
    materialParams: {
      '镜身': '铝合金+工程塑料',
      '光学系统': '伽利略光学系统',
      '镜片': '多层镀膜光学玻璃',
      '调焦机构': '齿轮齿条传动',
      '光源': 'LED冷光源'
    },
    serviceLife: '正常使用10年以上',
    specimenTypes: ['植物胚胎', '植物组织', '叶片表皮', '花粉颗粒', '种子结构'],
    operationGuide: {
      steps: [
        '将标本放置在载物台上',
        '调节目镜，调整瞳距',
        '转动调焦手轮至图像清晰',
        '调整放大倍数',
        '调节光源亮度',
        '进行解剖操作'
      ],
      tips: [
        '镜头用专用擦镜纸清洁',
        '避免阳光直射',
        '不用时盖好防尘罩',
        '存放在干燥通风处'
      ]
    },
    relatedEquipments: [6],
    performance: '光学质量：★★★★★\n操作便捷：★★★★★\n舒适性：★★★★☆',
    scenarios: ['植物解剖', '胚胎观察', '组织培养', '科研教学'],
    tags: ['鉴定仪器'],
    stock: 34,
    sales: 234,
    rating: 4.8,
    supplier: '奥特光学仪器'
  }
]

export const packages = [
  {
    id: 1,
    name: '初学者入门套餐',
    price: 599,
    originalPrice: 796,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/196783/22/25709/123456/abc123def.jpg',
    description: '适合学生和初学者，包含基本标本制作工具',
    items: [
      { id: 1, name: '专业植物标本夹', quantity: 1 },
      { id: 5, name: '无酸标本台纸', quantity: 1 },
      { id: 8, name: '硅胶干燥剂', quantity: 1 },
      { id: 10, name: '植物标本采集刀', quantity: 1 }
    ],
    suitableFor: ['学生实习', '科普爱好者', '入门学习'],
    sales: 1234,
    rating: 4.8,
    tag: '入门推荐'
  },
  {
    id: 2,
    name: '专业科研套餐',
    price: 2599,
    originalPrice: 3254,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/187654/11/26789/987654/def456ghi.jpg',
    description: '科研机构首选，高效专业的标本制作设备组合',
    items: [
      { id: 2, name: '植物标本干燥机', quantity: 1 },
      { id: 1, name: '专业植物标本夹', quantity: 2 },
      { id: 3, name: '标本防腐处理液', quantity: 2 },
      { id: 5, name: '无酸标本台纸', quantity: 2 },
      { id: 8, name: '硅胶干燥剂', quantity: 3 }
    ],
    suitableFor: ['科研机构', '高校实验室', '植物研究所'],
    sales: 567,
    rating: 4.9,
    tag: '热销'
  },
  {
    id: 3,
    name: '野外采集专业套装',
    price: 1299,
    originalPrice: 1605,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/165432/22/28901/234567/jkl012mno.jpg',
    description: '完整的野外采集工具，满足专业植物考察需求',
    items: [
      { id: 4, name: '便携式野外采集箱', quantity: 1 },
      { id: 10, name: '植物标本采集刀', quantity: 1 },
      { id: 1, name: '专业植物标本夹', quantity: 1 },
      { id: 8, name: '硅胶干燥剂', quantity: 2 }
    ],
    suitableFor: ['野外考察', '植物资源调查', '科普活动'],
    sales: 789,
    rating: 4.8,
    tag: '精选'
  },
  {
    id: 4,
    name: '博物馆级典藏套餐',
    price: 8999,
    originalPrice: 11043,
    image: 'https://img14.360buyimg.com/n1/jfs/t1/132109/22/31234/678901/stu901vwx.jpg',
    description: '博物馆和专业标本馆的顶级配置，永久保存珍贵标本',
    items: [
      { id: 7, name: '智能恒温恒湿标本柜', quantity: 1 },
      { id: 2, name: '植物标本干燥机', quantity: 1 },
      { id: 3, name: '标本防腐处理液', quantity: 5 },
      { id: 5, name: '无酸标本台纸', quantity: 5 },
      { id: 6, name: '数码体视显微镜', quantity: 1 },
      { id: 9, name: '标本标签打印机', quantity: 1 },
      { id: 11, name: '标本透明保护膜', quantity: 3 }
    ],
    suitableFor: ['博物馆', '标本馆', '珍贵标本收藏'],
    sales: 56,
    rating: 5.0,
    tag: '典藏'
  }
]

export const mockUsers = [
  {
    id: 1,
    username: 'buyer001',
    password: 'buyer123456',
    role: 'buyer',
    name: '李研究员',
    institution: '中国科学院植物研究所',
    phone: '13800138001',
    email: 'liyanjiu@ibcas.ac.cn',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  },
  {
    id: 2,
    username: 'supplier001',
    password: 'supplier123456',
    role: 'supplier',
    name: '张经理',
    company: '华茂科教仪器有限公司',
    phone: '13900139001',
    email: 'zhang@huamaokeji.com',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
]

export const mockOrders = [
  {
    id: 1001,
    orderNo: 'ORD202401150001',
    items: [
      { equipmentId: 1, name: '专业植物标本夹', price: 299, quantity: 2, image: 'https://img14.360buyimg.com/n1/jfs/t1/196783/22/25709/123456/abc123def.jpg' },
      { equipmentId: 3, name: '标本防腐处理液', price: 158, quantity: 3, image: 'https://img14.360buyimg.com/n1/jfs/t1/176543/33/27890/456789/ghi789jkl.jpg' }
    ],
    totalAmount: 1072,
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    buyerName: '李研究员',
    buyerInstitution: '中国科学院植物研究所',
    shippingAddress: '北京市海淀区香山南辛村20号'
  },
  {
    id: 1002,
    orderNo: 'ORD202401100002',
    items: [
      { equipmentId: 2, name: '植物标本干燥机', price: 1299, quantity: 1, image: 'https://img14.360buyimg.com/n1/jfs/t1/187654/11/26789/987654/def456ghi.jpg' }
    ],
    totalAmount: 1299,
    status: 'completed',
    createdAt: '2024-01-10T14:20:00Z',
    confirmedAt: '2024-01-12T09:15:00Z',
    buyerName: '王教授',
    buyerInstitution: '北京大学生命科学学院',
    shippingAddress: '北京市海淀区颐和园路5号'
  },
  {
    id: 1003,
    orderNo: 'ORD202401050003',
    items: [
      { equipmentId: 4, name: '便携式野外采集箱', price: 459, quantity: 1, image: 'https://img14.360buyimg.com/n1/jfs/t1/165432/22/28901/234567/jkl012mno.jpg' },
      { equipmentId: 10, name: '植物标本采集刀', price: 89, quantity: 2, image: 'https://img14.360buyimg.com/n1/jfs/t1/98876/22/34567/345678/bcd890efg.jpg' }
    ],
    totalAmount: 637,
    status: 'completed',
    createdAt: '2024-01-05T09:45:00Z',
    confirmedAt: '2024-01-07T16:30:00Z',
    buyerName: '李研究员',
    buyerInstitution: '中国科学院植物研究所',
    shippingAddress: '北京市海淀区香山南辛村20号'
  }
]
