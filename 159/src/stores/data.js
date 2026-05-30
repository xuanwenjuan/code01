import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const departments = [
  { id: 1, name: '总公司', parentId: 0, children: [
    { id: 2, name: '技术部', parentId: 1, children: [
      { id: 21, name: '前端组', parentId: 2 },
      { id: 22, name: '后端组', parentId: 2 },
      { id: 23, name: '测试组', parentId: 2 }
    ]},
    { id: 3, name: '市场部', parentId: 1, children: [
      { id: 31, name: '销售组', parentId: 3 },
      { id: 32, name: '推广组', parentId: 3 }
    ]},
    { id: 4, name: '财务部', parentId: 1 },
    { id: 5, name: '人事部', parentId: 1 },
    { id: 6, name: '行政部', parentId: 1 }
  ]}
]

const employees = [
  { id: 1, name: '张小明', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', phone: '13800138000', email: 'zhangxiaoming@company.com', department: '技术部', position: '技术总监', deptId: 2, gender: '男', birthday: '1988-05-15', entryDate: '2020-01-15' },
  { id: 2, name: '张三', avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', phone: '13800138001', email: 'zhangsan@company.com', department: '技术部-前端组', position: '前端开发工程师', deptId: 21, gender: '男', birthday: '1995-03-20', entryDate: '2021-03-20' },
  { id: 3, name: '李四', avatar: 'https://cube.elemecdn.com/0/84/e69f7dbd26b0f1472bb17689e190apng.png', phone: '13800138002', email: 'lisi@company.com', department: '技术部-前端组', position: '前端开发工程师', deptId: 21, gender: '男', birthday: '1996-08-10', entryDate: '2021-06-15' },
  { id: 4, name: '王五', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', phone: '13800138003', email: 'wangwu@company.com', department: '技术部-后端组', position: '后端开发工程师', deptId: 22, gender: '男', birthday: '1994-12-05', entryDate: '2020-09-01' },
  { id: 5, name: '赵六', avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', phone: '13800138004', email: 'zhaoliu@company.com', department: '技术部-测试组', position: '测试工程师', deptId: 23, gender: '女', birthday: '1997-04-18', entryDate: '2022-01-10' },
  { id: 6, name: '钱七', avatar: 'https://cube.elemecdn.com/0/84/e69f7dbd26b0f1472bb17689e190apng.png', phone: '13800138005', email: 'qianqi@company.com', department: '市场部-销售组', position: '销售经理', deptId: 31, gender: '男', birthday: '1992-11-22', entryDate: '2019-08-15' },
  { id: 7, name: '孙八', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', phone: '13800138006', email: 'sunba@company.com', department: '市场部-推广组', position: '推广专员', deptId: 32, gender: '女', birthday: '1998-02-28', entryDate: '2022-03-01' },
  { id: 8, name: '周九', avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', phone: '13800138007', email: 'zhoujiu@company.com', department: '财务部', position: '财务主管', deptId: 4, gender: '女', birthday: '1985-09-10', entryDate: '2018-05-20' },
  { id: 9, name: '吴十', avatar: 'https://cube.elemecdn.com/0/84/e69f7dbd26b0f1472bb17689e190apng.png', phone: '13800138008', email: 'wushi@company.com', department: '人事部', position: 'HR经理', deptId: 5, gender: '男', birthday: '1987-07-15', entryDate: '2019-02-15' },
  { id: 10, name: '郑十一', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', phone: '13800138009', email: 'zheng11@company.com', department: '行政部', position: '行政专员', deptId: 6, gender: '女', birthday: '1993-06-20', entryDate: '2021-11-01' }
]

const approvals = [
  { id: 1, type: 'leave', title: '春节回家探亲', applicant: '张三', applicantId: 2, startDate: '2024-12-20', endDate: '2024-12-22', days: 3, reason: '春节回家探望父母', leaveType: '年假', status: 'pending', approver: '张小明', createTime: '2024-12-15 09:30:00' },
  { id: 2, type: 'business', title: '上海客户拜访', applicant: '钱七', applicantId: 6, startDate: '2024-12-18', endDate: '2024-12-20', days: 3, reason: '洽谈年度合作项目', destination: '上海', transportation: '飞机', status: 'approved', approver: '张小明', createTime: '2024-12-14 14:20:00' },
  { id: 3, type: 'leave', title: '感冒病假', applicant: '李四', applicantId: 3, startDate: '2024-12-16', endDate: '2024-12-16', days: 1, reason: '感冒发烧需要休息', leaveType: '病假', status: 'approved', approver: '张小明', createTime: '2024-12-16 08:30:00' },
  { id: 4, type: 'leave', title: '年假休息', applicant: '王五', applicantId: 4, startDate: '2024-12-23', endDate: '2024-12-27', days: 5, reason: '休年假调整状态', leaveType: '年假', status: 'pending', approver: '张小明', createTime: '2024-12-13 10:00:00' },
  { id: 5, type: 'business', title: '深圳技术交流', applicant: '张三', applicantId: 2, startDate: '2024-12-25', endDate: '2024-12-26', days: 2, reason: '参加前端技术峰会', destination: '深圳', transportation: '高铁', status: 'rejected', approver: '张小明', createTime: '2024-12-12 16:00:00', rejectReason: '年底项目紧张，延后执行' }
]

const files = [
  { id: 1, name: '2024年度工作计划.docx', type: 'docx', size: 256000, category: '文档', isFavorite: true, createTime: '2024-12-01 09:30:00', uploader: '张小明' },
  { id: 2, name: '技术架构设计.pdf', type: 'pdf', size: 1584000, category: '文档', isFavorite: true, createTime: '2024-11-28 14:20:00', uploader: '张小明' },
  { id: 3, name: '产品宣传海报.png', type: 'png', size: 3584000, category: '图片', isFavorite: false, createTime: '2024-12-10 10:15:00', uploader: '钱七' },
  { id: 4, name: '年度总结PPT.pptx', type: 'pptx', size: 8560000, category: '文档', isFavorite: false, createTime: '2024-12-12 16:45:00', uploader: '张三' },
  { id: 5, name: '财务报表.xlsx', type: 'xlsx', size: 456000, category: '文档', isFavorite: true, createTime: '2024-12-05 11:30:00', uploader: '周九' },
  { id: 6, name: '项目源码.zip', type: 'zip', size: 12584000, category: '压缩包', isFavorite: false, createTime: '2024-11-25 09:00:00', uploader: '张三' },
  { id: 7, name: '培训视频.mp4', type: 'mp4', size: 125600000, category: '视频', isFavorite: false, createTime: '2024-11-20 14:00:00', uploader: '吴十' },
  { id: 8, name: '产品需求文档.docx', type: 'docx', size: 186000, category: '文档', isFavorite: true, createTime: '2024-12-08 10:30:00', uploader: '孙八' },
  { id: 9, name: '公司logo.png', type: 'png', size: 256000, category: '图片', isFavorite: true, createTime: '2024-01-15 09:00:00', uploader: '郑十一' },
  { id: 10, name: '员工手册.pdf', type: 'pdf', size: 3584000, category: '文档', isFavorite: false, createTime: '2024-01-10 09:00:00', uploader: '吴十' }
]

const notices = [
  { id: 1, title: '关于2024年元旦放假安排的通知', type: 'notice', createTime: '2024-12-15 09:30:00', isTop: true },
  { id: 2, title: '公司年度绩效考核通知', type: 'notice', createTime: '2024-12-14 14:20:00', isTop: false },
  { id: 3, title: '办公系统升级维护公告', type: 'announcement', createTime: '2024-12-13 16:45:00', isTop: false }
]

export const useDataStore = defineStore('data', () => {
  const departmentList = ref(departments)
  const employeeList = ref(employees)
  const approvalList = ref(approvals)
  const fileList = ref(files)
  const noticeList = ref(notices)

  const getEmployeesByDept = (deptId) => {
    if (!deptId) return employeeList.value
    const deptIdStr = String(deptId)
    return employeeList.value.filter(e =>
      String(e.deptId) === deptIdStr || String(e.deptId).startsWith(deptIdStr)
    )
  }

  const searchEmployees = (keyword) => {
    if (!keyword) return employeeList.value
    const kw = keyword.toLowerCase()
    return employeeList.value.filter(e =>
      e.name.toLowerCase().includes(kw) ||
      e.phone.includes(kw) ||
      e.email.toLowerCase().includes(kw) ||
      e.department.toLowerCase().includes(kw) ||
      e.position.toLowerCase().includes(kw)
    )
  }

  const getEmployeeById = (id) => {
    return employeeList.value.find(e => e.id === id)
  }

  const getMyApprovals = (applicantId) => {
    return approvalList.value.filter(a => a.applicantId === applicantId)
  }

  const getPendingApprovals = () => {
    return approvalList.value.filter(a => a.status === 'pending')
  }

  const getApprovalsByStatus = (status) => {
    if (!status) return approvalList.value
    return approvalList.value.filter(a => a.status === status)
  }

  const createApproval = (data) => {
    const newApproval = {
      id: Date.now(),
      ...data,
      status: 'pending',
      createTime: new Date().toLocaleString()
    }
    approvalList.value.unshift(newApproval)
    return newApproval
  }

  const updateApprovalStatus = (id, status, rejectReason = '') => {
    const approval = approvalList.value.find(a => a.id === id)
    if (approval) {
      approval.status = status
      if (rejectReason) {
        approval.rejectReason = rejectReason
      }
    }
    return approval
  }

  const getFilesByCategory = (category) => {
    if (!category || category === '全部') return fileList.value
    if (category === '收藏') return fileList.value.filter(f => f.isFavorite)
    return fileList.value.filter(f => f.category === category)
  }

  const searchFiles = (keyword) => {
    if (!keyword) return fileList.value
    const kw = keyword.toLowerCase()
    return fileList.value.filter(f => f.name.toLowerCase().includes(kw))
  }

  const toggleFileFavorite = (id) => {
    const file = fileList.value.find(f => f.id === id)
    if (file) {
      file.isFavorite = !file.isFavorite
    }
    return file
  }

  const fileCategories = computed(() => {
    const categories = new Set(fileList.value.map(f => f.category))
    return ['全部', '收藏', ...Array.from(categories)]
  })

  const statistics = computed(() => ({
    employeeCount: employeeList.value.length,
    pendingApprovalCount: approvalList.value.filter(a => a.status === 'pending').length,
    approvalCount: approvalList.value.length,
    fileCount: fileList.value.length
  }))

  return {
    departmentList,
    employeeList,
    approvalList,
    fileList,
    noticeList,
    fileCategories,
    statistics,
    getEmployeesByDept,
    searchEmployees,
    getEmployeeById,
    getMyApprovals,
    getPendingApprovals,
    getApprovalsByStatus,
    createApproval,
    updateApprovalStatus,
    getFilesByCategory,
    searchFiles,
    toggleFileFavorite
  }
})
