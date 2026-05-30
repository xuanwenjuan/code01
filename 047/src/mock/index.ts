import Mock from 'mockjs'
import { Category, ProductSku, Order, AfterSale, MemberLevel, Member } from '@/types'

const Random = Mock.Random

const categoryData: Category[] = [
  {
    id: '1',
    name: '手办',
    parentId: null,
    level: 1,
    sort: 1,
    status: 'active',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
    children: [
      {
        id: '1-1',
        name: '动漫手办',
        parentId: '1',
        level: 2,
        sort: 1,
        status: 'active',
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00',
        children: [
          {
            id: '1-1-1',
            name: '火影忍者',
            parentId: '1-1',
            level: 3,
            sort: 1,
            status: 'active',
            createdAt: '2024-01-01 10:00:00',
            updatedAt: '2024-01-01 10:00:00',
          },
          {
            id: '1-1-2',
            name: '海贼王',
            parentId: '1-1',
            level: 3,
            sort: 2,
            status: 'active',
            createdAt: '2024-01-01 10:00:00',
            updatedAt: '2024-01-01 10:00:00',
          },
        ],
      },
      {
        id: '1-2',
        name: '游戏手办',
        parentId: '1',
        level: 2,
        sort: 2,
        status: 'active',
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00',
      },
    ],
  },
  {
    id: '2',
    name: '盲盒',
    parentId: null,
    level: 1,
    sort: 2,
    status: 'active',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
    children: [
      {
        id: '2-1',
        name: '泡泡玛特',
        parentId: '2',
        level: 2,
        sort: 1,
        status: 'active',
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00',
      },
    ],
  },
  {
    id: '3',
    name: '文具',
    parentId: null,
    level: 1,
    sort: 3,
    status: 'active',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
  },
  {
    id: '4',
    name: '国潮周边',
    parentId: null,
    level: 1,
    sort: 4,
    status: 'active',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
  },
  {
    id: '5',
    name: '艺术摆件',
    parentId: null,
    level: 1,
    sort: 5,
    status: 'inactive',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
  },
]

const productData: ProductSku[] = Mock.mock({
  'list|50': [
    {
      id: () => Random.id(),
      productId: () => Random.id(),
      'productName|1': [
        '火影忍者鸣人手办',
        '海贼王路飞手办',
        '泡泡玛特DIMOO盲盒',
        '国潮文创笔记本',
        '古风艺术摆件',
        '原神限定手办',
        '迪士尼联名盲盒',
      ],
      categoryId: () => Random.pick(['1', '2', '3', '4', '5']),
      categoryName: function() {
        const map: Record<string, string> = {
          '1': '手办',
          '2': '盲盒',
          '3': '文具',
          '4': '国潮周边',
          '5': '艺术摆件',
        }
        return map[this.categoryId] || '手办'
      },
      specs: function() {
        const colors = ['红色', '蓝色', '绿色', '黑色', '白色', '金色']
        const sizes = ['S', 'M', 'L', 'XL', '限定版']
        return {
          颜色: Random.pick(colors),
          尺寸: Random.pick(sizes),
        }
      },
      retailPrice: () => Random.integer(99, 999),
      activityPrice: function() {
        return Math.floor(this.retailPrice * 0.8)
      },
      stock: () => Random.integer(10, 500),
      stockThreshold: () => Random.integer(5, 20),
      outOfStockReminder: () => Random.boolean(),
      'status|1': ['on_sale', 'off_sale'],
      createdAt: () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updatedAt: () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
    },
  ],
}).list

const orderData: Order[] = Mock.mock({
  'list|30': [
    {
      id: () => Random.id(),
      orderNo: () => 'ORD' + Random.string('number', 12),
      userId: () => Random.id(),
      userName: () => Random.cname(),
      totalAmount: () => Random.integer(100, 5000),
      'status|1': ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
      'items|1-3': [
        {
          id: () => Random.id(),
          skuId: () => Random.id(),
          productName: () => Random.pick(['火影忍者鸣人手办', '泡泡玛特盲盒', '国潮笔记本']),
          specs: () => ({ 颜色: Random.pick(['红色', '蓝色']), 尺寸: 'M' }),
          quantity: () => Random.integer(1, 3),
          price: () => Random.integer(99, 500),
        },
      ],
      createdAt: () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updatedAt: () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
    },
  ],
}).list

