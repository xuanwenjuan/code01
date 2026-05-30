<script setup lang="ts">
import { ref, watch, type FormInstance, type FormRules } from 'vue'
import { ElMessage } from 'element-plus'

interface Props {
  visible: boolean
  title: string
  modelValue: Record<string, any>
  rules?: FormRules
  width?: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'submit', value: Record<string, any>): void
}

const props = withDefaults(defineProps<Props>(), {
  width: '500px',
  rules: () => ({})
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const localForm = ref<Record<string, any>>({})

watch(() => props.modelValue, (newVal) => {
  localForm.value = { ...newVal }
}, { deep: true, immediate: true })

watch(() => props.visible, (newVal) => {
  if (newVal) {
    localForm.value = { ...props.modelValue }
  }
})

const handleCancel = () => {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    emit('submit', { ...localForm.value })
    ElMessage.success('操作成功')
    handleCancel()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields()
})
</script>

<template>
  <el-dialog :title="title" :model-value="visible" :width="width" @update:model-value="handleCancel">
    <el-form ref="formRef" :model="localForm" :rules="rules" label-width="100px">
      <slot name="form" :form="localForm">
        <slot />
      </slot>
    </el-form>
    <template #footer>
      <slot name="footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </slot>
    </template>
  </el-dialog>
</template>
