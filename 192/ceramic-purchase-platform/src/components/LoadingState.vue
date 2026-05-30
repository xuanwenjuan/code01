<template>
  <div class="loading-state">
    <el-loading v-model="loading" :text="text" background="rgba(255, 255, 255, 0.9)">
      <div style="height: 200px;"></div>
    </el-loading>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
    default: '加载中...'
  }
})
</script>

<style scoped>
.loading-state {
  padding: 40px 0;
}
</style>
