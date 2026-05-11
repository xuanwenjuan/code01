import Mock from 'mockjs'
import type { 
  Hospital, 
  Department, 
  Doctor, 
  ScheduleSlot, 
  OperationLog,
  DoctorTitle,
  DoctorStatus,
  ScheduleTime
} from '@/types'

const hospitals: Hospital[] = [
  { id: 'H001', name: '总院', address: '北京市朝阳区医院路1号' },
  { id: 'H002', name: '东院区', address: '北京市东城区医院路2号' },
  { id: 'H003', name: '西院区', address: '北京市西城区医院路3号' }
]

const departments: Department[] = [
  { id: 'D001', name: '内科', hospitalId: 'H001', hospitalName: '总院' },
  { id: 'D002', name: '外科', hospitalId: 'H001', hospitalName: '总院' },
  { id: 'D003', name: '儿科', hospitalId: 'H001', hospitalName: '总院' },
  { id: 'D004', name: '急诊科', hospitalId: 'H001', hospitalName: '总院' },
  { id: 'D005', name: '内科', hospitalId: 'H002', hospitalName: '东院区' },
  { id: 'D006', name: '外科', hospitalId: 'H002', hospitalName: '东院区' },
  { id: 'D007', name: '内科', hospitalId: 'H003', hospitalName: '西院区' },
  { id: 'D008', name: '儿科', hospitalId: 'H003', hospitalName: '西院区' }
]

const titles: DoctorTitle[] = ['主任医师', '副主任医师', '主治医师', '住院医师', '专家']
const statuses: DoctorStatus[] = ['normal', 'stop', 'substitute']
const times: ScheduleTime[] = ['morning', 'afternoon', 'night']
const specialties = [
  '心血管疾病诊治', '消化系统疾病', '呼吸系统疾病', '内分泌代谢疾病',
  '普通外科手术', '骨科手术', '神经外科', '泌尿外科',
  '儿科常见病', '新生儿疾病', '儿童保健', '儿童发育',
  '急诊急救', '危重症救治', '创伤救治'
]

const doctorNames = [
  '张明华', '李建国', '王丽萍', '刘伟强', '陈晓燕', '赵文德',
  '孙丽娟', '周志强', '吴雪梅', '郑海涛', '冯晓琳', '何晨光',
  '马晓燕', '林卫国', '黄丽华', '徐明辉', '朱秀兰', '高建华'
]

