<template>
  <div class="loading-wrapper flex items-center justify-center">
    <el-icon class="is-loading" :size="size">
      <Loading />
    </el-icon>
    <span class="loading-text" v-if="text">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '加载中...'
  },
  size: {
    type: Number,
    default: 24
  }
})
</script>

<style scoped>
.loading-wrapper {
  padding: 40px 0;
  color: #409eff;
  gap: 10px;
}

.loading-text {
  font-size: 14px;
}
</style>
