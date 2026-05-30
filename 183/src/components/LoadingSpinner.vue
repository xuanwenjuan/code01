<template>
  <div class="loading-container" v-if="loading">
    <el-icon class="loading-icon" :size="size" color="#8b6914"><Loading /></el-icon>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'

defineProps({
  loading: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
    default: '加载中...'
  },
  size: {
    type: Number,
    default: 32
  }
})
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  min-height: 200px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 15px;
  color: #8b6914;
  font-size: 14px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
