<template>
  <div class="loading-state">
    <el-loading :text="text" :fullscreen="fullscreen" />
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '加载中...'
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.loading-state {
  padding: 60px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
