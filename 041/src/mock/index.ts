import Mock from 'mockjs'
import type { 
  Hospital, 
  Department, 
  Doctor, 
  ScheduleSlot, 
  OperationLog,
  FeeRule,
  RegistrationFee,
  ScheduleRule,
  RegistrationRecord,
  DoctorTitle,
  DoctorStatus,
  ScheduleTime,
  SlotStatus
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

const feeRules: FeeRule[] = [
  { title: '专家', baseFee: 300, expertPremium: 200, description: '专家门诊' },
  { title: '主任医师', baseFee: 100, expertPremium: 0, description: '正高职称' },
  { title: '副主任医师', baseFee: 80, expertPremium: 0, description: '副高职称' },
  { title: '主治医师', baseFee: 50, expertPremium: 0, description: '中级职称' },
  { title: '住院医师', baseFee: 30, expertPremium: 0, description: '初级职称' }
]

function calculateFee(title: DoctorTitle, isExpert: boolean): RegistrationFee {
  const rule = feeRules.find(r => r.title === title) || feeRules[3]
  const expertPremium = isExpert && title !== '专家' ? feeRules[0].expertPremium : 0
  const baseFee = rule.baseFee
  const totalFee = baseFee + expertPremium
  
  return {
    baseFee,
    expertPremium,
    totalFee,
    title,
    isExpert
  }
}

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
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
    phone: `1${String(Math.floor(Math.random() * 9) + 3)}${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
    email: `doctor${index + 1}@hospital.com`,
    joinDate: `202${Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
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
      if (doctor.status !== 'stop' && Math.random() > 0.3) {
        const usedTimes = new Set<ScheduleTime>()
        const numSlots = Math.floor(Math.random() * 2) + 1
        
        for (let i = 0; i < numSlots; i++) {
          let time: ScheduleTime
          do {
            time = times[Math.floor(Math.random() * times.length)]
          } while (usedTimes.has(time))
          usedTimes.add(time)
          
          const isExpert = doctor.title === '专家'
          const total = isExpert ? 15 : 25
          const reserved = Math.floor(Math.random() * (total + 1))
          const available = total - reserved
          
          let status: SlotStatus = 'available'
          if (available === 0) status = 'full'
          else if (available <= 5) status = 'limited'
          
          const isLocked = Math.random() > 0.95
          if (isLocked) status = 'locked'
          
          const doctorDept = departments.find(d => d.id === doctor.departmentId)
          
          slots.push({
            id: `SLOT${String(slots.length + 1).padStart(5, '0')}`,
            doctorId: doctor.id,
            doctorName: doctor.name,
            departmentId: doctor.departmentId,
            departmentName: doctor.departmentName,
            hospitalId: doctor.hospitalId,
            hospitalName: doctor.hospitalName,
            date: dateStr,
            time,
            total,
            reserved,
            available,
            status,
            isExpert,
            isLocked,
            fee: calculateFee(doctor.title, isExpert),
            stopReason: doctor.status === 'stop' ? '医生休假' : undefined,
            scheduleRuleId: `RULE${String(Math.floor(slots.length / 10) + 1).padStart(4, '0')}`
          })
        }
      }
    })
  }
  
  return slots
}

const slots = generateSlots()

const scheduleRules: ScheduleRule[] = doctors.slice(0, 8).map((doctor, index) => {
  const dept = departments.find(d => d.id === doctor.departmentId)!
  return {
    id: `RULE${String(index + 1).padStart(4, '0')}`,
    doctorId: doctor.id,
    doctorName: doctor.name,
    departmentId: doctor.departmentId,
    date: new Date().toISOString().split('T')[0],
    times: ['morning', 'afternoon'].slice(0, Math.floor(Math.random() * 2) + 1),
    maxPatients: doctor.title === '专家' ? 15 : 25,
    repeatMode: index % 2 === 0 ? 'weekly' : 'none',
    repeatDays: index % 2 === 0 ? [1, 3, 5] : undefined,
    repeatEndDate: index % 2 === 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
    isExpert: doctor.title === '专家',
    notes: '',
    createdAt: new Date().toISOString(),
    createdBy: '系统管理员'
  }
})

