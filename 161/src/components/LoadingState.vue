<template>
  <div class="loading-state">
    <el-skeleton v-if="type === 'card'" :rows="5" animated />
    <div v-else class="loading-spinner">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <span>{{ text }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '加载中...'
  },
  type: {
    type: String,
    default: 'spinner'
  }
})
</script>

<style lang="scss" scoped>
.loading-state {
  padding: 40px 0;

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #909399;

    .el-icon {
      color: #409eff;
    }
  }
}
</style>
