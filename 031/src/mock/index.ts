import Mock from 'mockjs'
import type {
  Member,
  Card,
  Course,
  Appointment,
  OperationLog,
  FilterOptions,
  CardType,
  MemberStatus,
  AppointmentStatus,
  CourseStatus,
  CardStatus,
  UserRole,
  Gender,
} from '@/types'
import {
  CARD_DURATION_MAP,
  calculateExpiryDate,
  formatDate,
  addDays,
} from '@/utils/date'

const Random = Mock.Random

const courseCategories = ['瑜伽', '动感单车', '力量训练', '有氧健身', '普拉提', '搏击', '游泳']
const coachNames = ['李教练', '王教练', '张教练', '刘教练', '陈教练']
const rooms = ['A1教室', 'A2教室', 'B1教室', 'B2教室', 'C1教室', '私教1室', '私教2室']
const firstNames = ['张', '李', '王', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡']
const lastNames = [
  '伟',
  '芳',
  '娜',
  '敏',
  '静',
  '丽',
  '强',
  '磊',
  '军',
  '洋',
  '勇',
  '艳',
  '杰',
  '娟',
  '涛',
  '明',
  '超',
  '华',
  '平',
]
const operationTypes = [
  '新增会员',
  '更新会员信息',
  '删除会员',
  '开卡',
  '续卡',
  '冻结会员',
  '解冻会员',
  '新增卡种',
  '更新卡种',
  '删除卡种',
  '新增课程',
  '更新课程',
  '取消课程',
  '预约课程',
  '签到核销',
  '取消预约',
  '手动签到',
  '充值',
  '退款',
]
const operationModules = ['会员管理', '卡种管理', '课程管理', '预约管理', '财务管理']
const operatorNames = ['张前台', '李教练', '王教练', '系统管理员']
const operatorRoles: UserRole[] = ['receptionist', 'coach', 'admin']
const targetTypes = ['会员', '卡种', '课程', '预约']

function generateCards(): Card[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'card_001',
      name: '月卡',
      type: 'month',
      price: 299,
      duration: 30,
      description: '30天无限次入场，包含团体课程',
      status: 'active' as CardStatus,
      createTime: now,
      updateTime: now,
    },
    {
      id: 'card_002',
      name: '季卡',
      type: 'quarter',
      price: 799,
      duration: 90,
      description: '90天无限次入场，包含团体课程',
      status: 'active' as CardStatus,
      createTime: now,
      updateTime: now,
    },
    {
      id: 'card_003',
      name: '年卡',
      type: 'year',
      price: 2999,
      duration: 365,
      description: '365天无限次入场，包含团体课程和私教10节',
      status: 'active' as CardStatus,
      createTime: now,
      updateTime: now,
    },
    {
      id: 'card_004',
      name: '次卡（50次）',
      type: 'times',
      price: 1500,
      times: 50,
      description: '50次入场券，有效期一年',
      status: 'active' as CardStatus,
      createTime: now,
      updateTime: now,
    },
    {
      id: 'card_005',
      name: '次卡（10次）',
      type: 'times',
      price: 350,
      times: 10,
      description: '10次入场券，有效期三个月',
      status: 'inactive' as CardStatus,
      createTime: now,
      updateTime: now,
    },
  ]
}

