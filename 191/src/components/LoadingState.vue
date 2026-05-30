<template>
  <div class="loading-state">
    <el-icon class="is-loading" :size="40" color="#d4af37">
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
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;

  .loading-text {
    margin-top: 16px;
    font-size: 14px;
  }
}
</style>
