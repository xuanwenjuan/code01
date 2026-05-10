<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  title: string
  width?: string
  okText?: string
  cancelText?: string
  okDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '500px',
  okText: '确定',
  cancelText: '取消',
  okDisabled: false
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'ok'): void
  (e: 'cancel'): void
}>()

const modalStyle = computed(() => ({
  width: props.width
}))

const handleOk = () => {
  emit('ok')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-container" :style="modalStyle">
          <div class="modal-header">
            <span class="modal-title">{{ title }}</span>
            <button class="modal-close" @click="handleCancel">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button 
              class="btn btn-primary" 
              @click="handleOk"
              :disabled="okDisabled"
            >
              {{ okText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

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
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #9ca3af;
  line-height: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #4b5563;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
