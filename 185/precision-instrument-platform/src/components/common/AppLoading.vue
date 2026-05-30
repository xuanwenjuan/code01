<template>
  <div class="app-loading" v-if="loading">
    <el-loading-spinner class="loading-spinner" />
    <p class="loading-text">{{ text }}</p>
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

<style scoped>
.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.loading-spinner {
  width: 50px;
  height: 50px;
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
}
</style>