const doctors: Doctor[] = doctorNames.map((name, index) => {
  const dept = departments[index % departments.length]
  return {
    id: `DOC${String(index + 1).padStart(3, '0')}`,
    name,
    title: titles[Math.floor(Math.random() * titles.length)],
    departmentId: dept.id,
    departmentName: dept.name,
    hospitalId: dept.hospitalId,
    hospitalName: dept.hospitalName,
    specialty: specialties[index % specialties.length],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`
  }
})

function generateSlots(): ScheduleSlot[] {
  const slots: ScheduleSlot[] = []
  const today = new Date()
  
  for (let day = 0; day < 14; day++) {
    const date = new Date(today)
    date.setDate(date.getDate() + day)
    const dateStr = date.toISOString().split('T')[0]
    
    doctors.forEach(doctor => {
      if (Math.random() > 0.3) {
        const usedTimes = new Set<ScheduleTime>()
        const numSlots = Math.floor(Math.random() * 2) + 1
        
        for (let i = 0; i < numSlots; i++) {
          let time: ScheduleTime
          do {
            time = times[Math.floor(Math.random() * times.length)]
          } while (usedTimes.has(time))
          usedTimes.add(time)
          
          const total = doctor.title === '专家' ? 15 : 25
          const reserved = Math.floor(Math.random() * (total + 1))
          const available = total - reserved
          
          let status: 'available' | 'limited' | 'full' = 'available'
          if (available === 0) status = 'full'
          else if (available <= 5) status = 'limited'
          
          slots.push({
            id: `SLOT${String(slots.length + 1).padStart(5, '0')}`,
            doctorId: doctor.id,
            doctorName: doctor.name,
            date: dateStr,
            time,
            total,
            reserved,
            available,
            status,
            isExpert: doctor.title === '专家'
          })
        }
      }
    })
  }
  
  return slots
}

const slots = generateSlots()

const operations: string[] = [
  '添加医生', '编辑医生信息', '修改出诊状态', '创建排班',
  '编辑排班', '锁定号源', '解锁号源', '释放号源',
  '添加停诊备注', '患者挂号', '取消挂号'
]

const operationLogs: OperationLog[] = Array.from({ length: 50 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 7))
  date.setHours(Math.floor(Math.random() * 10) + 8, Math.floor(Math.random() * 60))
  
  const isAdmin = Math.random() > 0.5
  const opIndex = Math.floor(Math.random() * operations.length)
  
  return {
    id: `LOG${String(i + 1).padStart(5, '0')}`,
    operator: isAdmin ? '系统管理员' : `挂号员${Math.floor(Math.random() * 5) + 1}`,
    operatorRole: isAdmin ? 'admin' : 'registrar',
    operationType: operations[opIndex],
    operationDetail: `执行${operations[opIndex]}操作，目标：${doctors[Math.floor(Math.random() * doctors.length)].name}`,
    timestamp: date.toISOString()
  }
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

Mock.setup({ timeout: '200-500' })

Mock.mock('/api/hospitals', 'get', () => ({ code: 200, data: hospitals }))

Mock.mock('/api/departments', 'get', () => ({ code: 200, data: departments }))

Mock.mock(/\/api\/doctors(\?.*)?$/, 'get', (options: { url: string }) => {
  const params = new URLSearchParams(options.url.split('?')[1] || '')
  let filtered = [...doctors]
  
  const deptId = params.get('departmentId')
  if (deptId) filtered = filtered.filter(d => d.departmentId === deptId)
  
  const title = params.get('title')
  if (title) filtered = filtered.filter(d => d.title === title)
  
  const status = params.get('status')
  if (status) filtered = filtered.filter(d => d.status === status)
  
  const keyword = params.get('keyword')
  if (keyword) {
    filtered = filtered.filter(d => 
      d.name.includes(keyword) || d.specialty.includes(keyword)
    )
  }
  
  return { code: 200, data: filtered }
})

Mock.mock(/\/api\/slots(\?.*)?$/, 'get', (options: { url: string }) => {
  const params = new URLSearchParams(options.url.split('?')[1] || '')
  let filtered = [...slots]
  
  const doctorId = params.get('doctorId')
  if (doctorId) filtered = filtered.filter(s => s.doctorId === doctorId)
  
  const date = params.get('date')
  if (date) filtered = filtered.filter(s => s.date === date)
  
  const time = params.get('time')
  if (time) filtered = filtered.filter(s => s.time === time)
  
  const startDate = params.get('startDate')
  const endDate = params.get('endDate')
  if (startDate && endDate) {
    filtered = filtered.filter(s => s.date >= startDate && s.date <= endDate)
  }
  
  return { code: 200, data: filtered }
})

Mock.mock(/\/api\/logs(\?.*)?$/, 'get', (options: { url: string }) => {
  const params = new URLSearchParams(options.url.split('?')[1] || '')
  let filtered = [...operationLogs]
  
  const operator = params.get('operator')
  if (operator) filtered = filtered.filter(l => l.operator.includes(operator))
  
  const opType = params.get('operationType')
  if (opType) filtered = filtered.filter(l => l.operationType === opType)
  
  const startDate = params.get('startDate')
  const endDate = params.get('endDate')
  if (startDate && endDate) {
    filtered = filtered.filter(l => {
      const date = l.timestamp.split('T')[0]
      return date >= startDate && date <= endDate
    })
  }
  
  return { code: 200, data: filtered }
})

Mock.mock('/api/slots/register', 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body)
  const slot = slots.find(s => s.id === body.slotId)
  
  if (slot && slot.available > 0) {
    slot.available--
    slot.reserved++
    if (slot.available === 0) slot.status = 'full'
    else if (slot.available <= 5) slot.status = 'limited'
    
    const log: OperationLog = {
      id: `LOG${String(operationLogs.length + 1).padStart(5, '0')}`,
      operator: '挂号员1',
      operatorRole: 'registrar',
      operationType: '患者挂号',
      operationDetail: `患者${body.patientName}挂号成功，医生：${slot.doctorName}，日期：${slot.date}`,
      timestamp: new Date().toISOString()
    }
    operationLogs.unshift(log)
    
    return { code: 200, data: { success: true, slot } }
  }
  
  return { code: 400, message: '号源不足' }
})

Mock.mock('/api/slots/release', 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body)
  const slot = slots.find(s => s.id === body.slotId)
  
  if (slot) {
    slot.available++
    slot.reserved--
    if (slot.available > 5) slot.status = 'available'
    else if (slot.available > 0) slot.status = 'limited'
    
    const log: OperationLog = {
      id: `LOG${String(operationLogs.length + 1).padStart(5, '0')}`,
      operator: '系统管理员',
      operatorRole: 'admin',
      operationType: '释放号源',
      operationDetail: `手动释放号源，医生：${slot.doctorName}，日期：${slot.date}`,
      timestamp: new Date().toISOString()
    }
    operationLogs.unshift(log)
    
    return { code: 200, data: { success: true, slot } }
  }
  
  return { code: 400, message: '号源不存在' }
})

export { hospitals, departments, doctors, slots, operationLogs }