const afterSaleData: AfterSale[] = Mock.mock({
  'list|20': [
    {
      id: () => Random.id(),
      orderId: () => Random.id(),
      orderNo: () => 'ORD' + Random.string('number', 12),
      'type|1': ['return', 'exchange', 'refund'],
      'status|1': ['pending', 'processing', 'approved', 'rejected', 'completed'],
      reason: () => Random.pick(['商品质量问题', '尺寸不合适', '收到商品与描述不符', '其他原因']),
      userId: () => Random.id(),
      userName: () => Random.cname(),
      'items|1': [
        {
          id: () => Random.id(),
          skuId: () => Random.id(),
          productName: () => Random.pick(['火影忍者鸣人手办', '泡泡玛特盲盒']),
          specs: () => ({ 颜色: '红色', 尺寸: 'M' }),
          quantity: 1,
          price: () => Random.integer(99, 500),
        },
      ],
      'progress|1-4': [
        {
          id: () => Random.id(),
          status: () => Random.pick(['提交申请', '审核中', '处理中', '已完成']),
          description: () => Random.csentence(10, 30),
          operator: () => Random.cname(),
          time: () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
        },
      ],
      createdAt: () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updatedAt: () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
    },
  ],
}).list

const memberLevelData: MemberLevel[] = [
  {
    id: '1',
    name: '普通会员',
    level: 1,
    discount: 1,
    pointsRate: 1,
    birthdayBenefit: '生日当天享受双倍积分',
    minPoints: 0,
  },
  {
    id: '2',
    name: '银卡会员',
    level: 2,
    discount: 0.95,
    pointsRate: 1.5,
    birthdayBenefit: '生日当天享受双倍积分 + 50元优惠券',
    minPoints: 1000,
  },
  {
    id: '3',
    name: '金卡会员',
    level: 3,
    discount: 0.9,
    pointsRate: 2,
    birthdayBenefit: '生日当天享受三倍积分 + 100元优惠券 + 精美礼品',
    minPoints: 5000,
  },
  {
    id: '4',
    name: '钻石会员',
    level: 4,
    discount: 0.85,
    pointsRate: 3,
    birthdayBenefit: '生日当天享受五倍积分 + 200元优惠券 + 专属礼品 + 专属客服',
    minPoints: 20000,
  },
]

const memberData: Member[] = Mock.mock({
  'list|50': [
    {
      id: () => Random.id(),
      name: () => Random.cname(),
      phone: () => /^1[3-9]\d{9}$/.exec(Random.string('number', 11))?.[0] || '13800138000',
      email: () => Random.email(),
      'levelId|1': ['1', '2', '3', '4'],
      levelName: function() {
        const map: Record<string, string> = {
          '1': '普通会员',
          '2': '银卡会员',
          '3': '金卡会员',
          '4': '钻石会员',
        }
        return map[this.levelId] || '普通会员'
      },
      points: () => Random.integer(0, 50000),
      totalConsumption: () => Random.integer(100, 50000),
      birthday: () => Random.date('yyyy-MM-dd'),
      'status|1': ['active', 'inactive'],
      'levelChangeRecords|0-3': [
        {
          id: () => Random.id(),
          'fromLevel|1': ['普通会员', '银卡会员', '金卡会员'],
          'toLevel|1': ['银卡会员', '金卡会员', '钻石会员'],
          reason: () => Random.pick(['消费达标升级', '活动奖励升级', '手动调整']),
          operator: () => Random.cname(),
          time: () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
        },
      ],
      createdAt: () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updatedAt: () => Random.datetime('yyyy-MM-dd HH:mm:ss'),
    },
  ],
}).list

Mock.mock(/\/api\/categories/, 'get', () => ({
  code: 200,
  message: 'success',
  data: categoryData,
}))

Mock.mock(/\/api\/products/, 'get', () => ({
  code: 200,
  message: 'success',
  data: productData,
}))

Mock.mock(/\/api\/orders/, 'get', () => ({
  code: 200,
  message: 'success',
  data: orderData,
}))

Mock.mock(/\/api\/after-sales/, 'get', () => ({
  code: 200,
  message: 'success',
  data: afterSaleData,
}))

Mock.mock(/\/api\/member-levels/, 'get', () => ({
  code: 200,
  message: 'success',
  data: memberLevelData,
}))

Mock.mock(/\/api\/members/, 'get', () => ({
  code: 200,
  message: 'success',
  data: memberData,
}))

export { categoryData, productData, orderData, afterSaleData, memberLevelData, memberData }
