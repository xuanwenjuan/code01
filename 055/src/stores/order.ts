import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CustomerOrder, OrderItem } from '@/types'
import { CustomerOrderStatus, CustomerType } from '@/types'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const generateMockOrders = (): CustomerOrder[] => {
  const customers = ['永辉超市', '沃尔玛', '家乐福', '社区团购', '便民店', '生鲜超市']
  const areas = ['东城区', '西城区', '朝阳区', '海淀区', '丰台区']
  const products = ['白菜', '萝卜', '苹果', '橙子', '猪肉', '鸡肉', '鲫鱼', '虾', '香菇']
  const customerTypes = [CustomerType.SUPERMARKET, CustomerType.STORE, CustomerType.GROUPBUY]
  const statuses = [
    CustomerOrderStatus.PENDING,
    CustomerOrderStatus.PREPARING,
    CustomerOrderStatus.DELIVERING,
    CustomerOrderStatus.COMPLETED,
    CustomerOrderStatus.CANCELLED
  ]

  return Array.from({ length: 25 }, (_, i) => {
    const itemCount = Math.floor(Math.random() * 3) + 1
    const items: OrderItem[] = Array.from({ length: itemCount }, (_, j) => {
      const quantity = Math.floor(Math.random() * 50) + 10
      const unitPrice = Math.floor(Math.random() * 15) + 5
      return {
        categoryId: i * 10 + j + 1,
        categoryName: products[(i + j) % products.length],
        quantity,
        unit: 'kg',
        unitPrice,
        subtotal: quantity * unitPrice
      }
    })

    const status = statuses[i % statuses.length]
    let progress = 0
    if (status === CustomerOrderStatus.PREPARING) progress = 25
    if (status === CustomerOrderStatus.DELIVERING) progress = 60
    if (status === CustomerOrderStatus.COMPLETED) progress = 100

    return {
      id: i + 1,
      orderNo: `CO${dayjs().subtract(i, 'day').format('YYYYMMDD')}${String(i + 1).padStart(3, '0')}`,
      customerName: `${customers[i % customers.length]}${Math.floor(i / customers.length) + 1}号店`,
      customerType: customerTypes[i % customerTypes.length],
      deliveryArea: areas[i % areas.length],
      deliveryAddress: `${areas[i % areas.length]}某某街道${i + 1}号`,
      contactPerson: `联系人${i + 1}`,
      phone: `1${3 + i % 7}${Math.random().toString().slice(2, 11)}`,
      items,
      totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0),
      orderDate: dayjs().subtract(i, 'day').format('YYYY-MM-DD'),
      deliveryDate: dayjs().subtract(i - 2, 'day').format('YYYY-MM-DD'),
      status,
      progress,
      remark: i % 6 === 0 ? 'VIP客户，请优先配送' : ''
    }
  })
}

export const useOrderStore = defineStore('order', () => {
  const customerOrders = ref<CustomerOrder[]>([])
  const loading = ref(false)

  const pendingCount = computed(() => {
    return customerOrders.value.filter(o => o.status === CustomerOrderStatus.PENDING).length
  })

  const deliveringCount = computed(() => {
    return customerOrders.value.filter(o => o.status === CustomerOrderStatus.DELIVERING).length
  })

  const validateOrder = (order: Partial<CustomerOrder>, _isEdit = false): boolean => {
    if (!order.customerName?.trim()) {
      ElMessage.error('请输入客户名称')
      return false
    }
    if (!order.deliveryArea) {
      ElMessage.error('请选择配送区域')
      return false
    }
    if (!order.deliveryAddress?.trim()) {
      ElMessage.error('请输入配送地址')
      return false
    }
    if (!order.contactPerson?.trim()) {
      ElMessage.error('请输入联系人')
      return false
    }
    if (!order.phone?.trim()) {
      ElMessage.error('请输入联系电话')
      return false
    }
    if (!order.deliveryDate) {
      ElMessage.error('请选择配送日期')
      return false
    }
    if (!order.items || order.items.length === 0) {
      ElMessage.error('请添加订单商品')
      return false
    }
    return true
  }

  const fetchCustomerOrders = async () => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      customerOrders.value = generateMockOrders()
    } finally {
      loading.value = false
    }
  }

  const addCustomerOrder = async (order: Omit<CustomerOrder, 'id' | 'orderNo'>) => {
    if (!validateOrder(order)) return false

    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const newId = Math.max(...customerOrders.value.map(o => o.id), 0) + 1
      const orderNo = `CO${dayjs().format('YYYYMMDD')}${String(newId).padStart(3, '0')}`
      customerOrders.value.push({
        ...order,
        id: newId,
        orderNo
      })
      ElMessage.success('新增订单成功')
      return true
    } finally {
      loading.value = false
    }
  }

  const updateCustomerOrder = async (order: CustomerOrder) => {
    if (!validateOrder(order, true)) return false

    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = customerOrders.value.findIndex(item => item.id === order.id)
      if (index !== -1) {
        customerOrders.value[index] = order
      }
      ElMessage.success('更新成功')
      return true
    } finally {
      loading.value = false
    }
  }

  const updateStatus = async (id: number, status: CustomerOrderStatus) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const order = customerOrders.value.find(item => item.id === id)
      if (order) {
        order.status = status
        
        if (status === CustomerOrderStatus.PREPARING) order.progress = 25
        if (status === CustomerOrderStatus.DELIVERING) order.progress = 60
        if (status === CustomerOrderStatus.COMPLETED) order.progress = 100
        if (status === CustomerOrderStatus.CANCELLED) order.progress = 0
      }
      const statusText = {
        [CustomerOrderStatus.PENDING]: '待处理',
        [CustomerOrderStatus.PREPARING]: '备货中',
        [CustomerOrderStatus.DELIVERING]: '配送中',
        [CustomerOrderStatus.COMPLETED]: '已完成',
        [CustomerOrderStatus.CANCELLED]: '已取消'
      }
      ElMessage.success(`状态已更新为：${statusText[status]}`)
      return true
    } finally {
      loading.value = false
    }
  }

  const updateProgress = async (id: number, progress: number) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const order = customerOrders.value.find(item => item.id === id)
      if (order) {
        order.progress = progress
      }
      ElMessage.success('配送进度已更新')
      return true
    } finally {
      loading.value = false
    }
  }

  return {
    customerOrders,
    loading,
    pendingCount,
    deliveringCount,
    fetchCustomerOrders,
    addCustomerOrder,
    updateCustomerOrder,
    updateStatus,
    updateProgress
  }
}, {
  persist: true
})
