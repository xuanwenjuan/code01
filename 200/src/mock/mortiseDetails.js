export const mortiseDetails = {
  1: {
    id: 1,
    name: '燕尾榫',
    englishName: 'Dovetail Joint',
    category: 'classic',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20dovetail%20mortise%20tenon%20joint%20wood%20craft&image_size=landscape_16_9',
    description: '燕尾榫是中国传统木工技艺中最具代表性的榫卯结构，被誉为"万榫之母"。其形如燕尾，榫头呈梯形，与卯眼紧密咬合，具有极强的抗拉能力。',
    history: '燕尾榫的历史可追溯至新石器时代，河姆渡文化遗址中就发现了早期燕尾榫的应用。历经数千年发展，技艺日趋精湛。',
    application: '广泛应用于抽屉、箱子、柜子等需要强力连接的家具部位，是传统红木家具中不可或缺的结构。',
    difficulty: 5,
    views: 12580,
    likes: 3240,
    collects: 1890,
    createdAt: '2024-01-15',
    structureParts: [
      { name: '榫头', description: '梯形凸出部分，角度通常在15°-20°之间' },
      { name: '卯眼', description: '与榫头对应的凹槽，精确匹配榫头角度' },
      { name: '肩台', description: '榫头根部的平台，保证结合面平整' },
      { name: '榫颊', description: '榫头的侧面，提供主要的摩擦力' }
    ],
    makingSteps: [
      { step: 1, title: '设计放样', description: '根据木材尺寸和受力要求，精确绘制燕尾榫的形状和角度' },
      { step: 2, title: '开榫', description: '使用榫卯锯或带锯，按照放样线切割出榫头形状' },
      { step: 3, title: '凿卯', description: '使用凿子手工凿出与榫头匹配的卯眼' },
      { step: 4, title: '试拼', description: '将榫头和卯眼进行试拼，检查配合精度' },
      { step: 5, title: '修整', description: '根据试拼结果，微调榫头或卯眼，确保严丝合缝' },
      { step: 6, title: '组装', description: '涂抹粘合剂后进行最终组装，夹紧固定至胶干' }
    ],
    tools: ['木工凿', '榫卯锯', '角尺', '划线器', '木槌', '打磨机'],
    materials: ['硬木（红木、花梨木、鸡翅木等）', '木工粘合剂', '砂纸'],
    videos: [
      { title: '燕尾榫制作全过程', duration: '15:32', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20thumbnail%20dovetail%20joint%20making%20tutorial&image_size=square' },
      { title: '燕尾榫角度计算方法', duration: '08:45', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20thumbnail%20dovetail%20angle%20calculation&image_size=square' }
    ],
    designerId: 1,
    tags: ['经典', '家具', '入门']
  },
  2: {
    id: 2,
    name: '格肩榫',
    englishName: 'Mitered Mortise and Tenon',
    category: 'classic',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20gejian%20mortise%20tenon%20joint%20woodwork&image_size=landscape_16_9',
    description: '格肩榫是一种常用于框架结构的榫卯，特点是榫头肩部呈45度斜角，组装后表面美观无缝。',
    history: '格肩榫始于唐宋，成熟于明清，是明式家具框架结构的典型代表。',
    application: '主要用于桌椅框架、门框、窗框等部位的横竖材连接。',
    difficulty: 4,
    views: 8920,
    likes: 2150,
    collects: 1230,
    createdAt: '2024-02-20',
    structureParts: [
      { name: '榫头', description: '端部的凸出部分' },
      { name: '格肩', description: '榫头两侧45度斜角' },
      { name: '卯眼', description: '横向构件上的开孔' },
      { name: '斜肩', description: '与格肩配合的斜面' }
    ],
    makingSteps: [
      { step: 1, title: '下料', description: '根据设计尺寸截取所需木料' },
      { step: 2, title: '开榫', description: '切割出榫头和格肩' },
      { step: 3, title: '凿卯', description: '在对应位置凿出卯眼' },
      { step: 4, title: '试装', description: '检查配合情况，确保斜肩密合' },
      { step: 5, title: '组装', description: '施胶组装并夹紧固定' }
    ],
    tools: ['木工凿', '手锯', '角尺', '划线器', '夹具'],
    materials: ['硬木', '木工胶', '砂纸'],
    videos: [
      { title: '格肩榫制作教程', duration: '12:18', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20thumbnail%20mitered%20mortise%20tenon%20tutorial&image_size=square' }
    ],
    designerId: 2,
    tags: ['经典', '框架']
  },
  3: {
    id: 3,
    name: '霸王枨',
    englishName: 'Overarm Tenon',
    category: 'classic',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20bawangcheng%20mortise%20tenon%20table%20joint&image_size=landscape_16_9',
    description: '霸王枨是古代工匠为解决桌案承重问题而发明的精妙结构，无需钉子即可使桌子稳固承重。',
    history: '霸王枨出现于宋代，明清时期达到顶峰，是中国古代力学智慧的杰出代表。',
    application: '广泛应用于方桌、画案等家具，连接桌面与腿足，分散承重。',
    difficulty: 5,
    views: 15680,
    likes: 4320,
    collects: 2560,
    createdAt: '2024-01-08',
    structureParts: [
      { name: '枨杆', description: '连接腿足的斜向杆件' },
      { name: '上端榫', description: '与桌面牙板连接的榫头' },
      { name: '下端榫', description: '与腿足连接的榫头' },
      { name: '托角', description: '枨杆与腿足交接处的装饰' }
    ],
    makingSteps: [
      { step: 1, title: '设计计算', description: '根据桌子尺寸计算枨杆的角度和长度' },
      { step: 2, title: '制作枨杆', description: '刨制枨杆并制作两端榫头' },
      { step: 3, title: '凿卯', description: '在牙板和腿足上凿出对应卯眼' },
      { step: 4, title: '试装', description: '预组装检查各部位配合' },
      { step: 5, title: '总装', description: '施胶组装，确保整体稳固' }
    ],
    tools: ['木工刨', '凿子', '锯', '角尺', '划线器'],
    materials: ['硬木', '木工胶'],
    videos: [
      { title: '霸王枨结构解析', duration: '18:45', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20thumbnail%20overarm%20tenon%20structure%20analysis&image_size=square' },
      { title: '霸王枨制作演示', duration: '22:10', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20thumbnail%20overarm%20tenon%20making%20demonstration&image_size=square' }
    ],
    designerId: 1,
    tags: ['经典', '桌案']
  },
  5: {
    id: 5,
    name: '模块化榫卯',
    englishName: 'Modular Mortise and Tenon',
    category: 'innovative',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20modular%20mortise%20tenon%20joint%20system%20design&image_size=landscape_16_9',
    description: '基于传统榫卯原理设计的现代模块化连接系统，可实现快速拆装和重复使用。',
    history: '模块化榫卯是近年来随着可持续设计理念发展起来的新型结构，融合了传统智慧与现代设计思维。',
    application: '适用于装配式家具、展览搭建、临时建筑等领域，符合循环经济理念。',
    difficulty: 3,
    views: 18920,
    likes: 5680,
    collects: 3420,
    createdAt: '2024-03-10',
    structureParts: [
      { name: '公模块', description: '带榫头的标准化模块' },
      { name: '母模块', description: '带卯眼的标准化模块' },
      { name: '锁定销', description: '可选的快速锁定装置' },
      { name: '密封垫', description: '减少摩擦和噪音的缓冲垫' }
    ],
    makingSteps: [
      { step: 1, title: '模块设计', description: '设计标准化的模块尺寸和接口' },
      { step: 2, title: '数控加工', description: '使用CNC设备批量生产模块' },
      { step: 3, title: '表面处理', description: '进行打磨、上漆等表面处理' },
      { step: 4, title: '组装测试', description: '测试模块间的连接可靠性' },
      { step: 5, title: '迭代优化', description: '根据测试结果优化设计' }
    ],
    tools: ['CNC加工中心', '3D打印机（原型）', '打磨设备'],
    materials: ['实木或胶合板', '环保粘合剂', '可选：铝合金连接件'],
    videos: [
      { title: '模块化榫卯系统介绍', duration: '10:25', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20thumbnail%20modular%20mortise%20tenon%20system%20introduction&image_size=square' }
    ],
    designerId: 4,
    tags: ['创新', '模块化', '现代']
  },
  10: {
    id: 10,
    name: '斗拱榫卯',
    englishName: 'Dougong Bracket System',
    category: 'architecture',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20dougong%20bracket%20system%20architecture&image_size=landscape_16_9',
    description: '斗拱是中国古代建筑中最具特色的结构元素，由多个小构件组合而成，具有承重、装饰、减震多重功能。',
    history: '斗拱最早出现于西周时期，历经春秋战国、秦汉、唐宋、明清各代发展，技艺达到登峰造极的境界。',
    application: '用于宫殿、寺庙、塔楼等大型建筑的屋檐支撑，是中国建筑艺术的象征。',
    difficulty: 5,
    views: 25680,
    likes: 7890,
    collects: 5680,
    createdAt: '2024-01-01',
    structureParts: [
      { name: '斗', description: '斗形垫块，承托拱和翘' },
      { name: '拱', description: '弓形构件，前后挑出' },
      { name: '翘', description: '弓形构件，左右挑出' },
      { name: '昂', description: '斜向下垂的构件，起杠杆作用' },
      { name: '升', description: '拱与翘之间的垫块' }
    ],
    makingSteps: [
      { step: 1, title: '图纸设计', description: '根据建筑等级和规模设计斗拱形制' },
      { step: 2, title: '构件制作', description: '分别制作斗、拱、翘、昂等各个零件' },
      { step: 3, title: '试拼', description: '在地面进行预组装，检查配合精度' },
      { step: 4, title: '安装', description: '按照顺序逐层安装到建筑上' },
      { step: 5, title: '调试', description: '调整各构件受力，确保整体稳定' }
    ],
    tools: ['传统木工工具全套', '角尺', '水平仪', '墨斗'],
    materials: ['硬木（通常为楠木、柏木）', '传统木蜡'],
    videos: [
      { title: '斗拱结构详解', duration: '25:30', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20thumbnail%20dougong%20structure%20detailed%20explanation&image_size=square' },
      { title: '应县木塔斗拱赏析', duration: '18:20', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20thumbnail%20yingxian%20wooden%20pagoda%20dougong&image_size=square' }
    ],
    designerId: 6,
    tags: ['建筑', '斗拱', '国宝']
  }
}
