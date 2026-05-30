export const categories = [
  { id: 'all', name: '全部', icon: 'AppstoreOutlined' },
  { id: 'classic', name: '经典榫卯', icon: 'CrownOutlined' },
  { id: 'innovative', name: '创新榫卯', icon: 'BulbOutlined' },
  { id: 'furniture', name: '家具榫卯', icon: 'HomeOutlined' },
  { id: 'architecture', name: '建筑榫卯', icon: 'BuildOutlined' },
  { id: 'decoration', name: '装饰榫卯', icon: 'AppstoreOutlined' }
]

export const classicMortises = [
  {
    id: 1,
    name: '燕尾榫',
    category: 'classic',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20dovetail%20mortise%20tenon%20joint%20wood%20craft&image_size=square_hd',
    description: '被誉为万榫之母，是中国传统木工中最具代表性的榫卯结构',
    difficulty: 5,
    views: 12580,
    likes: 3240,
    designerId: 1,
    tags: ['经典', '家具', '入门']
  },
  {
    id: 2,
    name: '格肩榫',
    category: 'classic',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20gejian%20mortise%20tenon%20joint%20woodwork&image_size=square_hd',
    description: '常用于家具框架连接，结构稳定美观',
    difficulty: 4,
    views: 8920,
    likes: 2150,
    designerId: 2,
    tags: ['经典', '框架']
  },
  {
    id: 3,
    name: '霸王枨',
    category: 'classic',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20bawangcheng%20mortise%20tenon%20table%20joint&image_size=square_hd',
    description: '古代桌案类家具的核心结构，无需钉子即可承重千斤',
    difficulty: 5,
    views: 15680,
    likes: 4320,
    designerId: 1,
    tags: ['经典', '桌案']
  },
  {
    id: 4,
    name: '龙凤榫',
    category: 'classic',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20dragon%20phoenix%20mortise%20tenon%20joint&image_size=square_hd',
    description: '又称楔丁榫，用于厚板拼接，坚固耐用',
    difficulty: 4,
    views: 7650,
    likes: 1890,
    designerId: 3,
    tags: ['经典', '拼接']
  }
]

export const innovativeMortises = [
  {
    id: 5,
    name: '模块化榫卯',
    category: 'innovative',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20modular%20mortise%20tenon%20joint%20system%20design&image_size=square_hd',
    description: '基于传统榫卯原理设计的可拆装模块化连接系统',
    difficulty: 3,
    views: 18920,
    likes: 5680,
    designerId: 4,
    tags: ['创新', '模块化', '现代']
  },
  {
    id: 6,
    name: '参数化榫卯',
    category: 'innovative',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parametric%20mortise%20tenon%20joint%20digital%20design&image_size=square_hd',
    description: '运用参数化设计理论，可根据负载自动调整结构参数',
    difficulty: 5,
    views: 22150,
    likes: 6240,
    designerId: 5,
    tags: ['创新', '参数化', '数字化']
  },
  {
    id: 7,
    name: '3D打印榫卯',
    category: 'innovative',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=3D%20printed%20mortise%20tenon%20joint%20modern%20design&image_size=square_hd',
    description: '适配3D打印工艺的新型榫卯结构设计',
    difficulty: 4,
    views: 14320,
    likes: 3890,
    designerId: 4,
    tags: ['创新', '3D打印']
  }
]

export const furnitureMortises = [
  {
    id: 8,
    name: '椅盘榫卯',
    category: 'furniture',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20chair%20seat%20mortise%20tenon%20joint&image_size=square_hd',
    description: '明式椅子的经典坐面连接结构',
    difficulty: 4,
    views: 9870,
    likes: 2450,
    designerId: 2,
    tags: ['家具', '椅子']
  },
  {
    id: 9,
    name: '衣柜门榫',
    category: 'furniture',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20wardrobe%20door%20mortise%20tenon&image_size=square_hd',
    description: '衣柜门板的专用榫卯结构',
    difficulty: 3,
    views: 6540,
    likes: 1680,
    designerId: 3,
    tags: ['家具', '衣柜']
  }
]

export const architectureMortises = [
  {
    id: 10,
    name: '斗拱榫卯',
    category: 'architecture',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20dougong%20bracket%20system%20architecture&image_size=square_hd',
    description: '中国古建筑的精髓，可减震抗震',
    difficulty: 5,
    views: 25680,
    likes: 7890,
    designerId: 6,
    tags: ['建筑', '斗拱', '国宝']
  },
  {
    id: 11,
    name: '梁柱榫卯',
    category: 'architecture',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20beam%20column%20mortise%20tenon%20joint&image_size=square_hd',
    description: '古建筑梁柱连接的核心结构',
    difficulty: 5,
    views: 18920,
    likes: 4560,
    designerId: 6,
    tags: ['建筑', '梁柱']
  }
]

export const decorationMortises = [
  {
    id: 12,
    name: '花格榫卯',
    category: 'decoration',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20lattice%20window%20mortise%20tenon%20decoration&image_size=square_hd',
    description: '传统花格窗棂的榫卯工艺',
    difficulty: 4,
    views: 11230,
    likes: 3120,
    designerId: 3,
    tags: ['装饰', '花格']
  }
]

export const allMortises = [
  ...classicMortises,
  ...innovativeMortises,
  ...furnitureMortises,
  ...architectureMortises,
  ...decorationMortises
]
