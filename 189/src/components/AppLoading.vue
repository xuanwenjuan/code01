<template>
  <div class="app-loading">
    <el-icon :size="40" color="#8B4513" class="is-loading">
      <Loading />
    </el-icon>
    <p class="loading-text">{{ text }}</p>
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
.app-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  color: $text-light;

  .loading-text {
    margin-top: 16px;
    font-size: 14px;
  }
}
</style>
