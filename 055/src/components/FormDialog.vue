<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-width="labelWidth"
      class="form-content"
    >
      <slot></slot>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Props<T> {
  title: string
  visible: boolean
  formData: Partial<T>
  rules?: FormRules
  width?: string
  labelWidth?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props<any>>(), {
  width: '600px',
  labelWidth: '120px',
  loading: false
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'update:formData', value: Record<string, unknown>): void
  (e: 'submit'): void
}>()

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

watch(() => props.visible, (val) => {
  dialogVisible.value = val
}, { immediate: true })

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const handleClose = () => {
  dialogVisible.value = false
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit')
  } catch {
    // 验证失败
  }
}

const resetFields = () => {
  formRef.value?.resetFields()
}

defineExpose({
  resetFields,
  validate: () => formRef.value?.validate()
})
</script>

<style scoped>
.form-content {
  padding-right: 20px;
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }

  :deep(.el-form-item__label) {
    width: 80px !important;
  }
}
</style>
