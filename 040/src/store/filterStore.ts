import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FilterParams, DeviceStatus, MonitorStatus, OperationType, AlertLevel, AlertStatus } from '@/types'
import { DEFAULT_FILTER_PARAMS } from '@/constants'

interface FilterState {
  deviceFilters: Omit<FilterParams, 'operationTypes' | 'alertLevels' | 'alertStatuses'>
  operationFilters: Pick<FilterParams, 'operationTypes' | 'startTime' | 'endTime' | 'keyword'>
  energyFilters: Pick<FilterParams, 'areaIds' | 'startTime' | 'endTime' | 'minEnergy' | 'maxEnergy'>
  alertFilters: Pick<FilterParams, 'alertLevels' | 'alertStatuses' | 'startTime' | 'endTime' | 'keyword'>
  
  setDeviceFilter: (filters: Partial<FilterParams>) => void
  setOperationFilter: (filters: Partial<FilterParams>) => void
  setEnergyFilter: (filters: Partial<FilterParams>) => void
  setAlertFilter: (filters: Partial<FilterParams>) => void
  
  resetDeviceFilters: () => void
  resetOperationFilters: () => void
  resetEnergyFilters: () => void
  resetAlertFilters: () => void
  
  toggleAreaFilter: (areaId: string) => void
  toggleDeviceStatusFilter: (status: DeviceStatus) => void
  toggleMonitorStatusFilter: (status: MonitorStatus) => void
  toggleOperationTypeFilter: (type: OperationType) => void
  toggleAlertLevelFilter: (level: AlertLevel) => void
  toggleAlertStatusFilter: (status: AlertStatus) => void
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      deviceFilters: DEFAULT_FILTER_PARAMS,
      operationFilters: {
        operationTypes: [],
        startTime: null,
        endTime: null,
        keyword: '',
      },
      energyFilters: {
        areaIds: [],
        startTime: null,
        endTime: null,
        minEnergy: null,
        maxEnergy: null,
      },
      alertFilters: {
        alertLevels: [],
        alertStatuses: [],
        startTime: null,
        endTime: null,
        keyword: '',
      },

      setDeviceFilter: (filters) => set((state) => ({
        deviceFilters: { ...state.deviceFilters, ...filters },
      })),

      setOperationFilter: (filters) => set((state) => ({
        operationFilters: { ...state.operationFilters, ...filters },
      })),

      setEnergyFilter: (filters) => set((state) => ({
        energyFilters: { ...state.energyFilters, ...filters },
      })),

      setAlertFilter: (filters) => set((state) => ({
        alertFilters: { ...state.alertFilters, ...filters },
      })),

      resetDeviceFilters: () => set({ deviceFilters: DEFAULT_FILTER_PARAMS }),

      resetOperationFilters: () => set({
        operationFilters: {
          operationTypes: [],
          startTime: null,
          endTime: null,
          keyword: '',
        },
      }),

      resetEnergyFilters: () => set({
        energyFilters: {
          areaIds: [],
          startTime: null,
          endTime: null,
          minEnergy: null,
          maxEnergy: null,
        },
      }),

      resetAlertFilters: () => set({
        alertFilters: {
          alertLevels: [],
          alertStatuses: [],
          startTime: null,
          endTime: null,
          keyword: '',
        },
      }),

      toggleAreaFilter: (areaId) => {
        const current = get().deviceFilters.areaIds
        const updated = current.includes(areaId)
          ? current.filter((id) => id !== areaId)
          : [...current, areaId]
        set((state) => ({ deviceFilters: { ...state.deviceFilters, areaIds: updated } }))
      },

      toggleDeviceStatusFilter: (status) => {
        const current = get().deviceFilters.deviceStatuses
        const updated = current.includes(status)
          ? current.filter((s) => s !== status)
          : [...current, status]
        set((state) => ({ deviceFilters: { ...state.deviceFilters, deviceStatuses: updated } }))
      },

      toggleMonitorStatusFilter: (status) => {
        const current = get().deviceFilters.monitorStatuses
        const updated = current.includes(status)
          ? current.filter((s) => s !== status)
          : [...current, status]
        set((state) => ({ deviceFilters: { ...state.deviceFilters, monitorStatuses: updated } }))
      },

      toggleOperationTypeFilter: (type) => {
        const current = get().operationFilters.operationTypes
        const updated = current.includes(type)
          ? current.filter((t) => t !== type)
          : [...current, type]
        set((state) => ({ operationFilters: { ...state.operationFilters, operationTypes: updated } }))
      },

      toggleAlertLevelFilter: (level) => {
        const current = get().alertFilters.alertLevels
        const updated = current.includes(level)
          ? current.filter((l) => l !== level)
          : [...current, level]
        set((state) => ({ alertFilters: { ...state.alertFilters, alertLevels: updated } }))
      },

      toggleAlertStatusFilter: (status) => {
        const current = get().alertFilters.alertStatuses
        const updated = current.includes(status)
          ? current.filter((s) => s !== status)
          : [...current, status]
        set((state) => ({ alertFilters: { ...state.alertFilters, alertStatuses: updated } }))
      },
    }),
    {
      name: 'filter-store',
    }
  )
)
