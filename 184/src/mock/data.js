export const categories = [
  { id: 1, name: '油性漆', icon: 'Brush', count: 128, color: '#f56c6c' },
  { id: 2, name: '水性漆', icon: 'Drop', count: 96, color: '#409eff' },
  { id: 3, name: '底漆/补土', icon: 'Crop', count: 45, color: '#67c23a' },
  { id: 4, name: '光油/消光', icon: 'Sunny', count: 38, color: '#e6a23c' },
  { id: 5, name: '稀释剂', icon: 'Glass', count: 28, color: '#909399' },
  { id: 6, name: '工具耗材', icon: 'Tools', count: 67, color: '#8e44ad' },
  { id: 7, name: '喷笔配件', icon: 'Aim', count: 34, color: '#16a085' },
  { id: 8, name: '防护用品', icon: 'Warning', count: 22, color: '#c0392b' }
]

export const products = [
  {
    id: 1,
    name: '郡士油性漆 光泽白 GS1',
    categoryId: 1,
    price: 45,
    originalPrice: 55,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
      'https://img.alicdn.com/imgextra/i2/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
      'https://img.alicdn.com/imgextra/i3/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png'
    ],
    description: '高光泽度白色油性漆，适用于模型主体涂装，附着力强，漆膜饱满',
    specs: [
      { id: 1, name: '10ml', price: 45, stock: 120, capacity: '10ml' },
      { id: 2, name: '50ml', price: 180, stock: 45, capacity: '50ml' }
    ],
    parameters: [
      { label: '品牌', value: '郡士' },
      { label: '类型', value: '油性漆' },
      { label: '容量', value: '10ml/50ml' },
      { label: '光泽', value: '光泽' },
      { label: '干燥时间', value: '15-30分钟' },
      { label: '稀释比例', value: '1:1-1:2' }
    ],
    suitableModels: ['高达模型', '军模', '车模', '手办'],
    modelDetails: [
      { type: '高达模型', scale: '1/144, 1/100, 1/60', effect: '主体白色涂装，光泽度高', difficulty: '简单' },
      { type: '军模', scale: '1/35, 1/48', effect: '车辆内部、人物服饰', difficulty: '中等' },
      { type: '车模', scale: '1/24, 1/18', effect: '车身主体，镜面效果', difficulty: '中等' },
      { type: '手办', scale: '1/7, 1/8', effect: '肤色基底、服装高光', difficulty: '困难' }
    ],
    usageSteps: [
      '使用前请将漆料充分摇匀，建议摇匀1-2分钟',
      '根据需要使用郡士蓝标稀释剂稀释，建议比例1:1-1:2',
      '喷涂时保持15-20cm距离，采用薄喷多层的方式',
      '每层喷涂后等待5-10分钟再喷下一层',
      '完成后建议等待24小时完全干燥后再进行组装'
    ],
    notices: [
      '请在通风良好的环境下使用，建议佩戴防护面具',
      '远离火源，避免高温环境存放',
      '请放置在儿童无法触及的地方',
      '如不慎接触皮肤或眼睛，请立即用大量清水冲洗'
    ],
    comments: [
      { id: 1, userName: '模型达人', rating: 5, date: '2024-01-12', spec: '10ml', content: '遮盖力很强，光泽度也很好，喷涂出来的效果非常棒！', images: [] },
      { id: 2, userName: '高达爱好者', rating: 5, date: '2024-01-08', spec: '50ml', content: '大瓶装更划算，做了好几个模型还没用完，质量很稳定。', images: [] },
      { id: 3, userName: '新手小白', rating: 4, date: '2024-01-05', spec: '10ml', content: '第一次用油性漆，效果不错，就是味道有点大，记得通风。', images: [] }
    ],
    commentCount: 256,
    sales: 2356,
    rating: 4.9,
    isHot: true,
    isNew: false,
    discount: true,
    freeShipping: true,
    codAvailable: true
  },
  {
    id: 2,
    name: '田宫水性漆 消光黑 XF-1',
    categoryId: 2,
    price: 32,
    originalPrice: 38,
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i2/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
      'https://img.alicdn.com/imgextra/i3/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png'
    ],
    description: '环保水性漆，无异味，消光效果出色，适合军事模型旧化处理',
    specs: [
      { id: 1, name: '10ml', price: 32, stock: 200, capacity: '10ml' },
      { id: 2, name: '50ml', price: 128, stock: 60, capacity: '50ml' }
    ],
    parameters: [
      { label: '品牌', value: '田宫' },
      { label: '类型', value: '水性漆' },
      { label: '容量', value: '10ml/50ml' },
      { label: '光泽', value: '消光' },
      { label: '干燥时间', value: '20-40分钟' },
      { label: '稀释比例', value: '1:0.5-1:1' }
    ],
    suitableModels: ['军模', '高达模型', '场景模型'],
    modelDetails: [
      { type: '军模', scale: '1/35, 1/48, 1/72', effect: '坦克底盘、武器装备旧化', difficulty: '简单' },
      { type: '高达模型', scale: '1/144, 1/100', effect: '关节、武器、机械细节', difficulty: '简单' },
      { type: '场景模型', scale: '各种比例', effect: '地面、建筑物阴影', difficulty: '中等' }
    ],
    usageSteps: [
      '使用前请将漆料充分摇匀',
      '可直接使用或用纯净水稀释，建议比例1:0.5-1:1',
      '喷涂时保持15-20cm距离，薄喷多层',
      '每层等待20-40分钟表干后再喷下一层',
      '完全干燥需要24小时'
    ],
    notices: [
      '水性漆干燥时间较长，请耐心等待',
      '避免在低温高湿环境下使用',
      '工具使用后请立即用清水清洗',
      '请放置在儿童无法触及的地方'
    ],
    comments: [
      { id: 1, userName: '军模老手', rating: 5, date: '2024-01-10', spec: '50ml', content: '做旧化效果一流，颜色很正，水性漆也很环保。', images: [] },
      { id: 2, userName: '新手玩家', rating: 4, date: '2024-01-06', spec: '10ml', content: '第一次用水性漆，效果不错，就是干燥慢了点。', images: [] }
    ],
    commentCount: 189,
    sales: 1892,
    rating: 4.8,
    isHot: true,
    isNew: false,
    discount: true,
    freeShipping: false,
    codAvailable: true
  },
  {
    id: 3,
    name: '郡士水补土 灰色 1000号',
    categoryId: 3,
    price: 68,
    originalPrice: 78,
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i3/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
      'https://img.alicdn.com/imgextra/i4/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png'
    ],
    description: '1000号灰色水补土，填充能力强，增强漆面附着力，是模型涂装必备基底',
    specs: [
      { id: 1, name: '40ml', price: 68, stock: 80, capacity: '40ml' },
      { id: 2, name: '170ml', price: 220, stock: 25, capacity: '170ml' }
    ],
    parameters: [
      { label: '品牌', value: '郡士' },
      { label: '类型', value: '水补土' },
      { label: '目数', value: '1000号' },
      { label: '颜色', value: '灰色' },
      { label: '干燥时间', value: '30-60分钟' },
      { label: '稀释比例', value: '1:2-1:3' }
    ],
    suitableModels: ['高达模型', '军模', '车模', '手办', '树脂模型'],
    modelDetails: [
      { type: '高达模型', scale: '所有比例', effect: '统一底色，增强漆面附着力', difficulty: '简单' },
      { type: '军模', scale: '所有比例', effect: '填充打磨痕迹，统一底色', difficulty: '简单' },
      { type: '树脂模型', scale: '所有比例', effect: '封闭树脂表面，防止渗色', difficulty: '中等' },
      { type: '手办', scale: '所有比例', effect: '统一肤色基底，增强发色', difficulty: '中等' }
    ],
    usageSteps: [
      '使用前请充分摇匀2-3分钟',
      '用蓝标稀释剂稀释，比例1:2-1:3',
      '喷涂前确保模型表面清洁无油',
      '薄喷2-3层，每层间隔15-20分钟',
      '完全干燥60分钟后可进行上色'
    ],
    notices: [
      '水补土喷涂时请佩戴防毒面具',
      '稀释比例过高会影响填充效果',
      '建议在通风良好的环境下使用',
      '避免皮肤接触，如不慎接触请用肥皂水清洗'
    ],
    comments: [
      { id: 1, userName: '专业玩家', rating: 5, date: '2024-01-11', spec: '170ml', content: '做模型必备！填充能力强，附着力好，大瓶更划算。', images: [] },
      { id: 2, userName: '新手入门', rating: 5, date: '2024-01-07', spec: '40ml', content: '第一次用，效果很好，漆面明显更牢固了。', images: [] }
    ],
    commentCount: 423,
    sales: 3421,
    rating: 4.9,
    isHot: true,
    isNew: false,
    discount: true,
    freeShipping: true,
    codAvailable: true
  },
  {
    id: 4,
    name: '消光透明保护漆 B-514',
    categoryId: 4,
    price: 58,
    originalPrice: 68,
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i4/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png'
    ],
    description: '罐喷消光保护漆，使用方便，均匀细腻，有效保护漆面防止氧化',
    specs: [
      { id: 1, name: '88ml', price: 58, stock: 150, capacity: '88ml' }
    ],
    parameters: [
      { label: '品牌', value: '郡士' },
      { label: '类型', value: '保护漆' },
      { label: '容量', value: '88ml' },
      { label: '光泽', value: '消光' },
      { label: '干燥时间', value: '10-20分钟' },
      { label: '使用方式', value: '直接喷涂' }
    ],
    suitableModels: ['高达模型', '军模', '手办', '完成品保护'],
    modelDetails: [
      { type: '高达模型', scale: '所有比例', effect: '保护漆面，消除塑料光泽', difficulty: '简单' },
      { type: '军模', scale: '所有比例', effect: '统一质感，增强真实感', difficulty: '简单' },
      { type: '手办', scale: '所有比例', effect: '保护涂装，防止蹭色', difficulty: '简单' },
      { type: '完成品', scale: '所有比例', effect: '防氧化、防灰尘', difficulty: '简单' }
    ],
    usageSteps: [
      '使用前请充分摇匀1-2分钟',
      '在通风良好的环境下使用',
      '距离模型20-30cm，快速扫喷',
      '薄喷2-3层，每层间隔10分钟',
      '完全干燥24小时后再触摸'
    ],
    notices: [
      '罐喷产品使用时请注意通风',
      '避免在高温环境下使用',
      '请勿对着人或动物喷射',
      '请放置在儿童无法触及的地方'
    ],
    comments: [
      { id: 1, userName: '高达玩家', rating: 5, date: '2024-01-09', spec: '88ml', content: '消光效果非常好，喷完质感提升很多，使用也很方便。', images: [] },
      { id: 2, userName: '手办爱好者', rating: 5, date: '2024-01-05', spec: '88ml', content: '保护手办涂装必备，喷完不用担心蹭色了。', images: [] }
    ],
    commentCount: 312,
    sales: 2876,
    rating: 4.8,
    isHot: true,
    isNew: true,
    discount: true,
    freeShipping: true,
    codAvailable: false
  },
  {
    id: 5,
    name: '蓝标油性稀释剂 T-101',
    categoryId: 5,
    price: 45,
    originalPrice: 52,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png'
    ],
    description: '蓝标稀释剂，稀释力强，挥发适中，适合油性漆通用稀释',
    specs: [
      { id: 1, name: '110ml', price: 45, stock: 180, capacity: '110ml' },
      { id: 2, name: '400ml', price: 135, stock: 40, capacity: '400ml' }
    ],
    parameters: [
      { label: '品牌', value: '田宫' },
      { label: '类型', value: '稀释剂' },
      { label: '容量', value: '110ml/400ml' },
      { label: '适用', value: '油性漆' },
      { label: '挥发速度', value: '适中' },
      { label: '稀释比例', value: '根据需求调节' }
    ],
    suitableModels: ['通用油性漆稀释'],
    modelDetails: [
      { type: '通用', scale: '所有比例', effect: '稀释油性漆、珐琅漆', difficulty: '简单' }
    ],
    usageSteps: [
      '根据漆料类型调整稀释比例',
      '一般建议比例1:1-1:3',
      '充分搅拌均匀后使用',
      '使用后请及时盖紧瓶盖',
      '避免阳光直射'
    ],
    notices: [
      '易燃液体，请远离火源',
      '请在通风良好的环境下使用',
      '避免接触皮肤和眼睛',
      '请放置在儿童无法触及的地方'
    ],
    comments: [
      { id: 1, userName: '老玩家', rating: 5, date: '2024-01-08', spec: '400ml', content: '一直用这个，稀释效果很好，大瓶更划算。', images: [] }
    ],
    commentCount: 156,
    sales: 1567,
    rating: 4.7,
    isHot: false,
    isNew: false,
    discount: true,
    freeShipping: false,
    codAvailable: true
  },
  {
    id: 6,
    name: '模型剪钳 金牌锋',
    categoryId: 6,
    price: 128,
    originalPrice: 158,
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i2/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
      'https://img.alicdn.com/imgextra/i1/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png'
    ],
    description: '高碳钢刃口，剪切平整，单刃设计，是模型制作必备工具',
    specs: [
      { id: 1, name: '标准款', price: 128, stock: 60, capacity: '140mm' }
    ],
    parameters: [
      { label: '品牌', value: '金牌' },
      { label: '类型', value: '剪钳' },
      { label: '材质', value: '高碳钢' },
      { label: '刃口', value: '单刃' },
      { label: '长度', value: '140mm' },
      { label: '适用', value: '塑料模型' }
    ],
    suitableModels: ['高达模型', '军模', '拼装模型'],
    modelDetails: [
      { type: '高达模型', scale: '所有比例', effect: '剪切流道、零件', difficulty: '简单' },
      { type: '军模', scale: '所有比例', effect: '剪切细小零件', difficulty: '简单' },
      { type: '拼装模型', scale: '所有比例', effect: '通用剪切', difficulty: '简单' }
    ],
    usageSteps: [
      '使用前检查刃口是否有损坏',
      '剪切时将零件靠近刃口根部',
      '用力均匀，避免过度用力',
      '使用后清理刃口残留',
      '涂抹防锈油保护刃口'
    ],
    notices: [
      '刃口锋利，请小心使用',
      '请勿剪切金属零件',
      '请放置在儿童无法触及的地方',
      '定期保养，延长使用寿命'
    ],
    comments: [
      { id: 1, userName: '模型新手', rating: 5, date: '2024-01-10', spec: '标准款', content: '剪水口非常干净，几乎不用打磨，太好用了！', images: [] },
      { id: 2, userName: '资深玩家', rating: 5, date: '2024-01-06', spec: '标准款', content: '用了很多年了，质量一直很稳定，值得购买。', images: [] }
    ],
    commentCount: 567,
    sales: 4521,
    rating: 4.9,
    isHot: true,
    isNew: false,
    discount: true,
    freeShipping: true,
    codAvailable: true
  },
  {
    id: 7,
    name: 'HD-130喷笔 0.3mm',
    categoryId: 7,
    price: 268,
    originalPrice: 328,
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i3/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
      'https://img.alicdn.com/imgextra/i4/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png'
    ],
    description: '0.3mm口径喷笔，雾化细腻，调节精准，适合大面积喷涂和细节描绘',
    specs: [
      { id: 1, name: '0.3mm', price: 268, stock: 35, capacity: '0.3mm口径' },
      { id: 2, name: '0.5mm', price: 288, stock: 20, capacity: '0.5mm口径' }
    ],
    parameters: [
      { label: '品牌', value: 'HD' },
      { label: '类型', value: '喷笔' },
      { label: '口径', value: '0.3mm/0.5mm' },
      { label: '料壶', value: '7cc' },
      { label: '工作气压', value: '15-50PSI' },
      { label: '调节', value: '双动' }
    ],
    suitableModels: ['高达模型', '军模', '车模', '手办涂装'],
    modelDetails: [
      { type: '高达模型', scale: '所有比例', effect: '大面积喷涂、阴影渐变', difficulty: '中等' },
      { type: '军模', scale: '所有比例', effect: '迷彩涂装、旧化效果', difficulty: '中等' },
      { type: '手办', scale: '所有比例', effect: '肤色渐变、细节涂装', difficulty: '困难' },
      { type: '车模', scale: '所有比例', effect: '车身喷涂、镜面效果', difficulty: '困难' }
    ],
    usageSteps: [
      '连接气泵，调整气压至15-30PSI',
      '倒入稀释好的漆料，建议不超过料壶容量的2/3',
      '先在废纸上测试喷涂效果',
      '喷涂时保持15-20cm距离，均匀移动',
      '使用后及时用稀释剂清洗喷笔'
    ],
    notices: [
      '首次使用请仔细阅读说明书',
      '使用后必须彻底清洗，防止堵塞',
      '请佩戴防护装备',
      '避免摔碰，保护精密部件'
    ],
    comments: [
      { id: 1, userName: '喷涂爱好者', rating: 5, date: '2024-01-09', spec: '0.3mm', content: '雾化效果很好，新手也容易上手，性价比很高！', images: [] },
      { id: 2, userName: '专业玩家', rating: 4, date: '2024-01-05', spec: '0.5mm', content: '大面积喷涂效率很高，小面积建议用0.3mm。', images: [] }
    ],
    commentCount: 234,
    sales: 1234,
    rating: 4.8,
    isHot: false,
    isNew: true,
    discount: true,
    freeShipping: true,
    codAvailable: false
  },
  {
    id: 8,
    name: '防毒面具 3M 6200',
    categoryId: 8,
    price: 198,
    originalPrice: 238,
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    images: [
      'https://img.alicdn.com/imgextra/i4/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
      'https://img.alicdn.com/imgextra/i1/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png'
    ],
    description: '专业级防毒面具，有效过滤有机蒸汽，保护喷涂时的呼吸系统',
    specs: [
      { id: 1, name: '标准套装', price: 198, stock: 100, capacity: '含2个滤毒盒' }
    ],
    parameters: [
      { label: '品牌', value: '3M' },
      { label: '类型', value: '防毒面具' },
      { label: '型号', value: '6200' },
      { label: '过滤', value: '有机蒸汽' },
      { label: '材质', value: '橡胶' },
      { label: '配件', value: '含2个滤毒盒' }
    ],
    suitableModels: ['喷涂防护必备'],
    modelDetails: [
      { type: '通用', scale: '所有模型喷涂', effect: '防护有机蒸汽、漆雾', difficulty: '简单' }
    ],
    usageSteps: [
      '检查面具是否有损坏',
      '安装滤毒盒并确保密封',
      '调整头带至舒适位置',
      '进行气密性测试',
      '使用后及时更换滤毒盒'
    ],
    notices: [
      '滤毒盒需定期更换',
      '请勿在氧气不足环境使用',
      '使用后请妥善存放',
      '请选择合适的尺寸'
    ],
    comments: [
      { id: 1, userName: '健康第一', rating: 5, date: '2024-01-08', spec: '标准套装', content: '做喷涂必备！密封性很好，再也不怕油漆味了。', images: [] }
    ],
    commentCount: 145,
    sales: 876,
    rating: 4.9,
    isHot: false,
    isNew: false,
    discount: true,
    freeShipping: true,
    codAvailable: false
  }
]

