import dayjs from 'dayjs'

const cities = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉',
  '西安', '重庆', '天津', '苏州', '长沙', '郑州', '青岛', '大连'
]

const statuses = ['pending', 'in_transit', 'transfer', 'delivery', 'signed']
const statusLabels = {
  pending: '待揽收',
  in_transit: '在途',
  transfer: '中转',
  delivery: '派件中',
  signed: '已签收'
}

const goodsTypes = ['电子产品', '服装鞋帽', '食品饮料', '家居用品', '办公用品', '医疗器械']

function generateWaybill(id, trackerId = null) {
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const senderCity = cities[Math.floor(Math.random() * cities.length)]
  let receiverCity = cities[Math.floor(Math.random() * cities.length)]
  while (receiverCity === senderCity) {
    receiverCity = cities[Math.floor(Math.random() * cities.length)]
  }

  const createTime = dayjs().subtract(Math.floor(Math.random() * 30), 'day')
  let updateTime = createTime.add(Math.floor(Math.random() * 7), 'day')
  if (status === 'signed') {
    updateTime = createTime.add(Math.floor(Math.random() * 5) + 2, 'day')
  }

  const hasException = Math.random() > 0.8
  const exceptionType = hasException
    ? ['weather_delay', 'traffic_jam', 'package_damaged', 'address_error'][Math.floor(Math.random() * 4)]
    : null

  return {
    id: `WL${String(id).padStart(8, '0')}`,
    trackingNo: `TRK${Date.now()}${String(id).padStart(4, '0')}`,
    status,
    statusLabel: statusLabels[status],
    goodsType: goodsTypes[Math.floor(Math.random() * goodsTypes.length)],
    goodsName: `${goodsTypes[Math.floor(Math.random() * goodsTypes.length)]}包裹`,
    weight: (Math.random() * 20 + 0.5).toFixed(2),
    volume: `${(Math.random() * 0.5 + 0.1).toFixed(2)}m³`,
    sender: {
      name: `发件人${id}`,
      phone: `13${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
      address: `${senderCity}市XX区XX街道${100 + id}号`,
      city: senderCity
    },
    receiver: {
      name: `收件人${id}`,
      phone: `15${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
      address: `${receiverCity}市XX区XX街道${200 + id}号`,
      city: receiverCity
    },
    estimatedDelivery: createTime.add(3, 'day').format('YYYY-MM-DD'),
    createTime: createTime.format('YYYY-MM-DD HH:mm:ss'),
    updateTime: updateTime.format('YYYY-MM-DD HH:mm:ss'),
    trackerId,
    hasException,
    exceptionType,
    exceptionDesc: hasException
      ? {
          weather_delay: '因恶劣天气延误，预计延迟1-2天',
          traffic_jam: '交通拥堵，运输延迟',
          package_damaged: '包装轻微破损，正在处理',
          address_error: '收件地址有误，正在联系收件人确认'
        }[exceptionType]
      : null,
    currentLocation: status === 'pending'
      ? `${senderCity}市转运中心`
      : status === 'signed'
      ? `${receiverCity}市XX网点`
      : status === 'delivery'
      ? `${receiverCity}市XX派送点`
      : cities[Math.floor(Math.random() * cities.length)] + '市中转站'
  }
}

export const waybills = []
for (let i = 1; i <= 50; i++) {
  const trackerId = i % 3 === 1 ? 2 : i % 3 === 2 ? 3 : null
  waybills.push(generateWaybill(i, trackerId))
}

export const statusList = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待揽收' },
  { value: 'in_transit', label: '在途' },
  { value: 'transfer', label: '中转' },
  { value: 'delivery', label: '派件中' },
  { value: 'signed', label: '已签收' }
]

export const exceptionTypes = [
  { value: 'weather_delay', label: '天气延误' },
  { value: 'traffic_jam', label: '交通拥堵' },
  { value: 'package_damaged', label: '包裹破损' },
  { value: 'address_error', label: '地址错误' },
  { value: 'other', label: '其他异常' }
]
