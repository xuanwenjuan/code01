import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Trip, FilterParams, TripType, TripStatus, Attraction, DailyExpense } from '@/types'
import { generateId, calculateDays, formatDateTime } from '@/utils'
import { useLogStore } from './logStore'

export const useTripStore = defineStore(
  'trip',
  () => {
    const trips = ref<Trip[]>([])
    const loading = ref(false)
    const currentTrip = ref<Trip | null>(null)

    const totalTrips = computed(() => trips.value.length)
    const preparingTrips = computed(() => trips.value.filter((t) => t.status === 'preparing').length)
    const ongoingTrips = computed(() => trips.value.filter((t) => t.status === 'ongoing').length)
    const completedTrips = computed(() => trips.value.filter((t) => t.status === 'completed').length)

    const totalBudget = computed(() => trips.value.reduce((sum, t) => sum + t.budget, 0))
    const totalSpent = computed(() => trips.value.reduce((sum, t) => sum + t.spent, 0))

    const fetchTrips = async (): Promise<void> => {
      loading.value = true
      try {
        const response = await fetch('/api/trips')
        const result = await response.json()
        if (result.code === 200) {
          trips.value = result.data
        }
      } finally {
        loading.value = false
      }
    }

    const createTrip = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'days' | 'spent'>): Promise<Trip> => {
      const newTrip: Trip = {
        ...tripData,
        id: generateId(),
        days: calculateDays(tripData.startDate, tripData.endDate),
        spent: 0,
        createdAt: formatDateTime(new Date()),
        updatedAt: formatDateTime(new Date())
      }

      trips.value.unshift(newTrip)

      const logStore = useLogStore()
      logStore.addLog({
        type: 'create_trip',
        tripId: newTrip.id,
        tripName: newTrip.name,
        content: `创建了新行程：${newTrip.name}（${newTrip.destination}）`,
        operator: '管理员'
      })

      return newTrip
    }

    const updateTrip = async (id: string, tripData: Partial<Trip>): Promise<Trip | null> => {
      const index = trips.value.findIndex((t) => t.id === id)
      if (index === -1) return null

      const oldTrip = { ...trips.value[index] }
      const updatedTrip: Trip = {
        ...trips.value[index],
        ...tripData,
        updatedAt: formatDateTime(new Date()),
        days: tripData.startDate && tripData.endDate ? calculateDays(tripData.startDate, tripData.endDate) : trips.value[index].days
      }

      trips.value[index] = updatedTrip

      const logStore = useLogStore()
      let changes: string[] = []
      if (tripData.startDate && tripData.startDate !== oldTrip.startDate) {
        changes.push(`开始日期从 ${oldTrip.startDate} 改为 ${tripData.startDate}`)
      }
      if (tripData.endDate && tripData.endDate !== oldTrip.endDate) {
        changes.push(`结束日期从 ${oldTrip.endDate} 改为 ${tripData.endDate}`)
      }
      if (tripData.status && tripData.status !== oldTrip.status) {
        changes.push(`状态变更`)
      }
      if (changes.length === 0) {
        changes = ['修改了行程信息']
      }

      logStore.addLog({
        type: 'update_trip',
        tripId: updatedTrip.id,
        tripName: updatedTrip.name,
        content: `修改了行程「${updatedTrip.name}」：${changes.join('；')}`,
        operator: '管理员'
      })

      return updatedTrip
    }

    const deleteTrip = async (id: string): Promise<boolean> => {
      const index = trips.value.findIndex((t) => t.id === id)
      if (index === -1) return false

      const deletedTrip = trips.value[index]
      trips.value.splice(index, 1)

      const logStore = useLogStore()
      logStore.addLog({
        type: 'delete_trip',
        tripId: deletedTrip.id,
        tripName: deletedTrip.name,
        content: `删除了行程：${deletedTrip.name}（${deletedTrip.destination}）`,
        operator: '管理员'
      })

      return true
    }

    const getTripById = (id: string): Trip | undefined => {
      return trips.value.find((t) => t.id === id)
    }

    const filterTrips = (params: FilterParams): Trip[] => {
      return trips.value.filter((trip: Trip) => {
        if (params.keyword) {
          const keyword: string = params.keyword.toLowerCase()
          const matchName: boolean = trip.name.toLowerCase().includes(keyword)
          const matchDestination: boolean = trip.destination.toLowerCase().includes(keyword)
          if (!matchName && !matchDestination) return false
        }

        if (params.type && trip.type !== params.type) return false
        if (params.status && trip.status !== params.status) return false

        if (params.budgetMin !== undefined && trip.budget < params.budgetMin) return false
        if (params.budgetMax !== undefined && trip.budget > params.budgetMax) return false

        if (params.dateStart && trip.endDate < params.dateStart) return false
        if (params.dateEnd && trip.startDate > params.dateEnd) return false

        return true
      })
    }

    const addAttraction = (tripId: string, attraction: Omit<Attraction, 'id' | 'status'>): void => {
      const trip = trips.value.find((t) => t.id === tripId)
      if (!trip) return

      const newAttraction: Attraction = {
        ...attraction,
        id: generateId(),
        status: 'pending'
      }

      trip.attractions.push(newAttraction)
      trip.updatedAt = formatDateTime(new Date())

      const logStore = useLogStore()
      logStore.addLog({
        type: 'add_checkin',
        tripId: trip.id,
        tripName: trip.name,
        content: `为行程「${trip.name}」添加了打卡景点：${newAttraction.name}`,
        operator: '管理员'
      })
    }

    const canTransitionStatus = (currentStatus: Attraction['status'], newStatus: Attraction['status']): boolean => {
      if (currentStatus === newStatus) return false
      if (currentStatus === 'checked') return false
      if (currentStatus === 'missed' && newStatus === 'pending') return false
      return true
    }

    const updateAttractionStatus = (tripId: string, attractionId: string, status: Attraction['status']): { success: boolean; message: string } => {
      const trip = trips.value.find((t: Trip) => t.id === tripId)
      if (!trip) return { success: false, message: '行程不存在' }

      const attraction = trip.attractions.find((a: Attraction) => a.id === attractionId)
      if (!attraction) return { success: false, message: '景点不存在' }

      const oldStatus = attraction.status
      if (!canTransitionStatus(oldStatus, status)) {
        return { success: false, message: `无法从「${oldStatus}」状态切换到「${status}」` }
      }

      attraction.status = status
      if (status === 'checked') {
        attraction.checkedInAt = formatDateTime(new Date())
      }
      if (status === 'missed') {
        attraction.checkedInAt = undefined
      }
      trip.updatedAt = formatDateTime(new Date())

      const logStore = useLogStore()
      logStore.addLog({
        type: 'update_checkin',
        tripId: trip.id,
        tripName: trip.name,
        content: `景点「${attraction.name}」打卡状态从 ${oldStatus} 更新为 ${status}`,
        operator: '管理员'
      })

      return { success: true, message: '打卡状态更新成功' }
    }

    const recalculateSpent = (trip: Trip): void => {
      trip.spent = trip.expenses.reduce((sum: number, e: DailyExpense) => sum + e.amount, 0)
    }

    const addExpense = (tripId: string, expense: Omit<DailyExpense, 'id'>): { success: boolean; message: string } => {
      const trip = trips.value.find((t: Trip) => t.id === tripId)
      if (!trip) return { success: false, message: '行程不存在' }

      const newExpense: DailyExpense = {
        ...expense,
        id: generateId()
      }

      trip.expenses.push(newExpense)
      recalculateSpent(trip)
      trip.updatedAt = formatDateTime(new Date())

      const logStore = useLogStore()
      logStore.addLog({
        type: 'add_expense',
        tripId: trip.id,
        tripName: trip.name,
        content: `为行程「${trip.name}」添加了花费：${expense.description}，金额 ¥${expense.amount}`,
        operator: '管理员'
      })

      const isOverBudget = trip.spent > trip.budget
      const message = isOverBudget
        ? '花费已添加，注意：当前花费已超过预算！'
        : '花费已添加'

      return { success: true, message }
    }

    const updateBudget = (tripId: string, budget: number): void => {
      const trip = trips.value.find((t) => t.id === tripId)
      if (!trip) return

      const oldBudget = trip.budget
      trip.budget = budget
      trip.updatedAt = formatDateTime(new Date())

      const logStore = useLogStore()
      logStore.addLog({
        type: 'update_budget',
        tripId: trip.id,
        tripName: trip.name,
        content: `调整了行程「${trip.name}」的预算：从 ¥${oldBudget} 改为 ¥${budget}`,
        operator: '管理员'
      })
    }

    const getTripTypes = (): { value: TripType; label: string }[] => {
      return [
        { value: 'domestic', label: '国内游' },
        { value: 'overseas', label: '出境游' },
        { value: 'weekend', label: '周末短途' },
        { value: 'business', label: '商务出差' }
      ]
    }

    const getTripStatuses = (): { value: TripStatus; label: string }[] => {
      return [
        { value: 'preparing', label: '筹备中' },
        { value: 'ongoing', label: '进行中' },
        { value: 'completed', label: '已结束' }
      ]
    }

    return {
      trips,
      loading,
      currentTrip,
      totalTrips,
      preparingTrips,
      ongoingTrips,
      completedTrips,
      totalBudget,
      totalSpent,
      fetchTrips,
      createTrip,
      updateTrip,
      deleteTrip,
      getTripById,
      filterTrips,
      addAttraction,
      updateAttractionStatus,
      addExpense,
      updateBudget,
      getTripTypes,
      getTripStatuses
    }
  },
  {
    persist: {
      key: 'trip-store',
      paths: ['trips']
    }
  }
)
