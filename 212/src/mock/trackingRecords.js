import dayjs from 'dayjs'
import { waybills } from './waybills'

function generateTrackingRecord(waybillId, statusIndex, createTime) {
  const statusNodes = [
    { status: 'pending', label: '待揽收', desc: '运单已创建，等待快递员揽收' },
    { status: 'in_transit', label: '在途', desc: '货物已发出，正在运输途中' },
    { status: 'transfer', label: '中转', desc: '货物到达中转站，正在分拣' },
    { status: 'delivery', label: '派件中', desc: '货物已到达目的地，正在派送' },
    { status: 'signed', label: '已签收', desc: '货物已成功签收' }
  ]

  const node = statusNodes[statusIndex]
  const time = dayjs(createTime).add(statusIndex * (Math.random() * 12 + 6), 'hour')

  return {
    id: `${waybillId}-${statusIndex}`,
    waybillId,
    status: node.status,
    statusLabel: node.label,
    description: node.desc,
    location: node.status === 'pending'
      ? '发件地仓库'
      : node.status === 'signed'
      ? '收件人地址'
      : ['北京转运中心', '上海航空枢纽', '广州分拣中心', '深圳分拨中心'][Math.floor(Math.random() * 4)],
    operator: statusIndex === 0 ? '系统' : `操作员${100 + statusIndex}`,
    time: time.format('YYYY-MM-DD HH:mm:ss'),
    isException: Math.random() > 0.9,
    exceptionDesc: Math.random() > 0.9 ? '运输轻微延迟' : null
  }
}

export const trackingRecords = {}

waybills.forEach(waybill => {
  const statusOrder = ['pending', 'in_transit', 'transfer', 'delivery', 'signed']
  const currentIndex = statusOrder.indexOf(waybill.status)
  const records = []

  for (let i = 0; i <= currentIndex; i++) {
    records.push(generateTrackingRecord(waybill.id, i, waybill.createTime))
  }

  records.sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf())
  trackingRecords[waybill.id] = records
})

export default trackingRecords
