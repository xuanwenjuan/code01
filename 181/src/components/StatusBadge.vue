<template>
  <el-tag :type="tagType" effect="light" size="small">
    {{ statusText }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { getOrderStatusText, getOrderStatusColor } from '@/utils/validate'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const tagType = computed(() => {
  const typeMap = {
    pending: 'warning',
    paid: 'primary',
    shipping: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[props.status] || 'info'
})

const statusText = computed(() => getOrderStatusText(props.status))
</script>
