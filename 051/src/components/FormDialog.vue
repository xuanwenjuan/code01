<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :before-close="handleClose"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-width="labelWidth"
      :disabled="mode === 'view'"
    >
      <slot />
    </el-form>
    <template #footer v-if="mode !== 'view'">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, type FormInstance, type FormRules } from 'element-plus'
import type { FormMode } from '@/types'

interface Props {
  modelValue: boolean
  title: string
  formData: Record<string, unknown>
  rules?: FormRules
  width?: string
  labelWidth?: string
  mode?: FormMode
}

const props = withDefaults(defineProps<Props>(), {
  width: '500px',
  labelWidth: '100px',
  rules: () => ({}),
  mode: 'add'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: Record<string, unknown>): void
}>()

const visible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    formRef.value?.clearValidate()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value || props.mode === 'view') return

  submitting.value = true
  try {
    await formRef.value.validate((valid) => {
      if (valid) {
        emit('submit', props.formData)
        visible.value = false
      }
    })
  } finally {
    submitting.value = false
  }
}

defineExpose({
  formRef,
  validate: () => formRef.value?.validate(),
  clearValidate: () => formRef.value?.clearValidate()
})
</script>
