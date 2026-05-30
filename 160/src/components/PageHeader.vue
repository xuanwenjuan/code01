<template>
  <div class="page-header" :style="{ background: bgGradient }">
    <div class="container">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  bgGradient: {
    type: String,
    default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
})
</script>

<style lang="scss" scoped>
.page-header {
  padding: 60px 0;
  margin-bottom: 30px;
  text-align: center;
  color: #fff;

  .page-title {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 12px;
  }

  .page-subtitle {
    font-size: 16px;
    opacity: 0.9;
  }
}
</style>
