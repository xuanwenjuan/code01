<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button type="button" class="modal-close" @click="handleCancel">&times;</button>
        </div>
        <div class="modal-body">
          <div class="alert" :class="`alert-${type}`">
            <span v-if="type === 'success'">✓</span>
            <span v-else-if="type === 'warning'">⚠</span>
            <span v-else-if="type === 'danger'">✕</span>
            <span v-else>ℹ</span>
            {{ message }}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="handleCancel">{{ cancelText }}</button>
          <button type="button" class="btn" :class="`btn-${type === 'danger' ? 'danger' : 'primary'}`" @click="handleConfirm" :disabled="loading">
            <span v-if="loading">处理中...</span>
            <span v-else>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, withDefaults } from 'vue'

interface Props {
  visible: boolean
  title: string
  message: string
  type?: 'success' | 'warning' | 'danger' | 'info'
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'warning',
  confirmText: '确定',
  cancelText: '取消',
  loading: false
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()

const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>