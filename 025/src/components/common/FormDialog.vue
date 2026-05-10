<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :destroy-on-close="destroyOnClose"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-width="labelWidth"
      :disabled="disabled"
    >
      <slot />
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <slot name="footer">
          <el-button :disabled="disabled" @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :loading="confirmLoading"
            :disabled="disabled"
            @click="handleConfirm"
          >
            确定
          </el-button>
        </slot>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DialogMode } from '@/types'

interface Props {
  visible: boolean
  title: string
  width?: string
  labelWidth?: string
  confirmLoading?: boolean
  disabled?: boolean
  destroyOnClose?: boolean
  mode?: DialogMode
  initialData?: Record<string, unknown>
  rules?: FormRules
}

const props = withDefaults(defineProps<Props>(), {
  width: '600px',
  labelWidth: '100px',
  confirmLoading: false,
  disabled: false,
  destroyOnClose: true,
  mode: 'create',
  rules: () => ({})
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [formData: Record<string, unknown>]
  cancel: []
  'form-validated': [isValid: boolean]
}>()

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive<Record<string, unknown>>({})

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    if (props.initialData) {
      Object.assign(formData, props.initialData)
    }
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  } else {
    Object.keys(formData).forEach(key => {
      delete formData[key]
    })
  }
})

watch(() => props.initialData, (newData) => {
  if (newData && dialogVisible.value) {
    Object.assign(formData, newData)
  }
}, { deep: true })

function handleClose(): void {
  emit('update:visible', false)
  emit('cancel')
}

function handleCancel(): void {
  emit('update:visible', false)
  emit('cancel')
}

async function handleConfirm(): Promise<void> {
  if (!formRef.value) {
    emit('confirm', formData)
    return
  }

  try {
    await formRef.value.validate(async (isValid) => {
      emit('form-validated', isValid)
      if (isValid) {
        emit('confirm', { ...formData })
      }
    })
  } catch (error) {
    emit('form-validated', false)
  }
}

function validate(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!formRef.value) {
      resolve(true)
      return
    }
    formRef.value.validate((valid) => {
      resolve(valid)
    })
  })
}

function clearValidate(): void {
  formRef.value?.clearValidate()
}

function resetFields(): void {
  formRef.value?.resetFields()
}

defineExpose({
  validate,
  clearValidate,
  resetFields,
  formData,
  formRef
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto !important;
  }

  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 18px;
    }
  }
}
</style>
