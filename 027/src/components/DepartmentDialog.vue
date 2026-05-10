<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="科室名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入科室名称" />
      </el-form-item>
      <el-form-item label="科室描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入科室描述"
        />
      </el-form-item>
      <el-form-item label="位置" prop="location">
        <el-input v-model="formData.location" placeholder="如：门诊楼1层A区" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="active">启用</el-radio>
          <el-radio value="inactive">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Department } from '@/types'

interface Props {
  visible: boolean
  title: string
  department?: Department | null
}

const props = withDefaults(defineProps<Props>(), {
  department: null
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: Partial<Department>): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const defaultFormData: Partial<Department> = {
  name: '',
  description: '',
  location: '',
  phone: '',
  status: 'active'
}

const formData = reactive<Partial<Department>>({ ...defaultFormData })

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入科室名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.department) {
        Object.assign(formData, props.department)
      } else {
        Object.assign(formData, defaultFormData)
      }
    }
  }
)

function handleClose() {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

async function handleSubmit() {
  await formRef.value?.validate()
  loading.value = true
  try {
    emit('submit', { ...formData })
  } finally {
    loading.value = false
  }
}
</script>
