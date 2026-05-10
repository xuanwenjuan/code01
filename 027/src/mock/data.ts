import Mock from 'mockjs'
import type {
  Department,
  Doctor,
  Patient,
  Registration,
  Prescription,
  PrescriptionItem,
  OperationLog,
  User,
  Schedule,
  TitleLevel,
  VisitStatus,
  OperationType,
  TargetType,
  UserRole
} from '@/types'

const generateId = (): string => Mock.Random.guid()

const titleLevels: TitleLevel[] = ['主任医师', '副主任医师', '主治医师', '住院医师', '医士']

const departmentNames = ['内科', '外科', '儿科', '眼科', '口腔科', '妇产科', '皮肤科', '骨科', '神经内科', '心血管内科']
const departmentLocations = [
  '门诊楼1层A区', '门诊楼1层B区', '门诊楼2层A区', '门诊楼2层B区',
  '门诊楼3层A区', '门诊楼3层B区', '门诊楼4层A区', '门诊楼4层B区'
]

const medicineNames = [
  '阿莫西林胶囊', '头孢克肟片', '布洛芬缓释胶囊', '奥美拉唑肠溶胶囊',
  '氯雷他定片', '蒙脱石散', '复方氨酚烷胺片', '维生素C片',
  '甲硝唑片', '盐酸左氧氟沙星胶囊', '对乙酰氨基酚片', '多潘立酮片',
  '黄连素片', '乳酸菌素片', '葡萄糖酸钙口服溶液'
]

export const mockDepartments: Department[] = departmentNames.map((name, index) => ({
  id: generateId(),
  name,
  description: `${name}是我院重点科室之一，拥有先进的医疗设备和专业的医疗团队。`,
  location: departmentLocations[index % departmentLocations.length],
  phone: `010-${Mock.Random.integer(10000000, 99999999)}`,
  status: index < 8 ? 'active' : 'inactive',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}))

const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高']
const lastNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛']

export const mockDoctors: Doctor[] = []
mockDepartments.slice(0, 6).forEach((dept, deptIndex) => {
  const doctorCount = deptIndex < 2 ? 5 : 3
  for (let i = 0; i < doctorCount; i++) {
    const firstName = firstNames[Mock.Random.integer(0, firstNames.length - 1)]
    const lastName = lastNames[Mock.Random.integer(0, lastNames.length - 1)]
    mockDoctors.push({
      id: generateId(),
      name: `${firstName}${lastName}`,
      gender: Mock.Random.boolean() ? 'male' : 'female',
      age: Mock.Random.integer(28, 60),
      title: titleLevels[Mock.Random.integer(0, titleLevels.length - 1)],
      departmentId: dept.id,
      phone: `1${Mock.Random.integer(3, 9)}${Mock.Random.string('number', 9)}`,
      email: Mock.Random.email(),
      specialty: Mock.Random.pick([
        '常见病诊治', '疑难病症', '微创手术', '慢性病管理',
        '康复治疗', '预防保健', '急诊处理'
      ]),
      education: Mock.Random.pick(['博士', '硕士', '本科']),
      avatar: '',
      status: i < doctorCount - 1 ? 'on_duty' : 'off_duty',
      createdAt: Mock.Random.date('2023-01-01', '2023-12-31') + 'T00:00:00.000Z',
      updatedAt: Mock.Random.date('2024-01-01', '2024-05-01') + 'T00:00:00.000Z'
    })
  }
})

export const mockSchedules: Schedule[] = []
mockDoctors.forEach(doctor => {
  const weekDays = [1, 2, 3, 4, 5]
  weekDays.forEach(day => {
    if (Mock.Random.boolean(0.6)) {
      if (Mock.Random.boolean()) {
        mockSchedules.push({
          doctorId: doctor.id,
          departmentId: doctor.departmentId,
          weekDay: day as 1 | 2 | 3 | 4 | 5 | 6 | 7,
          timeSlot: 'morning',
          maxPatients: 20,
          status: 'available'
        })
      }
      if (Mock.Random.boolean()) {
        mockSchedules.push({
          doctorId: doctor.id,
          departmentId: doctor.departmentId,
          weekDay: day as 1 | 2 | 3 | 4 | 5 | 6 | 7,
          timeSlot: 'afternoon',
          maxPatients: 15,
          status: 'available'
        })
      }
    }
  })
})

export const mockPatients: Patient[] = []
for (let i = 0; i < 50; i++) {
  const firstName = firstNames[Mock.Random.integer(0, firstNames.length - 1)]
  const lastName = lastNames[Mock.Random.integer(0, lastNames.length - 1)]
  mockPatients.push({
    id: generateId(),
    name: `${firstName}${lastName}`,
    gender: Mock.Random.boolean() ? 'male' : 'female',
    age: Mock.Random.integer(1, 85),
    phone: `1${Mock.Random.integer(3, 9)}${Mock.Random.string('number', 9)}`,
    idCard: Mock.Random.string('number', 18),
    address: `北京市${Mock.Random.pick(['朝阳区', '海淀区', '东城区', '西城区', '丰台区'])}${Mock.Random.string('letter', 5)}路${Mock.Random.integer(1, 100)}号`,
    emergencyContact: `${firstNames[Mock.Random.integer(0, firstNames.length - 1)]}某某`,
    emergencyPhone: `1${Mock.Random.integer(3, 9)}${Mock.Random.string('number', 9)}`,
    medicalHistory: Mock.Random.boolean() ? '有高血压病史3年，糖尿病史2年' : '无特殊病史',
    createdAt: Mock.Random.date('2024-01-01', '2024-04-30') + 'T00:00:00.000Z',
    updatedAt: Mock.Random.date('2024-01-01', '2024-05-01') + 'T00:00:00.000Z'
  })
}

