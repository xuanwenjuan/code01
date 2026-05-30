<template>
  <div v-if="loading" class="page-loading">
    <div class="loading-content">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <span class="loading-text">{{ text }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: '加载中...'
  }
})
</script>

<style scoped lang="scss">
.page-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  border-radius: 8px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #909399;
}

.loading-text {
  font-size: 14px;
}
</style>
