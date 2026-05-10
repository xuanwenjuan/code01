<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type}`"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ToastMessage, ToastMethods } from '../../types'
import { generateId } from '../../utils/storage'
import { setToastMethods } from '../../store'

const toasts = ref<ToastMessage[]>([])

function showToast(message: string, type: ToastMessage['type'] = 'info', duration: number = 3000): void {
  const id = generateId('toast')
  toasts.value.push({ id, message, type })
  
  window.setTimeout(() => {
    const index = toasts.value.findIndex((t: ToastMessage) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }, duration)
}

const toastMethods: ToastMethods = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error'),
  warning: (message: string) => showToast(message, 'warning'),
  info: (message: string) => showToast(message, 'info')
}

onMounted(() => {
  setToastMethods(toastMethods)
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  color: var(--white);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.toast-success {
  background-color: var(--success-color);
}

.toast-error {
  background-color: var(--danger-color);
}

.toast-warning {
  background-color: var(--warning-color);
}

.toast-info {
  background-color: var(--primary-color);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
