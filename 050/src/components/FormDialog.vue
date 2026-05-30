<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-width="labelWidth"
    >
      <slot :form="formData" :is-edit="isEdit"></slot>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        <el-icon><Check /></el-icon>
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Props<T> {
  visible: boolean
  data?: T | null
  title?: string
  width?: string
  labelWidth?: string
  rules?: FormRules
}

interface Emits<T> {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: T): void
}

const props = withDefaults(defineProps<Props<Record<string, unknown>>>(), {
  title: '',
  width: '600px',
  labelWidth: '100px',
  rules: () => ({})
})

const emit = defineEmits<Emits<Record<string, unknown>>>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const formData = reactive<Record<string, unknown>>({})

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isEdit = computed(() => !!props.data)

watch(() => props.data, (data) => {
  if (data) {
    Object.assign(formData, data)
  } else {
    Object.keys(formData).forEach(key => {
      delete formData[key]
    })
  }
}, { immediate: true, deep: true })

const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    emit('submit', { ...formData })
  } catch {
    // 验证失败
  } finally {
    loading.value = false
  }
}

defineExpose({
  formRef,
  formData
})
</script>
