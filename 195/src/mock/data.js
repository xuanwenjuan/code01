export const categories = [
  { id: 1, name: '雕刻刀', icon: '🔪', description: '各类精雕、浮雕专用刀具' },
  { id: 2, name: '木凿', icon: '⚒️', description: '平凿、圆凿、斜凿等' },
  { id: 3, name: '木锉', icon: '🔧', description: '粗齿、细齿、什锦锉' },
  { id: 4, name: '锯子', icon: '🪚', description: '手锯、钢丝锯、曲线锯' },
  { id: 5, name: '刨子', icon: '🪓', description: '平刨、槽刨、边刨' },
  { id: 6, name: '辅助工具', icon: '🛠️', description: '测量、固定、打磨工具' }
]

export const tools = [
  {
    id: 1,
    name: '东阳精雕刀套装',
    categoryId: 1,
    type: 'fine',
    price: 368,
    originalPrice: 498,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20wood%20carving%20tools%20set%20on%20wooden%20table%20warm%20light&image_size=square_hd',
    description: '精选白钢材质，12件套精雕刀，适合精细浮雕',
    material: '高速白钢',
    materialComposition: {
      main: '高碳铬钼合金钢',
      elements: ['碳(C): 1.2%', '铬(Cr): 4.5%', '钼(Mo): 0.5%', '钒(V): 0.2%', '锰(Mn): 0.4%'],
      handle: '精选硬木手柄'
    },
    hardness: 'HRC62-65',
    wearResistance: '优秀',
    specifications: ['平刀3mm', '平刀6mm', '圆刀4mm', '圆刀8mm', '斜刀5mm', '三角刀3mm'],
    applicableWoodTypes: ['红木', '紫檀木', '黄花梨', '酸枝木', '楠木', '黄杨木'],
    craftAdaptation: [
      { craft: '浮雕工艺', level: '极佳', desc: '适合深浅层次的精细浮雕雕刻' },
      { craft: '人物雕刻', level: '极佳', desc: '特别适合人物面部表情、发丝等细节处理' },
      { craft: '花鸟虫鱼', level: '极佳', desc: '花瓣纹理、羽毛纹理精细刻画' },
      { craft: '镂空雕刻', level: '优秀', desc: '适合小件工艺品的镂空透雕' }
    ],
    applicableScenes: ['精细浮雕', '人物开脸', '花鸟虫鱼', '红木小件'],
    maintenanceGuide: {
      daily: ['使用后用软布擦拭干净，去除木屑和树脂', '涂抹薄层防锈油，置于干燥通风处'],
      sharpening: ['建议使用天然油石磨刀，保持30度角', '每次磨刀后需抛光处理刀刃'],
      storage: ['长期存放需涂抹防锈油脂', '用防潮纸包裹后放置于工具箱内'],
      attention: ['禁止用于金属、石材等硬物雕刻', '避免刀刃直接磕碰硬物']
    },
    stock: 156,
    sales: 2341,
    rating: 4.9,
    supplier: '东阳匠艺工具厂'
  },
  {
    id: 2,
    name: '专业木雕凿子套装',
    categoryId: 2,
    type: 'rough',
    price: 258,
    originalPrice: 358,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20wood%20carving%20chisels%20set%20on%20workbench&image_size=square_hd',
    description: '铬钒合金钢材质，8件套凿子，适合粗加工打坯',
    material: '铬钒合金钢',
    materialComposition: {
      main: '铬钒合金钢(CR-V)',
      elements: ['碳(C): 0.85%', '铬(Cr): 0.75%', '钒(V): 0.15%', '锰(Mn): 0.45%', '硅(Si): 0.25%'],
      handle: '榉木手柄，加装铁箍防止开裂'
    },
    hardness: 'HRC58-61',
    wearResistance: '良好',
    specifications: ['平凿6mm', '平凿12mm', '平凿20mm', '圆凿8mm', '圆凿15mm', '斜凿10mm'],
    applicableWoodTypes: ['松木', '杨木', '榆木', '榉木', '橡木', '胡桃木'],
    craftAdaptation: [
      { craft: '打坯出胚', level: '极佳', desc: '高效去除多余木料，快速成型' },
      { craft: '大型木雕', level: '极佳', desc: '大型佛像、人物雕塑的粗加工' },
      { craft: '实木家具', level: '优秀', desc: '传统榫卯结构制作' },
      { craft: '建筑雕刻', level: '优秀', desc: '古建筑构件、装饰雕刻' }
    ],
    applicableScenes: ['打坯出胚', '大型木雕', '实木家具', '建筑雕刻'],
    maintenanceGuide: {
      daily: ['使用后清理木屑，保持凿刃清洁', '手柄如有松动及时加固铁箍'],
      sharpening: ['粗磨用砂轮，精磨用油石', '保持凿刃角度平凿25度，圆凿随弧'],
      storage: ['凿刃朝上放置，避免磕碰', '长期不用需涂抹防锈油'],
      attention: ['禁止用凿子撬动硬物', '禁止敲击凿柄尾部(除专用铁箍款)']
    },
    stock: 89,
    sales: 1567,
    rating: 4.8,
    supplier: '山东匠工五金'
  },
  {
    id: 3,
    name: '红木专用锉刀组',
    categoryId: 3,
    type: 'fine',
    price: 128,
    originalPrice: 168,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wood%20rasp%20files%20set%20for%20redwood%20carving&image_size=square_hd',
    description: '高碳钢材质，10件套什锦锉，精细打磨必备',
    material: 'T12高碳钢',
    materialComposition: {
      main: 'T12碳素工具钢',
      elements: ['碳(C): 1.2%', '锰(Mn): 0.35%', '硅(Si): 0.3%', '硫(S): ≤0.03%', '磷(P): ≤0.03%'],
      handle: '橡塑防滑手柄'
    },
    hardness: 'HRC60-63',
    wearResistance: '优秀',
    specifications: ['平锉', '圆锉', '半圆锉', '三角锉', '方锉', '刀形锉'],
    applicableWoodTypes: ['红木', '紫檀', '酸枝', '鸡翅木', '花梨木', '黑檀'],
    craftAdaptation: [
      { craft: '精细打磨', level: '极佳', desc: '红木表面精细打磨抛光' },
      { craft: '曲面修整', level: '极佳', desc: '圆弧、曲面的修整打磨' },
      { craft: '凹槽清理', level: '优秀', desc: '雕刻凹槽内部的打磨清理' },
      { craft: '细节处理', level: '极佳', desc: '边角、纹路等细节部位打磨' }
    ],
    applicableScenes: ['精细打磨', '曲面修整', '凹槽清理', '细节处理'],
    maintenanceGuide: {
      daily: ['使用后用铜丝刷清理齿间木屑', '涂抹防锈油，防止生锈'],
      sharpening: ['锉刀不建议打磨锉齿，变钝后建议更换', '切忌用锉刀锉削金属'],
      storage: ['悬挂存放，避免齿面磕碰', '干燥环境存放，防止生锈'],
      attention: ['禁止用普通锉刀锉削淬火钢材', '禁止锉刀沾水后不处理直接存放']
    },
    stock: 234,
    sales: 3456,
    rating: 4.7,
    supplier: '上海精工锉具'
  },
  {
    id: 4,
    name: '手工木雕锯',
    categoryId: 4,
    type: 'rough',
    price: 89,
    originalPrice: 128,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hand%20wood%20carving%20saw%20with%20wooden%20handle&image_size=square_hd',
    description: '日式手锯，细齿设计，切割流畅',
    material: 'SK5碳素钢',
    materialComposition: {
      main: 'SK5高级碳素工具钢',
      elements: ['碳(C): 0.85%', '锰(Mn): 0.5%', '硅(Si): 0.35%', '硫(S): ≤0.03%', '磷(P): ≤0.03%'],
      handle: '榉木三铆钉固定手柄'
    },
    hardness: 'HRC59-62',
    wearResistance: '良好',
    specifications: ['锯片长度200mm', '齿距1.5mm', '硬木手柄'],
    applicableWoodTypes: ['松木', '杉木', '杨木', '榆木', '榉木', '樟木'],
    craftAdaptation: [
      { craft: '木料切割', level: '极佳', desc: '各种木料的快速切割下料' },
      { craft: '轮廓下料', level: '极佳', desc: '雕刻作品轮廓的精确下料' },
      { craft: '异形切割', level: '优秀', desc: '曲线、异形木料的切割' },
      { craft: '拼接准备', level: '优秀', desc: '木料拼接前的接口切割' }
    ],
    applicableScenes: ['木料切割', '轮廓下料', '异形切割', '拼接准备'],
    maintenanceGuide: {
      daily: ['使用后清理锯齿间的木屑', '涂抹防锈油，防止生锈'],
      sharpening: ['用专用锉刀顺齿形修磨', '保持锯齿角度一致'],
      storage: ['悬挂存放，避免锯齿受压变形', '干燥环境存放'],
      attention: ['禁止锯切金属、石材等硬物', '避免用力过猛导致锯片折断']
    },
    stock: 178,
    sales: 892,
    rating: 4.6,
    supplier: '苏州刃具厂'
  },
  {
    id: 5,
    name: '欧式木工刨',
    categoryId: 5,
    type: 'rough',
    price: 198,
    originalPrice: 268,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=european%20style%20wood%20hand%20plane%20tool&image_size=square_hd',
    description: '铸铁机身，精密调节，表面平整',
    material: '铸铁机身+高速钢刀片',
    materialComposition: {
      body: '灰口铸铁',
      blade: 'M2高速钢',
      elements: ['碳(C): 0.85%', '钨(W): 6.0%', '钼(Mo): 5.0%', '铬(Cr): 4.0%', '钒(V): 2.0%'],
      handle: '榉木手柄'
    },
    hardness: 'HRC61-64',
    wearResistance: '优秀',
    specifications: ['刨身长度250mm', '刨刀宽度50mm', '深度调节精度0.1mm'],
    applicableWoodTypes: ['松木', '杉木', '榆木', '榉木', '橡木', '水曲柳'],
    craftAdaptation: [
      { craft: '木料找平', level: '极佳', desc: '大面积木料的平面找平' },
      { craft: '表面刨光', level: '极佳', desc: '木料表面精细刨光处理' },
      { craft: '榫卯制作', level: '优秀', desc: '传统榫卯结构的精密制作' },
      { craft: '家具制作', level: '优秀', desc: '实木家具各部件的加工' }
    ],
    applicableScenes: ['木料找平', '表面刨光', '榫卯制作', '家具制作'],
    maintenanceGuide: {
      daily: ['使用后清理刨花，保持刨床清洁', '检查刨刃锋利度，及时打磨'],
      sharpening: ['用油石打磨刨刃，保持30度角', '打磨后需抛光处理'],
      storage: ['刨刃朝上放置，避免磕碰', '长期存放需涂抹防锈油'],
      attention: ['禁止刨削带钉子的木料', '避免刨削过硬或有节疤的木料']
    },
    stock: 67,
    sales: 567,
    rating: 4.8,
    supplier: '青岛木工机械厂'
  },
  {
    id: 6,
    name: '微雕工具套装',
    categoryId: 1,
    type: 'fine',
    price: 588,
    originalPrice: 788,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=micro%20wood%20carving%20tools%20set%20with%20magnifying%20glass&image_size=square_hd',
    description: '橄榄核、核桃专用微雕工具，16件套',
    material: '进口白钢',
    materialComposition: {
      main: '进口高合金白钢',
      elements: ['碳(C): 1.35%', '铬(Cr): 5.0%', '钼(Mo): 1.0%', '钒(V): 0.5%', '钴(Co): 0.5%'],
      handle: '精选花梨木手柄'
    },
    hardness: 'HRC63-66',
    wearResistance: '极佳',
    specifications: ['平刀0.5mm', '平刀1mm', '圆刀0.8mm', '勾刀', '刮片', '放大镜'],
    applicableWoodTypes: ['橄榄核', '核桃', '象牙果', '红木小料', '黄杨木', '檀香木'],
    craftAdaptation: [
      { craft: '橄榄核雕', level: '极佳', desc: '橄榄核精细雕刻，人物、花鸟微雕' },
      { craft: '核桃雕刻', level: '极佳', desc: '核桃表面精细纹路雕刻' },
      { craft: '印章雕刻', level: '优秀', desc: '木质印章的精细篆刻' },
      { craft: '精细微雕', level: '极佳', desc: '毫米级精细微雕作品' }
    ],
    applicableScenes: ['橄榄核雕', '核桃雕刻', '印章雕刻', '精细微雕'],
    maintenanceGuide: {
      daily: ['使用后用软毛刷清理刀刃', '涂抹薄层防锈油'],
      sharpening: ['必须使用天然细油石磨刀', '保持刀刃角度，避免磨坏刀尖'],
      storage: ['放入专用工具盒，避免磕碰', '干燥环境存放，防止生锈'],
      attention: ['禁止用于硬度过高的材料', '刀尖极易折断，使用时需格外小心']
    },
    stock: 45,
    sales: 234,
    rating: 4.9,
    supplier: '苏州微雕工具社'
  },
  {
    id: 7,
    name: '木雕打磨机',
    categoryId: 6,
    type: 'fine',
    price: 458,
    originalPrice: 598,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=electric%20wood%20carving%20polisher%20machine&image_size=square_hd',
    description: '无级调速，多种磨头，高效打磨',
    material: '工程塑料+金属配件',
    materialComposition: {
      body: 'ABS工程塑料',
      motor: '纯铜电机',
      accessories: '金刚石磨头、砂轮磨头、羊毛轮',
      powerCord: '纯铜芯电源线'
    },
    hardness: '-',
    wearResistance: '良好',
    specifications: ['功率300W', '转速8000-30000rpm', '配10种磨头'],
    applicableWoodTypes: ['所有木质材料', '红木', '松木', '榆木', '榉木', '胡桃木'],
    craftAdaptation: [
      { craft: '表面打磨', level: '极佳', desc: '大面积木料快速打磨平整' },
      { craft: '抛光处理', level: '极佳', desc: '木雕作品表面精细抛光' },
      { craft: '凹槽清理', level: '优秀', desc: '雕刻凹槽内部打磨清理' },
      { craft: '快速成型', level: '优秀', desc: '木雕作品快速粗加工成型' }
    ],
    applicableScenes: ['表面打磨', '抛光处理', '凹槽清理', '快速成型'],
    maintenanceGuide: {
      daily: ['使用后清理磨头和机身上的木屑', '检查电源线是否有破损'],
      maintenance: ['定期给电机轴承加注润滑油', '碳刷磨损后及时更换'],
      storage: ['清理干净后放入工具箱', '干燥通风处存放，避免潮湿'],
      attention: ['严禁在潮湿环境中使用', '长时间使用需停机散热', '更换磨头必须断电']
    },
    stock: 123,
    sales: 1234,
    rating: 4.7,
    supplier: '永康电动工具厂'
  },
  {
    id: 8,
    name: '木工夹具套装',
    categoryId: 6,
    type: 'rough',
    price: 168,
    originalPrice: 218,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=woodworking%20clamps%20set%20on%20workbench&image_size=square_hd',
    description: '快速夹紧，力度可调，固定必备',
    material: '铝合金+尼龙',
    materialComposition: {
      body: '航空级铝合金',
      screw: '45号钢',
      clampPad: '增强尼龙',
      handle: '防滑橡塑'
    },
    hardness: '-',
    wearResistance: '良好',
    specifications: ['6寸夹2个', '12寸夹2个', 'F型夹2个'],
    applicableWoodTypes: ['所有木质材料', '实木', '板材', '集成材'],
    craftAdaptation: [
      { craft: '木料固定', level: '极佳', desc: '雕刻时稳固固定木料' },
      { craft: '拼接夹紧', level: '极佳', desc: '木料拼接时加压固定' },
      { craft: '装配定位', level: '优秀', desc: '家具装配时定位固定' },
      { craft: '粘接加压', level: '优秀', desc: '木材粘接时均匀加压' }
    ],
    applicableScenes: ['木料固定', '拼接夹紧', '装配定位', '粘接加压'],
    maintenanceGuide: {
      daily: ['使用后清理夹具上的胶水和木屑', '给丝杆涂抹润滑脂'],
      maintenance: ['定期检查丝杆是否顺畅', '夹垫磨损后可更换'],
      storage: ['清理干净后存放于干燥处', '避免受压变形'],
      attention: ['禁止超出最大夹紧力使用', '禁止用重物敲击夹具']
    },
    stock: 200,
    sales: 789,
    rating: 4.5,
    supplier: '浙江夹具厂'
  }
]

