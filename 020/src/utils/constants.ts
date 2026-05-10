import { EquipmentCategoryType, EquipmentStatus } from '@/types'

function getCurrentTime(): string {
  return new Date().toISOString()
}

export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: EquipmentCategoryType.AEROBIC, description: '跑步机、椭圆机等有氧设备', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
  { id: 'cat-2', name: EquipmentCategoryType.STRENGTH, description: '哑铃、杠铃等力量训练设备', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
  { id: 'cat-3', name: EquipmentCategoryType.FLEXIBILITY, description: '瑜伽垫、拉伸带等柔韧训练设备', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
  { id: 'cat-4', name: EquipmentCategoryType.REHABILITATION, description: '康复训练专用设备', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
  { id: 'cat-5', name: EquipmentCategoryType.AUXILIARY, description: '辅助训练器材', createdAt: getCurrentTime(), updatedAt: getCurrentTime() }
]

export const EQUIPMENT_STATUS_OPTIONS = [
  { label: EquipmentStatus.IN_STOCK, value: EquipmentStatus.IN_STOCK },
  { label: EquipmentStatus.IN_USE, value: EquipmentStatus.IN_USE },
  { label: EquipmentStatus.MAINTENANCE, value: EquipmentStatus.MAINTENANCE },
  { label: EquipmentStatus.SCRAPPED, value: EquipmentStatus.SCRAPPED }
]
