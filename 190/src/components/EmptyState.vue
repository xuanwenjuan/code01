<template>
  <div class="empty-state flex flex-col items-center justify-center">
    <el-icon :size="80" color="#c0c4cc">
    <component :is="icon" />
    </el-icon>
    <p class="empty-text">{{ text }}</p>
    <slot name="extra"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default'
  },
  text: {
    type: String,
    default: '暂无数据'
  }
})

const icon = computed(() => {
  const iconMap = {
    'default': 'Document',
    'search': 'Search',
    'order': 'Tickets',
    'favorite': 'Star',
    'cart': 'ShoppingCart',
    'user': 'User'
  }
  return iconMap[props.type] || iconMap['default']
})
</script>

<style scoped>
.empty-state {
  padding: 60px 0;
  color: #909399;
}

.empty-text {
  margin-top: 20px;
  font-size: 14px;
}
</style>
