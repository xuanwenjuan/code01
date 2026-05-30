<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="confirm-content">
      <el-icon v-if="type === 'warning'" :size="48" color="#E6A23C">
        <WarningFilled />
      </el-icon>
      <el-icon v-else-if="type === 'danger'" :size="48" color="#F56C6C">
        <CircleCloseFilled />
      </el-icon>
      <el-icon v-else-if="type === 'success'" :size="48" color="#67C23A">
        <CircleCheckFilled />
      </el-icon>
      <el-icon v-else :size="48" color="#409EFF">
        <InfoFilled />
      </el-icon>
      <div class="content-text">
        <p v-if="message" class="message">{{ message }}</p>
        <p v-if="subMessage" class="sub-message">{{ subMessage }}</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleCancel">{{ cancelText }}</el-button>
      <el-button :type="confirmType" @click="handleConfirm">
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { 
  WarningFilled, 
  CircleCloseFilled, 
  CircleCheckFilled, 
  InfoFilled 
} from '@element-plus/icons-vue'

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
  subMessage: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'warning',
    validator: (val) => ['warning', 'danger', 'success', 'info']
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
  width: {
    type: String,
    default: '420px'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function handleConfirm() {
  emit('confirm')
  visible.value = false
}

function handleCancel() {
  emit('cancel')
  visible.value = false
}

function handleClose() {
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.confirm-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;

  .content-text {
    flex: 1;

    .message {
      font-size: 15px;
      color: $text-color;
      margin-bottom: 8px;
      line-height: 1.6;
    }

    .sub-message {
      font-size: 13px;
      color: $text-light;
      line-height: 1.6;
    }
  }
}
</style>
