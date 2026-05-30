<script setup>
defineProps({
  text: {
    type: String,
    default: '暂无数据'
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="empty-container">
    <el-icon class="empty-icon"><DataLine /></el-icon>
    <p class="empty-text">{{ text }}</p>
    <p v-if="description" class="empty-desc">{{ description }}</p>
  </div>
</template>

<style scoped>
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  color: #dcdfe6;
}

.empty-text {
  margin-top: 16px;
  font-size: 16px;
  color: #606266;
}

.empty-desc {
  margin-top: 8px;
  font-size: 14px;
  color: #909399;
}
</style>
