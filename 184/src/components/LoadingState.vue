<template>
  <div class="loading-state flex-center">
    <div class="loading-content">
      <el-icon class="loading-icon" :size="40" color="#409eff"><Loading /></el-icon>
      <p class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '加载中...'
  }
})
</script>

<style scoped lang="scss">
.loading-state {
  padding: 60px 0;
  background: #fff;
  border-radius: 8px;
  min-height: 200px;
}

.loading-content {
  text-align: center;
  
  .loading-icon {
    animation: rotate 1s linear infinite;
  }
  
  .loading-text {
    margin-top: 12px;
    color: #909399;
    font-size: 14px;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
