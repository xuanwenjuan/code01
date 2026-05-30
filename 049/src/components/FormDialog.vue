<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="internalFormData"
      :rules="rules"
      :label-width="labelWidth"
      label-position="right"
      class="form-dialog-content"
    >
      <slot :formData="internalFormData" />
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确 定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, watch, ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  modelValue: boolean
  title: string
  formData: Record<string, any>
  rules?: FormRules
  width?: string
  labelWidth?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '600px',
  labelWidth: '100px',
  loading: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: Record<string, any>): void
}>()

const formRef = ref<FormInstance>()
const internalFormData = reactive({ ...props.formData })

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

watch(
  () => props.formData,
  (newVal) => {
    Object.assign(internalFormData, newVal)
  },
  { deep: true }
)

const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...internalFormData })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

defineExpose({
  formRef,
  resetFields: () => formRef.value?.resetFields(),
  validate: () => formRef.value?.validate()
})
</script>

<style scoped>
.form-dialog-content {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}

.form-dialog-content::-webkit-scrollbar {
  width: 6px;
}

.form-dialog-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 2vh auto !important;
  }

  .form-dialog-content {
    max-height: 50vh;
  }
}
</style>
