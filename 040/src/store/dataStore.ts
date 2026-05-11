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
} from '@/types'
import {
  mockAreas,
  mockDevices,
  mockEnergyData,
  mockDailyEnergySummaries,
  mockAlerts,
  mockOperationLogs,
} from '@/mock'
import { getAverageLoadRate, getHighLoadDeviceCount } from '@/utils'

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
  
  updateDevice: (deviceId: string, updates: Partial<Device>) => void
  createDevice: (device: Omit<Device, 'id' | 'lastUpdateTime'>) => void
  deleteDevice: (deviceId: string) => void
  
  acknowledgeAlert: (alertId: string, operator: string) => void
  resolveAlert: (alertId: string, operator: string) => void
  
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
}

function calculateStatistics(devices: Device[], alerts: Alert[], summaries: DailyEnergySummary[]): Statistics {
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
          const loadRate = device.ratedPower > 0 
            ? Math.round((device.currentPower / device.ratedPower) * 10000) / 100 
            : 0
          let loadLevel: DeviceWithLoadRate['loadLevel'] = 'normal'
          if (loadRate >= 100) loadLevel = 'overload'
          else if (loadRate >= 80) loadLevel = 'high'
          else if (loadRate <= 30) loadLevel = 'low'
          
          return {
            ...device,
            loadRate,
            loadLevel,
          }
        })
      },

      setCurrentDevice: (device) => set({ currentDevice: device }),
      setCurrentAlert: (alert) => set({ currentAlert: alert }),

      openDeviceModal: (device) => set({
        currentDevice: device || null,
        isDeviceModalOpen: true,
      }),

      closeDeviceModal: () => set({
        isDeviceModalOpen: false,
        currentDevice: null,
      }),

      openAlertModal: (alert) => set({
        currentAlert: alert,
        isAlertModalOpen: true,
      }),

      closeAlertModal: () => set({
        isAlertModalOpen: false,
        currentAlert: null,
      }),

      updateDevice: (deviceId, updates) => {
        const { devices, addOperationLog, updateStatistics } = get()
        const device = devices.find((d) => d.id === deviceId)
        if (!device) return

        const beforeValue = updates.ratedPower !== undefined
          ? `${device.ratedPower}kW`
          : undefined
        const afterValue = updates.ratedPower !== undefined
          ? `${updates.ratedPower}kW`
          : undefined

        const updatedDevices = devices.map((d) =>
          d.id === deviceId
            ? { ...d, ...updates, lastUpdateTime: new Date().toISOString() }
            : d
        )

        set({
          devices: updatedDevices,
        })
        
        updateStatistics()

        addOperationLog(
          'update_device',
          '当前用户',
          '更新设备信息',
          device,
          beforeValue,
          afterValue
        )
      },

      createDevice: (device) => {
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

        addOperationLog(
          'create_device',
          '当前用户',
          '创建新设备',
          newDevice
        )
      },

      deleteDevice: (deviceId) => {
        const { devices, addOperationLog, updateStatistics } = get()
        const device = devices.find((d) => d.id === deviceId)
        if (!device) return

        const filtered = devices.filter((d) => d.id !== deviceId)
        set({
          devices: filtered,
        })
        
        updateStatistics()

        addOperationLog(
          'delete_device',
          '当前用户',
          '删除设备',
          device
        )
      },

      acknowledgeAlert: (alertId, operator) => {
        const { alerts, addOperationLog, updateStatistics } = get()
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

        const alert = alerts.find((a) => a.id === alertId)
        if (alert) {
          const device = get().devices.find((d) => d.id === alert.deviceId)
          addOperationLog(
            'dispatch_workorder',
            operator,
            '确认告警并派发工单',
            device
          )
        }
      },

      resolveAlert: (alertId, operator) => {
        const { alerts, addOperationLog, updateStatistics } = get()
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

        const alert = alerts.find((a) => a.id === alertId)
        if (alert) {
          const device = get().devices.find((d) => d.id === alert.deviceId)
          if (device) {
            const updatedDevice = {
              ...device,
              status: 'online' as DeviceStatus,
              monitorStatus: 'normal' as MonitorStatus,
            }
            get().updateDevice(device.id, updatedDevice)
          }
          addOperationLog(
            'add_inspection',
            operator,
            '设备告警已解决，完成巡检',
            device
          )
        }
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
