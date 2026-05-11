import type { Asset, AssetCategory, AssetStatus, DepreciationMethod } from '@/types/asset'
import { CATEGORY_DEPRECIATION_RATE } from '@/types/asset'
import { departments, warehouses, employees } from './baseData'
import { calculateCurrentValue } from '@/utils/depreciation'

const laptopModels = ['MacBook Pro 14', 'ThinkPad X1 Carbon', 'Dell XPS 13', 'HP EliteBook', 'Lenovo Legion']
const monitorModels = ['Dell U2723QE', 'LG 27UK850', 'Samsung Odyssey', 'ASUS ROG', 'BenQ PD2700U']
const peripheralModels = ['Logitech MX Master 3', 'Keychron K2', 'Apple Magic Mouse', 'SteelSeries Arctis', 'Wacom Intuos']
const serverModels = ['Dell PowerEdge', 'HP ProLiant', 'IBM xSeries', 'Lenovo ThinkSystem', 'Supermicro']
const otherModels = ['网络交换机', '路由器', 'UPS电源', '打印机', '扫描仪']

const depreciationMethods: DepreciationMethod[] = ['straight_line', 'accelerated', 'straight_line', 'straight_line', 'accelerated']

const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const randomDate = (startYear: number = 2020): string => {
  const start = new Date(startYear, 0, 1)
  const end = new Date()
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

const generateSN = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const getModelByCategory = (category: AssetCategory): string => {
  switch (category) {
    case 'laptop':
      return randomPick(laptopModels)
    case 'monitor':
      return randomPick(monitorModels)
    case 'peripheral':
      return randomPick(peripheralModels)
    case 'server':
      return randomPick(serverModels)
    default:
      return randomPick(otherModels)
  }
}

const getUsefulLifeByCategory = (category: AssetCategory): number => {
  switch (category) {
    case 'laptop':
      return 4
    case 'monitor':
      return 5
    case 'peripheral':
      return 3
    case 'server':
      return 6
    default:
      return 5
  }
}

const categories: AssetCategory[] = ['laptop', 'monitor', 'peripheral', 'server', 'other']
const statuses: AssetStatus[] = ['idle', 'in_use', 'repairing', 'scrapped']

const generateAsset = (index: number): Asset => {
  const category = randomPick(categories)
  const status = randomPick(statuses)
  const model = getModelByCategory(category)
  const purchaseDate = randomDate(2020)
  const purchasePrice = Math.round((500 + Math.random() * 8000) * 100) / 100
  const depreciationRate = CATEGORY_DEPRECIATION_RATE[category]
  const depreciationMethod = randomPick(depreciationMethods)
  const department = randomPick(departments).name
  const warehouse = randomPick(warehouses).name
  const employee = randomPick(employees)
  const salvageValue = Math.round(purchasePrice * 0.1 * 100) / 100
  const usefulLife = getUsefulLifeByCategory(category)
  
  const depreciationResult = calculateCurrentValue(
    purchasePrice,
    purchaseDate,
    depreciationRate,
    depreciationMethod,
    salvageValue,
    usefulLife
  )

  return {
    id: `asset-${index + 1}`,
    name: `${model}`,
    category,
    model,
    serialNumber: generateSN(),
    purchasePrice,
    purchaseDate,
    warehouse,
    department,
    status,
    currentHolder: status === 'in_use' ? employee.name : undefined,
    remark: Math.random() > 0.7 ? '设备状态良好' : undefined,
    depreciationRate,
    depreciationMethod,
    currentValue: depreciationResult.currentValue,
    salvageValue,
    usefulLife,
    accumulatedDepreciation: depreciationResult.accumulatedDepreciation,
    createdAt: purchaseDate,
    updatedAt: randomDate(2023)
  }
}

export const mockAssets: Asset[] = Array.from({ length: 50 }, (_, i) => generateAsset(i))
