import Mock from 'mockjs'
import type {
  CourseCategory,
  Teacher,
  Student,
  Class,
  ClassAssignmentRecord,
  Status,
  Gender,
  TeacherStatus,
  PaymentStatus,
  StudentClassStatus,
  ClassStatus,
  OperationType,
  DayOfWeek
} from '@/types'

export const generateId = () => Mock.Random.guid()

// 课程类目初始数据
export const initialCourseCategories: CourseCategory[] = [
  { id: '1', name: '少儿启蒙', parentId: null, level: 1, sort: 1, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '2', name: '学科培优', parentId: null, level: 1, sort: 2, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '3', name: '艺术特长', parentId: null, level: 1, sort: 3, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '4', name: '成人考证', parentId: null, level: 1, sort: 4, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '1-1', name: '幼儿英语', parentId: '1', level: 2, sort: 1, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '1-2', name: '思维数学', parentId: '1', level: 2, sort: 2, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '1-3', name: '拼音识字', parentId: '1', level: 2, sort: 3, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '2-1', name: '语文写作', parentId: '2', level: 2, sort: 1, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '2-2', name: '数学思维', parentId: '2', level: 2, sort: 2, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '2-3', name: '英语提升', parentId: '2', level: 2, sort: 3, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '3-1', name: '钢琴', parentId: '3', level: 2, sort: 1, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '3-2', name: '美术', parentId: '3', level: 2, sort: 2, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '3-3', name: '舞蹈', parentId: '3', level: 2, sort: 3, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '4-1', name: '教师资格证', parentId: '4', level: 2, sort: 1, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '4-2', name: '会计职称', parentId: '4', level: 2, sort: 2, status: Status.ENABLED, createTime: '2024-01-01' },
  { id: '4-3', name: '建造师', parentId: '4', level: 2, sort: 3, status: Status.ENABLED, createTime: '2024-01-01' }
]

// 教师初始数据
export const initialTeachers: Teacher[] = [
  {
    id: 't1',
    name: '张老师',
    gender: Gender.FEMALE,
    phone: '13800138001',
    email: 'zhang@example.com',
    subjects: ['幼儿英语', '英语提升'],
    experience: 8,
    education: '本科',
    title: '高级讲师',
    status: TeacherStatus.ON,
    availableTime: [
      { day: 1 as DayOfWeek, periods: [1, 2, 4] },
      { day: 2 as DayOfWeek, periods: [3, 4, 5] },
      { day: 3 as DayOfWeek, periods: [1, 2] },
      { day: 4 as DayOfWeek, periods: [4, 5, 6] },
      { day: 5 as DayOfWeek, periods: [1, 2, 3] },
      { day: 6 as DayOfWeek, periods: [1, 2, 3, 4] }
    ],
    createTime: '2024-01-15'
  },
  {
    id: 't2',
    name: '李老师',
    gender: Gender.MALE,
    phone: '13800138002',
    email: 'li@example.com',
    subjects: ['思维数学', '数学思维'],
    experience: 10,
    education: '硕士',
    title: '特级讲师',
    status: TeacherStatus.ON,
    availableTime: [
      { day: 1 as DayOfWeek, periods: [3, 4, 5] },
      { day: 2 as DayOfWeek, periods: [1, 2] },
      { day: 3 as DayOfWeek, periods: [4, 5, 6] },
      { day: 5 as DayOfWeek, periods: [1, 2] },
      { day: 6 as DayOfWeek, periods: [5, 6, 7] }
    ],
    createTime: '2024-01-20'
  },
  {
    id: 't3',
    name: '王老师',
    gender: Gender.FEMALE,
    phone: '13800138003',
    email: 'wang@example.com',
    subjects: ['语文写作', '拼音识字'],
    experience: 5,
    education: '本科',
    title: '讲师',
    status: TeacherStatus.ON,
    availableTime: [
      { day: 1 as DayOfWeek, periods: [6, 7] },
      { day: 2 as DayOfWeek, periods: [4, 5, 6] },
      { day: 3 as DayOfWeek, periods: [1, 2, 3] },
      { day: 4 as DayOfWeek, periods: [1, 2] },
      { day: 6 as DayOfWeek, periods: [1, 2, 3] }
    ],
    createTime: '2024-02-01'
  },
  {
    id: 't4',
    name: '陈老师',
    gender: Gender.FEMALE,
    phone: '13800138004',
    email: 'chen@example.com',
    subjects: ['钢琴'],
    experience: 12,
    education: '本科',
    title: '高级讲师',
    status: TeacherStatus.ON,
    availableTime: [
      { day: 2 as DayOfWeek, periods: [5, 6, 7, 8] },
      { day: 4 as DayOfWeek, periods: [5, 6, 7, 8] },
      { day: 6 as DayOfWeek, periods: [1, 2, 3, 4, 5, 6] },
      { day: 7 as DayOfWeek, periods: [1, 2, 3, 4] }
    ],
    createTime: '2024-02-10'
  },
  {
    id: 't5',
    name: '刘老师',
    gender: Gender.MALE,
    phone: '13800138005',
    email: 'liu@example.com',
    subjects: ['美术'],
    experience: 6,
    education: '硕士',
    title: '讲师',
    status: TeacherStatus.OFF,
    availableTime: [
      { day: 1 as DayOfWeek, periods: [5, 6, 7] },
      { day: 3 as DayOfWeek, periods: [5, 6, 7] },
      { day: 5 as DayOfWeek, periods: [5, 6, 7] },
      { day: 6 as DayOfWeek, periods: [5, 6, 7, 8] }
    ],
    createTime: '2024-02-15'
  }
]

