<template>
  <div class="page-header">
    <h2 class="page-title">{{ title }}</h2>
    <div v-if="$slots.extra" class="page-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
  
  .page-extra {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
