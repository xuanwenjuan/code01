<template>
  <div class="base-card" :class="{ 'card-hover': hover }">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
        <div v-if="$slots.extra" class="card-extra">
          <slot name="extra"></slot>
        </div>
      </slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  hover: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped lang="scss">
.base-card {
  background: var(--bg-white);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-light);
  transition: all var(--transition-medium);
  overflow: hidden;
  
  &.card-hover:hover {
    box-shadow: var(--shadow-medium);
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
  
  .card-extra {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.card-body {
  padding: 20px;
}

.card-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-light);
}
</style>
