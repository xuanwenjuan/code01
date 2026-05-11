export type DeviceStatus = 'online' | 'offline' | 'fault' | 'maintenance'

export type MonitorStatus = 'normal' | 'warning' | 'alarm'

export type DeviceType = 
  | 'air_conditioner'
  | 'lighting'
  | 'motor'
  | 'pump'
  | 'elevator'
  | 'transformer'
  | 'cooling_tower'
  | 'ventilation'

export type AreaType = 
  | 'workshop'
  | 'office'
  | 'parking'
  | 'outdoor'

export type OperationType = 
  | 'update_power'
  | 'dispatch_workorder'
  | 'add_inspection'
  | 'device_online'
  | 'device_offline'
  | 'create_device'
  | 'delete_device'
  | 'update_device'

export type AlertType = 'overload' | 'voltage_abnormal' | 'offline' | 'fault'

export type AlertLevel = 'low' | 'medium' | 'high'

export type AlertStatus = 'active' | 'acknowledged' | 'resolved'

export type LoadLevel = 'low' | 'normal' | 'high' | 'overload'

export interface Area {
  id: string
  name: string
  type: AreaType
  deviceCount: number
  description: string
}

export interface Device {
  id: string
  name: string
  code: string
  type: DeviceType
  ratedPower: number
  currentPower: number
  voltage: number
  current: number
  powerFactor?: number
  status: DeviceStatus
  monitorStatus: MonitorStatus
  areaId: string
  areaName: string
  lastUpdateTime: string
  installTime: string
  manufacturer: string
  model: string
}

export interface DeviceWithLoadRate extends Device {
  loadRate: number
  loadLevel: LoadLevel
}

export interface EnergyData {
  id: string
  deviceId: string
  deviceName: string
  areaId: string
  areaName: string
  power: number
  energyConsumption: number
  timestamp: string
  voltage: number
  current: number
  powerFactor: number
}

export interface DailyEnergySummary {
  date: string
  areaId: string
  areaName: string
  totalEnergy: number
  peakEnergy: number
  valleyEnergy: number
  avgPower: number
  deviceCount: number
  monitorStatus: MonitorStatus
}

export interface Alert {
  id: string
  deviceId: string
  deviceName: string
  areaId: string
  areaName: string
  type: AlertType
  level: AlertLevel
  message: string
  status: AlertStatus
  createTime: string
  acknowledgeTime?: string
  resolveTime?: string
  acknowledgedBy?: string
  resolvedBy?: string
}

export interface OperationLog {
  id: string
  operationType: OperationType
  operator: string
  deviceId?: string
  deviceName?: string
  areaId?: string
  areaName?: string
  details: string
  beforeValue?: string
  afterValue?: string
  timestamp: string
  ip: string
}

export interface FilterParams {
  areaIds: string[]
  deviceStatuses: DeviceStatus[]
  monitorStatuses: MonitorStatus[]
  minPower: number | null
  maxPower: number | null
  minLoadRate: number | null
  maxLoadRate: number | null
  minEnergy: number | null
  maxEnergy: number | null
  startTime: string | null
  endTime: string | null
  operationTypes: OperationType[]
  alertLevels: AlertLevel[]
  alertStatuses: AlertStatus[]
  keyword: string
}

export interface Statistics {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  faultDevices: number
  maintenanceDevices: number
  avgLoadRate: number
  highLoadDevices: number
  todayEnergy: number
  todayPeakEnergy: number
  todayValleyEnergy: number
  activeAlerts: number
  highPriorityAlerts: number
}

export interface AreaStatistics {
  areaId: string
  areaName: string
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  faultDevices: number
  maintenanceDevices: number
  avgLoadRate: number
  totalEnergy: number
  monitorStatus: MonitorStatus
}

export type StatusLabelMap = {
  [K in DeviceStatus]: { text: string; color: string }
}

export type MonitorStatusLabelMap = {
  [K in MonitorStatus]: { text: string; color: string }
}

export type DeviceTypeLabelMap = {
  [K in DeviceType]: string
}

export type AreaTypeLabelMap = {
  [K in AreaType]: string
}

export type OperationTypeLabelMap = {
  [K in OperationType]: string
}

export type AlertTypeLabelMap = {
  [K in AlertType]: string
}

export type AlertLevelLabelMap = {
  [K in AlertLevel]: { text: string; color: string }
}

export type AlertStatusLabelMap = {
  [K in AlertStatus]: { text: string; color: string }
}

export type LoadLevelLabelMap = {
  [K in LoadLevel]: { text: string; color: string }
}

export type Nullable<T> = T | null | undefined

export type WithId<T> = T & { id: string }

export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

export type ArrayElement<A> = A extends (infer T)[] ? T : never
