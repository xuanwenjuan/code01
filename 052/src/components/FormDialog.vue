<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-width="labelWidth"
    >
      <slot />
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  modelValue: boolean
  title?: string
  width?: string
  labelWidth?: string
  formData: Record<string, unknown>
  rules?: FormRules
}

const props = withDefaults(defineProps<Props>(), {
  title: '编辑',
  width: '600px',
  labelWidth: '100px'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [formData: Record<string, unknown>]
  'cancel': []
}>()

const formRef = ref<FormInstance>()
const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  nextTick(() => {
    formRef.value?.resetFields()
    formRef.value?.clearValidate()
  })
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', props.formData)
    visible.value = false
  } catch {
    // 校验失败
  }
}

const resetFields = () => {
  formRef.value?.resetFields()
}

const clearValidate = () => {
  formRef.value?.clearValidate()
}

defineExpose({
  resetFields,
  clearValidate,
  validate: () => formRef.value?.validate()
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
