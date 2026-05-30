<script setup>
defineProps({
  text: {
    type: String,
    default: '加载中...'
  }
})
</script>

<template>
  <div class="loading-container">
    <el-icon class="loading-icon"><Loading /></el-icon>
    <p class="loading-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.loading-icon {
  font-size: 48px;
  color: #e6a23c;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
}
</style>
