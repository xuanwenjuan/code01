export type AssetCategory = 'laptop' | 'monitor' | 'peripheral' | 'server' | 'other'

export type AssetStatus = 'idle' | 'in_use' | 'repairing' | 'scrapped'

export type DepreciationMethod = 'straight_line' | 'accelerated' | 'units_of_production'

export type FormMode = 'create' | 'edit' | 'view'

export const ASSET_CATEGORY_MAP: Record<AssetCategory, string> = {
  laptop: '笔记本电脑',
  monitor: '显示器',
  peripheral: '外设配件',
  server: '服务器设备',
  other: '其他设备'
}

export const ASSET_STATUS_MAP: Record<AssetStatus, string> = {
  idle: '闲置',
  in_use: '在用',
  repairing: '维修中',
  scrapped: '已报废'
}

export const ASSET_STATUS_TAG_TYPE: Record<AssetStatus, 'info' | 'success' | 'warning' | 'danger'> = {
  idle: 'info',
  in_use: 'success',
  repairing: 'warning',
  scrapped: 'danger'
}

export const DEPRECIATION_METHOD_MAP: Record<DepreciationMethod, string> = {
  straight_line: '直线折旧法',
  accelerated: '加速折旧法',
  units_of_production: '工作量法'
}

export const CATEGORY_DEPRECIATION_RATE: Record<AssetCategory, number> = {
  laptop: 25,
  monitor: 20,
  peripheral: 30,
  server: 15,
  other: 20
}

export const CATEGORY_USEFUL_LIFE: Record<AssetCategory, number> = {
  laptop: 4,
  monitor: 5,
  peripheral: 3,
  server: 6,
  other: 5
}

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  model: string
  serialNumber: string
  purchasePrice: number
  purchaseDate: string
  warehouse: string
  department: string
  status: AssetStatus
  currentHolder?: string
  remark?: string
  depreciationRate: number
  depreciationMethod: DepreciationMethod
  salvageValue: number
  usefulLife: number
  currentValue: number
  accumulatedDepreciation: number
  createdAt: string
  updatedAt: string
}

export interface AssetFormData {
  name: string
  category: AssetCategory
  model: string
  serialNumber: string
  purchasePrice: number
  purchaseDate: string
  warehouse: string
  department: string
  status: AssetStatus
  currentHolder?: string
  remark?: string
  depreciationRate: number
  depreciationMethod: DepreciationMethod
  salvageValue: number
  usefulLife: number
}

export interface DepreciationDetail {
  year: number
  monthlyDepreciation: number
  annualDepreciation: number
  accumulatedDepreciation: number
  remainingValue: number
}

export interface AssetFilterParams {
  keyword?: string
  category?: AssetCategory | ''
  department?: string
  status?: AssetStatus | ''
  purchaseYear?: number | ''
  warehouse?: string
  minValue?: number
  maxValue?: number
  isHighValue?: boolean | ''
}

export interface SaveFilterPayload {
  name: string
  filters: AssetFilterParams
}

export interface SavedFilter {
  id: string
  name: string
  filters: AssetFilterParams
  createdAt: string
}
