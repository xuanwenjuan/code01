<template>
  <el-tag :type="tagType" :effect="effect" size="small">
    {{ displayText }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProductStatus, InventoryOperationType, OperationType } from '@/types'

interface Props {
  type: 'product' | 'inventory' | 'operation'
  value: ProductStatus | InventoryOperationType | OperationType
}

const props = defineProps<Props>()

const statusConfig: Record<string, { text: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  normal: { text: '正常', type: 'success' },
  low_stock: { text: '库存不足', type: 'warning' },
  out_of_stock: { text: '已售罄', type: 'danger' },
  expiring_soon: { text: '即将过期', type: 'warning' },
  expired: { text: '已过期', type: 'danger' },
  in: { text: '入库', type: 'success' },
  out: { text: '出库', type: 'warning' },
  sale: { text: '售卖', type: 'primary' },
  offline: { text: '下架', type: 'danger' },
  add: { text: '新增', type: 'success' },
  edit: { text: '编辑', type: 'primary' },
  delete: { text: '删除', type: 'danger' },
  in_stock: { text: '入库', type: 'success' },
  out_stock: { text: '出库', type: 'warning' }
}

const displayText = computed(() => statusConfig[props.value]?.text || props.value)
const tagType = computed(() => statusConfig[props.value]?.type || 'info')
const effect = computed<'light' | 'dark' | 'plain'>(() => 'light')
</script>
