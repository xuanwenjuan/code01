<template>
  <el-tag :type="tagType" :size="size" :effect="effect">
    <slot>
      {{ statusText }}
    </slot>
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'order'
  },
  size: {
    type: String,
    default: 'small'
  },
  effect: {
    type: String,
    default: 'light'
  }
})

const statusMaps = {
  order: {
    pending: { text: '待付款', type: 'warning' },
    shipped: { text: '已发货', type: 'primary' },
    completed: { text: '已完成', type: 'success' },
    cancelled: { text: '已取消', type: 'info' }
  },
  product: {
    inStock: { text: '有货', type: 'success' },
    lowStock: { text: '库存紧张', type: 'warning' },
    outOfStock: { text: '缺货', type: 'danger' }
  },
  user: {
    buyer: { text: '采购用户', type: 'primary' },
    seller: { text: '仪器商家', type: 'success' },
    admin: { text: '管理员', type: 'danger' }
  }
}

const statusText = computed(() => {
  const map = statusMaps[props.type] || statusMaps.order
  return map[props.status]?.text || props.status
})

const tagType = computed(() => {
  const map = statusMaps[props.type] || statusMaps.order
  return map[props.status]?.type || 'info'
})
</script>
