export const mockOrders = [
  {
    id: 1001,
    orderNo: 'ORD202401200001',
    userId: 1,
    status: 'completed',
    totalAmount: 1536,
    items: [
      { materialId: 1, name: '景德镇高岭土特级', price: 128, quantity: 10, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=100&h=100&fit=crop' },
      { materialId: 3, name: '高温粉青青瓷釉', price: 380, quantity: 1, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' }
    ],
    address: '江西省景德镇市珠山区陶艺街88号',
    contact: '张师傅 138****8001',
    createdAt: '2024-01-20 10:30:00',
    paidAt: '2024-01-20 10:32:00',
    shippedAt: '2024-01-21 09:00:00',
    completedAt: '2024-01-23 15:30:00'
  },
  {
    id: 1002,
    orderNo: 'ORD202401250002',
    userId: 1,
    status: 'shipped',
    totalAmount: 896,
    items: [
      { materialId: 5, name: '景德镇青花料', price: 680, quantity: 1, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=100&h=100&fit=crop' },
      { materialId: 6, name: '德化高白瓷泥', price: 158, quantity: 1, image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=100&h=100&fit=crop' }
    ],
    address: '江西省景德镇市珠山区陶艺街88号',
    contact: '张师傅 138****8001',
    createdAt: '2024-01-25 14:20:00',
    paidAt: '2024-01-25 14:22:00',
    shippedAt: '2024-01-26 10:00:00',
    completedAt: null
  },
  {
    id: 1003,
    orderNo: 'ORD202401280003',
    userId: 1,
    status: 'pending',
    totalAmount: 268,
    items: [
      { materialId: 2, name: '宜兴原矿紫砂泥', price: 268, quantity: 1, image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=100&h=100&fit=crop' }
    ],
    address: '江西省景德镇市珠山区陶艺街88号',
    contact: '张师傅 138****8001',
    createdAt: '2024-01-28 09:15:00',
    paidAt: null,
    shippedAt: null,
    completedAt: null
  },
  {
    id: 1004,
    orderNo: 'ORD202401220004',
    userId: 2,
    status: 'completed',
    totalAmount: 536,
    items: [
      { materialId: 2, name: '宜兴原矿紫砂泥', price: 268, quantity: 2, image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=100&h=100&fit=crop' }
    ],
    address: '江苏省宜兴市丁蜀镇紫砂路66号',
    contact: '李大师 138****8002',
    createdAt: '2024-01-22 16:40:00',
    paidAt: '2024-01-22 16:42:00',
    shippedAt: '2024-01-23 08:30:00',
    completedAt: '2024-01-25 11:20:00'
  }
]

export const orderStatusMap = {
  pending: { label: '待付款', color: 'warning' },
  paid: { label: '已付款', color: 'info' },
  shipped: { label: '已发货', color: 'primary' },
  completed: { label: '已完成', color: 'success' },
  cancelled: { label: '已取消', color: 'danger' }
}
