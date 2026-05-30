import Mock from 'mockjs'
import { useAppStore } from '@/store'

const Random = Mock.Random

const generateDepartments = () => {
  const departments = [
    { id: 'd0', name: '总公司', parentId: null },
    { id: 'd1', name: '北京分公司', parentId: 'd0' },
    { id: 'd2', name: '上海分公司', parentId: 'd0' },
    { id: 'd3', name: '广州分公司', parentId: 'd0' },
    { id: 'd1-1', name: '技术部', parentId: 'd1' },
    { id: 'd1-2', name: '产品部', parentId: 'd1' },
    { id: 'd1-3', name: '运营部', parentId: 'd1' },
    { id: 'd2-1', name: '市场部', parentId: 'd2' },
    { id: 'd2-2', name: '销售部', parentId: 'd2' },
    { id: 'd3-1', name: '人力资源部', parentId: 'd3' },
    { id: 'd3-2', name: '财务部', parentId: 'd3' }
  ]
  return departments
}

const generateEmployees = () => {
  const positions = ['CEO', 'CTO', '产品经理', '前端工程师', '后端工程师', '运营专员', '销售经理', 'HR专员', '财务主管']
  const statuses: Array<'active' | 'vacation' | 'resigned'> = ['active', 'vacation', 'resigned']
  
  const employees = []
  const departmentMap: Record<string, string> = {
    'd0': '总公司',
    'd1': '北京分公司',
    'd2': '上海分公司',
    'd3': '广州分公司',
    'd1-1': '技术部',
    'd1-2': '产品部',
    'd1-3': '运营部',
    'd2-1': '市场部',
    'd2-2': '销售部',
    'd3-1': '人力资源部',
    'd3-2': '财务部'
  }

  for (let i = 0; i < 50; i++) {
    const deptId = Random.pick(Object.keys(departmentMap))
    employees.push({
      id: `e${i}`,
      name: Random.cname(),
      employeeNo: `EMP${String(i + 1000).padStart(4, '0')}`,
      position: Random.pick(positions),
      departmentId: deptId,
      departmentName: departmentMap[deptId],
      supervisorId: i > 0 ? `e${Math.floor(Math.random() * i)}` : null,
      supervisorName: i > 0 ? Random.cname() : null,
      status: i < 40 ? 'active' : Random.pick(statuses),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      email: Random.email(),
      phone: Random.phone()
    })
  }
  return employees
}

const generateMessages = (employees: Array<{ id: string; name: string; avatar: string }>) => {
  const messages = []
  const contents = [
    '你好，请问这个需求什么时候可以完成？',
    '好的，我下午发给你',
    '今天开会讨论一下Q2的计划',
    '收到，我马上处理',
    '那个bug修复了吗？',
    '新版本已经上线了',
    '周末一起聚餐吧',
    '帮我审批一下请假申请',
    '这个文档我已经更新了',
    '谢谢！'
  ]

  for (let i = 0; i < 100; i++) {
    const sender = Random.pick(employees)
    const receiver = Random.pick(employees.filter(e => e.id !== sender.id))
    messages.push({
      id: `m${i}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      receiverId: receiver.id,
      content: Random.pick(contents),
      type: 'text',
      status: Random.pick(['unread', 'read', 'read', 'read']),
      createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      isGroup: false
    })
  }
  return messages
}

const generateChatSessions = (employees: Array<{ id: string; name: string; avatar: string }>) => {
  const sessions = []
  
  employees.slice(0, 15).forEach((emp, index) => {
    sessions.push({
      id: `s-p-${index}`,
      name: emp.name,
      avatar: emp.avatar,
      type: 'private',
      lastMessage: '你好，最近怎么样？',
      lastMessageTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      unreadCount: Random.integer(0, 5)
    })
  })

  const groupNames = ['技术部群', '产品部群', '公司大群', '项目A组', '管理层群']
  groupNames.forEach((name, index) => {
    sessions.push({
      id: `s-g-${index}`,
      name,
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=group${index}`,
      type: 'group',
      lastMessage: '大家注意一下今天的会议',
      lastMessageTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      unreadCount: Random.integer(0, 10),
      members: employees.slice(0, 10).map(e => e.id)
    })
  })

  return sessions
}

