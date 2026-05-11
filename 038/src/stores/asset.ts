import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { 
  Asset, 
  AssetFormData, 
  AssetFilterParams, 
  AssetStatus,
  DepreciationDetail,
  SavedFilter,
  SaveFilterPayload
} from '@/types/asset'
import { ASSET_CATEGORY_MAP } from '@/types/asset'
import type { PaginationParams } from '@/types/common'
import * as assetApi from '@/api/asset'
import { addOperationLog } from '@/api/log'
import { generateDepreciationSchedule, formatCurrency, getDepreciationPercentage, isHighValueAsset } from '@/utils/depreciation'

interface AssetStats {
  total: number
  idle: number
  inUse: number
  repairing: number
  scrapped: number
  totalValue: number
  totalPurchaseValue: number
  totalDepreciation: number
  highValueCount: number
}

export const useAssetStore = defineStore('asset', () => {
  const assets = ref<Asset[]>([])
  const total = ref(0)
  const loading = ref(false)
  const stats = ref<AssetStats>({
    total: 0,
    idle: 0,
    inUse: 0,
    repairing: 0,
    scrapped: 0,
    totalValue: 0,
    totalPurchaseValue: 0,
    totalDepreciation: 0,
    highValueCount: 0
  })

  const pagination = ref<PaginationParams>({
    page: 1,
    pageSize: 10
  })

  const filters = ref<AssetFilterParams>({
    keyword: '',
    category: '',
    department: '',
    status: '',
    purchaseYear: '',
    warehouse: '',
    minValue: undefined,
    maxValue: undefined,
    isHighValue: ''
  })

  const savedFilters = ref<SavedFilter[]>([])

  const idleAssets = computed(() => assets.value.filter(a => a.status === 'idle'))
  const highValueAssets = computed(() => assets.value.filter(a => isHighValueAsset(a.purchasePrice)))

  const fetchAssets = async (): Promise<void> => {
    loading.value = true
    try {
      assetApi.recalculateAllDepreciation()
      const response = await assetApi.getAssetList({
        ...pagination.value,
        ...filters.value
      })
      assets.value = response.list
      total.value = response.total
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async (): Promise<void> => {
    stats.value = await assetApi.getAssetStats()
  }

  const createAsset = async (data: AssetFormData, operator: string): Promise<Asset> => {
    const newAsset = await assetApi.createAsset(data)
    await fetchAssets()
    await fetchStats()
    await addOperationLog('create', newAsset.id, newAsset.name, 'asset', '新增资产', operator)
    return newAsset
  }

  const updateAsset = async (id: string, data: Partial<AssetFormData>, operator: string): Promise<Asset> => {
    const asset = assets.value.find(a => a.id === id)
    const updatedAsset = await assetApi.updateAsset(id, data)
    await fetchAssets()
    await fetchStats()
    await addOperationLog('update', updatedAsset.id, updatedAsset.name, 'asset', '修改资产信息', operator)
    return updatedAsset
  }

  const updateAssetStatus = async (
    id: string, 
    status: AssetStatus, 
    operator: string,
    holder?: string
  ): Promise<Asset> => {
    const asset = assets.value.find(a => a.id === id)
    const updatedAsset = await assetApi.updateAssetStatus(id, status, holder)
    await fetchAssets()
    await fetchStats()
    
    const descriptions: Record<AssetStatus, string> = {
      idle: '资产已归库',
      in_use: '资产已领用',
      repairing: '资产送修',
      scrapped: '资产已报废'
    }
    
    const operationType = status === 'scrapped' ? 'scrap' : 'update'
    await addOperationLog(
      operationType, 
      updatedAsset.id, 
      asset?.name || updatedAsset.name, 
      'asset', 
      descriptions[status], 
      operator
    )
    return updatedAsset
  }

  const deleteAsset = async (id: string, operator: string): Promise<void> => {
    const asset = assets.value.find(a => a.id === id)
    await assetApi.deleteAsset(id)
    await fetchAssets()
    await fetchStats()
    if (asset) {
      await addOperationLog('delete', id, asset.name, 'asset', '删除资产', operator)
    }
  }

  const getDepreciationDetails = (asset: Asset): {
    schedule: DepreciationDetail[]
    currentPercentage: number
    monthlyDepreciation: number
    monthsUsed: number
    summary: string
  } => {
    const schedule = generateDepreciationSchedule(
      asset.purchasePrice,
      asset.salvageValue,
      asset.usefulLife,
      asset.depreciationRate,
      asset.depreciationMethod
    )
    
    const currentPercentage = getDepreciationPercentage(asset.purchasePrice, asset.currentValue)
    const monthlyDepreciation = (asset.purchasePrice - asset.salvageValue) / (asset.usefulLife * 12)
    
    const purchaseDate = new Date(asset.purchaseDate)
    const now = new Date()
    const monthsUsed = Math.max(0, 
      (now.getFullYear() - purchaseDate.getFullYear()) * 12 + 
      (now.getMonth() - purchaseDate.getMonth())
    )
    
    const summary = `资产原值 ${formatCurrency(asset.purchasePrice)}，已使用 ${monthsUsed} 个月，累计折旧 ${formatCurrency(asset.accumulatedDepreciation)}，当前净值 ${formatCurrency(asset.currentValue)}`
    
    return {
      schedule,
      currentPercentage,
      monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
      monthsUsed,
      summary
    }
  }

  const resetFilters = (): void => {
    filters.value = {
      keyword: '',
      category: '',
      department: '',
      status: '',
      purchaseYear: '',
      warehouse: '',
      minValue: undefined,
      maxValue: undefined,
      isHighValue: ''
    }
    pagination.value.page = 1
  }

  const setPage = (page: number): void => {
    pagination.value.page = page
  }

  const setPageSize = (pageSize: number): void => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
  }

  const saveFilter = (payload: SaveFilterPayload): void => {
    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name: payload.name,
      filters: { ...payload.filters },
      createdAt: new Date().toISOString()
    }
    savedFilters.value.unshift(newFilter)
  }

  const deleteSavedFilter = (id: string): void => {
    const index = savedFilters.value.findIndex(f => f.id === id)
    if (index !== -1) {
      savedFilters.value.splice(index, 1)
    }
  }

  const applySavedFilter = (id: string): void => {
    const savedFilter = savedFilters.value.find(f => f.id === id)
    if (savedFilter) {
      filters.value = { ...savedFilter.filters }
      pagination.value.page = 1
      fetchAssets()
    }
  }

  return {
    assets,
    total,
    loading,
    stats,
    pagination,
    filters,
    savedFilters,
    idleAssets,
    highValueAssets,
    fetchAssets,
    fetchStats,
    createAsset,
    updateAsset,
    updateAssetStatus,
    deleteAsset,
    getDepreciationDetails,
    resetFilters,
    setPage,
    setPageSize,
    saveFilter,
    deleteSavedFilter,
    applySavedFilter
  }
}, {
  persist: {
    key: 'asset-store',
    paths: ['pagination', 'filters', 'savedFilters']
  }
})
