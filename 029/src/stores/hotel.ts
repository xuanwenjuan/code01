import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import {
  RoomStatus,
  OrderStatus,
  OperationAction,
  type Room,
  type RoomTypeConfig,
  type Order,
  type OperationLog,
  type Guest,
  type RoomType,
  type OrderPayment
} from '@/types'
import { mockRoomTypes, mockRooms, mockOrders, mockGuests, mockLogs } from '@/mock'
import { generateId, generateOrderNo, formatCurrency } from '@/utils'
import { useUserStore } from './user'

export const useHotelStore = defineStore(
  'hotel',
  () => {
    const roomTypes = ref<RoomTypeConfig[]>([])
    const rooms = ref<Room[]>([])
    const orders = ref<Order[]>([])
    const guests = ref<Guest[]>([])
    const operationLogs = ref<OperationLog[]>([])

    const currentFloor = ref<number | null>(null)
    const selectedRoomType = ref<RoomType | null>(null)
    const selectedRoomStatus = ref<RoomStatus | null>(null)
    const orderKeyword = ref<string>('')
    const selectedOrderStatus = ref<OrderStatus | null>(null)
    const logOperator = ref<string>('')
    const logAction = ref<string>('')
    const logDateRange = ref<string[]>([])

    const initData = () => {
      roomTypes.value = [...mockRoomTypes]
      rooms.value = [...mockRooms]
      orders.value = [...mockOrders]
      guests.value = [...mockGuests]
      operationLogs.value = [...mockLogs]
    }

    const filteredRooms = computed(() => {
      return rooms.value.filter((room) => {
        if (currentFloor.value !== null && room.floor !== currentFloor.value) return false
        if (selectedRoomType.value && room.typeCode !== selectedRoomType.value) return false
        if (selectedRoomStatus.value && room.status !== selectedRoomStatus.value) return false
        return true
      })
    })

    const filteredOrders = computed(() => {
      return orders.value.filter((order) => {
        if (selectedOrderStatus.value && order.status !== selectedOrderStatus.value) return false
        if (orderKeyword.value) {
          const keyword = orderKeyword.value.toLowerCase()
          return (
            order.orderNo.toLowerCase().includes(keyword) ||
            order.guest.name.includes(keyword) ||
            order.roomNumber.includes(keyword)
          )
        }
        return true
      })
    })

    const filteredLogs = computed(() => {
      return operationLogs.value.filter((log) => {
        if (logOperator.value && log.operator !== logOperator.value) return false
        if (logAction.value && log.action !== logAction.value) return false
        if (logDateRange.value.length === 2) {
          const logDate = dayjs(log.timestamp)
          const startDate = dayjs(logDateRange.value[0]).startOf('day')
          const endDate = dayjs(logDateRange.value[1]).endOf('day')
          if (logDate.isBefore(startDate) || logDate.isAfter(endDate)) return false
        }
        return true
      })
    })

    const roomsByFloor = computed(() => {
      const floorMap = new Map<number, Room[]>()
      filteredRooms.value.forEach((room) => {
        if (!floorMap.has(room.floor)) {
          floorMap.set(room.floor, [])
        }
        floorMap.get(room.floor)?.push(room)
      })
      const sortedFloors = Array.from(floorMap.keys()).sort((a, b) => a - b)
      return sortedFloors.map((floor) => ({
        floor,
        rooms: floorMap.get(floor)?.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)) || []
      }))
    })

    const statistics = computed(() => {
      const today = dayjs().format('YYYY-MM-DD')
      return {
        totalRooms: rooms.value.length,
        vacantRooms: rooms.value.filter((r) => r.status === RoomStatus.VACANT).length,
        bookedRooms: rooms.value.filter((r) => r.status === RoomStatus.BOOKED).length,
        occupiedRooms: rooms.value.filter((r) => r.status === RoomStatus.OCCUPIED).length,
        cleaningRooms: rooms.value.filter((r) => r.status === RoomStatus.CLEANING).length,
        todayRevenue: orders.value
          .filter(
            (o) =>
              (o.status === OrderStatus.CHECKED_IN || o.status === OrderStatus.CHECKED_OUT) &&
              o.createTime.startsWith(today)
          )
          .reduce((sum, o) => sum + o.totalAmount, 0),
        pendingCheckinCount: orders.value.filter((o) => o.status === OrderStatus.PENDING_CHECKIN)
          .length,
        overdueCount: orders.value.filter((o) => o.isOverdue).length,
        todayCheckinCount: orders.value.filter(
          (o) => o.status === OrderStatus.CHECKED_IN && o.actualCheckIn?.startsWith(today)
        ).length,
        todayCheckoutCount: orders.value.filter(
          (o) => o.status === OrderStatus.CHECKED_OUT && o.actualCheckOut?.startsWith(today)
        ).length
      }
    })

    const getRoomTypeByCode = (code: RoomType): RoomTypeConfig | undefined => {
      return roomTypes.value.find((rt) => rt.code === code)
    }

    const getRoomById = (roomId: string): Room | undefined => {
      return rooms.value.find((r) => r.id === roomId)
    }

    const getOrderById = (orderId: string): Order | undefined => {
      return orders.value.find((o) => o.id === orderId)
    }

    const getActiveOrderForRoom = (roomId: string): Order | undefined => {
      return orders.value.find(
        (o) =>
          o.roomId === roomId &&
          (o.status === OrderStatus.PENDING_CHECKIN || o.status === OrderStatus.CHECKED_IN)
      )
    }

    const updateRoomStatus = (roomId: string, status: RoomStatus, operatorName?: string) => {
      const room = rooms.value.find((r) => r.id === roomId)
      if (!room) return false

      const previousStatus = room.status
      if (previousStatus === status) return true

      room.status = status
      room.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')

      const userStore = useUserStore()
      const statusMap: Record<RoomStatus, string> = {
        [RoomStatus.VACANT]: '空闲',
        [RoomStatus.BOOKED]: '已预订',
        [RoomStatus.OCCUPIED]: '入住中',
        [RoomStatus.CLEANING]: '打扫中'
      }

      recordOperationLog({
        action: OperationAction.ROOM_STATUS_CHANGE,
        operator: operatorName || userStore.user?.username || 'system',
        operatorRole: userStore.user?.role || 'admin',
        targetType: 'room',
        targetId: roomId,
        targetName: `${room.roomNumber}房间`,
        details: `将${room.roomNumber}房间状态从${statusMap[previousStatus]}改为${statusMap[status]}`,
        beforeData: { status: previousStatus },
        afterData: { status }
      })

      return true
    }

    const updateOrderStatus = (orderId: string, status: OrderStatus, operatorName?: string) => {
      const order = orders.value.find((o) => o.id === orderId)
      if (!order) return false

      const previousStatus = order.status
      if (previousStatus === status) return true

      order.status = status
      order.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

      if (status === OrderStatus.CHECKED_IN) {
        order.actualCheckIn = dayjs().format('YYYY-MM-DD HH:mm:ss')
      } else if (status === OrderStatus.CHECKED_OUT) {
        order.actualCheckOut = dayjs().format('YYYY-MM-DD HH:mm:ss')
      }

      const userStore = useUserStore()
      recordOperationLog({
        action: getOrderActionName(status),
        operator: operatorName || userStore.user?.username || 'system',
        operatorRole: userStore.user?.role || 'admin',
        targetType: 'order',
        targetId: orderId,
        targetName: `订单${order.orderNo}`,
        details: `订单${order.orderNo}状态变更为${getOrderStatusChinese(status)}`,
        beforeData: { status: previousStatus },
        afterData: { status }
      })

      return true
    }

    const getOrderActionName = (status: OrderStatus): OperationAction => {
      const actionMap: Record<OrderStatus, OperationAction> = {
        [OrderStatus.PENDING_CHECKIN]: OperationAction.CREATE_BOOKING,
        [OrderStatus.CHECKED_IN]: OperationAction.CHECK_IN,
        [OrderStatus.CHECKED_OUT]: OperationAction.CHECK_OUT,
        [OrderStatus.CANCELLED]: OperationAction.CANCEL_BOOKING
      }
      return actionMap[status]
    }

    const getOrderStatusChinese = (status: OrderStatus): string => {
      const map: Record<OrderStatus, string> = {
        [OrderStatus.PENDING_CHECKIN]: '待入住',
        [OrderStatus.CHECKED_IN]: '已入住',
        [OrderStatus.CHECKED_OUT]: '已退房',
        [OrderStatus.CANCELLED]: '已取消'
      }
      return map[status]
    }

    const createBooking = (orderData: {
      roomId: string
      guest: Guest
      checkInDate: string
      checkOutDate: string
      nights: number
      totalAmount: number
      deposit: number
      remark?: string
    }): Order | null => {
      const room = getRoomById(orderData.roomId)
      if (!room || room.status !== RoomStatus.VACANT) {
        return null
      }

      const userStore = useUserStore()

      const newOrder: Order = {
        id: generateId('order_'),
        orderNo: generateOrderNo(),
        roomId: orderData.roomId,
        roomNumber: room.roomNumber,
        guestId: orderData.guest.id,
        guest: orderData.guest,
        checkInDate: orderData.checkInDate,
        checkOutDate: orderData.checkOutDate,
        nights: orderData.nights,
        status: OrderStatus.PENDING_CHECKIN,
        totalAmount: orderData.totalAmount,
        paidAmount: 0,
        deposit: orderData.deposit,
        payments: [],
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        createBy: userStore.user?.username || 'admin',
        remark: orderData.remark,
        isOverdue: false
      }

      guests.value.push(orderData.guest)
      orders.value.push(newOrder)

      updateRoomStatus(orderData.roomId, RoomStatus.BOOKED, userStore.user?.username)

      recordOperationLog({
        action: OperationAction.CREATE_BOOKING,
        operator: userStore.user?.username || 'admin',
        operatorRole: userStore.user?.role || 'admin',
        targetType: 'order',
        targetId: newOrder.id,
        targetName: `订单${newOrder.orderNo}`,
        details: `为客人${orderData.guest.name}创建${room.roomNumber}房间预订订单，共${orderData.nights}晚，金额${formatCurrency(orderData.totalAmount)}`,
        beforeData: { roomStatus: RoomStatus.VACANT },
        afterData: { roomStatus: RoomStatus.BOOKED, orderStatus: OrderStatus.PENDING_CHECKIN }
      })

      return newOrder
    }

    const checkIn = (orderId: string): boolean => {
      const order = getOrderById(orderId)
      if (!order || order.status !== OrderStatus.PENDING_CHECKIN) {
        return false
      }

      const userStore = useUserStore()

      updateOrderStatus(orderId, OrderStatus.CHECKED_IN, userStore.user?.username)
      updateRoomStatus(order.roomId, RoomStatus.OCCUPIED, userStore.user?.username)

      recordOperationLog({
        action: OperationAction.CHECK_IN,
        operator: userStore.user?.username || 'admin',
        operatorRole: userStore.user?.role || 'admin',
        targetType: 'order',
        targetId: orderId,
        targetName: `订单${order.orderNo}`,
        details: `为客人${order.guest.name}办理${order.roomNumber}房间入住手续`,
        beforeData: {
          orderStatus: OrderStatus.PENDING_CHECKIN,
          roomStatus: RoomStatus.BOOKED
        },
        afterData: {
          orderStatus: OrderStatus.CHECKED_IN,
          roomStatus: RoomStatus.OCCUPIED
        }
      })

      return true
    }

    const checkOut = (orderId: string, payment?: OrderPayment): boolean => {
      const order = getOrderById(orderId)
      if (!order || order.status !== OrderStatus.CHECKED_IN) {
        return false
      }

      const userStore = useUserStore()

      if (payment) {
        order.payments.push(payment)
        order.paidAmount += payment.amount
      }

      updateOrderStatus(orderId, OrderStatus.CHECKED_OUT, userStore.user?.username)
      updateRoomStatus(order.roomId, RoomStatus.CLEANING, userStore.user?.username)

      recordOperationLog({
        action: OperationAction.CHECK_OUT,
        operator: userStore.user?.username || 'admin',
        operatorRole: userStore.user?.role || 'admin',
        targetType: 'order',
        targetId: orderId,
        targetName: `订单${order.orderNo}`,
        details: `为客人${order.guest.name}办理${order.roomNumber}房间退房手续，结算金额${formatCurrency(order.totalAmount)}`,
        beforeData: {
          orderStatus: OrderStatus.CHECKED_IN,
          roomStatus: RoomStatus.OCCUPIED
        },
        afterData: {
          orderStatus: OrderStatus.CHECKED_OUT,
          roomStatus: RoomStatus.CLEANING
        }
      })

      return true
    }

    const forceCheckOut = (orderId: string, reason?: string): boolean => {
      const order = getOrderById(orderId)
      if (!order || order.status !== OrderStatus.CHECKED_IN) {
        return false
      }

      const userStore = useUserStore()
      const overdueHours = order.overdueHours || 0

      updateOrderStatus(orderId, OrderStatus.CHECKED_OUT, userStore.user?.username)
      updateRoomStatus(order.roomId, RoomStatus.CLEANING, userStore.user?.username)

      recordOperationLog({
        action: OperationAction.FORCE_CHECK_OUT,
        operator: userStore.user?.username || 'admin',
        operatorRole: userStore.user?.role || 'admin',
        targetType: 'order',
        targetId: orderId,
        targetName: `订单${order.orderNo}`,
        details: `因客人超时${overdueHours}小时未退房${reason ? `（${reason}）` : ''}，对${order.roomNumber}房间执行强制退房操作`,
        beforeData: {
          orderStatus: OrderStatus.CHECKED_IN,
          roomStatus: RoomStatus.OCCUPIED,
          overdueHours
        },
        afterData: {
          orderStatus: OrderStatus.CHECKED_OUT,
          roomStatus: RoomStatus.CLEANING
        }
      })

      return true
    }

    const cancelBooking = (orderId: string, reason?: string): boolean => {
      const order = getOrderById(orderId)
      if (!order || order.status !== OrderStatus.PENDING_CHECKIN) {
        return false
      }

      const userStore = useUserStore()

      updateOrderStatus(orderId, OrderStatus.CANCELLED, userStore.user?.username)
      updateRoomStatus(order.roomId, RoomStatus.VACANT, userStore.user?.username)

      recordOperationLog({
        action: OperationAction.CANCEL_BOOKING,
        operator: userStore.user?.username || 'admin',
        operatorRole: userStore.user?.role || 'admin',
        targetType: 'order',
        targetId: orderId,
        targetName: `订单${order.orderNo}`,
        details: `取消${order.roomNumber}房间预订订单${reason ? `，原因：${reason}` : ''}`,
        beforeData: {
          orderStatus: OrderStatus.PENDING_CHECKIN,
          roomStatus: RoomStatus.BOOKED
        },
        afterData: {
          orderStatus: OrderStatus.CANCELLED,
          roomStatus: RoomStatus.VACANT
        }
      })

      return true
    }

    const markRoomClean = (roomId: string): boolean => {
      const room = getRoomById(roomId)
      if (!room || room.status !== RoomStatus.CLEANING) {
        return false
      }

      const userStore = useUserStore()

      room.lastCleanedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')

      updateRoomStatus(roomId, RoomStatus.VACANT, userStore.user?.username)

      return true
    }

    const adjustRoomTypePrice = (roomTypeId: string, newPrice: number): boolean => {
      const roomType = roomTypes.value.find((rt) => rt.id === roomTypeId)
      if (!roomType) return false

      const userStore = useUserStore()
      const oldPrice = roomType.price

      roomType.price = newPrice
      roomType.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')

      recordOperationLog({
        action: OperationAction.PRICE_ADJUST,
        operator: userStore.user?.username || 'admin',
        operatorRole: userStore.user?.role || 'admin',
        targetType: 'roomType',
        targetId: roomTypeId,
        targetName: roomType.name,
        details: `将${roomType.name}价格从${formatCurrency(oldPrice)}调整为${formatCurrency(newPrice)}`,
        beforeData: { price: oldPrice },
        afterData: { price: newPrice }
      })

      return true
    }

    const updateRoomTypeConfig = (roomTypeId: string, updates: Partial<RoomTypeConfig>): boolean => {
      const index = roomTypes.value.findIndex((rt) => rt.id === roomTypeId)
      if (index === -1) return false

      const userStore = useUserStore()
      const roomType = roomTypes.value[index]
      const beforeData = { ...roomType }

      roomTypes.value[index] = {
        ...roomType,
        ...updates,
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }

      recordOperationLog({
        action: OperationAction.ROOM_TYPE_UPDATE,
        operator: userStore.user?.username || 'admin',
        operatorRole: userStore.user?.role || 'admin',
        targetType: 'roomType',
        targetId: roomTypeId,
        targetName: roomType.name,
        details: `更新${roomType.name}房型配置`,
        beforeData,
        afterData: { ...roomTypes.value[index] }
      })

      return true
    }

    const addRoomType = (roomType: Omit<RoomTypeConfig, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
      const userStore = useUserStore()

      const newRoomType: RoomTypeConfig = {
        ...roomType,
        id: generateId('rt'),
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }

      roomTypes.value.push(newRoomType)

      recordOperationLog({
        action: OperationAction.ROOM_TYPE_ADD,
        operator: userStore.user?.username || 'admin',
        operatorRole: userStore.user?.role || 'admin',
        targetType: 'roomType',
        targetId: newRoomType.id,
        targetName: newRoomType.name,
        details: `新增房型"${newRoomType.name}"，价格${formatCurrency(newRoomType.price)}/晚`,
        afterData: { ...newRoomType }
      })

      return true
    }

    const deleteRoomType = (roomTypeId: string): boolean => {
      const index = roomTypes.value.findIndex((rt) => rt.id === roomTypeId)
      if (index === -1) return false

      const userStore = useUserStore()
      const roomType = roomTypes.value[index]

      const roomsUsingType = rooms.value.filter((r) => r.typeCode === roomType.code)
      if (roomsUsingType.length > 0) {
        return false
      }

      roomTypes.value.splice(index, 1)

      recordOperationLog({
        action: OperationAction.ROOM_TYPE_DELETE,
        operator: userStore.user?.username || 'admin',
        operatorRole: userStore.user?.role || 'admin',
        targetType: 'roomType',
        targetId: roomTypeId,
        targetName: roomType.name,
        details: `删除房型"${roomType.name}"`,
        beforeData: { ...roomType }
      })

      return true
    }

    const addOperationLog = (log: Omit<OperationLog, 'id'>) => {
      const newLog: OperationLog = {
        ...log,
        id: generateId('log')
      }
      operationLogs.value.unshift(newLog)
    }

    const recordOperationLog = (log: {
      action: string
      operator: string
      operatorRole: 'admin' | 'receptionist'
      targetType: 'room' | 'order' | 'roomType' | 'guest'
      targetId: string
      targetName: string
      details: string
      beforeData?: Record<string, unknown>
      afterData?: Record<string, unknown>
    }) => {
      addOperationLog({
        action: log.action,
        operator: log.operator,
        operatorRole: log.operatorRole,
        targetType: log.targetType,
        targetId: log.targetId,
        targetName: log.targetName,
        details: log.details,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        beforeData: log.beforeData,
        afterData: log.afterData
      })
    }

    const checkOverdueOrders = () => {
      const now = dayjs()
      orders.value.forEach((order) => {
        if (order.status === OrderStatus.CHECKED_IN) {
          const endOfCheckOut = dayjs(order.checkOutDate).endOf('day')
          if (now.isAfter(endOfCheckOut)) {
            order.isOverdue = true
            order.overdueHours = Math.floor(now.diff(endOfCheckOut, 'hour'))
          }
        }
      })
    }

    const clearFilters = () => {
      currentFloor.value = null
      selectedRoomType.value = null
      selectedRoomStatus.value = null
      orderKeyword.value = ''
      selectedOrderStatus.value = null
      logOperator.value = ''
      logAction.value = ''
      logDateRange.value = []
    }

    const setRoomFilters = (filters: {
      floor?: number | null
      roomType?: RoomType | null
      status?: RoomStatus | null
    }) => {
      if (filters.floor !== undefined) currentFloor.value = filters.floor
      if (filters.roomType !== undefined) selectedRoomType.value = filters.roomType
      if (filters.status !== undefined) selectedRoomStatus.value = filters.status
    }

    const setOrderFilters = (filters: {
      keyword?: string
      status?: OrderStatus | null
    }) => {
      if (filters.keyword !== undefined) orderKeyword.value = filters.keyword
      if (filters.status !== undefined) selectedOrderStatus.value = filters.status
    }

    const setLogFilters = (filters: {
      operator?: string
      action?: string
      dateRange?: string[]
    }) => {
      if (filters.operator !== undefined) logOperator.value = filters.operator
      if (filters.action !== undefined) logAction.value = filters.action
      if (filters.dateRange !== undefined) logDateRange.value = filters.dateRange
    }

    return {
      roomTypes,
      rooms,
      orders,
      guests,
      operationLogs,
      currentFloor,
      selectedRoomType,
      selectedRoomStatus,
      orderKeyword,
      selectedOrderStatus,
      logOperator,
      logAction,
      logDateRange,
      filteredRooms,
      filteredOrders,
      filteredLogs,
      roomsByFloor,
      statistics,
      initData,
      getRoomTypeByCode,
      getRoomById,
      getOrderById,
      getActiveOrderForRoom,
      updateRoomStatus,
      updateOrderStatus,
      createBooking,
      checkIn,
      checkOut,
      forceCheckOut,
      cancelBooking,
      markRoomClean,
      adjustRoomTypePrice,
      updateRoomTypeConfig,
      addRoomType,
      deleteRoomType,
      addOperationLog,
      recordOperationLog,
      checkOverdueOrders,
      clearFilters,
      setRoomFilters,
      setOrderFilters,
      setLogFilters
    }
  },
  {
    persist: {
      key: 'hotel-data',
      paths: ['roomTypes', 'rooms', 'orders', 'guests', 'operationLogs']
    }
  }
)
