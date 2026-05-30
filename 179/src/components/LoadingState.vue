<template>
  <div class="loading-state">
    <el-icon :size="40" class="loading-icon"><Loading /></el-icon>
    <p>{{ text }}</p>
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

<style lang="scss" scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  
  .loading-icon {
    color: #d4af37;
    animation: rotate 1s linear infinite;
    margin-bottom: 16px;
  }
  
  p {
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
