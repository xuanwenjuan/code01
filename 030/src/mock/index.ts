import Mock from 'mockjs'
import dayjs from 'dayjs'
import type { Building, House, Resident, WorkOrder, Payment, OperationLog, User } from '@/types'

const Random = Mock.Random

const generateBuildings = (): Building[] => {
  const buildings: Building[] = []
  const phases = ['一期', '二期', '三期']
  for (let i = 0; i < 9; i++) {
    const totalHouses = Random.integer(80, 120)
    const occupiedHouses = Random.integer(50, totalHouses)
    buildings.push({
      id: `building_${i + 1}`,
      name: `${phases[i % 3]}${Math.floor(i / 3) + 1}号楼`,
      phase: phases[i % 3],
      totalFloors: Random.integer(18, 30),
      totalUnits: Random.integer(2, 4),
      totalHouses,
      occupiedHouses,
      status: Random.pick(['normal', 'maintenance', 'completed']) as Building['status']
    })
  }
  return buildings
}

const generateHouses = (buildings: Building[]): House[] => {
  const houses: House[] = []
  buildings.forEach(building => {
    for (let unit = 1; unit <= building.totalUnits; unit++) {
      for (let floor = 1; floor <= building.totalFloors; floor++) {
        const houseNum = Random.integer(1, 2)
        for (let h = 1; h <= houseNum; h++) {
          houses.push({
            id: `house_${building.id}_${unit}_${floor}_${h}`,
            buildingId: building.id,
            unit,
            floor,
            houseNo: `${unit}-${floor}0${h}`,
            area: Random.float(80, 150, 0, 2),
            ownershipType: Random.pick(['owner', 'tenant', 'vacant']) as House['ownershipType'],
            occupancyStatus: Random.pick(['occupied', 'vacant', 'decorating']) as House['occupancyStatus']
          })
        }
      }
    }
  })
  return houses
}

const generateResidents = (buildings: Building[], houses: House[]): Resident[] => {
  const residents: Resident[] = []
  const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴']
  const lastNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '洋', '勇']
  
  houses.filter(h => h.occupancyStatus !== 'vacant').forEach(house => {
    const residentCount = Random.integer(1, 4)
    for (let i = 0; i < residentCount; i++) {
      const name = firstNames[Random.integer(0, firstNames.length - 1)] + lastNames[Random.integer(0, lastNames.length - 1)]
      residents.push({
        id: `resident_${house.id}_${i}`,
        houseId: house.id,
        buildingId: house.buildingId,
        name,
        phone: `1${Random.integer(3, 9)}${Random.string('number', 9)}`,
        idCard: Random.id(),
        relationship: i === 0 ? 'owner' : Random.pick(['family', 'tenant']) as Resident['relationship'],
        moveInDate: dayjs(Random.date('2020-01-01', '2025-12-31')).format('YYYY-MM-DD'),
        status: 'active'
      })
    }
  })
  return residents
}

const generateWorkOrders = (buildings: Building[], houses: House[], residents: Resident[]): WorkOrder[] => {
  const workOrders: WorkOrder[] = []
  const types = ['repair', 'complaint', 'suggestion', 'other'] as const
  const titles = ['水管漏水', '电梯故障', '门禁损坏', '路灯不亮', '噪音投诉', '绿化建议', '车位问题', '物业费疑问']
  const priorities = ['high', 'medium', 'low'] as const
  const statuses = ['pending', 'processing', 'checking', 'completed'] as const
  const handlers = ['维修员张三', '维修员李四', '维修员王五', '维修员赵六']
  
  for (let i = 0; i < 50; i++) {
    const resident = residents[Random.integer(0, residents.length - 1)]
    const house = houses.find(h => h.id === resident.houseId) || houses[0]
    const building = buildings.find(b => b.id === resident.buildingId) || buildings[0]
    const status = statuses[Random.integer(0, statuses.length - 1)]
    const createTime = Random.datetime('2025-01-01', '2025-05-01')
    const isTimeout = status !== 'completed' && dayjs().diff(dayjs(createTime), 'day') > 3
    
    workOrders.push({
      id: `workorder_${i + 1}`,
      residentId: resident.id,
      residentName: resident.name,
      phone: resident.phone,
      houseId: house.id,
      buildingId: building.id,
      buildingName: building.name,
      houseNo: house.houseNo,
      type: types[Random.integer(0, types.length - 1)],
      title: titles[Random.integer(0, titles.length - 1)],
      description: Random.cparagraph(3, 5),
      priority: priorities[Random.integer(0, priorities.length - 1)],
      status,
      createTime: dayjs(createTime).format('YYYY-MM-DD HH:mm:ss'),
      assignTime: status !== 'pending' ? dayjs(createTime).add(Random.integer(1, 24), 'hour').format('YYYY-MM-DD HH:mm:ss') : undefined,
      completeTime: status === 'completed' ? dayjs(createTime).add(Random.integer(2, 72), 'hour').format('YYYY-MM-DD HH:mm:ss') : undefined,
      handler: status !== 'pending' ? handlers[Random.integer(0, handlers.length - 1)] : undefined,
      isTimeout,
      remark: Random.boolean() ? Random.cparagraph(1, 2) : undefined
    })
  }
  return workOrders
}