function generateMembers(count: number = 50): Member[] {
  const members: Member[] = []
  const cardTypes: CardType[] = ['month', 'quarter', 'year', 'times']
  const memberStatuses: MemberStatus[] = ['normal', 'expired', 'frozen']
  const genders: Gender[] = ['male', 'female']

  for (let i = 0; i < count; i++) {
    const cardType = Random.pick(cardTypes)
    const status = Random.pick(memberStatuses)
    const gender = Random.pick(genders)
    const birthDate = Random.date('1980-01-01', '2005-12-31')
    const joinDate = Random.date('2025-01-01', '2026-05-01')
    const purchaseDate = joinDate

    const expiryDate = formatDate(calculateExpiryDate(purchaseDate, cardType))
    const remainingDays =
      cardType !== 'times' ? Math.max(0, Math.floor(Math.random() * 90) + 1) : undefined
    const remainingTimes = cardType === 'times' ? Math.max(1, Math.floor(Math.random() * 50) + 1) : undefined

    const now = new Date().toISOString()

    members.push({
      id: `member_${(i + 1).toString().padStart(3, '0')}`,
      name: Random.pick(firstNames) + Random.pick(lastNames),
      phone: '1' + Random.integer(3, 9) + Random.string('number', 9),
      gender,
      birthDate,
      joinDate,
      status,
      cardType,
      cardNumber: 'GYM' + Random.string('number', 10),
      remainingDays,
      remainingTimes,
      expiryDate,
      purchaseDate,
      balance: Random.integer(0, 5000),
      address: Random.city(),
      remarks: Random.boolean() ? Random.cparagraph(1, 1) : '',
      createTime: now,
      updateTime: now,
    })
  }
  return members
}

