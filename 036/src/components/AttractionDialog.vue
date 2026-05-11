<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑景点' : '添加景点'"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="景点名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入景点名称" />
      </el-form-item>

      <el-form-item label="位置" prop="location">
        <el-input v-model="formData.location" placeholder="请输入景点位置" />
      </el-form-item>

      <el-form-item label="计划日期" prop="plannedDate">
        <el-date-picker
          v-model="formData.plannedDate"
          type="date"
          placeholder="选择计划打卡日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入景点描述"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, type FormInstance, type FormRules, watch } from 'vue'
import type { Attraction } from '@/types'

const props = defineProps<{
  modelValue: boolean
  attraction?: Attraction | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: Omit<Attraction, 'id' | 'status'>): void
}>()

const formRef = ref<FormInstance>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.attraction)

interface FormData {
  name: string
  location: string
  plannedDate: string
  description: string
}

const initFormData = (): FormData => ({
  name: '',
  location: '',
  plannedDate: '',
  description: ''
})

const formData = ref<FormData>(initFormData())

const formRules: FormRules = {
  name: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入景点位置', trigger: 'blur' }],
  plannedDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }],
  description: [{ required: true, message: '请输入景点描述', trigger: 'blur' }]
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.attraction) {
        formData.value = {
          name: props.attraction.name,
          location: props.attraction.location,
          plannedDate: props.attraction.plannedDate,
          description: props.attraction.description
        }
      } else {
        formData.value = initFormData()
      }
    }
  }
)

const handleCancel = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  emit('submit', { ...formData.value })
  visible.value = false
}
</script>
