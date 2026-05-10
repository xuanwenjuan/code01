<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in appStore.toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
      >
        <span class="toast-icon">
          <template v-if="toast.type === 'success'">✓</template>
          <template v-else-if="toast.type === 'error'">✕</template>
          <template v-else-if="toast.type === 'warning'">!</template>
          <template v-else>i</template>
        </span>
        <span class="toast-message">{{ toast.message }}</span>
        <button
          class="toast-close"
          @click="appStore.removeToast(toast.id)"
        >×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
}

.toast-success {
  border-left: 4px solid #28a745;
}

.toast-error {
  border-left: 4px solid #dc3545;
}

.toast-warning {
  border-left: 4px solid #ffc107;
}

.toast-info {
  border-left: 4px solid #17a2b8;
}

.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  background: #d4edda;
  color: #155724;
}

.toast-error .toast-icon {
  background: #f8d7da;
  color: #721c24;
}

.toast-warning .toast-icon {
  background: #fff3cd;
  color: #856404;
}

.toast-info .toast-icon {
  background: #d1ecf1;
  color: #0c5460;
}

.toast-message {
  flex: 1;
  font-size: 14px;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  padding: 0;
  line-height: 1;
}

.toast-close:hover {
  color: #666;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>