// 学员初始数据
export const initialStudents: Student[] = [
  {
    id: 's1',
    name: '小明',
    gender: Gender.MALE,
    phone: '13900139001',
    age: 6,
    intendedCourse: '思维数学',
    paymentStatus: PaymentStatus.PAID,
    classStatus: StudentClassStatus.ENROLLED,
    classId: 'c1',
    className: '数学启蒙A班',
    createTime: '2024-03-01'
  },
  {
    id: 's2',
    name: '小红',
    gender: Gender.FEMALE,
    phone: '13900139002',
    age: 5,
    intendedCourse: '幼儿英语',
    paymentStatus: PaymentStatus.PAID,
    classStatus: StudentClassStatus.ENROLLED,
    classId: 'c2',
    className: '英语启蒙B班',
    createTime: '2024-03-02'
  },
  {
    id: 's3',
    name: '小华',
    gender: Gender.MALE,
    phone: '13900139003',
    age: 7,
    intendedCourse: '语文写作',
    paymentStatus: PaymentStatus.PARTIAL,
    classStatus: StudentClassStatus.PENDING,
    createTime: '2024-03-05'
  },
  {
    id: 's4',
    name: '小李',
    gender: Gender.FEMALE,
    phone: '13900139004',
    age: 8,
    intendedCourse: '钢琴',
    paymentStatus: PaymentStatus.PAID,
    classStatus: StudentClassStatus.ENROLLED,
    classId: 'c3',
    className: '钢琴基础班',
    createTime: '2024-03-06'
  },
  {
    id: 's5',
    name: '小张',
    gender: Gender.MALE,
    phone: '13900139005',
    age: 9,
    intendedCourse: '数学思维',
    paymentStatus: PaymentStatus.UNPAID,
    classStatus: StudentClassStatus.PENDING,
    createTime: '2024-03-08'
  },
  {
    id: 's6',
    name: '小王',
    gender: Gender.FEMALE,
    phone: '13900139006',
    age: 10,
    intendedCourse: '英语提升',
    paymentStatus: PaymentStatus.PAID,
    classStatus: StudentClassStatus.SUSPENDED,
    classId: 'c4',
    className: '英语提升班',
    createTime: '2024-03-10'
  }
]

