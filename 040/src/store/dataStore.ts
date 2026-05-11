import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Device,
  Area,
  EnergyData,
  DailyEnergySummary,
  Alert,
  OperationLog,
  Statistics,
  DeviceStatus,
  MonitorStatus,
  OperationType,
  DeviceWithLoadRate,
  AlertType,
} from '@/types'
import {
  mockAreas,
  mockDevices,
  mockEnergyData,
  mockDailyEnergySummaries,
  mockAlerts,
  mockOperationLogs,
} from '@/mock'
import { getAverageLoadRate, getHighLoadDeviceCount, calculateLoadRate } from '@/utils'
import { LOAD_THRESHOLDS, VOLTAGE_THRESHOLDS } from '@/constants'

interface DataState {
  areas: Area[]
  devices: Device[]
  energyData: EnergyData[]
  dailyEnergySummaries: DailyEnergySummary[]
  alerts: Alert[]
  operationLogs: OperationLog[]
  statistics: Statistics
  currentDevice: Device | null
  currentAlert: Alert | null
  isDeviceModalOpen: boolean
  isAlertModalOpen: boolean

  devicesWithLoadRate: DeviceWithLoadRate[]

  setCurrentDevice: (device: Device | null) => void
  setCurrentAlert: (alert: Alert | null) => void
  openDeviceModal: (device?: Device) => void
  closeDeviceModal: () => void
  openAlertModal: (alert: Alert) => void
  closeAlertModal: () => void

  updateDevice: (deviceId: string, updates: Partial<Device>, operator?: string) => void
  createDevice: (device: Omit<Device, 'id' | 'lastUpdateTime'>, operator?: string) => void
  deleteDevice: (deviceId: string, operator?: string) => void

  updateDevicePower: (deviceId: string, power: number, operator?: string) => void
  toggleDeviceStatus: (deviceId: string, operator?: string) => void

  acknowledgeAlert: (alertId: string, operator: string) => void
  resolveAlert: (alertId: string, operator: string, reason?: string) => void
  createAlert: (
    deviceId: string,
    type: AlertType,
    message: string,
    level?: Alert['level']
  ) => void

  addOperationLog: (
    operationType: OperationType,
    operator: string,
    details: string,
    device?: Device,
    beforeValue?: string,
    afterValue?: string
  ) => void

  refreshData: () => void
  updateStatistics: () => void
  checkDeviceStatusAndCreateAlerts: (deviceId: string) => void
}

