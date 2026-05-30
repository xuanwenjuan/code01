export const orderStatusMap = {
  pending: { text: '待接单', color: 'warning' },
  accepted: { text: '已接单', color: 'processing' },
  in_progress: { text: '服务中', color: 'processing' },
  completed: { text: '已完成', color: 'success' },
  cancelled: { text: '已取消', color: 'default' }
}

export const getStatusInfo = (status) => {
  return orderStatusMap[status] || { text: '未知状态', color: 'default' }
}