const operations: string[] = [
  '添加医生', '编辑医生信息', '删除医生', '修改出诊状态',
  '创建排班', '编辑排班', '删除排班', '锁定号源', '解锁号源',
  '释放号源', '添加停诊备注', '设置替诊医生',
  '患者挂号', '取消挂号', '患者签到', '修改挂号费', '批量创建排班'
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
    timestamp: date.toISOString(),
    ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    deviceInfo: 'Windows 11 / Chrome 120'
  }
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

const patientNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
const registrationRecords: RegistrationRecord[] = Array.from({ length: 30 }, (_, i) => {
  const slot = slots[Math.floor(Math.random() * slots.length)]
  const statuses: Array<'registered' | 'checked' | 'cancelled'> = ['registered', 'checked', 'cancelled']
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 7))
  
  return {
    id: `REG${String(i + 1).padStart(6, '0')}`,
    slotId: slot.id,
    doctorId: slot.doctorId,
    doctorName: slot.doctorName,
    patientName: patientNames[Math.floor(Math.random() * patientNames.length)],
    patientPhone: `1${String(Math.floor(Math.random() * 9) + 3)}${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
    patientIdCard: `110101${String(1970 + Math.floor(Math.random() * 50))}${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    date: slot.date,
    time: slot.time,
    fee: slot.fee,
    status,
    registeredAt: date.toISOString(),
    checkedAt: status === 'checked' ? new Date(date.getTime() + 60 * 60 * 1000).toISOString() : undefined,
    cancelledAt: status === 'cancelled' ? new Date(date.getTime() + 30 * 60 * 1000).toISOString() : undefined,
    cancelReason: status === 'cancelled' ? '患者个人原因' : undefined,
    operator: `挂号员${Math.floor(Math.random() * 5) + 1}`,
    operatorRole: 'registrar'
  }
})

Mock.setup({ timeout: '200-500' })

Mock.mock('/api/hospitals', 'get', () => ({ code: 200, data: hospitals }))

Mock.mock('/api/departments', 'get', () => ({ code: 200, data: departments }))

Mock.mock('/api/fee-rules', 'get', () => ({ code: 200, data: feeRules }))

Mock.mock('/api/schedule-rules', 'get', () => ({ code: 200, data: scheduleRules }))

Mock.mock('/api/registration-records', 'get', () => ({ code: 200, data: registrationRecords }))

