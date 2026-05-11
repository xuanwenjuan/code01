import Mock from 'mockjs'
import type {
  Area,
  Device,
  EnergyData,
  DailyEnergySummary,
  Alert,
  OperationLog,
  DeviceStatus,
  MonitorStatus,
  DeviceType,
  AreaType,
  OperationType,
} from '@/types'
import { AREA_TYPE_MAP, DEVICE_TYPE_MAP } from '@/constants'

const AREA_IDS: Record<AreaType, string> = {
  workshop: 'area_001',
  office: 'area_002',
  parking: 'area_003',
  outdoor: 'area_004',
}

const DEVICE_STATUS_OPTIONS: DeviceStatus[] = ['online', 'offline', 'fault', 'maintenance']
const DEVICE_STATUS_WEIGHTS: number[] = [0.65, 0.15, 0.1, 0.1]
const MONITOR_STATUS_OPTIONS: MonitorStatus[] = ['normal', 'warning', 'alarm']
const MONITOR_STATUS_WEIGHTS: number[] = [0.7, 0.2, 0.1]
const DEVICE_TYPE_OPTIONS: DeviceType[] = [
  'air_conditioner', 'lighting', 'motor', 'pump', 'elevator', 'transformer', 'cooling_tower', 'ventilation'
]

function getRandomItemWithWeight<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  let random = Math.random() * totalWeight
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) return items[i]
  }
  return items[items.length - 1]
}

function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function generateTimeWithinDays(days: number): string {
  const now = Date.now()
  const offset = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000)
  return new Date(now - offset).toISOString()
}

export const mockAreas: Area[] = [
  {
    id: AREA_IDS.workshop,
    name: '一号生产车间',
    type: 'workshop',
    deviceCount: 12,
    description: '主要生产区域，包含大量电机和照明设备',
  },
  {
    id: AREA_IDS.office,
    name: '办公大楼',
    type: 'office',
    deviceCount: 8,
    description: '行政办公区域，包含空调和照明系统',
  },
  {
    id: AREA_IDS.parking,
    name: '地下停车场',
    type: 'parking',
    deviceCount: 6,
    description: '地下停车区域，包含通风和照明设备',
  },
  {
    id: AREA_IDS.outdoor,
    name: '户外景观区',
    type: 'outdoor',
    deviceCount: 4,
    description: '园区户外景观照明和灌溉系统',
  },
]

function generateDevices(count: number): Device[] {
  const devices: Device[] = []
  const areaTypes: AreaType[] = ['workshop', 'office', 'parking', 'outdoor']
  
  for (let i = 0; i < count; i++) {
    const areaType = getRandomItem(areaTypes)
    const areaId = AREA_IDS[areaType]
    const area = mockAreas.find(a => a.id === areaId)!
    const deviceType = getRandomItem(DEVICE_TYPE_OPTIONS)
    const status = getRandomItemWithWeight(DEVICE_STATUS_OPTIONS, DEVICE_STATUS_WEIGHTS)
    
    let monitorStatus: MonitorStatus = 'normal'
    if (status === 'fault') {
      monitorStatus = 'alarm'
    } else if (status === 'maintenance') {
      monitorStatus = 'warning'
    } else {
      monitorStatus = getRandomItemWithWeight(MONITOR_STATUS_OPTIONS, MONITOR_STATUS_WEIGHTS)
    }

    const ratedPower = Mock.Random.integer(50, 500)
    const currentPower = status === 'offline' ? 0 : Mock.Random.integer(Math.floor(ratedPower * 0.3), Math.floor(ratedPower * 1.2))
    const voltage = status === 'offline' ? 0 : Mock.Random.integer(200, 240)
    const current = status === 'offline' ? 0 : parseFloat((currentPower / voltage).toFixed(2))

    devices.push({
      id: `device_${String(i + 1).padStart(3, '0')}`,
      name: `${DEVICE_TYPE_MAP[deviceType]}-${Mock.Random.string('number', 4)}`,
      code: Mock.Random.string('upper', 2) + Mock.Random.string('number', 6),
      type: deviceType,
      ratedPower,
      currentPower,
      voltage,
      current,
      status,
      monitorStatus,
      areaId,
      areaName: area.name,
      lastUpdateTime: generateTimeWithinDays(1),
      installTime: generateTimeWithinDays(365),
      manufacturer: getRandomItem(['西门子', '施耐德', 'ABB', '台达', '欧姆龙', '三菱电机']),
      model: `${Mock.Random.string('upper', 2)}-${Mock.Random.string('number', 4)}`,
    })
  }
  return devices
}

