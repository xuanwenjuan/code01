<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal" :class="`modal-${size}`">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button type="button" class="modal-close" @click="handleClose">&times;</button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer" v-if="showFooter">
          <slot name="footer">
            <button type="button" class="btn btn-outline" @click="handleClose">取消</button>
            <button type="button" class="btn btn-primary" @click="handleConfirm" :disabled="confirmLoading">
              <span v-if="confirmLoading">处理中...</span>
              <span v-else>{{ confirmText }}</span>
            </button>
          </slot>
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
  size?: 'sm' | 'md' | 'lg'
  showFooter?: boolean
  confirmText?: string
  confirmLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showFooter: true,
  confirmText: '确定',
  confirmLoading: false
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>