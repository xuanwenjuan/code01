export const mockOrders = [
  {
    id: 1001,
    orderNo: 'ORD20240520001',
    userId: 1,
    status: 'delivered',
    statusText: '已完成',
    totalAmount: 96.00,
    shippingFee: 8.00,
    discountAmount: 0,
    paymentMethod: 'alipay',
    address: {
      name: '张三',
      phone: '13800138001',
      address: '北京市朝阳区xxx街道xxx号'
    },
    items: [
      {
        productId: 1,
        productName: '高筋小麦粉 2.5kg',
        productImage: 'https://img.alicdn.com/imgextra/i3/O1CN01k3t4XM1v6x6X7wvjX_!!6000000006146-2-tps-800-800.png',
        specName: '2.5kg/袋',
        price: 38.00,
        quantity: 2,
        subtotal: 76.00
      },
      {
        productId: 4,
        productName: '白砂糖 1kg',
        productImage: 'https://img.alicdn.com/imgextra/i1/O1CN01aWmXK61f43VpJqP6M_!!6000000003981-2-tps-800-800.png',
        specName: '1kg/袋',
        price: 12.80,
        quantity: 1,
        subtotal: 12.80
      }
    ],
    createdAt: '2024-05-15T10:30:00.000Z',
    paidAt: '2024-05-15T10:32:00.000Z',
    deliveredAt: '2024-05-17T14:00:00.000Z'
  },
  {
    id: 1002,
    orderNo: 'ORD20240520002',
    userId: 1,
    status: 'shipping',
    statusText: '配送中',
    totalAmount: 83.00,
    shippingFee: 0,
    discountAmount: 10,
    paymentMethod: 'wechat',
    address: {
      name: '张三',
      phone: '13800138001',
      address: '北京市朝阳区xxx街道xxx号'
    },
    items: [
      {
        productId: 3,
        productName: '动物黄油 454g',
        productImage: 'https://img.alicdn.com/imgextra/i2/O1CN01Y56D6n1ly8m2h0F3Y_!!6000000004849-2-tps-800-800.png',
        specName: '454g/块',
        price: 58.00,
        quantity: 1,
        subtotal: 58.00
      },
      {
        productId: 6,
        productName: '淡奶油 250ml',
        productImage: 'https://img.alicdn.com/imgextra/i2/O1CN01rT6bWV1d3NfN4X7Zr_!!6000000003694-2-tps-800-800.png',
        specName: '250ml/盒',
        price: 25.00,
        quantity: 1,
        subtotal: 25.00
      }
    ],
    createdAt: '2024-05-18T14:20:00.000Z',
    paidAt: '2024-05-18T14:22:00.000Z',
    shippedAt: '2024-05-19T09:00:00.000Z'
  },
  {
    id: 1003,
    orderNo: 'ORD20240520003',
    userId: 1,
    status: 'pending',
    statusText: '待付款',
    totalAmount: 73.00,
    shippingFee: 8.00,
    discountAmount: 0,
    paymentMethod: null,
    address: {
      name: '张三',
      phone: '13800138001',
      address: '北京市朝阳区xxx街道xxx号'
    },
    items: [
      {
        productId: 8,
        productName: '蔓越莓干 500g',
        productImage: 'https://img.alicdn.com/imgextra/i1/O1CN01iCzFgq1ZWyZBWqCZn_!!6000000003191-2-tps-800-800.png',
        specName: '500g/袋',
        price: 45.00,
        quantity: 1,
        subtotal: 45.00
      },
      {
        productId: 7,
        productName: '泡打粉 100g',
        productImage: 'https://img.alicdn.com/imgextra/i1/O1CN01k3t4XM1v6x6X7wvjX_!!6000000006146-2-tps-800-800.png',
        specName: '100g/袋',
        price: 8.80,
        quantity: 2,
        subtotal: 17.60
      }
    ],
    createdAt: '2024-05-20T16:45:00.000Z'
  },
  {
    id: 1004,
    orderNo: 'ORD20240520004',
    userId: 1,
    status: 'cancelled',
    statusText: '已取消',
    totalAmount: 28.00,
    shippingFee: 0,
    discountAmount: 0,
    paymentMethod: null,
    address: {
      name: '张三',
      phone: '13800138001',
      address: '北京市朝阳区xxx街道xxx号'
    },
    items: [
      {
        productId: 10,
        productName: '6寸圆形活底蛋糕模',
        productImage: 'https://img.alicdn.com/imgextra/i2/O1CN01Y56D6n1ly8m2h0F3Y_!!6000000004849-2-tps-800-800.png',
        specName: '6寸',
        price: 28.00,
        quantity: 1,
        subtotal: 28.00
      }
    ],
    createdAt: '2024-05-10T09:00:00.000Z',
    cancelledAt: '2024-05-10T09:30:00.000Z'
  }
]
