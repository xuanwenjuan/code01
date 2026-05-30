export const mockPackages = [
  {
    id: 1,
    name: '青花瓷创作入门套餐',
    description: '适合初学者的青花瓷创作套装，包含优质高岭土、青花料和透明釉，助您开启陶瓷艺术之旅。',
    price: 598,
    originalPrice: 780,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&h=300&fit=crop',
    materials: [
      { id: 1, name: '景德镇高岭土特级', quantity: 2, unit: '50kg/袋' },
      { id: 5, name: '景德镇青花料', quantity: 1, unit: '1kg/瓶' },
      { id: 3, name: '高温透明釉', quantity: 2, unit: '5kg/桶' }
    ],
    suitableFor: ['陶艺初学者', '兴趣爱好者', '学生'],
    discount: '7.7折',
    sales: 1256,
    rating: 4.9
  },
  {
    id: 2,
    name: '青瓷大师创作套餐',
    description: '专业级青瓷创作套装，精选龙泉瓷土与粉青釉，呈现温润如玉的青瓷质感。',
    price: 1288,
    originalPrice: 1680,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop',
    materials: [
      { id: 1, name: '龙泉瓷土', quantity: 5, unit: '50kg/袋' },
      { id: 3, name: '高温粉青青瓷釉', quantity: 3, unit: '5kg/桶' }
    ],
    suitableFor: ['专业陶艺师', '青瓷收藏家', '工作室'],
    discount: '7.7折',
    sales: 680,
    rating: 5.0
  },
  {
    id: 3,
    name: '紫砂茶具制作套餐',
    description: '正宗宜兴紫砂泥料，适合制作各类紫砂壶和紫砂茶具，透气性佳，泡养效果好。',
    price: 798,
    originalPrice: 1072,
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500&h=300&fit=crop',
    materials: [
      { id: 2, name: '宜兴原矿紫砂泥', quantity: 4, unit: '25kg/捆' }
    ],
    suitableFor: ['紫砂艺人', '茶具制作者', '收藏爱好者'],
    discount: '7.4折',
    sales: 890,
    rating: 4.8
  },
  {
    id: 4,
    name: '建盏烧制专业套餐',
    description: '建阳建盏泥料与兔毫釉的完美组合，让您体验独特的窑变艺术。',
    price: 1588,
    originalPrice: 2060,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&h=300&fit=crop',
    materials: [
      { id: 1, name: '建阳建盏泥', quantity: 4, unit: '50kg/袋' },
      { id: 4, name: '建阳建盏兔毫釉', quantity: 4, unit: '5kg/桶' }
    ],
    suitableFor: ['建盏工匠', '窑变爱好者', '专业工作室'],
    discount: '7.7折',
    sales: 320,
    rating: 4.9
  },
  {
    id: 5,
    name: '德化白瓷雕塑套餐',
    description: '超高白度德化瓷泥，适合创作各类白瓷雕塑和工艺摆件，透光性极佳。',
    price: 888,
    originalPrice: 1106,
    image: 'https://images.unsplash.com/photo-1563826904577-6b72c5d75e53?w=500&h=300&fit=crop',
    materials: [
      { id: 6, name: '德化高白瓷泥', quantity: 6, unit: '50kg/袋' },
      { id: 3, name: '高温透明釉', quantity: 2, unit: '5kg/桶' }
    ],
    suitableFor: ['雕塑艺术家', '礼品定制', '工艺摆件'],
    discount: '8.0折',
    sales: 560,
    rating: 4.7
  },
  {
    id: 6,
    name: '釉下彩综合创作套餐',
    description: '青花料与釉里红的经典组合，适合创作传统釉下彩瓷器，色彩丰富艳丽。',
    price: 2280,
    originalPrice: 2920,
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=300&fit=crop',
    materials: [
      { id: 1, name: '景德镇高岭土特级', quantity: 5, unit: '50kg/袋' },
      { id: 5, name: '景德镇青花料', quantity: 2, unit: '1kg/瓶' },
      { id: 8, name: '釉里红颜料', quantity: 1, unit: '500g/瓶' },
      { id: 3, name: '高温透明釉', quantity: 3, unit: '5kg/桶' }
    ],
    suitableFor: ['釉下彩艺人', '传统瓷画家', '艺术院校'],
    discount: '7.8折',
    sales: 230,
    rating: 5.0
  }
]
