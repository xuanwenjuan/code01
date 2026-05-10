<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'

const { notifications, removeNotification } = useNotification()

const getTypeClass = (type: string) => {
  switch (type) {
    case 'success': return 'notification-success'
    case 'error': return 'notification-error'
    case 'warning': return 'notification-warning'
    case 'info': return 'notification-info'
    default: return 'notification-info'
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'success': return '✓'
    case 'error': return '✕'
    case 'warning': return '!'
    case 'info': return 'i'
    default: return 'i'
  }
}
</script>

<template>
  <div class="notification-container">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="getTypeClass(notification.type)"
      >
        <span class="notification-icon">{{ getTypeIcon(notification.type) }}</span>
        <span class="notification-message">{{ notification.message }}</span>
        <button 
          class="notification-close"
          @click="removeNotification(notification.id)"
        >
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.notification-icon {
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

.notification-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
}

.notification-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  opacity: 1;
}

.notification-success {
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
  color: #166534;
}

.notification-success .notification-icon {
  background: #22c55e;
  color: white;
}

.notification-error {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #991b1b;
}

.notification-error .notification-icon {
  background: #ef4444;
  color: white;
}

.notification-warning {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  color: #92400e;
}

.notification-warning .notification-icon {
  background: #f59e0b;
  color: white;
}

.notification-info {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  color: #1e40af;
}

.notification-info .notification-icon {
  background: #3b82f6;
  color: white;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
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
