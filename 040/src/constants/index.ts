import type {
  StatusLabelMap,
  MonitorStatusLabelMap,
  DeviceTypeLabelMap,
  AreaTypeLabelMap,
  OperationTypeLabelMap,
  AlertTypeLabelMap,
  AlertLevelLabelMap,
  AlertStatusLabelMap,
  LoadLevelLabelMap,
} from '@/types'

export const DEVICE_STATUS_MAP: StatusLabelMap = {
  online: { text: '在线', color: 'green' },
  offline: { text: '离线', color: 'default' },
  fault: { text: '故障', color: 'red' },
  maintenance: { text: '维护中', color: 'orange' },
}

export const MONITOR_STATUS_MAP: MonitorStatusLabelMap = {
  normal: { text: '正常', color: 'green' },
  warning: { text: '预警', color: 'orange' },
  alarm: { text: '告警', color: 'red' },
}

export const DEVICE_TYPE_MAP: DeviceTypeLabelMap = {
  air_conditioner: '空调',
  lighting: '照明',
  motor: '电机',
  pump: '水泵',
  elevator: '电梯',
  transformer: '变压器',
  cooling_tower: '冷却塔',
  ventilation: '通风设备',
}

export const AREA_TYPE_MAP: AreaTypeLabelMap = {
  workshop: '生产车间',
  office: '办公大楼',
  parking: '地下停车场',
  outdoor: '户外景观',
}

export const OPERATION_TYPE_MAP: OperationTypeLabelMap = {
  update_power: '修改额定功率',
  dispatch_workorder: '派发维修工单',
  add_inspection: '添加巡检备注',
  device_online: '设备上线',
  device_offline: '设备离线',
  create_device: '创建设备',
  delete_device: '删除设备',
  update_device: '更新设备信息',
}

export const ALERT_TYPE_MAP: AlertTypeLabelMap = {
  overload: '过载',
  voltage_abnormal: '电压异常',
  offline: '离线',
  fault: '故障',
}

export const ALERT_LEVEL_MAP: AlertLevelLabelMap = {
  low: { text: '低', color: 'success' },
  medium: { text: '中', color: 'warning' },
  high: { text: '高', color: 'error' },
}

export const ALERT_STATUS_MAP: AlertStatusLabelMap = {
  active: { text: '活动中', color: 'error' },
  acknowledged: { text: '已确认', color: 'processing' },
  resolved: { text: '已解决', color: 'success' },
}

export const LOAD_LEVEL_MAP: LoadLevelLabelMap = {
  low: { text: '低负载', color: 'success' },
  normal: { text: '正常', color: 'default' },
  high: { text: '高负载', color: 'warning' },
  overload: { text: '过载', color: 'error' },
}

export const DEFAULT_FILTER_PARAMS = {
  areaIds: [] as string[],
  deviceStatuses: [] as string[],
  monitorStatuses: [] as string[],
  minPower: null as number | null,
  maxPower: null as number | null,
  minLoadRate: null as number | null,
  maxLoadRate: null as number | null,
  minEnergy: null as number | null,
  maxEnergy: null as number | null,
  startTime: null as string | null,
  endTime: null as string | null,
  operationTypes: [] as string[],
  alertLevels: [] as string[],
  alertStatuses: [] as string[],
  keyword: '',
}

export const RESPONSIVE_BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  large: 1440,
  screen: 1920,
}

export const AREA_COLORS: Record<string, string> = {
  workshop: '#1890ff',
  office: '#52c41a',
  parking: '#722ed1',
  outdoor: '#fa8c16',
}

export const ALERT_LEVEL_COLORS: Record<string, string> = {
  low: '#52c41a',
  medium: '#faad14',
  high: '#ff4d4f',
}

export const LOAD_THRESHOLDS = {
  LOW: 0.3,
  HIGH: 0.8,
  OVERLOAD: 1.0,
}

export const VOLTAGE_THRESHOLDS = {
  MIN: 200,
  MAX: 240,
}

export const CHART_COLORS = [
  '#1890ff',
  '#52c41a',
  '#722ed1',
  '#fa8c16',
  '#eb2f96',
  '#13c2c2',
  '#faad14',
  '#f5222d',
]
