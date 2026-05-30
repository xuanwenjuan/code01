import { delay } from '@/utils/request'

export const mockStatistics = async () => {
  await delay(400)
  return [
    { title: '员工总数', value: 256, icon: 'User', color: '#409EFF', trend: 12 },
    { title: '待办事项', value: 8, icon: 'Clock', color: '#E6A23C', trend: -3 },
    { title: '本月审批', value: 45, icon: 'DocumentChecked', color: '#67C23A', trend: 8 },
    { title: '文件数量', value: 1256, icon: 'Folder', color: '#909399', trend: 156 }
  ]
}

export const mockTodos = async () => {
  await delay(400)
  return [
    { id: 1, title: '完成季度工作报告', priority: 'high', deadline: '2024-12-20', status: 'pending' },
    { id: 2, title: '审批张三的请假申请', priority: 'high', deadline: '2024-12-18', status: 'pending' },
    { id: 3, title: '参加技术部门周会', priority: 'medium', deadline: '2024-12-19', status: 'pending' },
    { id: 4, title: '整理项目文档', priority: 'low', deadline: '2024-12-25', status: 'pending' },
    { id: 5, title: '回复客户邮件', priority: 'medium', deadline: '2024-12-18', status: 'done' }
  ]
}

export const mockNotices = async () => {
  await delay(400)
  return [
    { id: 1, title: '关于2024年元旦放假安排的通知', type: 'notice', createTime: '2024-12-15 09:30:00', isTop: true },
    { id: 2, title: '公司年度绩效考核通知', type: 'notice', createTime: '2024-12-14 14:20:00', isTop: false },
    { id: 3, title: '办公系统升级维护公告', type: 'announcement', createTime: '2024-12-13 16:45:00', isTop: false },
    { id: 4, title: '新员工入职培训安排', type: 'notice', createTime: '2024-12-12 10:00:00', isTop: false },
    { id: 5, title: '关于加强网络安全管理的通知', type: 'announcement', createTime: '2024-12-10 11:30:00', isTop: false }
  ]
}

export const mockQuickLinks = async () => {
  await delay(300)
  return [
    { title: '发起请假', icon: 'Calendar', path: '/approval/leave', color: '#409EFF' },
    { title: '发起出差', icon: 'Van', path: '/approval/business', color: '#67C23A' },
    { title: '通讯录', icon: 'Phone', path: '/contacts', color: '#E6A23C' },
    { title: '文件中心', icon: 'Folder', path: '/files', color: '#909399' },
    { title: '我的日程', icon: 'Date', path: '/profile/schedule', color: '#F56C6C' },
    { title: '个人信息', icon: 'User', path: '/profile/info', color: '#409EFF' }
  ]
}

export const mockSchedule = async () => {
  await delay(400)
  const today = new Date()
  return [
    {
      id: 1,
      title: '部门周会',
      date: today.toISOString().split('T')[0],
      time: '09:30-10:30',
      location: '3楼会议室A'
    },
    {
      id: 2,
      title: '项目评审',
      date: today.toISOString().split('T')[0],
      time: '14:00-16:00',
      location: '2楼会议室B'
    },
    {
      id: 3,
      title: '客户对接',
      date: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
      time: '10:00-11:30',
      location: '线上会议'
    }
  ]
}

export const mockChartData = async () => {
  await delay(500)
  return {
    approvalData: {
      months: ['7月', '8月', '9月', '10月', '11月', '12月'],
      leave: [12, 19, 15, 22, 18, 25],
      business: [8, 12, 10, 15, 13, 20]
    },
    deptData: [
      { value: 85, name: '技术部' },
      { value: 45, name: '市场部' },
      { value: 35, name: '财务部' },
      { value: 30, name: '人事部' },
      { value: 25, name: '行政部' },
      { value: 36, name: '其他' }
    ]
  }
}