function calculateStatistics(
  devices: Device[],
  alerts: Alert[],
  summaries: DailyEnergySummary[]
): Statistics {
  const today = new Date().toISOString().split('T')[0]
  const todaySummaries = summaries.filter((s) => s.date === today)

  const totalTodayEnergy = todaySummaries.reduce((sum, s) => sum + s.totalEnergy, 0)
  const todayPeakEnergy = todaySummaries.reduce((sum, s) => sum + s.peakEnergy, 0)
  const todayValleyEnergy = todaySummaries.reduce((sum, s) => sum + s.valleyEnergy, 0)

  return {
    totalDevices: devices.length,
    onlineDevices: devices.filter((d) => d.status === 'online').length,
    offlineDevices: devices.filter((d) => d.status === 'offline').length,
    faultDevices: devices.filter((d) => d.status === 'fault').length,
    maintenanceDevices: devices.filter((d) => d.status === 'maintenance').length,
    avgLoadRate: getAverageLoadRate(devices),
    highLoadDevices: getHighLoadDeviceCount(devices),
    todayEnergy: totalTodayEnergy > 0 ? totalTodayEnergy : 245.67,
    todayPeakEnergy: todayPeakEnergy > 0 ? todayPeakEnergy : 110.55,
    todayValleyEnergy: todayValleyEnergy > 0 ? todayValleyEnergy : 61.42,
    activeAlerts: alerts.filter((a) => a.status === 'active').length,
    highPriorityAlerts: alerts.filter((a) => a.level === 'high' && a.status === 'active').length,
  }
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      areas: mockAreas,
      devices: mockDevices,
      energyData: mockEnergyData,
      dailyEnergySummaries: mockDailyEnergySummaries,
      alerts: mockAlerts,
      operationLogs: mockOperationLogs,
      statistics: calculateStatistics(mockDevices, mockAlerts, mockDailyEnergySummaries),
      currentDevice: null,
      currentAlert: null,
      isDeviceModalOpen: false,
      isAlertModalOpen: false,

      get devicesWithLoadRate() {
        return get().devices.map((device) => {
          const loadRate = calculateLoadRate(device.currentPower, device.ratedPower)
          let loadLevel: DeviceWithLoadRate['loadLevel'] = 'normal'
          if (loadRate >= 100) loadLevel = 'overload'
          else if (loadRate >= LOAD_THRESHOLDS.high * 100) loadLevel = 'high'
          else if (loadRate <= LOAD_THRESHOLDS.low * 100) loadLevel = 'low'

          return {
            ...device,
            loadRate,
            loadLevel,
          }
        })
      },

      setCurrentDevice: (device) => set({ currentDevice: device }),
      setCurrentAlert: (alert) => set({ currentAlert: alert }),

      openDeviceModal: (device) =>
        set({
          currentDevice: device || null,
          isDeviceModalOpen: true,
        }),

      closeDeviceModal: () =>
        set({
          isDeviceModalOpen: false,
          currentDevice: null,
        }),

      openAlertModal: (alert) =>
        set({
          currentAlert: alert,
          isAlertModalOpen: true,
        }),

      closeAlertModal: () =>
        set({
          isAlertModalOpen: false,
          currentAlert: null,
        }),

      checkDeviceStatusAndCreateAlerts: (deviceId) => {
        const { devices, alerts } = get()
        const device = devices.find((d) => d.id === deviceId)
        if (!device) return

        const loadRate = calculateLoadRate(device.currentPower, device.ratedPower)
        const activeAlerts = alerts.filter(
          (a) => a.deviceId === deviceId && a.status === 'active'
        )

        if (loadRate >= 100) {
          const existingAlert = activeAlerts.find((a) => a.type === 'overload')
          if (!existingAlert) {
            get().createAlert(
              deviceId,
              'overload',
              `设备严重过载，负载率达到 ${loadRate.toFixed(1)}%，额定功率 ${device.ratedPower}kW`,
              'high'
            )
          }
        } else if (loadRate >= 80) {
          const existingAlert = activeAlerts.find((a) => a.type === 'overload')
          if (!existingAlert) {
            get().createAlert(
              deviceId,
              'overload',
              `设备负载偏高，负载率达到 ${loadRate.toFixed(1)}%，请关注`,
              'medium'
            )
          }
        }

        if (device.voltage < VOLTAGE_THRESHOLDS.low || device.voltage > VOLTAGE_THRESHOLDS.high) {
          const existingAlert = activeAlerts.find((a) => a.type === 'voltage_abnormal')
          if (!existingAlert) {
            get().createAlert(
              deviceId,
              'voltage_abnormal',
              `电压异常，当前电压 ${device.voltage}V，正常范围 ${VOLTAGE_THRESHOLDS.low}-${VOLTAGE_THRESHOLDS.high}V`,
              'medium'
            )
          }
        }

        if (device.status === 'offline') {
          const existingAlert = activeAlerts.find((a) => a.type === 'offline')
          if (!existingAlert) {
            get().createAlert(
              deviceId,
              'offline',
              '设备离线，请检查网络连接或设备状态',
              'high'
            )
          }
        }

        if (device.status === 'fault') {
          const existingAlert = activeAlerts.find((a) => a.type === 'fault')
          if (!existingAlert) {
            get().createAlert(
              deviceId,
              'fault',
              '设备发生故障，需要立即维修',
              'high'
            )
          }
        }
      },

      createAlert: (deviceId, type, message, level = 'medium') => {
        const { devices, alerts } = get()
        const device = devices.find((d) => d.id === deviceId)
        if (!device) return

        const newAlert: Alert = {
          id: `alert_${String(alerts.length + 1).padStart(4, '0')}`,
          deviceId,
          deviceName: device.name,
          areaId: device.areaId,
          areaName: device.areaName,
          type,
          level,
          message,
          status: 'active',
          createTime: new Date().toISOString(),
        }

        set({
          alerts: [newAlert, ...alerts],
        })

        get().updateStatistics()
      },

      updateDevice: (deviceId, updates, operator = '系统管理员') => {
        const { devices, addOperationLog, updateStatistics } = get()
        const device = devices.find((d) => d.id === deviceId)
        if (!device) return

        const beforeStatus = device.status
        const beforePower = device.currentPower
        const beforeVoltage = device.voltage

        const updatedDevice = {
          ...device,
          ...updates,
          lastUpdateTime: new Date().toISOString(),
        }

        const updatedDevices = devices.map((d) => (d.id === deviceId ? updatedDevice : d))

        set({
          devices: updatedDevices,
        })

        updateStatistics()

        if (updates.status !== undefined && updates.status !== beforeStatus) {
          const statusMap: Record<DeviceStatus, string> = {
            online: '在线',
            offline: '离线',
            fault: '故障',
            maintenance: '维护中',
          }
          addOperationLog(
            updates.status === 'online' ? 'device_online' : 'device_offline',
            operator,
            `设备状态从「${statusMap[beforeStatus]}」变更为「${statusMap[updates.status]}」`,
            updatedDevice,
            statusMap[beforeStatus],
            statusMap[updates.status]
          )
        }

        if (updates.currentPower !== undefined && updates.currentPower !== beforePower) {
          addOperationLog(
            'update_power',
            operator,
            `设备功率从 ${beforePower}kW 调整为 ${updates.currentPower}kW`,
            updatedDevice,
            `${beforePower}kW`,
            `${updates.currentPower}kW`
          )
        }

        if (
          (updates.status !== undefined && updates.status !== beforeStatus) ||
          (updates.currentPower !== undefined && updates.currentPower !== beforePower) ||
          (updates.voltage !== undefined && updates.voltage !== beforeVoltage)
        ) {
          get().checkDeviceStatusAndCreateAlerts(deviceId)
        }

        if (updates.status !== undefined || updates.ratedPower !== undefined) {
          addOperationLog(
            'update_device',
            operator,
            '更新设备信息',
            updatedDevice
          )
        }
      },

      updateDevicePower: (deviceId, power, operator = '系统管理员') => {
        get().updateDevice(deviceId, { currentPower: power }, operator)
      },

      toggleDeviceStatus: (deviceId, operator = '系统管理员') => {
        const { devices } = get()
        const device = devices.find((d) => d.id === deviceId)
        if (!device) return

        const newStatus: DeviceStatus =
          device.status === 'offline' || device.status === 'fault' ? 'online' : 'offline'

        get().updateDevice(deviceId, { status: newStatus }, operator)
      },

      createDevice: (device, operator = '系统管理员') => {
        const { devices, addOperationLog, updateStatistics } = get()
        const newId = `device_${String(devices.length + 1).padStart(3, '0')}`
        const newDevice: Device = {
          ...device,
          id: newId,
          lastUpdateTime: new Date().toISOString(),
        }

        set({
          devices: [...devices, newDevice],
        })

        updateStatistics()

        addOperationLog('create_device', operator, '创建新设备', newDevice)

        get().checkDeviceStatusAndCreateAlerts(newId)
      },

      deleteDevice: (deviceId, operator = '系统管理员') => {
        const { devices, addOperationLog, updateStatistics } = get()
        const device = devices.find((d) => d.id === deviceId)
        if (!device) return

        const filtered = devices.filter((d) => d.id !== deviceId)
        set({
          devices: filtered,
        })

        updateStatistics()

        addOperationLog('delete_device', operator, '删除设备', device)
      },

      acknowledgeAlert: (alertId, operator) => {
        const { alerts, addOperationLog, updateStatistics } = get()
        const alert = alerts.find((a) => a.id === alertId)
        if (!alert || alert.status !== 'active') return

        const updatedAlerts = alerts.map((a) =>
          a.id === alertId
            ? {
                ...a,
                status: 'acknowledged' as const,
                acknowledgeTime: new Date().toISOString(),
                acknowledgedBy: operator,
              }
            : a
        )

        set({
          alerts: updatedAlerts,
        })

        updateStatistics()

        const device = get().devices.find((d) => d.id === alert.deviceId)
        addOperationLog(
          'dispatch_workorder',
          operator,
          `确认告警「${alert.message}」并派发工单`,
          device
        )
      },

      resolveAlert: (alertId, operator, reason) => {
        const { alerts, addOperationLog, updateStatistics } = get()
        const alert = alerts.find((a) => a.id === alertId)
        if (!alert || alert.status === 'resolved') return

        const updatedAlerts = alerts.map((a) =>
          a.id === alertId
            ? {
                ...a,
                status: 'resolved' as const,
                resolveTime: new Date().toISOString(),
                resolvedBy: operator,
              }
            : a
        )

        set({
          alerts: updatedAlerts,
        })

        updateStatistics()

        const device = get().devices.find((d) => d.id === alert.deviceId)
        if (device && (alert.type === 'fault' || alert.type === 'offline')) {
          const updatedDevice = {
            ...device,
            status: 'online' as DeviceStatus,
            monitorStatus: 'normal' as MonitorStatus,
          }
          get().updateDevice(device.id, updatedDevice, operator)
        }

        addOperationLog(
          'add_inspection',
          operator,
          reason || `设备告警已解决：${alert.message}`,
          device
        )
      },

      addOperationLog: (
        operationType,
        operator,
        details,
        device,
        beforeValue,
        afterValue
      ) => {
        const { operationLogs } = get()
        const newLog: OperationLog = {
          id: `log_${String(operationLogs.length + 1).padStart(6, '0')}`,
          operationType,
          operator,
          deviceId: device?.id,
          deviceName: device?.name,
          areaId: device?.areaId,
          areaName: device?.areaName,
          details,
          beforeValue,
          afterValue,
          timestamp: new Date().toISOString(),
          ip: '192.168.1.1',
        }

        set({
          operationLogs: [newLog, ...operationLogs],
        })
      },

      refreshData: () => {
        set({
          areas: mockAreas,
          energyData: mockEnergyData,
          dailyEnergySummaries: mockDailyEnergySummaries,
        })
      },

      updateStatistics: () => {
        const { devices, alerts, dailyEnergySummaries } = get()
        set({
          statistics: calculateStatistics(devices, alerts, dailyEnergySummaries),
        })
      },
    }),
    {
      name: 'data-store',
      partialize: (state) => ({
        devices: state.devices,
        alerts: state.alerts,
        operationLogs: state.operationLogs,
        statistics: state.statistics,
      }),
    }
  )
)
