<template>
  <div class="empty-state">
    <el-empty :description="description" :image-size="100">
      <template #image>
        <el-icon :size="80" color="#c0c4cc">
        <component :is="icon" />
        </el-icon>
      </template>
      <p class="empty-state-text">{{ text }}</p>
      <slot></slot>
    </el-empty>
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
  const icons = {
    default: 'Document',
    order: 'Tickets',
    favorite: 'Star',
    search: 'Search',
    equipment: 'Box'
  }
  return icons[props.type] || icons.default
})

const description = computed(() => props.text)
</script>

<style lang="scss" scoped>
.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-state-text {
  color: #909399;
  font-size: 14px;
  margin-top: 16px;
}
</style>
