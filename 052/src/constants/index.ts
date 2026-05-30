import type { MaterialCategory, MaterialStatus, DesignerStatus, OrderStatus, ContractStatus, StatusMap } from '@/types'

export const MATERIAL_CATEGORY_MAP: StatusMap<MaterialCategory> = {
  furniture: { label: '家具', type: 'primary' },
  curtain: { label: '窗帘', type: 'success' },
  lighting: { label: '灯饰', type: 'warning' },
  carpet: { label: '地毯', type: 'danger' },
  decoration: { label: '装饰摆件', type: 'info' }
}

export const MATERIAL_STATUS_MAP: StatusMap<MaterialStatus> = {
  on: { label: '上架', type: 'success' },
  off: { label: '下架', type: 'info' }
}

export const DESIGNER_STATUS_MAP: StatusMap<DesignerStatus> = {
  on: { label: '在岗', type: 'success' },
  off: { label: '休假', type: 'warning' },
  leave: { label: '离职', type: 'danger' }
}

export const ORDER_STATUS_MAP: StatusMap<OrderStatus> = {
  pending: { label: '待派单', type: 'warning' },
  assigned: { label: '已派单', type: 'primary' },
  designing: { label: '设计中', type: 'info' },
  completed: { label: '已完成', type: 'success' },
  deal: { label: '已成交', type: 'success' }
}

export const CONTRACT_STATUS_MAP: StatusMap<ContractStatus> = {
  pending: { label: '待确认', type: 'warning' },
  signed: { label: '已签约', type: 'success' },
  cancelled: { label: '已作废', type: 'danger' }
}

export const STYLE_OPTIONS = [
  { label: '现代简约', value: '现代简约' },
  { label: '北欧风格', value: '北欧风格' },
  { label: '中式古典', value: '中式古典' },
  { label: '欧式奢华', value: '欧式奢华' },
  { label: '工业风', value: '工业风' },
  { label: '日式禅意', value: '日式禅意' },
  { label: '轻奢风格', value: '轻奢风格' }
]

export const HOUSE_TYPE_OPTIONS = [
  { label: '一室一厅', value: '一室一厅' },
  { label: '两室一厅', value: '两室一厅' },
  { label: '三室一厅', value: '三室一厅' },
  { label: '三室两厅', value: '三室两厅' },
  { label: '四室两厅', value: '四室两厅' },
  { label: '别墅', value: '别墅' }
]
