<template>
  <div class="loading-state">
    <el-loading-spinner v-if="type === 'spinner'" :size="size" />
    <el-skeleton v-else :rows="rows" animated />
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'spinner'
  },
  size: {
    type: String,
    default: 'large'
  },
  rows: {
    type: Number,
    default: 3
  },
  text: {
    type: String,
    default: ''
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
  
  .loading-text {
    margin-top: 16px;
    font-size: 14px;
  }
}
</style>
