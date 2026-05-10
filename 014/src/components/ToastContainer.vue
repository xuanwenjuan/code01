<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="`toast-${toast.type}`"
      >
        <span class="toast-icon">
          <template v-if="toast.type === 'success'">✓</template>
          <template v-else-if="toast.type === 'error'">✕</template>
          <template v-else-if="toast.type === 'warning'">!</template>
          <template v-else>ℹ</template>
        </span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '@/stores/useUIStore'

const { toasts } = useUIStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  min-width: 200px;
  animation: slideIn 0.3s ease;
}

.toast-icon {
  font-size: 18px;
  font-weight: bold;
}

.toast-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.toast-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.toast-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.toast-info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>