function generateCourses(count: number = 20): Course[] {
  const courses: Course[] = []
  const statuses: CourseStatus[] = ['upcoming', 'ongoing', 'completed', 'cancelled']
  const now = new Date().toISOString()

  for (let i = 0; i < count; i++) {
    const date = Random.date('2026-05-01', '2026-06-30')
    const startTime = Random.time('HH:mm', '08:00', '20:00')
    const duration = Random.integer(45, 90)
    const maxParticipants = Random.integer(10, 30)
    const currentParticipants = Random.integer(0, maxParticipants)

    courses.push({
      id: `course_${(i + 1).toString().padStart(3, '0')}`,
      name: Random.pick(courseCategories) + '课',
      coachId: `coach_${Random.integer(1, 5)}`,
      coachName: Random.pick(coachNames),
      category: Random.pick(courseCategories),
      duration,
      price: Random.integer(50, 200),
      maxParticipants,
      currentParticipants,
      startTime,
      endTime: addMinutes(startTime, duration),
      date,
      room: Random.pick(rooms),
      status: Random.pick(statuses),
      createTime: now,
      updateTime: now,
    })
  }
  return courses
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + minutes
  const newH = Math.floor(totalMinutes / 60)
  const newM = totalMinutes % 60
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`
}

function generateAppointments(count: number = 30): Appointment[] {
  const appointments: Appointment[] = []
  const memberNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const courseNames = ['瑜伽课', '动感单车课', '力量训练课', '有氧健身课', '普拉提课']
  const statuses: AppointmentStatus[] = ['booked', 'checked_in', 'cancelled']
  const now = new Date().toISOString()

  for (let i = 0; i < count; i++) {
    const status = Random.pick(statuses)
    const appointmentTime = Random.datetime('2026-05-01 08:00', '2026-06-30 21:00')
    const memberName = Random.pick(memberNames)
    const courseName = Random.pick(courseNames)

    appointments.push({
      id: `appt_${(i + 1).toString().padStart(3, '0')}`,
      memberId: `member_${Random.integer(1, 50).toString().padStart(3, '0')}`,
      memberName,
      phone: '1' + Random.integer(3, 9) + Random.string('number', 9),
      courseId: `course_${Random.integer(1, 20).toString().padStart(3, '0')}`,
      courseName,
      coachName: Random.pick(coachNames),
      appointmentTime: new Date(appointmentTime).toISOString(),
      checkInTime:
        status === 'checked_in'
          ? new Date(Random.datetime('2026-05-01 08:00', '2026-06-30 21:00')).toISOString()
          : undefined,
      cancelTime:
        status === 'cancelled'
          ? new Date(Random.datetime('2026-05-01 08:00', '2026-06-30 21:00')).toISOString()
          : undefined,
      status,
      operatorId: '1',
      operatorName: '张前台',
      remarks: Random.boolean() ? Random.cparagraph(1, 1) : '',
      createTime: now,
      updateTime: now,
    })
  }
  return appointments
}

function generateLogs(count: number = 50): OperationLog[] {
  const logs: OperationLog[] = []

  for (let i = 0; i < count; i++) {
    const operationType = Random.pick(operationTypes)
    logs.push({
      id: `log_${Date.now()}_${i}`,
      operatorId: Random.string('number', 1),
      operatorName: Random.pick(operatorNames),
      operatorRole: Random.pick(operatorRoles),
      operationType,
      operationModule: Random.pick(operationModules),
      operationTime: new Date(Random.datetime('2026-04-01', '2026-05-10')).toISOString(),
      targetType: Random.pick(targetTypes),
      targetId: Random.string('number', 3),
      targetName: Random.cname(),
      details: `${operationType}：${Random.cparagraph(1, 1)}`,
      ip: Random.ip(),
    })
  }
  return logs
}

let mockCards = generateCards()
let mockMembers = generateMembers(50)
let mockCourses = generateCourses(20)
let mockAppointments = generateAppointments(30)
let mockLogs = generateLogs(50)

function updateMemberExpiryStatus(member: Member): Member {
  if (member.status === 'frozen') {
    return member
  }

  if (member.expiryDate) {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const expiry = new Date(member.expiryDate)
    expiry.setHours(0, 0, 0, 0)

    if (expiry < now) {
      return {
        ...member,
        status: 'expired',
        remainingDays: 0,
      }
    } else {
      const diffTime = expiry.getTime() - now.getTime()
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return {
        ...member,
        status: member.status === 'expired' ? 'normal' : member.status,
        remainingDays: member.cardType !== 'times' ? remainingDays : member.remainingDays,
      }
    }
  }
  return member
}

function refreshAllMembersExpiry(): void {
  mockMembers = mockMembers.map(updateMemberExpiryStatus)
}

function filterData<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterOptions,
  fieldMap: Record<string, keyof T>
): T[] {
  return data.filter((item) => {
    if (filters.cardType && fieldMap.cardType) {
      if (item[fieldMap.cardType] !== filters.cardType) return false
    }
    if (filters.memberStatus && fieldMap.memberStatus) {
      if (item[fieldMap.memberStatus] !== filters.memberStatus) return false
    }
    if (filters.appointmentStatus && fieldMap.appointmentStatus) {
      if (item[fieldMap.appointmentStatus] !== filters.appointmentStatus) return false
    }
    if (filters.memberName && fieldMap.memberName) {
      const name = String(item[fieldMap.memberName] || '')
      if (!name.includes(filters.memberName)) return false
    }
    if (filters.phone && fieldMap.phone) {
      const phone = String(item[fieldMap.phone] || '')
      if (!phone.includes(filters.phone)) return false
    }
    if (filters.courseName && fieldMap.courseName) {
      const courseName = String(item[fieldMap.courseName] || '')
      if (!courseName.includes(filters.courseName)) return false
    }
    if (filters.coachName && fieldMap.coachName) {
      const coachName = String(item[fieldMap.coachName] || '')
      if (!coachName.includes(filters.coachName)) return false
    }
    if (filters.operatorName && fieldMap.operatorName) {
      const operatorName = String(item[fieldMap.operatorName] || '')
      if (!operatorName.includes(filters.operatorName)) return false
    }
    if (filters.operatorRole && fieldMap.operatorRole) {
      if (item[fieldMap.operatorRole] !== filters.operatorRole) return false
    }
    if (filters.dateRange && fieldMap.dateField) {
      const dateValue = String(item[fieldMap.dateField] || '')
      if (!dateValue) return false
      const date = new Date(dateValue)
      const start = new Date(filters.dateRange[0])
      const end = new Date(filters.dateRange[1])
      end.setHours(23, 59, 59, 999)
      if (date < start || date > end) return false
    }
    return true
  })
}

function paginate<T>(
  data: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; page: number; pageSize: number } {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    data: data.slice(start, end),
    total: data.length,
    page,
    pageSize,
  }
}

Mock.mock('/api/members', 'get', (options: { url: string }) => {
  refreshAllMembersExpiry()
  const url = new URL(options.url, 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')

  const filters: FilterOptions = {
    cardType: (url.searchParams.get('cardType') as CardType | '') || '',
    memberStatus: (url.searchParams.get('memberStatus') as MemberStatus | '') || '',
    memberName: url.searchParams.get('memberName') || '',
    phone: url.searchParams.get('phone') || '',
  }

  const filtered = filterData(mockMembers, filters, {
    cardType: 'cardType',
    memberStatus: 'status',
    memberName: 'name',
    phone: 'phone',
  })

  const result = paginate(filtered, page, pageSize)
  return {
    code: 200,
    ...result,
  }
})

Mock.mock(/\/api\/members\/\w+$/, 'get', (options: { url: string }) => {
  refreshAllMembersExpiry()
  const id = options.url.split('/').pop()
  const member = mockMembers.find((m) => m.id === id)
  if (member) {
    return { code: 200, ...member }
  }
  return { code: 404, message: '会员不存在' }
})

Mock.mock('/api/members', 'post', (options: { body: string }) => {
  const memberData = JSON.parse(options.body) as Omit<Member, 'id' | 'cardNumber'>
  const now = new Date().toISOString()
  const purchaseDate = memberData.purchaseDate || memberData.joinDate
  const expiryDate = memberData.expiryDate || formatDate(calculateExpiryDate(purchaseDate, memberData.cardType))

  const newMember: Member = {
    ...memberData,
    id: `member_${(mockMembers.length + 1).toString().padStart(3, '0')}`,
    cardNumber: 'GYM' + Date.now().toString().slice(-10),
    purchaseDate,
    expiryDate,
    createTime: now,
    updateTime: now,
  }
  mockMembers.unshift(newMember)
  return { code: 200, ...newMember }
})

Mock.mock(/\/api\/members\/\w+$/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/').pop()
  const updateData = JSON.parse(options.body)
  const now = new Date().toISOString()
  const index = mockMembers.findIndex((m) => m.id === id)
  if (index !== -1) {
    const updatedMember = {
      ...mockMembers[index],
      ...updateData,
      updateTime: now,
    }

    if (updateData.cardType && updateData.purchaseDate) {
      updatedMember.expiryDate = formatDate(calculateExpiryDate(updateData.purchaseDate, updateData.cardType))
    }

    mockMembers[index] = updateMemberExpiryStatus(updatedMember)
    return { code: 200, ...mockMembers[index] }
  }
  return { code: 404, message: '会员不存在' }
})

Mock.mock(/\/api\/members\/\w+\/status$/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/')[3]
  const { status } = JSON.parse(options.body)
  const now = new Date().toISOString()
  const index = mockMembers.findIndex((m) => m.id === id)
  if (index !== -1) {
    mockMembers[index].status = status
    mockMembers[index].updateTime = now
    return { code: 200, ...mockMembers[index] }
  }
  return { code: 404, message: '会员不存在' }
})

Mock.mock(/\/api\/members\/\w+\/renew$/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/')[3]
  const { renewDays, renewTimes } = JSON.parse(options.body)
  const now = new Date().toISOString()
  const index = mockMembers.findIndex((m) => m.id === id)
  if (index !== -1) {
    const member = mockMembers[index]

    if (member.cardType === 'times' && renewTimes) {
      member.remainingTimes = (member.remainingTimes || 0) + renewTimes
    } else if (renewDays) {
      const baseDate = member.expiryDate && new Date(member.expiryDate) > new Date()
        ? member.expiryDate
        : new Date().toISOString()
      member.expiryDate = formatDate(addDays(baseDate, renewDays))
    }

    member.updateTime = now
    mockMembers[index] = updateMemberExpiryStatus(member)
    return { code: 200, ...mockMembers[index] }
  }
  return { code: 404, message: '会员不存在' }
})

Mock.mock(/\/api\/members\/\w+$/, 'delete', (options: { url: string }) => {
  const id = options.url.split('/').pop()
  const index = mockMembers.findIndex((m) => m.id === id)
  if (index !== -1) {
    mockMembers.splice(index, 1)
    return { code: 200 }
  }
  return { code: 404, message: '会员不存在' }
})

Mock.mock(/\/api\/members\/\w+\/check-conflict/, 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const date = url.searchParams.get('date') || ''
  const memberId = options.url.split('/')[3]

  const conflictingAppointment = mockAppointments.find(
    (a) => a.memberId === memberId && a.status === 'booked' && a.appointmentTime.startsWith(date.split('T')[0])
  )

  if (conflictingAppointment) {
    return {
      code: 200,
      hasConflict: true,
      message: '该会员当天已有其他课程预约，请注意时间冲突',
      conflictingAppointment,
    }
  }
  return { code: 200, hasConflict: false }
})

Mock.mock('/api/cards', 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
  const result = paginate(mockCards, page, pageSize)
  return { code: 200, ...result }
})

Mock.mock('/api/cards/all', 'get', () => {
  return { code: 200, data: mockCards.filter((c) => c.status === 'active') }
})

Mock.mock('/api/cards', 'post', (options: { body: string }) => {
  const cardData = JSON.parse(options.body)
  const now = new Date().toISOString()
  const newCard: Card = {
    ...cardData,
    id: `card_${(mockCards.length + 1).toString().padStart(3, '0')}`,
    createTime: now,
    updateTime: now,
  }
  mockCards.unshift(newCard)
  return { code: 200, ...newCard }
})

Mock.mock(/\/api\/cards\/\w+$/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/').pop()
  const updateData = JSON.parse(options.body)
  const now = new Date().toISOString()
  const index = mockCards.findIndex((c) => c.id === id)
  if (index !== -1) {
    mockCards[index] = { ...mockCards[index], ...updateData, updateTime: now }
    return { code: 200, ...mockCards[index] }
  }
  return { code: 404, message: '卡种不存在' }
})

Mock.mock(/\/api\/cards\/\w+$/, 'delete', (options: { url: string }) => {
  const id = options.url.split('/').pop()
  const index = mockCards.findIndex((c) => c.id === id)
  if (index !== -1) {
    mockCards.splice(index, 1)
    return { code: 200 }
  }
  return { code: 404, message: '卡种不存在' }
})

Mock.mock('/api/courses', 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')

  const filters: FilterOptions = {
    courseName: url.searchParams.get('courseName') || '',
    coachName: url.searchParams.get('coachName') || '',
  }

  const filtered = filterData(mockCourses, filters, {
    courseName: 'name',
    coachName: 'coachName',
  })

  const result = paginate(filtered, page, pageSize)
  return { code: 200, ...result }
})

Mock.mock('/api/courses/upcoming', 'get', () => {
  const upcoming = mockCourses.filter((c) => c.status === 'upcoming')
  return { code: 200, data: upcoming }
})

Mock.mock('/api/courses', 'post', (options: { body: string }) => {
  const courseData = JSON.parse(options.body)
  const now = new Date().toISOString()
  const newCourse: Course = {
    ...courseData,
    id: `course_${(mockCourses.length + 1).toString().padStart(3, '0')}`,
    currentParticipants: 0,
    createTime: now,
    updateTime: now,
  }
  mockCourses.unshift(newCourse)
  return { code: 200, ...newCourse }
})

Mock.mock(/\/api\/courses\/\w+$/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/').pop()
  const updateData = JSON.parse(options.body)
  const now = new Date().toISOString()
  const index = mockCourses.findIndex((c) => c.id === id)
  if (index !== -1) {
    mockCourses[index] = { ...mockCourses[index], ...updateData, updateTime: now }
    return { code: 200, ...mockCourses[index] }
  }
  return { code: 404, message: '课程不存在' }
})

Mock.mock(/\/api\/courses\/\w+\/cancel$/, 'put', (options: { url: string }) => {
  const id = options.url.split('/')[3]
  const now = new Date().toISOString()
  const index = mockCourses.findIndex((c) => c.id === id)
  if (index !== -1) {
    mockCourses[index].status = 'cancelled'
    mockCourses[index].updateTime = now
    return { code: 200, ...mockCourses[index] }
  }
  return { code: 404, message: '课程不存在' }
})

Mock.mock('/api/appointments', 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')

  const filters: FilterOptions = {
    appointmentStatus: (url.searchParams.get('appointmentStatus') as AppointmentStatus | '') || '',
    memberName: url.searchParams.get('memberName') || '',
    phone: url.searchParams.get('phone') || '',
    courseName: url.searchParams.get('courseName') || '',
    coachName: url.searchParams.get('coachName') || '',
  }

  const filtered = filterData(mockAppointments, filters, {
    appointmentStatus: 'status',
    memberName: 'memberName',
    phone: 'phone',
    courseName: 'courseName',
    coachName: 'coachName',
  })

  filtered.sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime())

  const result = paginate(filtered, page, pageSize)
  return { code: 200, ...result }
})

Mock.mock('/api/appointments', 'post', (options: { body: string }) => {
  const appointmentData = JSON.parse(options.body)

  const member = mockMembers.find((m) => m.id === appointmentData.memberId)
  if (!member) {
    return { code: 400, message: '会员不存在，请检查会员信息' }
  }

  if (member.status === 'expired') {
    return { code: 400, message: '该会员已过期，请先续卡后再预约' }
  }
  if (member.status === 'frozen') {
    return { code: 400, message: '该会员已被冻结，请先解冻后再预约' }
  }

  const course = mockCourses.find((c) => c.id === appointmentData.courseId)
  if (!course) {
    return { code: 400, message: '课程不存在，请检查课程信息' }
  }
  if (course.status !== 'upcoming') {
    return { code: 400, message: '该课程已开始或已结束，无法预约' }
  }
  if (course.currentParticipants >= course.maxParticipants) {
    return { code: 400, message: '课程预约已满，请选择其他课程' }
  }

  const existingAppointment = mockAppointments.find(
    (a) =>
      a.memberId === appointmentData.memberId &&
      a.courseId === appointmentData.courseId &&
      a.status === 'booked'
  )
  if (existingAppointment) {
    return { code: 400, message: '该会员已预约此课程，请勿重复预约' }
  }

  const now = new Date().toISOString()
  const newAppointment: Appointment = {
    ...appointmentData,
    id: `appt_${(mockAppointments.length + 1).toString().padStart(3, '0')}`,
    status: 'booked',
    appointmentTime: now,
    createTime: now,
    updateTime: now,
  }
  mockAppointments.unshift(newAppointment)

  const courseIndex = mockCourses.findIndex((c) => c.id === appointmentData.courseId)
  if (courseIndex !== -1) {
    mockCourses[courseIndex].currentParticipants += 1
  }

  return { code: 200, ...newAppointment }
})

Mock.mock(/\/api\/appointments\/\w+\/check-in$/, 'put', (options: { url: string }) => {
  const id = options.url.split('/')[3]
  const now = new Date().toISOString()
  const index = mockAppointments.findIndex((a) => a.id === id)
  if (index === -1) {
    return { code: 404, message: '预约不存在' }
  }

  const appointment = mockAppointments[index]
  if (appointment.status === 'checked_in') {
    return { code: 400, message: '该预约已签到，请勿重复签到' }
  }
  if (appointment.status === 'cancelled') {
    return { code: 400, message: '该预约已取消，无法签到' }
  }

  const member = mockMembers.find((m) => m.id === appointment.memberId)
  if (member) {
    if (member.status === 'expired') {
      return { code: 400, message: '该会员已过期，请先续卡' }
    }
    if (member.status === 'frozen') {
      return { code: 400, message: '该会员已被冻结，请先解冻' }
    }

    if (member.cardType === 'times') {
      if (!member.remainingTimes || member.remainingTimes <= 0) {
        return { code: 400, message: '次卡次数不足，请先充值' }
      }
    }
  }

  mockAppointments[index].status = 'checked_in'
  mockAppointments[index].checkInTime = now
  mockAppointments[index].updateTime = now

  if (member) {
    const memberIndex = mockMembers.findIndex((m) => m.id === member.id)
    if (memberIndex !== -1 && member.cardType === 'times' && member.remainingTimes && member.remainingTimes > 0) {
      mockMembers[memberIndex].remainingTimes -= 1
    }
  }

  return { code: 200, ...mockAppointments[index] }
})

Mock.mock(/\/api\/appointments\/\w+\/cancel$/, 'put', (options: { url: string }) => {
  const id = options.url.split('/')[3]
  const now = new Date().toISOString()
  const index = mockAppointments.findIndex((a) => a.id === id)
  if (index === -1) {
    return { code: 404, message: '预约不存在' }
  }

  const appointment = mockAppointments[index]
  if (appointment.status === 'checked_in') {
    return { code: 400, message: '该预约已签到，无法取消' }
  }
  if (appointment.status === 'cancelled') {
    return { code: 400, message: '该预约已取消，请勿重复操作' }
  }

  mockAppointments[index].status = 'cancelled'
  mockAppointments[index].cancelTime = now
  mockAppointments[index].updateTime = now

  const courseIndex = mockCourses.findIndex((c) => c.id === appointment.courseId)
  if (courseIndex !== -1 && mockCourses[courseIndex].currentParticipants > 0) {
    mockCourses[courseIndex].currentParticipants -= 1
  }

  return { code: 200, ...mockAppointments[index] }
})

Mock.mock('/api/logs', 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')

  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')

  const filters: FilterOptions = {
    operatorName: url.searchParams.get('operatorName') || '',
    operatorRole: (url.searchParams.get('operatorRole') as UserRole | '') || '',
    dateRange: startDate && endDate ? [startDate, endDate] : undefined,
  }

  const filtered = filterData(mockLogs, filters, {
    operatorName: 'operatorName',
    operatorRole: 'operatorRole',
    dateField: 'operationTime',
  })

  filtered.sort((a, b) => new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime())

  const result = paginate(filtered, page, pageSize)
  return { code: 200, ...result }
})

Mock.mock('/api/logs', 'post', (options: { body: string }) => {
  const logData = JSON.parse(options.body)
  mockLogs.unshift(logData)
  return { code: 200, ...logData }
})

Mock.mock('/api/members/statistics', 'get', () => {
  refreshAllMembersExpiry()

  const total = mockMembers.length
  const normal = mockMembers.filter((m) => m.status === 'normal').length
  const expired = mockMembers.filter((m) => m.status === 'expired').length
  const frozen = mockMembers.filter((m) => m.status === 'frozen').length

  const byCardType = {
    month: mockMembers.filter((m) => m.cardType === 'month').length,
    quarter: mockMembers.filter((m) => m.cardType === 'quarter').length,
    year: mockMembers.filter((m) => m.cardType === 'year').length,
    times: mockMembers.filter((m) => m.cardType === 'times').length,
  }

  return {
    code: 200,
    data: {
      total,
      normal,
      expired,
      frozen,
      byCardType,
    },
  }
})

Mock.mock('/api/appointments/statistics', 'get', () => {
  const total = mockAppointments.length
  const booked = mockAppointments.filter((a) => a.status === 'booked').length
  const checkedIn = mockAppointments.filter((a) => a.status === 'checked_in').length
  const cancelled = mockAppointments.filter((a) => a.status === 'cancelled').length

  const today = new Date().toISOString().split('T')[0]
  const todayCount = mockAppointments.filter((a) => a.appointmentTime.startsWith(today)).length

  return {
    code: 200,
    data: {
      total,
      booked,
      checkedIn,
      cancelled,
      today: todayCount,
    },
  }
})

export { mockMembers, mockCards, mockCourses, mockAppointments, mockLogs, CARD_DURATION_MAP }
