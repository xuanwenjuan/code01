import Mock from 'mockjs'
import {
  Course,
  CourseCategory,
  PlatformType,
  LearningStatus,
  ProgressStatus,
  OperationLog,
  OperationType
} from '@/types'
import { generateId, calculateProgress } from '@/utils'

const courseNames: Record<CourseCategory, string[]> = {
  [CourseCategory.FRONTEND]: [
    'Vue3 实战项目开发',
    'React Hooks 深入浅出',
    'TypeScript 高级编程',
    'Webpack 5 工程化实战',
    'CSS3 动画与响应式设计'
  ],
  [CourseCategory.BACKEND]: [
    'Spring Boot 微服务架构',
    'Node.js Express 企业级开发',
    'MySQL 性能优化与实战',
    'Redis 高可用架构设计',
    'Docker 容器化部署实战'
  ],
  [CourseCategory.PRODUCT]: [
    '产品经理入门到精通',
    'Axure RP 原型设计实战',
    '用户体验设计方法论',
    '数据驱动产品决策',
    '产品需求文档编写'
  ],
  [CourseCategory.LANGUAGE]: [
    '商务英语高级课程',
    '日语N2冲刺课程',
    '韩语入门到中级',
    '法语基础语法',
    '英语口语流利说'
  ]
}

const instructors: string[] = [
  '张教授',
  '李老师',
  '王大师',
  '陈博士',
  '刘讲师',
  '赵导师'
]

const generateMockCourses = (): Course[] => {
  const courses: Course[] = []
  const categories = Object.values(CourseCategory)
  
  categories.forEach((category) => {
    courseNames[category].forEach((name, index) => {
      const totalHours = Mock.Random.integer(20, 120)
      const studiedHours = Mock.Random.integer(0, totalHours)
      const status = studiedHours === 0
        ? LearningStatus.NOT_STARTED
        : studiedHours >= totalHours
          ? LearningStatus.COMPLETED
          : LearningStatus.LEARNING
      
      const daysSinceStart = Mock.Random.integer(1, 30)
      const createdAt = Mock.Random.date()
      const lastStudyDate = status === LearningStatus.NOT_STARTED
        ? null
        : Mock.Random.date()
      
      courses.push({
        id: generateId(),
        name,
        instructor: instructors[index % instructors.length],
        category,
        platform: Object.values(PlatformType)[Mock.Random.integer(0, Object.values(PlatformType).length - 1)],
        totalHours,
        studiedHours,
        status,
        progressPercentage: calculateProgress(studiedHours, totalHours),
        progressStatus: ProgressStatus.NORMAL,
        lastStudyDate,
        planHoursPerDay: Mock.Random.integer(1, 4),
        notes: studiedHours > 10 ? [
          {
            id: generateId(),
            content: '这门课程讲解清晰，知识点覆盖全面，非常推荐！',
            createdAt: Mock.Random.datetime()
          }
        ] : [],
        checkInHistory: studiedHours > 0 ? Array(Mock.Random.integer(1, Math.min(5, daysSinceStart))).fill(null).map(() => ({
          id: generateId(),
          date: Mock.Random.date(),
          hours: Mock.Random.integer(1, 3)
        })) : [],
        createdAt,
        updatedAt: Mock.Random.datetime()
      })
    })
  })
  
  return courses
}

const generateMockLogs = (): OperationLog[] => {
  const logs: OperationLog[] = []
  const types = Object.values(OperationType)
  
  for (let i = 0; i < 50; i++) {
    const type = types[Mock.Random.integer(0, types.length - 1)]
    logs.push({
      id: generateId(),
      type,
      courseId: generateId(),
      courseName: Mock.Random.pick([
        'Vue3 实战项目开发',
        'React Hooks 深入浅出',
        'Spring Boot 微服务架构',
        '产品经理入门到精通',
        '商务英语高级课程'
      ]),
      description: Mock.Random.pick([
        '添加了新的学习计划',
        '更新了课程学习进度',
        '完成了今日学习打卡',
        '添加了课程学习心得',
        '调整了每日学习时长'
      ]),
      detail: {
        ip: Mock.Random.ip(),
        browser: Mock.Random.pick(['Chrome', 'Firefox', 'Safari', 'Edge']),
        location: Mock.Random.city(true)
      },
      createdAt: Mock.Random.datetime()
    })
  }
  
  return logs.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export const mockCourses = generateMockCourses()
export const mockLogs = generateMockLogs()

Mock.setup({
  timeout: '200-500'
})
