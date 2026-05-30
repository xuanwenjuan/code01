export const products = [
  {
    id: 1,
    name: '专业陶艺制坯工具套装',
    categoryId: 1,
    categoryName: '制坯工具',
    price: 328,
    originalPrice: 458,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556770384-2e75f8d7bb48?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop'
    ],
    description: '包含8件专业制坯工具，精选不锈钢材质，人体工学设计，适合长期使用。',
    detail: '这套专业制坯工具包含：木制搭子、不锈钢切泥线、修坯刀3把、海绵2块、割线器1个。所有工具均采用高品质材料制作，经久耐用。适合陶艺爱好者和专业工作室使用。',
    materialDetail: {
      main: '食品级304不锈钢',
      handle: '进口榉木',
      features: [
        '防锈耐腐蚀：304不锈钢材质，不易生锈，使用寿命长',
        '人体工学设计：榉木手柄握感舒适，长时间使用不疲劳',
        '打磨精细：工具边缘经过精细打磨，不伤坯体',
        '环保健康：所有材质均符合食品接触安全标准'
      ]
    },
    specs: [
      { name: '材质', value: '不锈钢+榉木' },
      { name: '件数', value: '8件套装' },
      { name: '重量', value: '1.2kg' },
      { name: '适用人群', value: '初学者/专业人士' },
      { name: '适用陶艺品类', value: '拉坯、手工捏塑' }
    ],
    suitableFor: ['花瓶', '碗碟', '雕塑', '茶具'],
    suitableForDetail: {
      '花瓶': '适合制作各种大小的花瓶，工具尺寸齐全',
      '碗碟': '修坯刀可完美修整碗碟内部和边缘',
      '雕塑': '切泥线和搭子适合雕塑作品的粗加工',
      '茶具': '精细工具适合茶壶、茶杯等小型茶具制作'
    },
    skus: [
      { id: 101, name: '基础款', price: 328, stock: 156, description: '包含8件基础工具，适合初学者' },
      { id: 102, name: '专业款', price: 458, stock: 89, description: '包含12件专业工具，送收纳盒' },
      { id: 103, name: '豪华款', price: 688, stock: 45, description: '包含16件全套工具，送教程视频' }
    ],
    sales: 2341,
    rating: 4.9,
    reviews: 856,
    supplierId: 1,
    supplierName: '陶艺工坊旗舰店',
    tags: ['热销', '新品']
  },
  {
    id: 2,
    name: '高级修坯刀具12件套',
    categoryId: 2,
    categoryName: '修坯工具',
    price: 198,
    originalPrice: 268,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop'
    ],
    description: '12款不同形状修坯刀，满足各种修坯需求，钨钢材质持久锋利。',
    detail: '精选钨钢材质，刀头锋利耐磨，手柄采用防滑设计。包含直刀、弯刀、刮刀等12种不同形状，适合各种复杂度的修坯工作。',
    materialDetail: {
      main: '进口钨钢',
      handle: '防滑橡胶',
      features: [
        '超高硬度：钨钢材质硬度达HRA90以上，持久锋利',
        '耐磨耐用：比普通钢材耐用5倍以上',
        '防滑设计：橡胶手柄防滑防汗，握持稳固',
        '精密打磨：刀头经过精密研磨，切口光滑'
      ]
    },
    specs: [
      { name: '材质', value: '钨钢+橡胶手柄' },
      { name: '件数', value: '12件' },
      { name: '包装', value: '便携收纳盒' }
    ],
    suitableFor: ['精细修坯', '表面处理'],
    suitableForDetail: {
      '精细修坯': '适合修整坯体的精细部分，如口沿、足部',
      '表面处理': '可用于刮平、刮光坯体表面，提高光洁度'
    },
    skus: [
      { id: 201, name: '标准款', price: 198, stock: 234, description: '12件刀具+收纳盒' },
      { id: 202, name: '专业款', price: 298, stock: 123, description: '12件刀具+磨刀石+收纳盒' }
    ],
    sales: 1856,
    rating: 4.8,
    reviews: 623,
    supplierId: 1,
    supplierName: '陶艺工坊旗舰店',
    tags: ['推荐']
  },
  {
    id: 3,
    name: '电动施釉喷笔套装',
    categoryId: 3,
    categoryName: '施釉工具',
    price: 568,
    originalPrice: 698,
    image: 'https://images.unsplash.com/photo-1556770384-2e75f8d7bb48?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556770384-2e75f8d7bb48?w=800&h=800&fit=crop'
    ],
    description: '专业级电动喷笔，釉料雾化细腻均匀，适合大面积施釉作业。',
    detail: '配备0.3mm和0.5mm两种喷嘴，可调节喷气量和釉料流量。静音设计，长时间使用不疲劳。',
    materialDetail: {
      main: '航空级铝合金',
      handle: '工程塑料',
      features: [
        '轻量化设计：铝合金材质重量轻，长时间手持不累',
        '精密喷嘴：不锈钢喷嘴，雾化细腻均匀',
        '静音马达：噪音低于60分贝，使用舒适',
        '易于清洗：可拆卸设计，清洗方便'
      ]
    },
    specs: [
      { name: '电源', value: '220V/50Hz' },
      { name: '功率', value: '60W' },
      { name: '喷嘴规格', value: '0.3mm/0.5mm' }
    ],
    suitableFor: ['大面积施釉', '渐变效果'],
    suitableForDetail: {
      '大面积施釉': '喷涂效率高，适合大型作品的均匀施釉',
      '渐变效果': '可精确控制釉料流量，创造自然渐变效果'
    },
    skus: [
      { id: 301, name: '标准套装', price: 568, stock: 78, description: '喷笔+0.3mm喷嘴+气管' },
      { id: 302, name: '豪华套装', price: 798, stock: 45, description: '喷笔+双喷嘴+清洗套装+收纳箱' }
    ],
    sales: 987,
    rating: 4.7,
    reviews: 345,
    supplierId: 2,
    supplierName: '陶艺设备专营店',
    tags: []
  },
  {
    id: 4,
    name: '手工雕刻工具套装',
    categoryId: 4,
    categoryName: '雕刻工具',
    price: 168,
    originalPrice: 218,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=800&fit=crop'
    ],
    description: '15件雕刻工具套装，各种花纹和图案雕刻利器。',
    detail: '包含各种形状的雕刻刀、印花工具、纹理滚轮等15件工具，适合在坯体上创作各种精美的图案和纹理。',
    materialDetail: {
      main: '高碳钢',
      handle: '实木',
      features: [
        '刀口锋利：高碳钢材质，刀口经过特殊处理，雕刻流畅',
        '握感舒适：实木手柄，符合人体工学',
        '多样造型：15种不同造型，满足各种雕刻需求',
        '防锈处理：表面镀镍处理，防止生锈'
      ]
    },
    specs: [
      { name: '件数', value: '15件' },
      { name: '材质', value: '金属+木质手柄' }
    ],
    suitableFor: ['表面装饰', '图案雕刻'],
    suitableForDetail: {
      '表面装饰': '可在坯体表面雕刻各种装饰图案',
      '图案雕刻': '适合刻字、刻画等精细雕刻工作'
    },
    skus: [
      { id: 401, name: '标准款', price: 168, stock: 345, description: '15件雕刻工具+收纳包' }
    ],
    sales: 2134,
    rating: 4.9,
    reviews: 756,
    supplierId: 2,
    supplierName: '陶艺设备专营店',
    tags: ['热销']
  },
  {
    id: 5,
    name: '高品质陶泥套装5kg',
    categoryId: 5,
    categoryName: '泥料套装',
    price: 89,
    originalPrice: 128,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'
    ],
    description: '精选陶土，质地细腻，可塑性强，适合各种陶艺创作。',
    detail: '包含5kg高品质陶泥，天然矿物成分，不含任何有害物质。可重复使用，密封保存可长期保持可塑性。',
    materialDetail: {
      main: '天然陶土',
      features: [
        '天然矿物：采用地下深层天然陶土，无化学添加',
        '可塑性强：塑性指数高，易于塑形不易开裂',
        '质地细腻：颗粒均匀，表面光滑',
        '烧成范围广：1100℃-1250℃均可烧制'
      ]
    },
    specs: [
      { name: '重量', value: '5kg' },
      { name: '成分', value: '天然陶土' },
      { name: '保质期', value: '24个月' }
    ],
    suitableFor: ['拉坯', '手工捏塑', '雕塑'],
    suitableForDetail: {
      '拉坯': '可塑性强，适合拉坯制作',
      '手工捏塑': '质地柔软，适合手工塑造各种造型',
      '雕塑': '强度高，适合制作立体雕塑作品'
    },
    skus: [
      { id: 501, name: '5kg装', price: 89, stock: 567, description: '5kg高品质陶泥' },
      { id: 502, name: '10kg装', price: 168, stock: 345, description: '10kg特惠装，更划算' }
    ],
    sales: 4521,
    rating: 4.8,
    reviews: 1234,
    supplierId: 3,
    supplierName: '陶泥工坊',
    tags: ['热销', '推荐']
  },
  {
    id: 6,
    name: '智能控温电窑炉',
    categoryId: 6,
    categoryName: '窑炉设备',
    price: 8800,
    originalPrice: 10800,
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop'
    ],
    description: '0-1300℃智能控温，一键烧制，适合工作室和教学使用。',
    detail: '容积0.06立方米，最大温度1300℃，可烧制瓷器、炻器、陶器等多种作品。智能控温系统，可预设多条烧曲线。',
    materialDetail: {
      main: '耐高温陶瓷纤维',
      shell: '冷轧钢板喷塑',
      features: [
        '节能保温：高密度陶瓷纤维炉腔，保温效果好，能耗低',
        '智能控温：PID智能控制，精度±5℃',
        '安全可靠：多重安全保护，过热自动断电',
        '耐用性强：加热元件寿命长，可达5000小时以上'
      ]
    },
    specs: [
      { name: '容积', value: '0.06m³' },
      { name: '最高温度', value: '1300℃' },
      { name: '功率', value: '12kW' }
    ],
    suitableFor: ['素烧', '釉烧', '瓷烧'],
    suitableForDetail: {
      '素烧': '可进行低温素烧，使坯体定型',
      '釉烧': '可进行釉烧，使釉面熔融',
      '瓷烧': '可进行高温瓷烧，使坯体瓷化'
    },
    skus: [
      { id: 601, name: '标准款', price: 8800, stock: 12, description: '0.06m³窑炉+配件' },
      { id: 602, name: '大容量款', price: 15800, stock: 8, description: '0.12m³窑炉+配件' }
    ],
    sales: 156,
    rating: 4.9,
    reviews: 89,
    supplierId: 3,
    supplierName: '陶泥工坊',
    tags: ['新品']
  },
  {
    id: 7,
    name: '初学者入门工具套装',
    categoryId: 7,
    categoryName: '工具套装',
    price: 128,
    originalPrice: 188,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=800&fit=crop'
    ],
    description: '陶艺入门必备，16件工具配齐，赠送教程视频。',
    detail: '包含制坯、修坯、施釉、雕刻等基础工具共16件，适合零基础初学者使用，附赠详细的使用说明书和视频教程。',
    materialDetail: {
      main: '优质不锈钢',
      handle: '榉木',
      features: [
        '入门首选：包含所有必备工具，一站式购齐',
        '品质保证：采用优质材料，经久耐用',
        '教程配套：赠送详细教程视频，快速上手',
        '性价比高：比单独购买节省30%'
      ]
    },
    specs: [
      { name: '件数', value: '16件' },
      { name: '适用人群', value: '初学者' }
    ],
    suitableFor: ['入门学习', '手工DIY'],
    suitableForDetail: {
      '入门学习': '配备详细教程，适合零基础学习',
      '手工DIY': '适合亲子活动、手工爱好者'
    },
    skus: [
      { id: 701, name: '基础套装', price: 128, stock: 789, description: '16件工具+说明书' }
    ],
    sales: 5632,
    rating: 4.9,
    reviews: 2341,
    supplierId: 1,
    supplierName: '陶艺工坊旗舰店',
    tags: ['热销', '推荐']
  },
  {
    id: 8,
    name: '电子秤精准测量套装',
    categoryId: 8,
    categoryName: '辅助工具',
    price: 158,
    originalPrice: 198,
    image: 'https://images.unsplash.com/photo-1556770384-2e75f8d7bb48?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556770384-2e75f8d7bb48?w=800&h=800&fit=crop'
    ],
    description: '精准到0.1g的电子秤，釉料配方必备工具。',
    detail: '最大称重3kg，精度0.1g，背光显示屏，单位可切换。自动关机功能，节能环保。',
    materialDetail: {
      main: 'ABS工程塑料',
      sensor: '高精度传感器',
      features: [
        '高精度：采用高精度传感器，精度达0.1g',
        '多单位：支持g、oz、lb等多种单位切换',
        '背光显示：LCD背光显示屏，读数清晰',
        '节能环保：自动关机功能，延长电池寿命'
      ]
    },
    specs: [
      { name: '最大称重', value: '3kg' },
      { name: '精度', value: '0.1g' }
    ],
    suitableFor: ['釉料配比', '泥料称重'],
    suitableForDetail: {
      '釉料配比': '精确称量釉料成分，保证配方准确',
      '泥料称重': '精确控制泥料重量，保证作品一致性'
    },
    skus: [
      { id: 801, name: '标准款', price: 158, stock: 456, description: '电子秤+校准砝码' }
    ],
    sales: 1876,
    rating: 4.7,
    reviews: 543,
    supplierId: 2,
    supplierName: '陶艺设备专营店',
    tags: []
  }
]
