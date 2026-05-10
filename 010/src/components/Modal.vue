<script setup lang="ts">
import { computed } from 'vue'
import { store } from '../store'
import { ModalType } from '../types'

const modal = store.currentModal

const messageLines = computed(() => {
  if (!modal.value) return []
  return modal.value.message.split('\n').map((line, index) => ({
    key: index,
    text: line,
  }))
})

function handleConfirm() {
  if (modal.value?.onConfirm) {
    modal.value.onConfirm()
  } else {
    store.closeModal()
  }
}

function handleCancel() {
  if (modal.value?.onCancel) {
    modal.value.onCancel()
  } else {
    store.closeModal()
  }
}
</script>

<template>
  <div v-if="modal" class="modal-overlay" @click.self="handleCancel">
    <div class="modal" :style="{ maxWidth: modal.message.includes('\n') ? '600px' : '500px' }">
      <div class="modal-title">
        <span v-if="modal.type === ModalType.WARNING" style="color: var(--warning-color); margin-right: 4px">⚠</span>
        <span v-if="modal.type === ModalType.CONFIRM" style="color: var(--primary-color); margin-right: 4px">?</span>
        <span v-if="modal.type === ModalType.ALERT" style="color: var(--primary-color); margin-right: 4px">ℹ</span>
        {{ modal.title }}
      </div>
      <div class="modal-body">
        <div v-if="messageLines.length > 1">
          <div
            v-for="line in messageLines"
            :key="line.key"
            style="white-space: pre-wrap; line-height: 1.7"
          >
            {{ line.text }}
          </div>
        </div>
        <p v-else>{{ modal.message }}</p>
      </div>
      <div class="modal-footer">
        <button
          v-if="modal.type === ModalType.CONFIRM"
          class="btn btn-secondary"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          :class="[
            'btn',
            modal.type === ModalType.WARNING ? 'btn-warning' : 'btn-primary',
          ]"
          @click="handleConfirm"
        >
          {{ modal.type === ModalType.CONFIRM ? '确认' : '知道了' }}
        </button>
      </div>
    </div>
  </div>
</template>
