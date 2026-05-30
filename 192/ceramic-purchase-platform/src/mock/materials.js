export const mockMaterials = [
  {
    id: 1,
    name: '景德镇高岭土特级',
    categoryId: 1,
    typeId: 1,
    supplierId: 3,
    supplierName: '景德镇高岭土矿业',
    price: 128,
    unit: '50kg/袋',
    stock: 999,
    sales: 5680,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=800&fit=crop'
    ],
    description: '精选景德镇高岭村原产特级高岭土，质地纯净，白度高，可塑性强，是制作高档瓷器的首选原料。',
    parameters: {
      氧化铝: '38.5%',
      二氧化硅: '46.2%',
      氧化铁: '≤0.3%',
      氧化钛: '≤0.05%',
      氧化钙: '≤0.2%',
      氧化镁: '≤0.1%',
      烧失量: '14.5%',
      白度: '≥92%',
      可塑性指数: '≥25'
    },
    firingTemp: {
      min: 1280,
      max: 1350,
      recommend: '1300-1320℃ 还原焰'
    },
    suitableStyles: ['青花瓷', '白瓷', '玲珑瓷', '粉彩瓷'],
    features: ['高可塑性', '高白度', '低杂质', '烧结范围宽'],
    certifications: ['ISO9001', '国家陶瓷原料检测中心认证'],
    createdAt: '2024-01-10'
  },
  {
    id: 2,
    name: '宜兴原矿紫砂泥',
    categoryId: 1,
    typeId: 2,
    supplierId: 3,
    supplierName: '景德镇高岭土矿业',
    price: 268,
    unit: '25kg/捆',
    stock: 500,
    sales: 3240,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1563826904577-6b72c5d75e53?w=800&h=800&fit=crop'
    ],
    description: '宜兴黄龙山原矿紫砂泥，陈腐时间超过3年，泥性温润，透气性好，适合制作各类紫砂壶。',
    parameters: {
      二氧化硅: '58.3%',
      氧化铝: '20.1%',
      氧化铁: '8.5%',
      氧化钙: '0.6%',
      氧化镁: '0.4%',
      氧化钾: '2.8%',
      烧失量: '6.2%',
      收缩率: '8-10%'
    },
    firingTemp: {
      min: 1150,
      max: 1200,
      recommend: '1180℃ 氧化焰'
    },
    suitableStyles: ['紫砂壶', '紫砂茶宠', '紫砂雕塑'],
    features: ['原矿料', '透气性佳', '易包浆', '色泽温润'],
    certifications: ['国家地理标志保护产品'],
    createdAt: '2024-01-12'
  },
  {
    id: 3,
    name: '高温粉青青瓷釉',
    categoryId: 2,
    typeId: 7,
    supplierId: 4,
    supplierName: '龙泉釉料研究所',
    price: 380,
    unit: '5kg/桶',
    stock: 300,
    sales: 1890,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=800&fit=crop'
    ],
    description: '龙泉传统工艺粉青釉，釉色温润如玉，釉面光滑细腻，是制作青瓷艺术品的首选釉料。',
    parameters: {
      二氧化硅: '68.5%',
      氧化铝: '12.3%',
      氧化钙: '14.2%',
      氧化铁: '1.2%',
      氧化钾: '2.1%',
      氧化镁: '1.5%'
    },
    firingTemp: {
      min: 1280,
      max: 1320,
      recommend: '1300℃ 还原焰'
    },
    suitableStyles: ['龙泉青瓷', '汝瓷风格', '官窑风格'],
    features: ['釉色纯正', '釉面温润', '稳定性好', '成品率高'],
    certifications: ['非物质文化遗产技艺'],
    createdAt: '2024-01-08'
  },
  {
    id: 4,
    name: '建阳建盏兔毫釉',
    categoryId: 2,
    typeId: 9,
    supplierId: 4,
    supplierName: '龙泉釉料研究所',
    price: 450,
    unit: '5kg/桶',
    stock: 200,
    sales: 980,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=800&fit=crop'
    ],
    description: '建阳水吉原产兔毫釉料，在高温下能自然形成兔毫状纹理，是烧制建盏的专用釉料。',
    parameters: {
      二氧化硅: '62.0%',
      氧化铝: '13.5%',
      氧化铁: '15.8%',
      氧化钙: '5.2%',
      氧化锰: '2.5%',
      五氧化二磷: '1.0%'
    },
    firingTemp: {
      min: 1300,
      max: 1350,
      recommend: '1330℃ 强还原焰'
    },
    suitableStyles: ['建盏', '天目瓷', '茶盏'],
    features: ['纹理自然', '色彩丰富', '独特窑变', '收藏价值高'],
    certifications: ['国家地理标志保护产品'],
    createdAt: '2024-01-05'
  },
  {
    id: 5,
    name: '景德镇青花料',
    categoryId: 3,
    typeId: 10,
    supplierId: 5,
    supplierName: '德化陶瓷原料厂',
    price: 680,
    unit: '1kg/瓶',
    stock: 150,
    sales: 2450,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop'
    ],
    description: '景德镇传统青花料，发色纯正，稳定性好，适合釉下彩绘，是青花瓷制作的必备材料。',
    parameters: {
      氧化钴: '72.5%',
      氧化铝: '10.2%',
      氧化硅: '8.5%',
      氧化铁: '3.8%',
      氧化锰: '2.0%'
    },
    firingTemp: {
      min: 1280,
      max: 1350,
      recommend: '1320℃ 还原焰'
    },
    suitableStyles: ['青花瓷', '釉下彩', '青花玲珑'],
    features: ['发色纯正', '不晕散', '耐高温', '稳定性强'],
    certifications: ['ISO9001'],
    createdAt: '2024-01-15'
  },
  {
    id: 6,
    name: '德化高白瓷泥',
    categoryId: 1,
    typeId: 4,
    supplierId: 5,
    supplierName: '德化陶瓷原料厂',
    price: 158,
    unit: '50kg/袋',
    stock: 800,
    sales: 6780,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1563826904577-6b72c5d75e53?w=800&h=800&fit=crop'
    ],
    description: '德化优质高白瓷泥，白度高，透光度好，质地细腻，是制作德化白瓷的最佳原料。',
    parameters: {
      二氧化硅: '72.5%',
      氧化铝: '18.2%',
      氧化铁: '≤0.15%',
      氧化钛: '≤0.03%',
      氧化钾: '3.8%',
      氧化钠: '3.2%',
      烧失量: '2.2%',
      白度: '≥95%'
    },
    firingTemp: {
      min: 1250,
      max: 1300,
      recommend: '1280℃ 氧化焰'
    },
    suitableStyles: ['德化白瓷', '雕塑瓷', '日用瓷', '工艺瓷'],
    features: ['超高白度', '透光性好', '质地细腻', '成型性能好'],
    certifications: ['国家陶瓷质量监督检验中心认证'],
    createdAt: '2024-01-18'
  },
  {
    id: 7,
    name: '钧瓷窑变釉',
    categoryId: 2,
    typeId: 8,
    supplierId: 4,
    supplierName: '龙泉釉料研究所',
    price: 520,
    unit: '5kg/桶',
    stock: 180,
    sales: 760,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=800&fit=crop'
    ],
    description: '禹州神垕钧瓷窑变釉，入窑一色出窑万彩，釉面呈现独特的窑变效果，极具艺术价值。',
    parameters: {
      二氧化硅: '65.5%',
      氧化铝: '11.8%',
      氧化钙: '8.5%',
      氧化铁: '2.8%',
      氧化铜: '2.5%',
      五氧化二磷: '4.2%',
      氧化锡: '1.5%'
    },
    firingTemp: {
      min: 1280,
      max: 1320,
      recommend: '1300℃ 还原焰'
    },
    suitableStyles: ['钧瓷', '窑变釉瓷', '艺术瓷'],
    features: ['窑变独特', '色彩斑斓', '收藏价值高', '每件唯一'],
    certifications: ['国家地理标志保护产品'],
    createdAt: '2024-01-20'
  },
  {
    id: 8,
    name: '釉里红颜料',
    categoryId: 3,
    typeId: 11,
    supplierId: 5,
    supplierName: '德化陶瓷原料厂',
    price: 1280,
    unit: '500g/瓶',
    stock: 80,
    sales: 450,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=800&fit=crop'
    ],
    description: '高品质釉里红颜料，发色稳定，色泽红艳，是釉里红瓷器的首选彩绘原料。',
    parameters: {
      氧化铜: '85.0%',
      氧化铝: '6.5%',
      氧化硅: '4.2%',
      氧化铁: '≤0.3%'
    },
    firingTemp: {
      min: 1280,
      max: 1320,
      recommend: '1300℃ 强还原焰'
    },
    suitableStyles: ['釉里红', '青花釉里红', '釉下彩'],
    features: ['发色纯正', '色泽红艳', '稳定性好', '不晕散'],
    certifications: ['ISO9001'],
    createdAt: '2024-01-22'
  }
]

export const getMaterialsByCategory = (categoryId) => {
  return mockMaterials.filter(m => m.categoryId === parseInt(categoryId))
}

export const getMaterialById = (id) => {
  return mockMaterials.find(m => m.id === parseInt(id))
}

export const searchMaterials = (keyword) => {
  const kw = keyword.toLowerCase()
  return mockMaterials.filter(m => 
    m.name.toLowerCase().includes(kw) ||
    m.description.toLowerCase().includes(kw) ||
    m.supplierName.toLowerCase().includes(kw)
  )
}
