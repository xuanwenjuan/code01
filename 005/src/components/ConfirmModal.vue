<template>
  <Teleport to="body">
    <div v-if="appStore.confirmModal.visible" class="modal-overlay" @click.self="handleCancel">
      <div class="modal modal-sm">
        <div class="modal-header" :class="getHeaderClass()">
          <span class="modal-icon">{{ appStore.confirmModal.icon }}</span>
          <h3 class="modal-title">{{ appStore.confirmModal.title }}</h3>
          <button class="modal-close" @click="handleCancel">&times;</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--text-color); white-space: pre-line;">{{ appStore.confirmModal.message }}</p>
        </div>
        <div class="modal-footer">
          <button 
            v-if="appStore.confirmModal.showCancel" 
            class="btn btn-secondary" 
            @click="handleCancel"
          >
            {{ appStore.confirmModal.cancelText }}
          </button>
          <button class="btn btn-primary" @click="handleConfirm">
            {{ appStore.confirmModal.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const getHeaderClass = () => {
  const type = appStore.confirmModal.type
  if (type === 'danger') return 'modal-header-danger'
  if (type === 'warning') return 'modal-header-warning'
  if (type === 'success') return 'modal-header-success'
  return ''
}

const handleConfirm = () => {
  appStore.confirmModal.onConfirm?.()
}

const handleCancel = () => {
  appStore.confirmModal.onCancel?.()
}
</script>