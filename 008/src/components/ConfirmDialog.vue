<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DialogType } from '@/types'

const props = defineProps<{
  visible: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: DialogType
  closeOnConfirm?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const isLoading = ref(false)

function handleConfirm() {
  isLoading.value = true
  emit('confirm')
  if (props.closeOnConfirm !== false) {
    emit('update:visible', false)
  }
}

function handleCancel() {
  emit('update:visible', false)
  emit('cancel')
  isLoading.value = false
}

watch(() => props.visible, (val) => {
  if (!val) {
    isLoading.value = false
  }
})
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="modal-overlay"
      @click="handleCancel"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <span class="modal-title">{{ title || '确认' }}</span>
          <button class="close-btn" @click="handleCancel">×</button>
        </div>
        <div class="modal-body">
          <p style="line-height: 1.6; color: var(--text-secondary); margin: 0;">{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="handleCancel" :disabled="isLoading">
            {{ cancelText || '取消' }}
          </button>
          <button
            class="btn"
            :class="type === 'danger' ? 'btn-danger' : 'btn-primary'"
            @click="handleConfirm"
            :disabled="isLoading"
          >
            {{ isLoading ? '处理中...' : (confirmText || '确认') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
