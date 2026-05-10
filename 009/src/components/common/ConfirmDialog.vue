<template>
  <Modal
    :visible="visible"
    :title="title"
    size="sm"
    @update:visible="handleUpdateVisible"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="confirm-dialog">
      <div class="confirm-icon" :class="`confirm-icon-${type}`">
        {{ iconContent }}
      </div>
      <p class="confirm-message">{{ message }}</p>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Modal from './Modal.vue'
import type { ConfirmDialogOptions } from '../../types'

interface Props extends ConfirmDialogOptions {
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确定',
  cancelText: '取消',
  type: 'warning'
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const iconContent = computed(() => {
  switch (props.type) {
    case 'info': return 'i'
    case 'warning': return '!'
    case 'danger': return '?'
    default: return '!'
  }
})

function handleUpdateVisible(value: boolean) {
  emit('update:visible', value)
}

function handleConfirm() {
  emit('confirm')
  emit('update:visible', false)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.confirm-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.confirm-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 16px;
}

.confirm-icon-info {
  background-color: #ecf5ff;
  color: var(--primary-color);
}

.confirm-icon-warning {
  background-color: #fdf6ec;
  color: var(--warning-color);
}

.confirm-icon-danger {
  background-color: #fef0f0;
  color: var(--danger-color);
}

.confirm-message {
  font-size: 14px;
  color: var(--text-color);
  line-height: 1.6;
}
</style>
