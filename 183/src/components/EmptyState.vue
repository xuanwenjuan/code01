<template>
  <div class="empty-container">
    <el-icon :size="64" color="#c0b8a8"><DataLine /></el-icon>
    <p class="empty-text">{{ text }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script setup>
import { DataLine } from '@element-plus/icons-vue'

defineProps({
  text: {
    type: String,
    default: '暂无数据'
  }
})
</script>

<style lang="scss" scoped>
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  min-height: 200px;
}

.empty-text {
  margin-top: 15px;
  color: #888;
  font-size: 14px;
}
</style>
