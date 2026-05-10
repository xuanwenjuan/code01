<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modal.visible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-dialog" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ modal.title }}</h3>
            <button class="modal-close" @click="handleCancel">×</button>
          </div>
          <div v-if="modal.content" class="modal-body">
            <p>{{ modal.content }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="handleCancel">
              {{ modal.cancelText || '取消' }}
            </button>
            <button class="btn btn-confirm" @click="handleConfirm">
              {{ modal.confirmText || '确认' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useUIStore } from '@/stores/useUIStore'

const { modal, hideModal } = useUIStore()

function handleOverlayClick(): void {
  handleCancel()
}

function handleConfirm(): void {
  if (modal.value.onConfirm) {
    modal.value.onConfirm()
  } else {
    hideModal()
  }
}

function handleCancel(): void {
  if (modal.value.onCancel) {
    modal.value.onCancel()
  } else {
    hideModal()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 450px;
  margin: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: modalIn 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #374151;
}

.modal-body {
  padding: 20px;
  color: #4b5563;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-confirm {
  background: #3b82f6;
  color: white;
}

.btn-confirm:hover {
  background: #2563eb;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-dialog,
.modal-leave-to .modal-dialog {
  transform: scale(0.9);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>