const generatePayments = (buildings: Building[], houses: House[], residents: Resident[]): Payment[] => {
  const payments: Payment[] = []
  const types = ['property', 'water', 'electricity', 'gas', 'parking'] as const
  const statuses = ['unpaid', 'partial', 'paid'] as const
  
  for (let i = 0; i < 80; i++) {
    const resident = residents[Random.integer(0, residents.length - 1)]
    const house = houses.find(h => h.id === resident.houseId) || houses[0]
    const building = buildings.find(b => b.id === resident.buildingId) || buildings[0]
    const type = types[Random.integer(0, types.length - 1)]
    const status = statuses[Random.integer(0, statuses.length - 1)]
    const amount = Random.float(50, 500, 2, 2)
    const paidAmount = status === 'paid' ? amount : status === 'partial' ? Random.float(50, amount, 2, 2) : 0
    
    payments.push({
      id: `payment_${i + 1}`,
      residentId: resident.id,
      residentName: resident.name,
      houseId: house.id,
      buildingId: building.id,
      buildingName: building.name,
      houseNo: house.houseNo,
      type,
      amount,
      paidAmount,
      status,
      dueDate: dayjs(Random.date('2025-04-01', '2025-06-30')).format('YYYY-MM-DD'),
      paidDate: status !== 'unpaid' ? dayjs(Random.date('2025-04-01', '2025-05-10')).format('YYYY-MM-DD') : undefined,
      createTime: dayjs(Random.date('2025-03-01', '2025-05-01')).format('YYYY-MM-DD HH:mm:ss'),
      remark: Random.boolean() ? Random.cparagraph(1) : undefined
    })
  }
  return payments
}

const generateOperationLogs = (): OperationLog[] => {
  const logs: OperationLog[] = []
  const actions = ['修改收费标准', '强制结单', '费用减免', '添加住户', '修改住户信息', '派单', '审核工单', '删除记录', '调整楼栋信息']
  const targetTypes = ['收费标准', '工单', '住户', '楼栋', '费用']
  const operatorNames = ['管理员小王', '物业李经理', '物业张主管', '系统管理员']
  const roles = ['admin', 'property', 'maintenance']
  
  for (let i = 0; i < 100; i++) {
    logs.push({
      id: `log_${i + 1}`,
      operatorId: `user_${Random.integer(1, 10)}`,
      operatorName: operatorNames[Random.integer(0, operatorNames.length - 1)],
      operatorRole: roles[Random.integer(0, roles.length - 1)],
      action: actions[Random.integer(0, actions.length - 1)],
      targetType: targetTypes[Random.integer(0, targetTypes.length - 1)],
      targetId: `target_${Random.integer(1, 100)}`,
      targetName: Random.cword(5, 15),
      beforeChange: Random.boolean() ? Random.cparagraph(1, 2) : undefined,
      afterChange: Random.boolean() ? Random.cparagraph(1, 2) : undefined,
      createTime: dayjs(Random.datetime('2025-01-01', '2025-05-10')).format('YYYY-MM-DD HH:mm:ss'),
      ip: Random.ip()
    })
  }
  return logs
}

const generateUsers = (): User[] => {
  return [
    { id: 'user_1', username: 'admin', name: '系统管理员', role: 'admin', status: 'active' },
    { id: 'user_2', username: 'property1', name: '物业李经理', role: 'property', status: 'active' },
    { id: 'user_3', username: 'property2', name: '物业张主管', role: 'property', status: 'active' },
    { id: 'user_4', username: 'maintenance1', name: '维修员张三', role: 'maintenance', status: 'active' },
    { id: 'user_5', username: 'maintenance2', name: '维修员李四', role: 'maintenance', status: 'active' }
  ]
}

export const buildings = generateBuildings()
export const houses = generateHouses(buildings)
export const residents = generateResidents(buildings, houses)
export const workOrders = generateWorkOrders(buildings, houses, residents)
export const payments = generatePayments(buildings, houses, residents)
export const operationLogs = generateOperationLogs()
export const users = generateUsers()

export const mockData = {
  buildings,
  houses,
  residents,
  workOrders,
  payments,
  operationLogs,
  users
}
