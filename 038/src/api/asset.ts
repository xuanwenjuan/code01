import type { Asset, AssetFormData, AssetFilterParams, AssetStatus } from '@/types/asset'
import type { PaginatedResponse, PaginationParams } from '@/types/common'
import { mockAssets } from '@/mock/assets'
import { calculateCurrentValue, isHighValueAsset } from '@/utils/depreciation'
import dayjs from 'dayjs'

let assetsData: Asset[] = [...mockAssets]

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const getAssetList = async (
  params: PaginationParams & AssetFilterParams
): Promise<PaginatedResponse<Asset>> => {
  await delay()
  
  let filtered: Asset[] = [...assetsData]
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filtered = filtered.filter(
      asset =>
        asset.name.toLowerCase().includes(keyword) ||
        asset.serialNumber.toLowerCase().includes(keyword) ||
        asset.model.toLowerCase().includes(keyword)
    )
  }
  
  if (params.category) {
    filtered = filtered.filter(asset => asset.category === params.category)
  }
  
  if (params.department) {
    filtered = filtered.filter(asset => asset.department === params.department)
  }
  
  if (params.status) {
    filtered = filtered.filter(asset => asset.status === params.status)
  }
  
  if (params.purchaseYear) {
    filtered = filtered.filter(asset => 
      new Date(asset.purchaseDate).getFullYear() === params.purchaseYear
    )
  }
  
  if (params.warehouse) {
    filtered = filtered.filter(asset => asset.warehouse === params.warehouse)
  }
  
  if (params.minValue !== undefined && params.minValue !== 0) {
    filtered = filtered.filter(asset => asset.currentValue >= (params.minValue as number))
  }
  
  if (params.maxValue !== undefined && params.maxValue !== 0) {
    filtered = filtered.filter(asset => asset.currentValue <= (params.maxValue as number))
  }
  
  if (params.isHighValue === true) {
    filtered = filtered.filter(asset => isHighValueAsset(asset.purchasePrice))
  } else if (params.isHighValue === false) {
    filtered = filtered.filter(asset => !isHighValueAsset(asset.purchasePrice))
  }
  
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const list: Asset[] = filtered.slice(start, end)
  
  return {
    list,
    total: filtered.length,
    page: params.page,
    pageSize: params.pageSize
  }
}

export const getAssetById = async (id: string): Promise<Asset | undefined> => {
  await delay()
  return assetsData.find(asset => asset.id === id)
}

export const createAsset = async (data: AssetFormData): Promise<Asset> => {
  await delay()
  
  const now = dayjs().format('YYYY-MM-DD')
  const depreciationResult = calculateCurrentValue(
    data.purchasePrice,
    data.purchaseDate,
    data.depreciationRate,
    data.depreciationMethod,
    data.salvageValue || Math.round(data.purchasePrice * 0.1 * 100) / 100,
    data.usefulLife || 5
  )
  
  const newAsset: Asset = {
    id: `asset-${Date.now()}`,
    ...data,
    salvageValue: data.salvageValue || Math.round(data.purchasePrice * 0.1 * 100) / 100,
    usefulLife: data.usefulLife || 5,
    currentValue: depreciationResult.currentValue,
    accumulatedDepreciation: depreciationResult.accumulatedDepreciation,
    createdAt: now,
    updatedAt: now
  }
  
  assetsData.unshift(newAsset)
  return newAsset
}

export const updateAsset = async (id: string, data: Partial<AssetFormData>): Promise<Asset> => {
  await delay()
  
  const index = assetsData.findIndex(asset => asset.id === id)
  if (index === -1) {
    throw new Error('资产不存在')
  }
  
  const existingAsset = assetsData[index]
  const updatedAsset: Asset = {
    ...existingAsset,
    ...data,
    updatedAt: dayjs().format('YYYY-MM-DD')
  }
  
  if (data.purchasePrice || data.purchaseDate || data.depreciationRate || 
      data.depreciationMethod || data.salvageValue || data.usefulLife) {
    const depreciationResult = calculateCurrentValue(
      data.purchasePrice || existingAsset.purchasePrice,
      data.purchaseDate || existingAsset.purchaseDate,
      data.depreciationRate !== undefined ? data.depreciationRate : existingAsset.depreciationRate,
      data.depreciationMethod || existingAsset.depreciationMethod,
      data.salvageValue !== undefined ? data.salvageValue : existingAsset.salvageValue,
      data.usefulLife !== undefined ? data.usefulLife : existingAsset.usefulLife
    )
    updatedAsset.currentValue = depreciationResult.currentValue
    updatedAsset.accumulatedDepreciation = depreciationResult.accumulatedDepreciation
  }
  
  assetsData[index] = updatedAsset
  return updatedAsset
}

export const updateAssetStatus = async (id: string, status: AssetStatus, holder?: string): Promise<Asset> => {
  await delay()
  
  const index = assetsData.findIndex(asset => asset.id === id)
  if (index === -1) {
    throw new Error('资产不存在')
  }
  
  assetsData[index] = {
    ...assetsData[index],
    status,
    currentHolder: holder,
    updatedAt: dayjs().format('YYYY-MM-DD')
  }
  
  return assetsData[index]
}

export const deleteAsset = async (id: string): Promise<void> => {
  await delay()
  const index = assetsData.findIndex(asset => asset.id === id)
  if (index !== -1) {
    assetsData.splice(index, 1)
  }
}

export const getAssetStats = async (): Promise<{
  total: number
  idle: number
  inUse: number
  repairing: number
  scrapped: number
  totalValue: number
  totalPurchaseValue: number
  totalDepreciation: number
  highValueCount: number
}> => {
  await delay()
  
  const total = assetsData.length
  const idle = assetsData.filter(a => a.status === 'idle').length
  const inUse = assetsData.filter(a => a.status === 'in_use').length
  const repairing = assetsData.filter(a => a.status === 'repairing').length
  const scrapped = assetsData.filter(a => a.status === 'scrapped').length
  const totalValue = assetsData.reduce((sum, a) => sum + a.currentValue, 0)
  const totalPurchaseValue = assetsData.reduce((sum, a) => sum + a.purchasePrice, 0)
  const totalDepreciation = assetsData.reduce((sum, a) => sum + a.accumulatedDepreciation, 0)
  const highValueCount = assetsData.filter(a => isHighValueAsset(a.purchasePrice)).length
  
  return {
    total,
    idle,
    inUse,
    repairing,
    scrapped,
    totalValue: Math.round(totalValue * 100) / 100,
    totalPurchaseValue: Math.round(totalPurchaseValue * 100) / 100,
    totalDepreciation: Math.round(totalDepreciation * 100) / 100,
    highValueCount
  }
}

export const getAvailableAssets = async (): Promise<Asset[]> => {
  await delay()
  return assetsData.filter(asset => asset.status === 'idle')
}

export const recalculateAllDepreciation = (): void => {
  assetsData = assetsData.map(asset => {
    const result = calculateCurrentValue(
      asset.purchasePrice,
      asset.purchaseDate,
      asset.depreciationRate,
      asset.depreciationMethod,
      asset.salvageValue,
      asset.usefulLife
    )
    return {
      ...asset,
      currentValue: result.currentValue,
      accumulatedDepreciation: result.accumulatedDepreciation,
      updatedAt: dayjs().format('YYYY-MM-DD')
    }
  })
}
