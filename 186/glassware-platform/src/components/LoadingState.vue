<template>
  <div class="loading-state">
    <el-loading-spinner v-if="type === 'spinner'" class="loading-spinner" />
    <el-skeleton v-else :rows="rows" animated />
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'skeleton'
  },
  rows: {
    type: Number,
    default: 3
  }
})
</script>

<style lang="scss" scoped>
.loading-state {
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;

  .loading-spinner {
    width: 40px;
    height: 40px;
    --el-spinner-color: #409eff;
  }
}
</style>