export const packages = [
  {
    id: 1,
    name: '入门木雕套餐',
    price: 299,
    originalPrice: 426,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beginner%20wood%20carving%20starter%20kit%20package&image_size=square_hd',
    description: '适合零基础木雕爱好者入门学习',
    tools: [1, 3, 4],
    bonus: '赠送木雕教程视频+练习木料',
    sales: 5678
  },
  {
    id: 2,
    name: '进阶精雕套餐',
    price: 688,
    originalPrice: 896,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=advanced%20wood%20carving%20professional%20tools%20set&image_size=square_hd',
    description: '适合有一定基础的木雕爱好者',
    tools: [1, 3, 6, 7],
    bonus: '赠送磨刀石+保养油+高级教程',
    sales: 2345
  },
  {
    id: 3,
    name: '专业大师套餐',
    price: 1288,
    originalPrice: 1680,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20master%20wood%20carving%20complete%20tool%20kit&image_size=square_hd',
    description: '专业木雕师全套装备，一步到位',
    tools: [1, 2, 3, 5, 6, 7],
    bonus: '赠送工具箱+终身维护+大师直播课',
    sales: 892
  },
  {
    id: 4,
    name: '家具制作套餐',
    price: 598,
    originalPrice: 782,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wooden%20furniture%20making%20tools%20set&image_size=square_hd',
    description: '传统实木家具制作专用工具组',
    tools: [2, 4, 5, 8],
    bonus: '赠送榫卯教程+测量工具套装',
    sales: 1234
  }
]