const visitStatuses: VisitStatus[] = ['waiting', 'ongoing', 'completed', 'cancelled']
export const mockRegistrations: Registration[] = []
for (let i = 0; i < 80; i++) {
  const patient = mockPatients[Mock.Random.integer(0, mockPatients.length - 1)]
  const doctor = mockDoctors[Mock.Random.integer(0, mockDoctors.length - 1)]
  const dept = mockDepartments.find(d => d.id === doctor.departmentId)!
  const status = visitStatuses[Mock.Random.integer(0, 3)]
  const scheduleDate = Mock.Random.date('2024-05-01', '2024-05-10')
  
  mockRegistrations.push({
    id: generateId(),
    patientId: patient.id,
    patientName: patient.name,
    doctorId: doctor.id,
    doctorName: doctor.name,
    departmentId: dept.id,
    departmentName: dept.name,
    scheduleDate,
    timeSlot: Mock.Random.boolean() ? 'morning' : 'afternoon',
    visitNumber: Mock.Random.integer(1, 30),
    status,
    actualVisitTime: status !== 'waiting' ? `${scheduleDate} ${Mock.Random.integer(8, 17)}:${Mock.Random.string('number', 2)}:00` : undefined,
    completeTime: status === 'completed' ? `${scheduleDate} ${Mock.Random.integer(9, 18)}:${Mock.Random.string('number', 2)}:00` : undefined,
    symptoms: Mock.Random.pick(['发热咳嗽3天', '头晕头痛', '腹痛腹泻', '胸闷气短', '关节疼痛', '皮肤瘙痒']),
    diagnosis: status === 'completed' ? Mock.Random.pick(['上呼吸道感染', '高血压', '肠胃炎', '过敏反应', '关节炎']) : undefined,
    createdAt: `${scheduleDate} 08:00:00`,
    updatedAt: `${scheduleDate} 18:00:00`
  })
}

export const mockPrescriptions: Prescription[] = []
mockRegistrations.filter(r => r.status === 'completed').forEach(reg => {
  if (Mock.Random.boolean(0.8)) {
    const itemCount = Mock.Random.integer(1, 4)
    const items: PrescriptionItem[] = []
    for (let i = 0; i < itemCount; i++) {
      const price = Mock.Random.integer(10, 100)
      items.push({
        id: generateId(),
        medicineName: Mock.Random.pick(medicineNames),
        specification: `${Mock.Random.integer(10, 500)}mg/片`,
        dosage: '每次1片',
        usage: Mock.Random.pick(['口服，每日3次', '口服，每日2次', '饭后服用']),
        quantity: Mock.Random.integer(7, 30),
        unit: '片',
        price
      })
    }
    
    mockPrescriptions.push({
      id: generateId(),
      registrationId: reg.id,
      patientId: reg.patientId,
      patientName: reg.patientName,
      doctorId: reg.doctorId,
      doctorName: reg.doctorName,
      departmentId: reg.departmentId,
      departmentName: reg.departmentName,
      items,
      totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      remark: '',
      status: Mock.Random.pick(['pending', 'issued', 'dispensed']),
      createdAt: reg.completeTime || `${reg.scheduleDate} 12:00:00`,
      updatedAt: reg.completeTime || `${reg.scheduleDate} 12:00:00`
    })
  }
})

const operationTypes = [
  'create_department', 'update_department', 'delete_department',
  'create_doctor', 'update_doctor', 'update_schedule',
  'create_registration', 'cancel_registration',
  'start_visit', 'complete_visit', 'create_prescription'
]

const operationDescriptions: Record<string, string> = {
  create_department: '新增科室',
  update_department: '修改科室信息',
  delete_department: '删除科室',
  create_doctor: '新增医生',
  update_doctor: '修改医生信息',
  delete_doctor: '删除医生',
  update_schedule: '调整排班',
  create_registration: '患者挂号',
  cancel_registration: '退号处理',
  start_visit: '开始接诊',
  complete_visit: '完成就诊',
  create_prescription: '开具处方'
}

const operationTypeArray: OperationType[] = operationTypes as OperationType[]
const userRoleArray: UserRole[] = ['admin', 'doctor', 'reception', 'nurse']
const targetTypeArray: TargetType[] = ['department', 'doctor', 'registration', 'prescription', 'schedule']

export const mockOperationLogs: OperationLog[] = []
for (let i = 0; i < 100; i++) {
  const opType = operationTypeArray[Mock.Random.integer(0, operationTypeArray.length - 1)]
  const operatorRole = userRoleArray[Mock.Random.integer(0, userRoleArray.length - 1)]
  const targetType = targetTypeArray[Mock.Random.integer(0, targetTypeArray.length - 1)]
  mockOperationLogs.push({
    id: generateId(),
    operatorId: generateId(),
    operatorName: `${firstNames[Mock.Random.integer(0, firstNames.length - 1)]}${lastNames[Mock.Random.integer(0, lastNames.length - 1)]}`,
    operatorRole,
    operationType: opType,
    operationDescription: operationDescriptions[opType],
    targetType,
    targetId: generateId(),
    targetName: '',
    oldValue: '',
    newValue: '',
    ipAddress: `192.168.${Mock.Random.integer(1, 10)}.${Mock.Random.integer(1, 255)}`,
    createdAt: Mock.Random.datetime('2024-05-01 08:00:00', '2024-05-10 18:00:00')
  })
}

export const mockCurrentUser: User = {
  id: 'admin-001',
  username: 'admin',
  name: '系统管理员',
  role: 'admin',
  avatar: ''
}
