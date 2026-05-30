import { useEffect, useCallback, useRef } from 'react'
import { Order, OrderStatus, OrderStatusMap } from '@/types'

const statusFlow: OrderStatus[] = ['pending', 'making', 'ready', 'completed']

export function useOrderAutoRefresh(
  orders: Order[],
  onUpdateOrder: (id: string, status: OrderStatus) => void,
  enabled: boolean = true,
  interval: number = 5000
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const processPendingOrders = useCallback(() => {
    orders.forEach((order) => {
      if (order.status === 'cancelled' || order.status === 'completed') {
        return
      }

      const currentIndex = statusFlow.indexOf(order.status)
      if (currentIndex < statusFlow.length - 1) {
        const shouldProgress = Math.random() > 0.7
        if (shouldProgress) {
          const nextStatus = statusFlow[currentIndex + 1] as OrderStatus
          onUpdateOrder(order.id, nextStatus)
        }
      }
    })
  }, [orders, onUpdateOrder])

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setInterval(() => {
      processPendingOrders()
    }, interval)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [enabled, interval, processPendingOrders])

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const index = statusFlow.indexOf(current)
    if (index < statusFlow.length - 1) {
      return statusFlow[index + 1] as OrderStatus
    }
    return null
  }

  const getStatusProgress = (status: OrderStatus): number => {
    const index = statusFlow.indexOf(status)
    return index >= 0 ? ((index + 1) / statusFlow.length) * 100 : 0
  }

  return {
    getNextStatus,
    getStatusProgress,
    statusFlow
  }
}