export const mockDevices: Device[] = generateDevices(30)

function generateEnergyData(devices: Device[], hours: number): EnergyData[] {
  const data: EnergyData[] = []
  const now = Date.now()
  
  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString()
    
    devices.forEach(device => {
      if (device.status === 'offline') return
      
      const powerFactor = 0.8 + Math.random() * 0.15
      const powerVariation = 0.8 + Math.random() * 0.4
      const power = Math.floor(device.currentPower * powerVariation)
      const energyConsumption = parseFloat((power / 1000).toFixed(4))
      
      data.push({
        id: `energy_${device.id}_${i}`,
        deviceId: device.id,
        deviceName: device.name,
        areaId: device.areaId,
        areaName: device.areaName,
        power,
        energyConsumption,
        timestamp,
        voltage: device.voltage + Math.floor(Math.random() * 10 - 5),
        current: device.current + parseFloat((Math.random() * 2 - 1).toFixed(2)),
        powerFactor: parseFloat(powerFactor.toFixed(3)),
      })
    })
  }
  return data
}

export const mockEnergyData: EnergyData[] = generateEnergyData(mockDevices, 24)

function generateDailyEnergySummary(days: number): DailyEnergySummary[] {
  const summaries: DailyEnergySummary[] = []
  const now = Date.now()
  
  for (let d = 0; d < days; d++) {
    const date = new Date(now - d * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    
    mockAreas.forEach(area => {
      const areaDevices = mockDevices.filter(d => d.areaId === area.id)
      const activeDevices = areaDevices.filter(d => d.status !== 'offline')
      
      let monitorStatus: MonitorStatus = 'normal'
      const hasFault = areaDevices.some(d => d.monitorStatus === 'alarm')
      const hasWarning = areaDevices.some(d => d.monitorStatus === 'warning')
      
      if (hasFault) monitorStatus = 'alarm'
      else if (hasWarning) monitorStatus = 'warning'
      
      const baseEnergy = activeDevices.length * 20
      const variation = 0.7 + Math.random() * 0.6
      const totalEnergy = parseFloat((baseEnergy * variation).toFixed(2))
      
      summaries.push({
        date: dateStr,
        areaId: area.id,
        areaName: area.name,
        totalEnergy,
        peakEnergy: parseFloat((totalEnergy * 0.45).toFixed(2)),
        valleyEnergy: parseFloat((totalEnergy * 0.25).toFixed(2)),
        avgPower: parseFloat((baseEnergy / 24).toFixed(2)),
        deviceCount: activeDevices.length,
        monitorStatus,
      })
    })
  }
  return summaries
}

export const mockDailyEnergySummaries: DailyEnergySummary[] = generateDailyEnergySummary(14)

function generateAlerts(count: number): Alert[] {
  const alerts: Alert[] = []
  const alertTypes = [
    { type: 'overload' as const, message: '设备负载过高，超过额定功率' },
    { type: 'voltage_abnormal' as const, message: '电压异常，请检查供电系统' },
    { type: 'offline' as const, message: '设备离线，请检查网络连接' },
    { type: 'fault' as const, message: '设备故障，需要维修' },
  ]
  
  const onlineDevices = mockDevices.filter(d => d.status !== 'maintenance')
  
  for (let i = 0; i < count; i++) {
    const device = getRandomItem(onlineDevices)
    const alertType = getRandomItem(alertTypes)
    const level = getRandomItemWithWeight<'low' | 'medium' | 'high'>(
      ['low', 'medium', 'high'],
      [0.5, 0.3, 0.2]
    )
    
    const createTime = generateTimeWithinDays(7)
    let status: 'active' | 'acknowledged' | 'resolved' = 'active'
    let acknowledgeTime: string | undefined
    let resolveTime: string | undefined
    let acknowledgedBy: string | undefined
    let resolvedBy: string | undefined
    
    if (Math.random() > 0.4) {
      status = 'acknowledged'
      acknowledgeTime = generateTimeWithinDays(3)
      acknowledgedBy = getRandomItem(['张工', '李工', '王工', '赵工'])
      
      if (Math.random() > 0.5) {
        status = 'resolved'
        resolveTime = generateTimeWithinDays(2)
        resolvedBy = acknowledgedBy
      }
    }
    
    alerts.push({
      id: `alert_${String(i + 1).padStart(4, '0')}`,
      deviceId: device.id,
      deviceName: device.name,
      areaId: device.areaId,
      areaName: device.areaName,
      type: alertType.type,
      level,
      message: alertType.message,
      status,
      createTime,
      acknowledgeTime,
      resolveTime,
      acknowledgedBy,
      resolvedBy,
    })
  }
  return alerts
}

export const mockAlerts: Alert[] = generateAlerts(25)

const OPERATOR_NAMES = ['张工', '李工', '王工', '赵工', '刘工', '陈工']

function generateOperationLogs(count: number): OperationLog[] {
  const logs: OperationLog[] = []
  const operationDetails: Record<OperationType, { detail: string; beforeAfter: boolean }> = {
    update_power: { detail: '修改设备额定功率', beforeAfter: true },
    dispatch_workorder: { detail: '派发维修工单', beforeAfter: false },
    add_inspection: { detail: '添加设备巡检备注', beforeAfter: false },
    device_online: { detail: '设备恢复在线', beforeAfter: false },
    device_offline: { detail: '设备离线', beforeAfter: false },
    create_device: { detail: '创建设备', beforeAfter: false },
    delete_device: { detail: '删除设备', beforeAfter: false },
    update_device: { detail: '更新设备信息', beforeAfter: false },
  }
  
  const operationTypes: OperationType[] = [
    'update_power', 'dispatch_workorder', 'add_inspection', 
    'device_online', 'device_offline', 'create_device', 'update_device'
  ]
  
  for (let i = 0; i < count; i++) {
    const operationType = getRandomItem(operationTypes)
    const detailInfo = operationDetails[operationType]
    const device = getRandomItem(mockDevices)
    const operator = getRandomItem(OPERATOR_NAMES)
    
    let beforeValue: string | undefined
    let afterValue: string | undefined
    
    if (detailInfo.beforeAfter) {
      beforeValue = `${Mock.Random.integer(100, 300)}kW`
      afterValue = `${Mock.Random.integer(150, 400)}kW`
    }
    
    logs.push({
      id: `log_${String(i + 1).padStart(6, '0')}`,
      operationType,
      operator,
      deviceId: device.id,
      deviceName: device.name,
      areaId: device.areaId,
      areaName: device.areaName,
      details: detailInfo.detail,
      beforeValue,
      afterValue,
      timestamp: generateTimeWithinDays(30),
      ip: `192.168.${Mock.Random.integer(1, 10)}.${Mock.Random.integer(1, 254)}`,
    })
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const mockOperationLogs: OperationLog[] = generateOperationLogs(50)

export function getMockStatistics() {
  const todaySummary = mockDailyEnergySummaries.find(s => s.date === new Date().toISOString().split('T')[0])
  const totalTodayEnergy = mockDailyEnergySummaries
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((sum, s) => sum + s.totalEnergy, 0)
  
  const todayPeakEnergy = mockDailyEnergySummaries
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((sum, s) => sum + s.peakEnergy, 0)
  
  const todayValleyEnergy = mockDailyEnergySummaries
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((sum, s) => sum + s.valleyEnergy, 0)

  return {
    totalDevices: mockDevices.length,
    onlineDevices: mockDevices.filter(d => d.status === 'online').length,
    offlineDevices: mockDevices.filter(d => d.status === 'offline').length,
    faultDevices: mockDevices.filter(d => d.status === 'fault').length,
    maintenanceDevices: mockDevices.filter(d => d.status === 'maintenance').length,
    todayEnergy: todaySummary ? totalTodayEnergy : 245.67,
    todayPeakEnergy: todaySummary ? todayPeakEnergy : 110.55,
    todayValleyEnergy: todaySummary ? todayValleyEnergy : 61.42,
    activeAlerts: mockAlerts.filter(a => a.status === 'active').length,
    highPriorityAlerts: mockAlerts.filter(a => a.level === 'high' && a.status === 'active').length,
  }
}
