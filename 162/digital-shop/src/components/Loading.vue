<template>
  <div class="loading-wrapper" v-loading="loading" :element-loading-text="text">
    <slot v-if="!loading"></slot>
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

<style scoped lang="scss">
.loading-wrapper {
  min-height: 200px;
}
</style>