export const users = [
  {
    id: 1,
    username: 'buyer001',
    password: '123456',
    name: '张三木雕坊',
    role: 'buyer',
    phone: '13800138001',
    email: 'buyer@wood.com',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20traditional%20wood%20carving%20craftsman%20avatar&image_size=square',
    address: '浙江省东阳市木雕产业园'
  },
  {
    id: 2,
    username: 'supplier001',
    password: '123456',
    name: '东阳匠艺工具厂',
    role: 'supplier',
    phone: '13900139001',
    email: 'supplier@wood.com',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20traditional%20tool%20factory%20logo&image_size=square',
    address: '浙江省东阳市经济开发区'
  }
]

export const orders = [
  {
    id: 'ORD202401001',
    createTime: '2024-01-15 14:30:25',
    status: 'completed',
    totalAmount: 368,
    items: [
      { toolId: 1, toolName: '东阳精雕刀套装', price: 368, quantity: 1 }
    ],
    buyer: '张三木雕坊',
    supplier: '东阳匠艺工具厂'
  },
  {
    id: 'ORD202401002',
    createTime: '2024-01-18 10:15:33',
    status: 'shipped',
    totalAmount: 456,
    items: [
      { toolId: 3, toolName: '红木专用锉刀组', price: 128, quantity: 2 },
      { toolId: 4, toolName: '手工木雕锯', price: 89, quantity: 2 }
    ],
    buyer: '张三木雕坊',
    supplier: '上海精工锉具'
  },
  {
    id: 'ORD202401003',
    createTime: '2024-01-20 16:45:12',
    status: 'pending',
    totalAmount: 1288,
    items: [
      { toolId: 3, toolName: '专业大师套餐', price: 1288, quantity: 1 }
    ],
    buyer: '李四木雕工作室',
    supplier: '综合供应商'
  },
  {
    id: 'ORD202401004',
    createTime: '2024-01-22 09:20:45',
    status: 'completed',
    totalAmount: 688,
    items: [
      { toolId: 2, toolName: '进阶精雕套餐', price: 688, quantity: 1 }
    ],
    buyer: '王五工艺坊',
    supplier: '综合供应商'
  }
]

export const favorites = [1, 3, 6, 7]
