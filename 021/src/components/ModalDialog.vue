<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <span>{{ title }}</span>
        <button class="modal-close" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="handleSubmit" :disabled="submitting">
          {{ submitting ? '提交中...' : submitText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  title: string
  submitText?: string
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitText: '确定',
  submitting: false
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
}>()

const handleSubmit = () => {
  if (!props.submitting) {
    emit('submit')
  }
}
</script>
