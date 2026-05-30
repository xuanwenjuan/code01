<template>
  <div class="loading-state">
    <el-skeleton :rows="rows" animated :loading="loading">
      <slot></slot>
    </el-skeleton>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 5
  }
})
</script>

<style scoped>
.loading-state {
  padding: 20px;
}
</style>
