<template>
  <div class="loading-state">
    <el-loading v-if="loading" :text="text" fullscreen />
    <div v-else class="loading-box">
      <el-icon class="loading-icon" :size="40">
        <Loading />
      </el-icon>
      <p>{{ text }}</p>
    </div>
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
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.loading-state {
  padding: 60px 0;
  text-align: center;
  color: #999;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-icon {
  color: #d4a574;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
