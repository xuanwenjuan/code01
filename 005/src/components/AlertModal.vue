<template>
  <Teleport to="body">
    <div v-if="appStore.alertModal.visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal modal-sm" :class="[`alert-modal-${appStore.alertModal.type}`]">
        <div class="modal-body" style="text-align: center; padding: 30px 20px;">
          <div style="font-size: 48px; margin-bottom: 15px;">{{ appStore.alertModal.icon }}</div>
          <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 10px; color: var(--primary-color);">
            {{ appStore.alertModal.title }}
          </h3>
          <p style="color: #666; white-space: pre-line; line-height: 1.6;">
            {{ appStore.alertModal.message }}
          </p>
        </div>
        <div class="modal-footer" style="justify-content: center;">
          <button class="btn btn-primary" @click="handleClose">
            我知道了
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const handleClose = () => {
  appStore.alertModal.onClose?.()
}
</script>
