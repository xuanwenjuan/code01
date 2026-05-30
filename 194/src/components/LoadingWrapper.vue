<template>
  <div v-loading="loading" :element-loading-text="text" class="loading-wrapper">
    <slot></slot>
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

<style lang="scss" scoped>
.loading-wrapper {
  min-height: 200px;
  background: #fff;
  border-radius: 8px;
}
</style>
