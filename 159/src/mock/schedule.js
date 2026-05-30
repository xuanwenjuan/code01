import { delay } from '@/utils/request'

let schedules = [
  { id: 1, title: '部门周会', date: '2024-12-16', time: '09:30-10:30', location: '3楼会议室A', type: 'meeting', remind: true, description: '讨论本周工作进度和下周计划' },
  { id: 2, title: '项目评审', date: '2024-12-16', time: '14:00-16:00', location: '2楼会议室B', type: 'meeting', remind: true, description: '新项目技术方案评审' },
  { id: 3, title: '客户对接', date: '2024-12-17', time: '10:00-11:30', location: '线上会议', type: 'meeting', remind: false, description: '与客户沟通需求细节' },
  { id: 4, title: '提交季度报告', date: '2024-12-20', time: '17:00', location: '-', type: 'task', remind: true, description: '提交Q4季度工作报告' },
  { id: 5, title: '新员工培训', date: '2024-12-18', time: '14:00-17:00', location: '1楼培训室', type: 'training', remind: true, description: '新入职员工系统培训' },
  { id: 6, title: '午餐会议', date: '2024-12-19', time: '12:00-13:00', location: '公司餐厅', type: 'meeting', remind: false, description: '产品需求讨论午餐会' }
]

export const mockScheduleList = async (params = {}) => {
  await delay(400)
  let result = [...schedules]
  if (params.date) {
    result = result.filter(s => s.date === params.date)
  }
  if (params.month) {
    result = result.filter(s => s.date.startsWith(params.month))
  }
  return {
    list: result,
    total: result.length
  }
}

export const mockCreateSchedule = async (data) => {
  await delay(400)
  const newSchedule = {
    id: Date.now(),
    ...data
  }
  schedules.push(newSchedule)
  return { success: true, schedule: newSchedule }
}

export const mockUpdateSchedule = async (id, data) => {
  await delay(400)
  const index = schedules.findIndex(s => s.id === id)
  if (index > -1) {
    schedules[index] = { ...schedules[index], ...data }
  }
  return { success: true }
}

export const mockDeleteSchedule = async (id) => {
  await delay(300)
  const index = schedules.findIndex(s => s.id === id)
  if (index > -1) {
    schedules.splice(index, 1)
  }
  return { success: true }
}
