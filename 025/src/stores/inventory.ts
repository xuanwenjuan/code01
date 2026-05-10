import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type {
  InventoryRecord,
  PaginationParams,
  InventoryOperationType,
  PaginatedResponse,
  OperationType,
  InventoryOperationForm,
  InventoryRecordFilterParams
} from '@/types'
import { inventoryApi } from '@/api'
import { logApi } from '@/api'
import { emitInventoryOperation } from '@/utils/eventBus'

const operationTypeMap: Record<InventoryOperationType, string> = {
  'in': '入库',
  'out': '出库',
  'sale': '售卖',
  'offline': '下架'
}

const logTypeMap: Record<InventoryOperationType, OperationType> = {
  'in': 'in_stock',
  'out': 'out_stock',
  'sale': 'sale',
  'offline': 'offline'
}

export const useInventoryStore = defineStore('inventory', () => {
  const records = ref<InventoryRecord[]>([])
  const pagination = reactive<PaginationParams>({ page: 1, pageSize: 10 })
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const filterParams = reactive<InventoryRecordFilterParams>({
    productId: '',
    operationType: '',
    startTime: '',
    endTime: ''
  })

  async function fetchRecords(): Promise<PaginatedResponse<InventoryRecord>> {
    loading.value = true
    try {
      const result: PaginatedResponse<InventoryRecord> = await inventoryApi.getRecords({
        pagination,
        ...filterParams
      })
      records.value = result.list
      total.value = result.total
      return result
    } finally {
      loading.value = false
    }
  }

  async function performOperation(data: InventoryOperationForm & { productName: string }): Promise<InventoryRecord> {
    const result: InventoryRecord = await inventoryApi.operation({
      productId: data.productId,
      operationType: data.operationType,
      quantity: data.quantity,
      operator: data.operator,
      remark: data.remark
    })

    await fetchRecords()

    const operationTypeText: string = operationTypeMap[data.operationType]
    await logApi.add({
      operationType: logTypeMap[data.operationType],
      operationTypeText,
      module: '库存管理',
      targetId: data.productId,
      targetName: data.productName,
      operator: data.operator,
      detail: `${operationTypeText}商品：${data.productName}，数量：${data.quantity}`,
      ip: '127.0.0.1'
    })

    emitInventoryOperation({
      productId: data.productId,
      productName: data.productName,
      operationType: data.operationType,
      quantity: data.quantity,
      stockBefore: result.stockBefore,
      stockAfter: result.stockAfter
    })

    return result
  }

  function setFilterParams(params: Partial<InventoryRecordFilterParams>): void {
    Object.assign(filterParams, params)
    pagination.page = 1
  }

  function setPagination(params: Partial<PaginationParams>): void {
    Object.assign(pagination, params)
  }

  function resetFilters(): void {
    Object.assign(filterParams, {
      productId: '',
      operationType: '',
      startTime: '',
      endTime: ''
    })
    pagination.page = 1
  }

  return {
    records,
    pagination,
    total,
    loading,
    filterParams,
    fetchRecords,
    performOperation,
    setFilterParams,
    setPagination,
    resetFilters
  }
})
