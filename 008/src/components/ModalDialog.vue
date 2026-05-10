<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = defineProps<{
  visible: boolean
  title: string
  width?: string
  closeOnOverlayClick?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

function handleBodyScroll(disabled: boolean) {
  if (disabled) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

watch(() => props.visible, (val) => {
  handleBodyScroll(val)
}, { immediate: false })

function handleClose() {
  emit('update:visible', false)
  emit('close')
}

function handleOverlayClick(e: Event) {
  if (props.closeOnOverlayClick !== false && (e.target as HTMLElement).classList.contains('modal-overlay')) {
    handleClose()
  }
}

onUnmounted(() => {
  handleBodyScroll(false)
})
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div class="modal" :style="{ maxWidth: width || '500px' }">
        <div class="modal-header">
          <span class="modal-title">{{ title }}</span>
          <button class="close-btn" @click="handleClose">×</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>
