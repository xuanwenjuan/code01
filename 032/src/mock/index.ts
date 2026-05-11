import Mock from 'mockjs'
import dayjs from 'dayjs'
import type {
  Club,
  Activity,
  Registration,
  OperationLog,
  User,
  CheckInMethod
} from '@/types'
import {
  ClubCategory as CC,
  ActivityStatus as AS,
  RegistrationStatus as RS,
  OperationType as OT,
  UserRole as UR,
  CheckInMethod as CIM
} from '@/types'

const generateId = (): string => {
  return Mock.Random.guid()
}

const generateClubs = (): Club[] => {
  const clubs: Club[] = [
    {
      id: generateId(),
      name: '清风文学社',
      category: CC.LITERATURE,
      description: '以文会友，传承经典，定期举办读书会、征文比赛等活动',
      managerId: generateId(),
      managerName: '张明',
      memberCount: 85,
      createdAt: '2024-01-15',
      updatedAt: '2024-03-20'
    },
    {
      id: generateId(),
      name: '热血篮球社',
      category: CC.BASKETBALL,
      description: '热爱篮球，挥洒汗水，每周组织训练和友谊赛',
      managerId: generateId(),
      managerName: '李强',
      memberCount: 120,
      createdAt: '2024-02-10',
      updatedAt: '2024-04-05'
    },
    {
      id: generateId(),
      name: '极客编程社',
      category: CC.PROGRAMMING,
      description: '探索技术前沿，分享编程知识，举办编程竞赛',
      managerId: generateId(),
      managerName: '王芳',
      memberCount: 95,
      createdAt: '2024-01-20',
      updatedAt: '2024-04-10'
    },
    {
      id: generateId(),
      name: '星光音乐社',
      category: CC.MUSIC,
      description: '用音乐传递情感，定期举办音乐会和乐器培训',
      managerId: generateId(),
      managerName: '刘娜',
      memberCount: 78,
      createdAt: '2024-03-01',
      updatedAt: '2024-04-15'
    },
    {
      id: generateId(),
      name: '彩虹美术社',
      category: CC.ART,
      description: '发现美，创造美，定期举办画展和艺术工作坊',
      managerId: generateId(),
      managerName: '陈静',
      memberCount: 65,
      createdAt: '2024-02-20',
      updatedAt: '2024-04-08'
    },
    {
      id: generateId(),
      name: '未来科技社',
      category: CC.SCIENCE,
      description: '探索科学奥秘，开展创新实验，参加科技竞赛',
      managerId: generateId(),
      managerName: '赵磊',
      memberCount: 88,
      createdAt: '2024-01-25',
      updatedAt: '2024-04-12'
    }
  ]
  return clubs
}