Mock.mock(/\/api\/doctors(\?.*)?$/, 'get', (options: { url: string }) => {
  const params = new URLSearchParams(options.url.split('?')[1] || '')
  let filtered = [...doctors]
  
  const hospitalId = params.get('hospitalId')
  if (hospitalId) filtered = filtered.filter(d => d.hospitalId === hospitalId)
  
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
  
  const hospitalId = params.get('hospitalId')
  if (hospitalId) filtered = filtered.filter(s => s.hospitalId === hospitalId)
  
  const deptId = params.get('departmentId')
  if (deptId) filtered = filtered.filter(s => s.departmentId === deptId)
  
  const doctorId = params.get('doctorId')
  if (doctorId) filtered = filtered.filter(s => s.doctorId === doctorId)
  
  const date = params.get('date')
  if (date) filtered = filtered.filter(s => s.date === date)
  
  const time = params.get('time')
  if (time) filtered = filtered.filter(s => s.time === time)
  
  const status = params.get('status')
  if (status) filtered = filtered.filter(s => s.status === status)
  
  const isExpert = params.get('isExpert')
  if (isExpert) filtered = filtered.filter(s => s.isExpert === (isExpert === 'true'))
  
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
  
  const operatorRole = params.get('operatorRole')
  if (operatorRole) filtered = filtered.filter(l => l.operatorRole === operatorRole)
  
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
  
  if (slot && slot.available > 0 && !slot.isLocked) {
    slot.available--
    slot.reserved++
    if (slot.available === 0) slot.status = 'full'
    else if (slot.available <= 5) slot.status = 'limited'
    
    const newRecord: RegistrationRecord = {
      id: `REG${String(registrationRecords.length + 1).padStart(6, '0')}`,
      slotId: slot.id,
      doctorId: slot.doctorId,
      doctorName: slot.doctorName,
      patientName: body.patientName,
      patientPhone: body.patientPhone,
      patientIdCard: body.patientIdCard,
      date: slot.date,
      time: slot.time,
      fee: slot.fee,
      status: 'registered',
      registeredAt: new Date().toISOString(),
      operator: '挂号员1',
      operatorRole: 'registrar'
    }
    registrationRecords.unshift(newRecord)
    
    operationLogs.unshift({
      id: `LOG${String(operationLogs.length + 1).padStart(5, '0')}`,
      operator: '挂号员1',
      operatorRole: 'registrar',
      operationType: '患者挂号',
      operationDetail: `患者${body.patientName}挂号成功，医生：${slot.doctorName}，日期：${slot.date}，费用：¥${slot.fee.totalFee}`,
      timestamp: new Date().toISOString(),
      targetId: newRecord.id,
      targetType: 'registration'
    })
    
    return { code: 200, data: { success: true, slot, record: newRecord } }
  }
  
  return { code: 400, message: slot?.isLocked ? '号源已锁定' : '号源不足' }
})

Mock.mock('/api/slots/cancel', 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body)
  const record = registrationRecords.find(r => r.id === body.recordId)
  
  if (record && record.status === 'registered') {
    record.status = 'cancelled'
    record.cancelledAt = new Date().toISOString()
    record.cancelReason = body.reason || '患者取消'
    
    const slot = slots.find(s => s.id === record.slotId)
    if (slot) {
      slot.available++
      slot.reserved--
      if (slot.available > 5) slot.status = 'available'
      else if (slot.available > 0) slot.status = 'limited'
    }
    
    operationLogs.unshift({
      id: `LOG${String(operationLogs.length + 1).padStart(5, '0')}`,
      operator: '系统管理员',
      operatorRole: 'admin',
      operationType: '取消挂号',
      operationDetail: `取消患者${record.patientName}的挂号，医生：${record.doctorName}`,
      timestamp: new Date().toISOString(),
      targetId: record.id,
      targetType: 'registration'
    })
    
    return { code: 200, data: { success: true } }
  }
  
  return { code: 400, message: '无法取消该挂号记录' }
})

Mock.mock('/api/slots/lock', 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body)
  const slot = slots.find(s => s.id === body.slotId)
  
  if (slot) {
    slot.isLocked = true
    slot.status = 'locked'
    
    operationLogs.unshift({
      id: `LOG${String(operationLogs.length + 1).padStart(5, '0')}`,
      operator: '系统管理员',
      operatorRole: 'admin',
      operationType: '锁定号源',
      operationDetail: `锁定号源：${slot.doctorName} ${slot.date} ${slot.time}`,
      timestamp: new Date().toISOString(),
      targetId: slot.id,
      targetType: 'slot'
    })
    
    return { code: 200, data: { success: true, slot } }
  }
  
  return { code: 400, message: '号源不存在' }
})

Mock.mock('/api/slots/unlock', 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body)
  const slot = slots.find(s => s.id === body.slotId)
  
  if (slot) {
    slot.isLocked = false
    if (slot.available === 0) slot.status = 'full'
    else if (slot.available <= 5) slot.status = 'limited'
    else slot.status = 'available'
    
    operationLogs.unshift({
      id: `LOG${String(operationLogs.length + 1).padStart(5, '0')}`,
      operator: '系统管理员',
      operatorRole: 'admin',
      operationType: '解锁号源',
      operationDetail: `解锁号源：${slot.doctorName} ${slot.date} ${slot.time}`,
      timestamp: new Date().toISOString(),
      targetId: slot.id,
      targetType: 'slot'
    })
    
    return { code: 200, data: { success: true, slot } }
  }
  
  return { code: 400, message: '号源不存在' }
})

