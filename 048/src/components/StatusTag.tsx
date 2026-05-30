import { Tag } from 'antd'
import { CooperationStatus, OrderStatus, SettlementStatus, QualityResult, SupplierCategory } from '@/types'

type StatusType = CooperationStatus | OrderStatus | SettlementStatus | QualityResult | SupplierCategory

interface StatusTagProps {
  status: StatusType
}

const statusColorMap: Record<StatusType, string> = {
  '合作中': 'success',
  '已暂停': 'warning',
  '待审核': 'processing',
  '已终止': 'error',
  '待确认': 'warning',
  '已下单': 'processing',
  '供货中': 'blue',
  '已交付': 'success',
  '待对账': 'warning',
  '对账中': 'processing',
  '已结算': 'success',
  '已逾期': 'error',
  '合格': 'success',
  '不合格': 'error',
  '待检验': 'warning',
  '五金': 'blue',
  '塑胶': 'cyan',
  '电子': 'purple',
  '冲压件': 'geekblue',
}

export function StatusTag({ status }: StatusTagProps) {
  return <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>
}
