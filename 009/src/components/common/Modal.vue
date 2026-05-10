<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
      <div class="modal" :class="`modal-${size}`">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" @click="handleCancel">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div v-if="showFooter" class="modal-footer">
          <button class="btn btn-default" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button class="btn btn-primary" @click="handleConfirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  visible: boolean
  title: string
  size?: 'sm' | 'md' | 'lg'
  showFooter?: boolean
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showFooter: true,
  confirmText: '确定',
  cancelText: '取消'
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background-color: var(--white);
  border-radius: 8px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalIn 0.3s ease-out;
}

.modal-sm {
  width: 400px;
  max-width: 100%;
}

.modal-md {
  width: 600px;
  max-width: 100%;
}

.modal-lg {
  width: 900px;
  max-width: 100%;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-color-secondary);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  color: var(--text-color);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}
</style>
