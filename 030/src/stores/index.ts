import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockData } from '@/mock'
import type { 
  Building, 
  House, 
  Resident, 
  WorkOrder, 
  Payment, 
  OperationLog, 
  User, 
  WorkOrderStatus, 
  AdvancedFilter,
  PropertyFeeConfig,
  PaymentType,
  WorkOrderType,
  UserRole
} from '@/types'
import dayjs from 'dayjs'

const DEFAULT_PROPERTY_FEE_RATE = 2.5

export const useCommunityStore = defineStore('community', () => {
  const buildings = ref<Building[]>([...mockData.buildings])
  const houses = ref<House[]>([...mockData.houses])
  const residents = ref<Resident[]>([...mockData.residents])
  const workOrders = ref<WorkOrder[]>([...mockData.workOrders])
  const payments = ref<Payment[]>([...mockData.payments])
  const operationLogs = ref<OperationLog[]>([...mockData.operationLogs])
  const currentUser = ref<User>(mockData.users[0])
  const users = ref<User[]>([...mockData.users])
  
  const propertyFeeConfigs = ref<PropertyFeeConfig[]>(
    buildings.value.map(b => ({
      buildingId: b.id,
      ratePerSquare: DEFAULT_PROPERTY_FEE_RATE,
      effectiveDate: '2024-01-01',
      lastUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }))
  )

  const statistics = computed(() => {
    const totalHouses = houses.value.length
    const occupiedHouses = houses.value.filter((h: House) => h.occupancyStatus === 'occupied').length
    const totalResidents = residents.value.length
    const pendingOrders = workOrders.value.filter((w: WorkOrder) => w.status === 'pending').length
    const timeoutOrders = workOrders.value.filter((w: WorkOrder) => w.isTimeout).length
    const unpaidPayments = payments.value.filter((p: Payment) => p.status !== 'paid').length
    const todayLogs = operationLogs.value.filter((l: OperationLog) => 
      dayjs(l.createTime).isSame(dayjs(), 'day')
    ).length
    
    return {
      totalHouses,
      occupiedHouses,
      totalResidents,
      pendingOrders,
      timeoutOrders,
      unpaidPayments,
      todayLogs,
      occupancyRate: totalHouses > 0 ? ((occupiedHouses / totalHouses) * 100).toFixed(1) : '0'
    }
  })

  const maintenanceUsers = computed(() => {
    return users.value.filter((u: User) => u.role === 'maintenance' && u.status === 'active')
  })

  function getPropertyFeeRate(buildingId: string): number {
    const config = propertyFeeConfigs.value.find((c: PropertyFeeConfig) => c.buildingId === buildingId)
    return config?.ratePerSquare || DEFAULT_PROPERTY_FEE_RATE
  }

  function calculatePropertyFee(houseId: string, month?: string): {
    buildingId: string
    houseNo: string
    area: number
    ratePerSquare: number
    month: string
    totalFee: number
  } | null {
    const house = houses.value.find((h: House) => h.id === houseId)
    if (!house) return null

    const rate = getPropertyFeeRate(house.buildingId)
    const feeMonth = month || dayjs().format('YYYY-MM')
    const totalFee = parseFloat((house.area * rate).toFixed(2))

    return {
      buildingId: house.buildingId,
      houseNo: house.houseNo,
      area: house.area,
      ratePerSquare: rate,
      month: feeMonth,
      totalFee
    }
  }

  function generateMonthlyPropertyFee(): Payment[] {
    const currentMonth = dayjs().format('YYYY-MM')
    const newPayments: Payment[] = []
    
    houses.value.forEach((house: House) => {
      if (house.occupancyStatus !== 'occupied') return
      
      const existingPayment = payments.value.find((p: Payment) => 
        p.houseId === house.id && 
        p.type === 'property' && 
        p.feeMonth === currentMonth
      )
      
      if (existingPayment) return
      
      const feeInfo = calculatePropertyFee(house.id, currentMonth)
      if (!feeInfo) return
      
      const building = buildings.value.find((b: Building) => b.id === house.buildingId)
      const mainResident = residents.value.find((r: Resident) => 
        r.houseId === house.id && r.relationship === 'owner'
      ) || residents.value.find((r: Resident) => r.houseId === house.id)
      
      const newPayment: Payment = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        residentId: mainResident?.id || '',
        residentName: mainResident?.name || '',
        houseId: house.id,
        buildingId: house.buildingId,
        buildingName: building?.name || '',
        houseNo: house.houseNo,
        type: 'property',
        amount: feeInfo.totalFee,
        paidAmount: 0,
        status: 'unpaid',
        dueDate: dayjs().endOf('month').format('YYYY-MM-DD'),
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        feeMonth: currentMonth
      }
      
      payments.value.unshift(newPayment)
      newPayments.push(newPayment)
    })
    
    addOperationLog(
      '批量生成物业费',
      '费用',
      'batch_' + Date.now(),
      `${currentMonth}月物业费`,
      undefined,
      `生成${newPayments.length}条物业费记录`
    )
    
    return newPayments
  }

  function updatePropertyFeeRate(buildingId: string, newRate: number): void {
    const config = propertyFeeConfigs.value.find((c: PropertyFeeConfig) => c.buildingId === buildingId)
    if (config) {
      const beforeRate = config.ratePerSquare
      config.ratePerSquare = newRate
      config.lastUpdateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      
      const building = buildings.value.find((b: Building) => b.id === buildingId)
      addOperationLog(
        '修改收费标准',
        '收费标准',
        buildingId,
        building?.name || buildingId,
        `费率: ${beforeRate}元/㎡`,
        `费率: ${newRate}元/㎡`
      )
    }
  }

  function addOperationLog(
    action: string, 
    targetType: string, 
    targetId: string, 
    targetName: string,
    beforeChange?: string,
    afterChange?: string,
    remark?: string
  ): void {
    const log: OperationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operatorId: currentUser.value.id,
      operatorName: currentUser.value.name,
      operatorRole: currentUser.value.role,
      action,
      targetType,
      targetId,
      targetName,
      beforeChange,
      afterChange,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      ip: '127.0.0.1',
      remark
    }
    operationLogs.value.unshift(log)
  }

  function assignWorkOrder(orderId: string, handlerId: string, handlerName: string): void {
    const order = workOrders.value.find((w: WorkOrder) => w.id === orderId)
    if (order && order.status === 'pending') {
      order.status = 'processing'
      order.assignTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      order.handlerId = handlerId
      order.handler = handlerName
      
      addOperationLog(
        '派单',
        '工单',
        order.id,
        order.title,
        '状态: 待派单',
        `状态: 维修中, 处理人: ${handlerName}`
      )
    }
  }

  function updateWorkOrderStatus(orderId: string, newStatus: WorkOrderStatus, handler?: string): void {
    const order = workOrders.value.find((w: WorkOrder) => w.id === orderId)
    if (order) {
      const beforeStatus = order.status
      order.status = newStatus
      
      if (newStatus !== 'pending' && !order.assignTime) {
        order.assignTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        order.handler = handler || currentUser.value.name
      }
      
      if (newStatus === 'completed') {
        order.completeTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        order.isTimeout = false
      }
      
      const statusMap: Record<WorkOrderStatus, string> = {
        pending: '待派单',
        processing: '维修中',
        checking: '待验收',
        completed: '已完成'
      }
      
      addOperationLog(
        '更新工单状态',
        '工单',
        order.id,
        order.title,
        `状态: ${statusMap[beforeStatus]}`,
        `状态: ${statusMap[newStatus]}`
      )
    }
  }

  const workOrderStatusTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
    pending: ['processing'],
    processing: ['checking', 'completed'],
    checking: ['completed', 'processing'],
    completed: []
  }

  function isValidStatusTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
    return workOrderStatusTransitions[from].includes(to)
  }

  function processWorkOrder(orderId: string, action: 'assign' | 'complete' | 'approve' | 'reopen', handlerId?: string): void {
    const order = workOrders.value.find((w: WorkOrder) => w.id === orderId)
    if (!order) return

    switch (action) {
      case 'assign':
        if (order.status === 'pending' && handlerId) {
          const handlerUser = users.value.find((u: User) => u.id === handlerId)
          if (handlerUser) {
            assignWorkOrder(orderId, handlerId, handlerUser.name)
          }
        }
        break
      case 'complete':
        if (order.status === 'processing') {
          updateWorkOrderStatus(orderId, 'checking')
        }
        break
      case 'approve':
        if (order.status === 'checking') {
          updateWorkOrderStatus(orderId, 'completed')
        }
        break
      case 'reopen':
        if (order.status === 'checking') {
          updateWorkOrderStatus(orderId, 'processing')
        }
        break
    }
  }

  function updatePaymentStatus(paymentId: string, newStatus: Payment['status'], paidAmount?: number): void {
    const payment = payments.value.find((p: Payment) => p.id === paymentId)
    if (payment) {
      const beforeStatus = payment.status
      payment.status = newStatus
      if (paidAmount !== undefined) {
        payment.paidAmount = paidAmount
      }
      if (newStatus === 'paid') {
        payment.paidDate = dayjs().format('YYYY-MM-DD')
      }
      
      const statusMap: Record<Payment['status'], string> = {
        unpaid: '未缴费',
        partial: '部分缴费',
        paid: '已缴费'
      }
      
      addOperationLog(
        '更新缴费状态',
        '费用',
        payment.id,
        `${payment.type} - ${payment.amount}元`,
        `状态: ${statusMap[beforeStatus]}`,
        `状态: ${statusMap[newStatus]}`
      )
    }
  }

  function processPayment(paymentId: string, amount: number, method: Payment['paymentMethod'] = 'wechat'): void {
    const payment = payments.value.find((p: Payment) => p.id === paymentId)
    if (!payment || payment.status === 'paid') return

    const newPaidAmount = payment.paidAmount + amount
    const newStatus: Payment['status'] = newPaidAmount >= payment.amount ? 'paid' : 'partial'
    
    updatePaymentStatus(paymentId, newStatus, newPaidAmount)
    
    const house = houses.value.find((h: House) => h.id === payment.houseId)
    if (house && newStatus === 'paid' && payment.type === 'property') {
      house.lastPropertyFeeMonth = payment.feeMonth || dayjs().format('YYYY-MM')
    }
  }

  function applyDiscount(paymentId: string, discountAmount: number, reason: string): void {
    const payment = payments.value.find((p: Payment) => p.id === paymentId)
    if (!payment) return

    const originalAmount = payment.amount
    payment.discountAmount = discountAmount
    payment.amount = Math.max(0, originalAmount - discountAmount)
    
    addOperationLog(
      '费用减免',
      '费用',
      payment.id,
      `${payment.type} - ${originalAmount}元`,
      `原金额: ${originalAmount}元`,
      `减免后: ${payment.amount}元, 原因: ${reason}`
    )
  }

  function addWorkOrder(order: Omit<WorkOrder, 'id' | 'status' | 'createTime' | 'isTimeout'>): WorkOrder {
    const newOrder: WorkOrder = {
      ...order,
      id: `workorder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      isTimeout: false
    }
    workOrders.value.unshift(newOrder)
    addOperationLog('创建工单', '工单', newOrder.id, newOrder.title)
    return newOrder
  }

  function addPayment(payment: Omit<Payment, 'id' | 'status' | 'createTime' | 'paidAmount'>): Payment {
    const newPayment: Payment = {
      ...payment,
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'unpaid',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      paidAmount: 0
    }
    payments.value.unshift(newPayment)
    addOperationLog('创建费用记录', '费用', newPayment.id, `${newPayment.type} - ${newPayment.amount}元`)
    return newPayment
  }

  function addResident(resident: Omit<Resident, 'id'>): Resident {
    const newResident: Resident = {
      ...resident,
      id: `resident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    residents.value.unshift(newResident)
    addOperationLog('添加住户', '住户', newResident.id, newResident.name)
    return newResident
  }

  function updateResident(residentId: string, updates: Partial<Resident>): void {
    const resident = residents.value.find((r: Resident) => r.id === residentId)
    if (resident) {
      const beforeChange = JSON.stringify({
        name: resident.name,
        phone: resident.phone,
        status: resident.status,
        relationship: resident.relationship
      })
      Object.assign(resident, updates)
      addOperationLog(
        '修改住户信息',
        '住户',
        resident.id,
        resident.name,
        beforeChange,
        JSON.stringify({ 
          name: resident.name, 
          phone: resident.phone, 
          status: resident.status,
          relationship: resident.relationship 
        })
      )
    }
  }

  function deleteResident(residentId: string): void {
    const index = residents.value.findIndex((r: Resident) => r.id === residentId)
    if (index > -1) {
      const resident = residents.value[index]
      residents.value.splice(index, 1)
      addOperationLog('删除住户', '住户', resident.id, resident.name)
    }
  }

  function forceCompleteWorkOrder(orderId: string, reason: string): void {
    const order = workOrders.value.find((w: WorkOrder) => w.id === orderId)
    if (!order) return

    const beforeStatus = order.status
    order.status = 'completed'
    order.completeTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    order.isTimeout = false
    order.remark = reason ? `${order.remark || ''}\n强制结单原因: ${reason}`.trim() : order.remark

    addOperationLog(
      '强制结单',
      '工单',
      order.id,
      order.title,
      `状态: ${beforeStatus}`,
      `状态: 已完成 (强制结单)`,
      reason
    )
  }

  function filterResidents(filter: AdvancedFilter): Resident[] {
    return residents.value.filter((r: Resident) => {
      if (filter.buildingId && r.buildingId !== filter.buildingId) return false
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase()
        if (!r.name.toLowerCase().includes(keyword) && 
            !r.phone.includes(keyword)) return false
      }
      if (filter.occupancyStatus) {
        const house = houses.value.find((h: House) => h.id === r.houseId)
        if (!house || house.occupancyStatus !== filter.occupancyStatus) return false
      }
      return true
    })
  }

  function filterWorkOrders(filter: AdvancedFilter): WorkOrder[] {
    return workOrders.value.filter((w: WorkOrder) => {
      if (filter.buildingId && w.buildingId !== filter.buildingId) return false
      if (filter.workOrderType && w.type !== filter.workOrderType) return false
      if (filter.workOrderStatus && w.status !== filter.workOrderStatus) return false
      if (filter.priority && w.priority !== filter.priority) return false
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase()
        if (!w.title.toLowerCase().includes(keyword) && 
            !w.residentName.toLowerCase().includes(keyword) &&
            !w.id.toLowerCase().includes(keyword)) return false
      }
      if (filter.dateRange) {
        const [start, end] = filter.dateRange
        const createTime = dayjs(w.createTime)
        if (!createTime.isAfter(dayjs(start).subtract(1, 'day')) || 
            !createTime.isBefore(dayjs(end).add(1, 'day'))) return false
      }
      return true
    })
  }

  function filterPayments(filter: AdvancedFilter): Payment[] {
    return payments.value.filter((p: Payment) => {
      if (filter.buildingId && p.buildingId !== filter.buildingId) return false
      if (filter.paymentStatus && p.status !== filter.paymentStatus) return false
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase()
        if (!p.residentName.toLowerCase().includes(keyword)) return false
      }
      if (filter.dateRange) {
        const [start, end] = filter.dateRange
        const createTime = dayjs(p.createTime)
        if (!createTime.isAfter(dayjs(start).subtract(1, 'day')) || 
            !createTime.isBefore(dayjs(end).add(1, 'day'))) return false
      }
      return true
    })
  }

  function filterOperationLogs(filter: AdvancedFilter & { operatorName?: string }): OperationLog[] {
    return operationLogs.value.filter((l: OperationLog) => {
      if (filter.operatorName && !l.operatorName.includes(filter.operatorName)) return false
      if (filter.keyword && !l.action.includes(filter.keyword) && !l.targetName.includes(filter.keyword)) return false
      if (filter.dateRange) {
        const [start, end] = filter.dateRange
        const createTime = dayjs(l.createTime)
        if (!createTime.isAfter(dayjs(start).subtract(1, 'day')) || 
            !createTime.isBefore(dayjs(end).add(1, 'day'))) return false
      }
      return true
    })
  }

  function getBuildingById(id: string): Building | undefined {
    return buildings.value.find((b: Building) => b.id === id)
  }

  function getHouseById(id: string): House | undefined {
    return houses.value.find((h: House) => h.id === id)
  }

  function getResidentsByHouse(houseId: string): Resident[] {
    return residents.value.filter((r: Resident) => r.houseId === houseId)
  }

  function getWorkOrdersByBuilding(buildingId: string): WorkOrder[] {
    return workOrders.value.filter((w: WorkOrder) => w.buildingId === buildingId)
  }

  function getPaymentsByHouse(houseId: string): Payment[] {
    return payments.value.filter((p: Payment) => p.houseId === houseId)
  }

  return {
    buildings,
    houses,
    residents,
    workOrders,
    payments,
    operationLogs,
    currentUser,
    users,
    propertyFeeConfigs,
    maintenanceUsers,
    statistics,
    workOrderStatusTransitions,
    getPropertyFeeRate,
    calculatePropertyFee,
    generateMonthlyPropertyFee,
    updatePropertyFeeRate,
    addOperationLog,
    assignWorkOrder,
    updateWorkOrderStatus,
    isValidStatusTransition,
    processWorkOrder,
    updatePaymentStatus,
    processPayment,
    applyDiscount,
    addWorkOrder,
    addPayment,
    addResident,
    updateResident,
    deleteResident,
    forceCompleteWorkOrder,
    filterResidents,
    filterWorkOrders,
    filterPayments,
    filterOperationLogs,
    getBuildingById,
    getHouseById,
    getResidentsByHouse,
    getWorkOrdersByBuilding,
    getPaymentsByHouse
  }
}, {
  persist: {
    key: 'community-store',
    storage: localStorage,
    paths: [
      'buildings', 
      'houses', 
      'residents', 
      'workOrders', 
      'payments', 
      'operationLogs', 
      'currentUser',
      'propertyFeeConfigs'
    ]
  }
})