export const bundleDeals = [
  {
    id: 1,
    name: '高达入门涂装套装',
    price: 198,
    originalPrice: 256,
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    description: '包含基础色5瓶+水补土+工具套装，适合新手入门',
    products: [1, 2, 3],
    sales: 567,
    rating: 4.8
  },
  {
    id: 2,
    name: '军事模型进阶套装',
    price: 368,
    originalPrice: 458,
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    description: '军模专用色12瓶+旧化工具套装，专业玩家首选',
    products: [2, 3, 4, 5],
    sales: 345,
    rating: 4.9
  },
  {
    id: 3,
    name: '喷涂专业工具套装',
    price: 598,
    originalPrice: 728,
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    description: '喷笔+气泵+防护套装，一步到位的专业选择',
    products: [6, 7, 8],
    sales: 234,
    rating: 4.9
  }
]

export const colorSchemes = [
  {
    id: 1,
    name: 'RX-78-2 元祖高达配色',
    series: '高达UC',
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    colors: [
      { name: '主体白', code: 'GS1', hex: '#FFFFFF' },
      { name: '框架蓝', code: 'GS5', hex: '#1E40AF' },
      { name: '装甲红', code: 'GS3', hex: '#DC2626' },
      { name: '关节灰', code: 'GS36', hex: '#6B7280' },
      { name: '眼部黄', code: 'GS12', hex: '#FCD34D' }
    ]
  },
  {
    id: 2,
    name: '扎古II 量产型配色',
    series: '高达UC',
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    colors: [
      { name: '主体绿', code: 'GS14', hex: '#15803D' },
      { name: '装甲深绿', code: 'GS15', hex: '#166534' },
      { name: '独眼红', code: 'GS3', hex: '#DC2626' },
      { name: '管线黑', code: 'GS2', hex: '#000000' },
      { name: '武器灰', code: 'GS37', hex: '#4B5563' }
    ]
  },
  {
    id: 3,
    name: '虎式坦克 沙漠涂装',
    series: '军事模型',
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01k3Yp7b1wz8szzzzzz_!!6000000006314-2-tps-800-800.png',
    colors: [
      { name: '沙漠黄', code: 'XF-59', hex: '#D4A574' },
      { name: '迷彩棕', code: 'XF-64', hex: '#8B5A2B' },
      { name: '履带黑', code: 'XF-1', hex: '#000000' },
      { name: '旧化棕', code: 'XF-68', hex: '#654321' },
      { name: '高光沙', code: 'XF-57', hex: '#E8D5B7' }
    ]
  }
]