// 班级初始数据
export const initialClasses: Class[] = [
  {
    id: 'c1',
    name: '数学启蒙A班',
    categoryId: '1-2',
    categoryName: '思维数学',
    teacherId: 't2',
    teacherName: '李老师',
    maxStudents: 15,
    currentStudents: 12,
    status: ClassStatus.ACTIVE,
    schedule: [
      { id: 'sch1', day: 1 as DayOfWeek, period: 3, room: '101', isLocked: true },
      { id: 'sch2', day: 3 as DayOfWeek, period: 4, room: '101', isLocked: true },
      { id: 'sch3', day: 5 as DayOfWeek, period: 2, room: '101', isLocked: false }
    ],
    createTime: '2024-02-20'
  },
  {
    id: 'c2',
    name: '英语启蒙B班',
    categoryId: '1-1',
    categoryName: '幼儿英语',
    teacherId: 't1',
    teacherName: '张老师',
    maxStudents: 12,
    currentStudents: 10,
    status: ClassStatus.ACTIVE,
    schedule: [
      { id: 'sch4', day: 1 as DayOfWeek, period: 1, room: '102', isLocked: true },
      { id: 'sch5', day: 2 as DayOfWeek, period: 4, room: '102', isLocked: true },
      { id: 'sch6', day: 4 as DayOfWeek, period: 5, room: '102', isLocked: false }
    ],
    createTime: '2024-02-22'
  },
  {
    id: 'c3',
    name: '钢琴基础班',
    categoryId: '3-1',
    categoryName: '钢琴',
    teacherId: 't4',
    teacherName: '陈老师',
    maxStudents: 6,
    currentStudents: 5,
    status: ClassStatus.ACTIVE,
    schedule: [
      { id: 'sch7', day: 2 as DayOfWeek, period: 5, room: '201', isLocked: true },
      { id: 'sch8', day: 4 as DayOfWeek, period: 5, room: '201', isLocked: true },
      { id: 'sch9', day: 6 as DayOfWeek, period: 2, room: '201', isLocked: true }
    ],
    createTime: '2024-02-25'
  },
  {
    id: 'c4',
    name: '英语提升班',
    categoryId: '2-3',
    categoryName: '英语提升',
    teacherId: 't1',
    teacherName: '张老师',
    maxStudents: 20,
    currentStudents: 18,
    status: ClassStatus.ACTIVE,
    schedule: [
      { id: 'sch10', day: 2 as DayOfWeek, period: 3, room: '103', isLocked: true },
      { id: 'sch11', day: 4 as DayOfWeek, period: 4, room: '103', isLocked: true }
    ],
    createTime: '2024-02-28'
  }
]

// 分班记录初始数据
export const initialAssignmentRecords: ClassAssignmentRecord[] = [
  {
    id: 'r1',
    studentId: 's1',
    studentName: '小明',
    classId: 'c1',
    className: '数学启蒙A班',
    operation: OperationType.ASSIGN,
    operator: '管理员',
    operateTime: '2024-03-01 10:00:00',
    remark: '首次分班'
  },
  {
    id: 'r2',
    studentId: 's2',
    studentName: '小红',
    classId: 'c2',
    className: '英语启蒙B班',
    operation: OperationType.ASSIGN,
    operator: '管理员',
    operateTime: '2024-03-02 14:30:00',
    remark: '首次分班'
  }
]

// Mock接口配置
Mock.setup({
  timeout: '200-500'
})

// 获取课程类目
Mock.mock(/\/api\/course-categories/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: initialCourseCategories
  }
})

// 获取教师列表
Mock.mock(/\/api\/teachers/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: initialTeachers
  }
})

// 获取学员列表
Mock.mock(/\/api\/students/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: initialStudents
  }
})

// 获取班级列表
Mock.mock(/\/api\/classes/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: initialClasses
  }
})

// 获取分班记录
Mock.mock(/\/api\/assignment-records/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: initialAssignmentRecords
  }
})
