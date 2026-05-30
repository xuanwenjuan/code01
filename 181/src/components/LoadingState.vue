<template>
  <div class="loading-state">
    <div v-if="!text" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    <div v-else class="loading-with-text">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-with-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  
  .loading-text {
    color: #909399;
    font-size: 14px;
  }
}
</style>
