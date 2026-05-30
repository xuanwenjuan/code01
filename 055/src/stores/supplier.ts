import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Supplier } from '@/types'
import { CooperationStatus } from '@/types'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const generateMockSuppliers = (): Supplier[] => {
  const origins = ['山东寿光', '云南昆明', '广东广州', '浙江杭州', '江苏南京', '四川成都', '湖南长沙', '湖北武汉']
  const qualifications = ['A级资质', 'B级资质', 'C级资质']
  const supplyCycles = ['每周一次', '每周两次', '每两周一次', '按需供货']
  const deliveryRanges = ['全市配送', '主城区配送', '省内配送', '全国配送']
  const statuses = [CooperationStatus.COOPERATING, CooperationStatus.SUSPENDED, CooperationStatus.PENDING]

  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `${origins[i % origins.length].slice(0, 2)}农产品合作社${i + 1}号`,
    origin: origins[i % origins.length],
    contactPerson: `联系人${i + 1}`,
    phone: `1${3 + i % 7}${Math.random().toString().slice(2, 11)}`,
    qualification: qualifications[i % qualifications.length],
    supplyCycle: supplyCycles[i % supplyCycles.length],
    deliveryRange: deliveryRanges[i % deliveryRanges.length],
    cooperationStatus: statuses[i % statuses.length],
    contractExpireDate: dayjs().add(i - 5, 'day').format('YYYY-MM-DD'),
    remark: i % 3 === 0 ? '优质供应商，合作良好' : ''
  }))
}

export const useSupplierStore = defineStore('supplier', () => {
  const suppliers = ref<Supplier[]>([])
  const loading = ref(false)

  const expiringSoon = computed(() => {
    const thirtyDaysLater = dayjs().add(30, 'day')
    return suppliers.value.filter(supplier => {
      const expireDate = dayjs(supplier.contractExpireDate)
      return expireDate.isBefore(thirtyDaysLater) && expireDate.isAfter(dayjs())
    })
  })

  const cooperatingCount = computed(() => {
    return suppliers.value.filter(s => s.cooperationStatus === CooperationStatus.COOPERATING).length
  })

  const validateSupplier = (supplier: Partial<Supplier>, isEdit = false): boolean => {
    if (!supplier.name?.trim()) {
      ElMessage.error('供应商名称不能为空')
      return false
    }
    if (!supplier.origin?.trim()) {
      ElMessage.error('产地不能为空')
      return false
    }
    if (!supplier.contactPerson?.trim()) {
      ElMessage.error('联系人不能为空')
      return false
    }
    if (!supplier.phone?.trim()) {
      ElMessage.error('联系电话不能为空')
      return false
    }
    if (!/^1[3-9]\d{9}$/.test(supplier.phone)) {
      ElMessage.error('请输入正确的手机号')
      return false
    }
    if (!supplier.contractExpireDate) {
      ElMessage.error('合同到期日不能为空')
      return false
    }

    const duplicate = suppliers.value.find(
      item => item.name === supplier.name && (!isEdit || item.id !== supplier.id)
    )
    if (duplicate) {
      ElMessage.error('供应商名称已存在')
      return false
    }

    return true
  }

  const fetchSuppliers = async () => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      suppliers.value = generateMockSuppliers()
    } finally {
      loading.value = false
    }
  }

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    if (!validateSupplier(supplier)) return false

    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const newId = Math.max(...suppliers.value.map(s => s.id), 0) + 1
      suppliers.value.push({ ...supplier, id: newId })
      ElMessage.success('新增成功')
      return true
    } finally {
      loading.value = false
    }
  }

  const updateSupplier = async (supplier: Supplier) => {
    if (!validateSupplier(supplier, true)) return false

    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = suppliers.value.findIndex(item => item.id === supplier.id)
      if (index !== -1) {
        suppliers.value[index] = supplier
      }
      ElMessage.success('更新成功')
      return true
    } finally {
      loading.value = false
    }
  }

  const deleteSupplier = async (id: number) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = suppliers.value.findIndex(item => item.id === id)
      if (index !== -1) {
        suppliers.value.splice(index, 1)
      }
      ElMessage.success('删除成功')
      return true
    } finally {
      loading.value = false
    }
  }

  const toggleCooperationStatus = async (id: number, status: CooperationStatus) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const supplier = suppliers.value.find(item => item.id === id)
      if (supplier) {
        supplier.cooperationStatus = status
      }
      const statusText = {
        [CooperationStatus.COOPERATING]: '已恢复合作',
        [CooperationStatus.SUSPENDED]: '已暂停合作',
        [CooperationStatus.PENDING]: '已设为待审核'
      }
      ElMessage.success(statusText[status])
      return true
    } finally {
      loading.value = false
    }
  }

  return {
    suppliers,
    loading,
    expiringSoon,
    cooperatingCount,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    toggleCooperationStatus
  }
}, {
  persist: true
})
