<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    destroy-on-close
    @closed="handleClosed"
  >
    <div class="dialog-content">
      <el-icon v-if="icon" :size="40" :color="iconColor" class="dialog-icon">
        <component :is="icon" />
      </el-icon>
      <div class="dialog-text">
        <p v-if="message" class="dialog-message">{{ message }}</p>
        <slot></slot>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="handleCancel">{{ cancelText }}</el-button>
      <el-button
        :type="confirmType"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '420px'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmType: {
    type: String,
    default: 'primary'
  },
  icon: {
    type: String,
    default: 'Warning'
  },
  iconColor: {
    type: String,
    default: '#E6A23C'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'closed'])

const visible = {
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}

const handleClosed = () => {
  emit('closed')
}
</script>

<style scoped lang="scss">
.dialog-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 10px 0;
  
  .dialog-icon {
    flex-shrink: 0;
  }
  
  .dialog-text {
    flex: 1;
    
    .dialog-message {
      font-size: 14px;
      color: var(--text-regular);
      line-height: 1.6;
      margin: 0;
    }
  }
}
</style>