const generateApprovals = (employees: Array<{ id: string; name: string; avatar: string; departmentName: string; departmentId: string }>) => {
  const approvals = []
  const approvalTypes: Array<'leave' | 'reimbursement' | 'supplies'> = ['leave', 'reimbursement', 'supplies']
  const statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected']
  const leaveTypes = ['年假', '病假', '事假', '婚假', '产假']

  for (let i = 0; i < 30; i++) {
    const applicant = Random.pick(employees)
    const approver = Random.pick(employees.filter(e => e.id !== applicant.id))
    const type = Random.pick(approvalTypes)
    const status = Random.pick(statuses)
    
    let details
    if (type === 'leave') {
      const startDate = Random.date('yyyy-MM-dd')
      const days = Random.integer(1, 5)
      details = {
        leaveType: Random.pick(leaveTypes),
        startDate,
        endDate: Random.date('yyyy-MM-dd'),
        days,
        reason: Random.cparagraph(1)
      }
    } else if (type === 'reimbursement') {
      const items = []
      const itemCount = Random.integer(1, 3)
      let totalAmount = 0
      for (let j = 0; j < itemCount; j++) {
        const amount = Random.integer(100, 2000)
        totalAmount += amount
        items.push({
          name: `报销项目${j + 1}`,
          amount,
          description: Random.csentence()
        })
      }
      details = {
        amount: totalAmount,
        items,
        reason: Random.cparagraph(1)
      }
    } else {
      const items = []
      const itemCount = Random.integer(1, 5)
      for (let j = 0; j < itemCount; j++) {
        items.push({
          name: Random.ctitle(3, 5),
          quantity: Random.integer(1, 10),
          unit: Random.pick(['个', '本', '盒', '套'])
        })
      }
      details = {
        items,
        reason: Random.cparagraph(1)
      }
    }

    approvals.push({
      id: `a${i}`,
      title: type === 'leave' ? '请假申请' : type === 'reimbursement' ? '报销申请' : '物资申领',
      type,
      applicantId: applicant.id,
      applicantName: applicant.name,
      applicantAvatar: applicant.avatar,
      departmentId: applicant.departmentId,
      departmentName: applicant.departmentName,
      status,
      currentApproverId: approver.id,
      currentApproverName: approver.name,
      createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updatedAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      details,
      approvalFlow: [
        {
          approverId: approver.id,
          approverName: approver.name,
          status,
          approvedAt: status !== 'pending' ? Random.datetime('yyyy-MM-dd HH:mm:ss') : undefined,
          comment: status !== 'pending' ? Random.csentence() : undefined
        }
      ]
    })
  }
  return approvals
}

const generateNotifications = () => {
  const notifications = []
  const types: Array<'info' | 'warning' | 'success' | 'error'> = ['info', 'warning', 'success', 'error']
  const titles = [
    '新的审批待处理',
    '系统升级通知',
    '会议提醒',
    '您的申请已通过',
    '您的申请被驳回',
    '收到新消息',
    '考勤提醒'
  ]

  for (let i = 0; i < 20; i++) {
    notifications.push({
      id: `n${i}`,
      title: Random.pick(titles),
      content: Random.cparagraph(1),
      type: Random.pick(types),
      status: Random.pick(['unread', 'read']),
      createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss')
    })
  }
  return notifications
}

export const initMockData = () => {
  const departments = generateDepartments()
  const employees = generateEmployees()
  const messages = generateMessages(employees)
  const chatSessions = generateChatSessions(employees)
  const approvals = generateApprovals(employees)
  const notifications = generateNotifications()

  const store = useAppStore.getState()
  store.setDepartments(departments)
  store.setEmployees(employees)
  store.setMessages(messages)
  store.setChatSessions(chatSessions)
  store.setApprovals(approvals)
  store.setNotifications(notifications)
  store.setCurrentUser(employees[0])
}

initMockData()

Mock.setup({
  timeout: '200-500'
})

export default Mock