export const users = [
  {
    id: 1,
    username: 'buyer001',
    password: '123456',
    role: 'buyer',
    nickname: '模型爱好者小王',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13800138001',
    email: 'buyer@example.com',
    address: '北京市朝阳区模型街123号'
  },
  {
    id: 2,
    username: 'supplier001',
    password: '123456',
    role: 'supplier',
    nickname: '郡士官方旗舰店',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    phone: '13800138002',
    email: 'supplier@example.com',
    company: '郡士模型用品有限公司',
    license: '京ICP备12345678号'
  }
]

export const orders = [
  {
    id: 'ORD202401150001',
    createTime: '2024-01-15 14:30:25',
    status: 'delivered',
    statusText: '已完成',
    totalAmount: 356,
    products: [
      { productId: 1, specId: 1, name: '郡士油性漆 光泽白 GS1', specName: '10ml', price: 45, quantity: 2, image: '' },
      { productId: 3, specId: 1, name: '郡士水补土 灰色 1000号', specName: '40ml', price: 68, quantity: 1, image: '' },
      { productId: 6, specId: 1, name: '模型剪钳 金牌锋', specName: '标准款', price: 128, quantity: 1, image: '' }
    ],
    address: '北京市朝阳区模型街123号 小王 13800138001'
  },
  {
    id: 'ORD202401100002',
    createTime: '2024-01-10 09:15:33',
    status: 'shipping',
    statusText: '配送中',
    totalAmount: 180,
    products: [
      { productId: 2, specId: 1, name: '田宫水性漆 消光黑 XF-1', specName: '10ml', price: 32, quantity: 3, image: '' },
      { productId: 5, specId: 1, name: '蓝标油性稀释剂 T-101', specName: '110ml', price: 45, quantity: 1, image: '' }
    ],
    address: '北京市朝阳区模型街123号 小王 13800138001'
  },
  {
    id: 'ORD202401050003',
    createTime: '2024-01-05 16:45:12',
    status: 'pending',
    statusText: '待发货',
    totalAmount: 268,
    products: [
      { productId: 7, specId: 1, name: 'HD-130喷笔 0.3mm', specName: '0.3mm', price: 268, quantity: 1, image: '' }
    ],
    address: '北京市朝阳区模型街123号 小王 13800138001'
  }
]

export const favorites = [1, 3, 4, 6]
