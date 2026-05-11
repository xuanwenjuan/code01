import type { Medicine, MedicationReminder, OperationLog, FamilyMember } from '@/types'
import { getTodayString, getNowString } from '@/utils/date'

export const mockFamilyMembers: FamilyMember[] = [
  { id: 'm1', name: '张三', relation: '本人' },
  { id: 'm2', name: '李四', relation: '配偶' },
  { id: 'm3', name: '张明', relation: '父亲' },
  { id: 'm4', name: '王芳', relation: '母亲' }
]

export const mockMedicines: Medicine[] = [
  {
    id: 'med1',
    name: '布洛芬缓释胶囊',
    category: 'cold',
    manufacturer: '中美史克',
    spec: '0.3g*20粒',
    quantity: 15,
    unit: '盒',
    expireDate: '2026-08-15',
    createdAt: '2025-01-10 09:00:00',
    updatedAt: '2025-01-10 09:00:00'
  },
  {
    id: 'med2',
    name: '复方氨酚烷胺片',
    category: 'cold',
    manufacturer: '修正药业',
    spec: '12片/盒',
    quantity: 8,
    unit: '盒',
    expireDate: '2025-06-20',
    createdAt: '2025-02-05 14:30:00',
    updatedAt: '2025-02-05 14:30:00'
  },
  {
    id: 'med3',
    name: '硝苯地平缓释片',
    category: 'chronic',
    manufacturer: '拜耳药业',
    spec: '30mg*7片',
    quantity: 3,
    unit: '盒',
    expireDate: '2025-05-10',
    createdAt: '2025-01-20 10:15:00',
    updatedAt: '2025-03-01 08:00:00'
  },
  {
    id: 'med4',
    name: '二甲双胍片',
    category: 'chronic',
    manufacturer: '中美上海施贵宝',
    spec: '0.5g*60片',
    quantity: 1,
    unit: '盒',
    expireDate: '2024-12-20',
    createdAt: '2024-06-15 16:00:00',
    updatedAt: '2024-06-15 16:00:00'
  },
  {
    id: 'med5',
    name: '维生素C泡腾片',
    category: 'vitamin',
    manufacturer: '力度伸',
    spec: '1g*10片',
    quantity: 20,
    unit: '盒',
    expireDate: '2027-03-01',
    createdAt: '2025-03-10 11:00:00',
    updatedAt: '2025-03-10 11:00:00'
  },
  {
    id: 'med6',
    name: '善存多维元素片',
    category: 'vitamin',
    manufacturer: '惠氏',
    spec: '100片/瓶',
    quantity: 2,
    unit: '瓶',
    expireDate: '2026-11-30',
    createdAt: '2025-02-20 09:30:00',
    updatedAt: '2025-02-20 09:30:00'
  },
  {
    id: 'med7',
    name: '云南白药气雾剂',
    category: 'external',
    manufacturer: '云南白药',
    spec: '85g+30g',
    quantity: 5,
    unit: '盒',
    expireDate: '2026-04-15',
    createdAt: '2025-01-05 13:45:00',
    updatedAt: '2025-01-05 13:45:00'
  },
  {
    id: 'med8',
    name: '碘伏消毒液',
    category: 'external',
    manufacturer: '海氏海诺',
    spec: '100ml',
    quantity: 10,
    unit: '瓶',
    expireDate: '2025-09-01',
    createdAt: '2025-02-28 10:20:00',
    updatedAt: '2025-02-28 10:20:00'
  }
]

const today = getTodayString()

export const mockReminders: MedicationReminder[] = [
  {
    id: 'rem1',
    medicineId: 'med3',
    medicineName: '硝苯地平缓释片',
    memberId: 'm3',
    memberName: '张明',
    dosage: '1片',
    scheduledTime: '08:00',
    status: 'taken',
    actualTime: `${today} 07:58:00`,
    date: today,
    createdAt: '2025-03-01 08:00:00',
    updatedAt: `${today} 07:58:00`
  },
  {
    id: 'rem2',
    medicineId: 'med3',
    medicineName: '硝苯地平缓释片',
    memberId: 'm3',
    memberName: '张明',
    dosage: '1片',
    scheduledTime: '20:00',
    status: 'pending',
    actualTime: null,
    date: today,
    createdAt: '2025-03-01 08:00:00',
    updatedAt: '2025-03-01 08:00:00'
  },
  {
    id: 'rem3',
    medicineId: 'med1',
    medicineName: '布洛芬缓释胶囊',
    memberId: 'm1',
    memberName: '张三',
    dosage: '1粒',
    scheduledTime: '12:00',
    status: 'skipped',
    actualTime: null,
    date: today,
    createdAt: '2025-04-01 09:00:00',
    updatedAt: `${today} 12:15:00`
  },
  {
    id: 'rem4',
    medicineId: 'med5',
    medicineName: '维生素C泡腾片',
    memberId: 'm2',
    memberName: '李四',
    dosage: '1片',
    scheduledTime: '09:00',
    status: 'pending',
    actualTime: null,
    date: today,
    createdAt: '2025-03-15 10:00:00',
    updatedAt: '2025-03-15 10:00:00'
  },
  {
    id: 'rem5',
    medicineId: 'med6',
    medicineName: '善存多维元素片',
    memberId: 'm4',
    memberName: '王芳',
    dosage: '1片',
    scheduledTime: '10:00',
    status: 'missed',
    actualTime: null,
    date: '2025-05-10',
    createdAt: '2025-03-20 14:00:00',
    updatedAt: '2025-05-11 00:05:00'
  }
]

export const mockLogs: OperationLog[] = [
  {
    id: 'log1',
    operatorId: 'm1',
    operatorName: '张三',
    actionType: 'add',
    targetType: 'medicine',
    targetId: 'med5',
    targetName: '维生素C泡腾片',
    description: '新增药品：维生素C泡腾片',
    createdAt: '2025-03-10 11:00:00'
  },
  {
    id: 'log2',
    operatorId: 'm3',
    operatorName: '张明',
    actionType: 'mark_taken',
    targetType: 'reminder',
    targetId: 'rem1',
    targetName: '硝苯地平缓释片',
    description: '标记硝苯地平缓释片已服用',
    createdAt: `${today} 07:58:00`
  },
  {
    id: 'log3',
    operatorId: 'm1',
    operatorName: '张三',
    actionType: 'update_reminder',
    targetType: 'reminder',
    targetId: 'rem4',
    targetName: '维生素C泡腾片',
    description: '修改李四的维生素C泡腾片提醒时间',
    createdAt: '2025-04-05 16:30:00'
  },
  {
    id: 'log4',
    operatorId: 'm2',
    operatorName: '李四',
    actionType: 'replenish',
    targetType: 'medicine',
    targetId: 'med8',
    targetName: '碘伏消毒液',
    description: '补充碘伏消毒液库存5瓶',
    createdAt: '2025-03-15 10:20:00'
  },
  {
    id: 'log5',
    operatorId: 'm1',
    operatorName: '张三',
    actionType: 'mark_skipped',
    targetType: 'reminder',
    targetId: 'rem3',
    targetName: '布洛芬缓释胶囊',
    description: '标记布洛芬缓释胶囊已跳过',
    createdAt: `${today} 12:15:00`
  }
]