const generateActivities = (clubs: Club[]): Activity[] => {
  const activities: Activity[] = []
  const now = dayjs()

  const activityData = [
    {
      title: '春季诗歌朗诵会',
      description: '感受诗歌之美，分享阅读心得，欢迎所有文学爱好者参加',
      location: '图书馆报告厅',
      startTime: now.add(3, 'day').format('YYYY-MM-DD HH:mm'),
      endTime: now.add(3, 'day').add(3, 'hour').format('YYYY-MM-DD HH:mm'),
      maxParticipants: 50,
      currentParticipants: 35,
      status: AS.SIGNING_UP,
      checkInEnabled: true,
      clubIndex: 0
    },
    {
      title: '校园篮球联赛',
      description: '一年一度的校园篮球盛会，各学院代表队激烈角逐',
      location: '体育馆主馆',
      startTime: now.add(7, 'day').format('YYYY-MM-DD HH:mm'),
      endTime: now.add(7, 'day').add(4, 'hour').format('YYYY-MM-DD HH:mm'),
      maxParticipants: 100,
      currentParticipants: 88,
      status: AS.SIGNING_UP,
      checkInEnabled: true,
      clubIndex: 1
    },
    {
      title: 'Python 编程入门工作坊',
      description: '零基础也能学，从入门到实战，带你领略编程的魅力',
      location: '计算机楼302室',
      startTime: now.add(1, 'day').format('YYYY-MM-DD HH:mm'),
      endTime: now.add(1, 'day').add(2, 'hour').format('YYYY-MM-DD HH:mm'),
      maxParticipants: 30,
      currentParticipants: 28,
      status: AS.SIGNING_UP,
      checkInEnabled: true,
      clubIndex: 2
    },
    {
      title: '古典音乐欣赏会',
      description: '聆听经典，品味艺术，特邀音乐系教授现场讲解',
      location: '音乐厅',
      startTime: now.subtract(2, 'day').format('YYYY-MM-DD HH:mm'),
      endTime: now.subtract(2, 'day').add(2, 'hour').format('YYYY-MM-DD HH:mm'),
      maxParticipants: 80,
      currentParticipants: 72,
      status: AS.ENDED,
      checkInEnabled: true,
      clubIndex: 3
    },
    {
      title: '春季写生活动',
      description: '走进大自然，用画笔记录春天的美好',
      location: '校园花园',
      startTime: now.add(5, 'day').format('YYYY-MM-DD HH:mm'),
      endTime: now.add(5, 'day').add(4, 'hour').format('YYYY-MM-DD HH:mm'),
      maxParticipants: 25,
      currentParticipants: 18,
      status: AS.PREPARING,
      checkInEnabled: true,
      clubIndex: 4
    },
    {
      title: '机器人制作大赛',
      description: '发挥创意，动手实践，打造属于你的机器人',
      location: '科技馆实验室',
      startTime: now.add(10, 'day').format('YYYY-MM-DD HH:mm'),
      endTime: now.add(10, 'day').add(5, 'hour').format('YYYY-MM-DD HH:mm'),
      maxParticipants: 40,
      currentParticipants: 12,
      status: AS.PREPARING,
      checkInEnabled: true,
      clubIndex: 5
    },
    {
      title: '文学沙龙：现代诗歌创作',
      description: '探讨现代诗歌创作技巧，交流创作心得',
      location: '文学社活动室',
      startTime: now.add(2, 'day').format('YYYY-MM-DD HH:mm'),
      endTime: now.add(2, 'day').add(2, 'hour').format('YYYY-MM-DD HH:mm'),
      maxParticipants: 20,
      currentParticipants: 15,
      status: AS.SIGNING_UP,
      checkInEnabled: true,
      clubIndex: 0
    },
    {
      title: '3v3 篮球挑战赛',
      description: '三人组队，以球会友，赢取丰厚奖品',
      location: '室外篮球场',
      startTime: now.subtract(5, 'day').format('YYYY-MM-DD HH:mm'),
      endTime: now.subtract(5, 'day').add(3, 'hour').format('YYYY-MM-DD HH:mm'),
      maxParticipants: 60,
      currentParticipants: 55,
      status: AS.ENDED,
      checkInEnabled: true,
      clubIndex: 1
    }
  ]

  activityData.forEach((data) => {
    const club = clubs[data.clubIndex]
    activities.push({
      id: generateId(),
      clubId: club.id,
      clubName: club.name,
      title: data.title,
      description: data.description,
      location: data.location,
      startTime: data.startTime,
      endTime: data.endTime,
      maxParticipants: data.maxParticipants,
      currentParticipants: data.currentParticipants,
      status: data.status,
      checkInEnabled: data.checkInEnabled,
      checkInStartTime: data.startTime,
      createdAt: now.subtract(10, 'day').format('YYYY-MM-DD HH:mm'),
      updatedAt: now.format('YYYY-MM-DD HH:mm')
    })
  })

  return activities
}