Mock.mock('/api/slots/release', 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body)
  const slot = slots.find(s => s.id === body.slotId)
  
  if (slot) {
    slot.available++
    slot.reserved--
    if (slot.available > 5) slot.status = 'available'
    else if (slot.available > 0) slot.status = 'limited'
    
    operationLogs.unshift({
      id: `LOG${String(operationLogs.length + 1).padStart(5, '0')}`,
      operator: '系统管理员',
      operatorRole: 'admin',
      operationType: '释放号源',
      operationDetail: `手动释放号源，医生：${slot.doctorName}，日期：${slot.date}`,
      timestamp: new Date().toISOString(),
      targetId: slot.id,
      targetType: 'slot'
    })
    
    return { code: 200, data: { success: true, slot } }
  }
  
  return { code: 400, message: '号源不存在' }
})

Mock.mock('/api/schedule-rules', 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body) as ScheduleRule
  const doctor = doctors.find(d => d.id === body.doctorId)
  
  if (doctor) {
    const newRule: ScheduleRule = {
      ...body,
      id: `RULE${String(scheduleRules.length + 1).padStart(4, '0')}`,
      doctorName: doctor.name,
      createdAt: new Date().toISOString(),
      createdBy: '系统管理员'
    }
    scheduleRules.unshift(newRule)
    
    const datesToGenerate: string[] = []
    if (body.repeatMode === 'none') {
      datesToGenerate.push(body.date)
    } else if (body.repeatMode === 'daily' && body.repeatEndDate) {
      const start = new Date(body.date)
      const end = new Date(body.repeatEndDate)
      while (start <= end) {
        datesToGenerate.push(start.toISOString().split('T')[0])
        start.setDate(start.getDate() + 1)
      }
    } else if (body.repeatMode === 'weekly' && body.repeatDays && body.repeatEndDate) {
      const start = new Date(body.date)
      const end = new Date(body.repeatEndDate)
      while (start <= end) {
        if (body.repeatDays.includes(start.getDay())) {
          datesToGenerate.push(start.toISOString().split('T')[0])
        }
        start.setDate(start.getDate() + 1)
      }
    }
    
    datesToGenerate.forEach(dateStr => {
      body.times.forEach(time => {
        const existingSlot = slots.find(s => 
          s.doctorId === body.doctorId && s.date === dateStr && s.time === time
        )
        
        if (!existingSlot) {
          const total = body.maxPatients
          slots.push({
            id: `SLOT${String(slots.length + 1).padStart(5, '0')}`,
            doctorId: body.doctorId,
            doctorName: doctor.name,
            departmentId: doctor.departmentId,
            departmentName: doctor.departmentName,
            hospitalId: doctor.hospitalId,
            hospitalName: doctor.hospitalName,
            date: dateStr,
            time,
            total,
            reserved: 0,
            available: total,
            status: 'available',
            isExpert: doctor.title === '专家',
            isLocked: false,
            fee: calculateFee(doctor.title, doctor.title === '专家'),
            scheduleRuleId: newRule.id
          })
        }
      })
    })
    
    operationLogs.unshift({
      id: `LOG${String(operationLogs.length + 1).padStart(5, '0')}`,
      operator: '系统管理员',
      operatorRole: 'admin',
      operationType: '创建排班',
      operationDetail: `为医生${doctor.name}创建排班规则，生成${datesToGenerate.length}天排班`,
      timestamp: new Date().toISOString(),
      targetId: newRule.id,
      targetType: 'schedule'
    })
    
    return { code: 200, data: { success: true, rule: newRule, generatedCount: datesToGenerate.length } }
  }
  
  return { code: 400, message: '医生不存在' }
})

export { hospitals, departments, doctors, slots, operationLogs, feeRules, scheduleRules, registrationRecords, calculateFee }
