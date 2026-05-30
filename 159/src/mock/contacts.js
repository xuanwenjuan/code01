import { delay } from '@/utils/request'

const departments = [
  {
    id: 1,
    name: '总公司',
    children: [
      {
        id: 2,
        name: '技术部',
        children: [
          { id: 21, name: '前端组' },
          { id: 22, name: '后端组' },
          { id: 23, name: '测试组' }
        ]
      },
      {
        id: 3,
        name: '市场部',
        children: [
          { id: 31, name: '销售组' },
          { id: 32, name: '推广组' }
        ]
      },
      {
        id: 4,
        name: '财务部'
      },
      {
        id: 5,
        name: '人事部'
      },
      {
        id: 6,
        name: '行政部'
      }
    ]
  }
]

const employees = [
  { id: 1, name: '张小明', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', phone: '13800138000', email: 'zhangxiaoming@company.com', department: '技术部', position: '技术总监', deptId: 2 },
  { id: 2, name: '张三', avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', phone: '13800138001', email: 'zhangsan@company.com', department: '技术部-前端组', position: '前端开发工程师', deptId: 21 },
  { id: 3, name: '李四', avatar: 'https://cube.elemecdn.com/0/84/e69f7dbd26b0f1472bb17689e190apng.png', phone: '13800138002', email: 'lisi@company.com', department: '技术部-前端组', position: '前端开发工程师', deptId: 21 },
  { id: 4, name: '王五', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', phone: '13800138003', email: 'wangwu@company.com', department: '技术部-后端组', position: '后端开发工程师', deptId: 22 },
  { id: 5, name: '赵六', avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', phone: '13800138004', email: 'zhaoliu@company.com', department: '技术部-测试组', position: '测试工程师', deptId: 23 },
  { id: 6, name: '钱七', avatar: 'https://cube.elemecdn.com/0/84/e69f7dbd26b0f1472bb17689e190apng.png', phone: '13800138005', email: 'qianqi@company.com', department: '市场部-销售组', position: '销售经理', deptId: 31 },
  { id: 7, name: '孙八', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', phone: '13800138006', email: 'sunba@company.com', department: '市场部-推广组', position: '推广专员', deptId: 32 },
  { id: 8, name: '周九', avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', phone: '13800138007', email: 'zhoujiu@company.com', department: '财务部', position: '财务主管', deptId: 4 },
  { id: 9, name: '吴十', avatar: 'https://cube.elemecdn.com/0/84/e69f7dbd26b0f1472bb17689e190apng.png', phone: '13800138008', email: 'wushi@company.com', department: '人事部', position: 'HR经理', deptId: 5 },
  { id: 10, name: '郑十一', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', phone: '13800138009', email: 'zheng11@company.com', department: '行政部', position: '行政专员', deptId: 6 },
  { id: 11, name: '王十二', avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', phone: '13800138010', email: 'wang12@company.com', department: '技术部-后端组', position: '后端开发工程师', deptId: 22 },
  { id: 12, name: '刘十三', avatar: 'https://cube.elemecdn.com/0/84/e69f7dbd26b0f1472bb17689e190apng.png', phone: '13800138011', email: 'liu13@company.com', department: '技术部-测试组', position: '测试工程师', deptId: 23 }
]

export const mockDepartments = async () => {
  await delay(300)
  return departments
}

export const mockEmployees = async (params = {}) => {
  await delay(400)
  let result = [...employees]
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    result = result.filter(e =>
      e.name.toLowerCase().includes(keyword) ||
      e.phone.includes(keyword) ||
      e.email.toLowerCase().includes(keyword) ||
      e.department.toLowerCase().includes(keyword)
    )
  }
  if (params.deptId) {
    const deptIdStr = String(params.deptId)
    result = result.filter(e => String(e.deptId).startsWith(deptIdStr) || String(e.deptId) === deptIdStr)
  }
  return {
    list: result,
    total: result.length
  }
}

export const mockEmployeeDetail = async (id) => {
  await delay(300)
  const employee = employees.find(e => e.id === id)
  if (!employee) throw new Error('员工不存在')
  return {
    ...employee,
    gender: '男',
    birthday: '1990-05-15',
    entryDate: '2020-01-15',
    address: '北京市朝阳区xxx路xxx号',
    education: '本科',
    major: '计算机科学与技术',
    emergencyContact: '张某某',
    emergencyPhone: '13900139000'
  }
}