const generateRegistrations = (activities: Activity[]): Registration[] => {
  const registrations: Registration[] = []
  const studentNames = [
    '张伟', '王静', '李强', '刘洋', '陈敏',
    '杨帆', '赵雪', '周杰', '吴芳', '郑磊',
    '孙涛', '朱丽', '马超', '胡婷', '郭鹏'
  ]
  const classes = ['计算机2101', '计算机2102', '软件工程2101', '软件工程2102', '通信工程2101']

  activities.forEach((activity) => {
    for (let i = 0; i < activity.currentParticipants; i++) {
      const name = studentNames[Math.floor(Math.random() * studentNames.length)]
      const studentClass = classes[Math.floor(Math.random() * classes.length)]
      const statuses: RegistrationStatus[] = [RS.REGISTERED, RS.CHECKED_IN, RS.LEAVE, RS.REJECTED]
      const weights = [0.5, 0.3, 0.15, 0.05]
      const random = Math.random()
      let cumulative = 0
      let status: RegistrationStatus = RS.REGISTERED
      for (let j = 0; j < statuses.length; j++) {
        cumulative += weights[j]
        if (random < cumulative) {
          status = statuses[j]
          break
        }
      }

      const finalStatus = activity.status === AS.ENDED ? status : (status === RS.REJECTED ? RS.REGISTERED : status)
      const checkInMethods: CheckInMethod[] = [CIM.MANUAL, CIM.SCAN_CODE]
      const checkInMethod = finalStatus === RS.CHECKED_IN
        ? checkInMethods[Math.floor(Math.random() * checkInMethods.length)]
        : null

      registrations.push({
        id: generateId(),
        activityId: activity.id,
        activityTitle: activity.title,
        studentId: '2021' + Mock.Random.string('number', 6),
        studentName: name + Mock.Random.integer(1, 99),
        studentClass: studentClass,
        phone: '1' + Mock.Random.string('number', 10),
        status: finalStatus,
        checkInMethod,
        registeredAt: dayjs(activity.startTime).subtract(5, 'day').format('YYYY-MM-DD HH:mm'),
        checkedInAt: finalStatus === RS.CHECKED_IN ? dayjs(activity.startTime).add(10, 'minute').format('YYYY-MM-DD HH:mm') : null
      })
    }
  })

  return registrations
}

const generateOperationLogs = (clubs: Club[], activities: Activity[]): OperationLog[] => {
  const logs: OperationLog[] = []
  const operators = [
    { id: generateId(), name: '张明', role: UR.CLUB_MANAGER },
    { id: generateId(), name: '李强', role: UR.CLUB_MANAGER },
    { id: generateId(), name: '王芳', role: UR.CLUB_MANAGER },
    { id: generateId(), name: '刘娜', role: UR.CLUB_MANAGER },
    { id: generateId(), name: '系统管理员', role: UR.ADMIN }
  ]

  const operations: Array<{ type: OT; target: Club | Activity; details: string }> = []

  activities.forEach((activity) => {
    operations.push({
      type: OT.CREATE_ACTIVITY,
      target: activity,
      details: `创建了活动：${activity.title}`
    })
  })

  clubs.forEach((club) => {
    operations.push({
      type: OT.UPDATE_CLUB,
      target: club,
      details: `更新了社团信息：${club.name}`
    })
  })

  operations.push({
    type: OT.CHECK_IN,
    target: activities[0],
    details: `签到：学生在活动"${activities[0].title}"签到成功`
  })

  operations.push({
    type: OT.SCAN_CHECK_IN,
    target: activities[1],
    details: `扫码签到：学生在活动"${activities[1].title}"签到成功`
  })

  operations.push({
    type: OT.BATCH_CHECK_IN,
    target: activities[2],
    details: `批量签到了活动"${activities[2].title}"的多名学生`
  })

  operations.forEach((op, index) => {
    const operator = operators[index % operators.length]
    logs.push({
      id: generateId(),
      operatorId: operator.id,
      operatorName: operator.name,
      operatorRole: operator.role,
      operationType: op.type,
      targetId: op.target.id,
      targetName: op.target.name || (op.target as Activity).title,
      details: op.details,
      createdAt: dayjs().subtract(index, 'day').format('YYYY-MM-DD HH:mm:ss')
    })
  })

  return logs
}

const mockClubs = generateClubs()
const mockActivities = generateActivities(mockClubs)
const mockRegistrations = generateRegistrations(mockActivities)
const mockOperationLogs = generateOperationLogs(mockClubs, mockActivities)

const mockUser: User = {
  id: generateId(),
  name: '系统管理员',
  role: UR.ADMIN,
  clubId: null,
  clubName: null
}

Mock.setup({
  timeout: '200-500'
})

const response = <T>(data: T) => ({
  code: 200,
  message: 'success',
  data
})

export const api = {
  getClubs: () => Mock.mock('/api/clubs', 'get', response(mockClubs)),
  getActivities: () => Mock.mock('/api/activities', 'get', response(mockActivities)),
  getRegistrations: () => Mock.mock('/api/registrations', 'get', response(mockRegistrations)),
  getOperationLogs: () => Mock.mock('/api/operation-logs', 'get', response(mockOperationLogs)),
  getCurrentUser: () => Mock.mock('/api/user/current', 'get', response(mockUser))
}

api.getClubs()
api.getActivities()
api.getRegistrations()
api.getOperationLogs()
api.getCurrentUser()

export { mockClubs, mockActivities, mockRegistrations, mockOperationLogs, mockUser }
