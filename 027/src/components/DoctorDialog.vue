<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="600px"
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
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入医生姓名" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="formData.gender">
          <el-radio value="male">男</el-radio>
          <el-radio value="female">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input-number
          v-model="formData.age"
          :min="22"
          :max="70"
          placeholder="请输入年龄"
        />
      </el-form-item>
      <el-form-item label="职称" prop="title">
        <el-select v-model="formData.title" placeholder="请选择职称" style="width: 100%">
          <el-option
            v-for="item in titleLevels"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属科室" prop="departmentId">
        <el-select v-model="formData.departmentId" placeholder="请选择科室" style="width: 100%">
          <el-option
            v-for="dept in departments"
            :key="dept.id"
            :label="dept.name"
            :value="dept.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="电子邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入电子邮箱" />
      </el-form-item>
      <el-form-item label="专业特长" prop="specialty">
        <el-input
          v-model="formData.specialty"
          type="textarea"
          :rows="2"
          placeholder="请输入专业特长"
        />
      </el-form-item>
      <el-form-item label="学历" prop="education">
        <el-select v-model="formData.education" placeholder="请选择学历" style="width: 100%">
          <el-option label="博士" value="博士" />
          <el-option label="硕士" value="硕士" />
          <el-option label="本科" value="本科" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="on_duty">在岗</el-radio>
          <el-radio value="off_duty">离岗</el-radio>
          <el-radio value="leave">休假</el-radio>
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
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Doctor, Department, TitleLevel } from '@/types'
import { useSystemStore } from '@/stores/system'

interface Props {
  visible: boolean
  title: string
  doctor?: Doctor | null
}

const props = withDefaults(defineProps<Props>(), {
  doctor: null
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: Partial<Doctor>): void
}>()

const systemStore = useSystemStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const titleLevels = computed(() => systemStore.titleLevels)
const departments = computed(() => systemStore.activeDepartments)

const defaultFormData: Partial<Doctor> = {
  name: '',
  gender: 'male',
  age: 30,
  title: '主治医师',
  departmentId: '',
  phone: '',
  email: '',
  specialty: '',
  education: '本科',
  status: 'on_duty'
}

const formData = reactive<Partial<Doctor>>({ ...defaultFormData })

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入医生姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'change' }],
  title: [{ required: true, message: '请选择职称', trigger: 'change' }],
  departmentId: [{ required: true, message: '请选择科室', trigger: 'change' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  specialty: [{ required: true, message: '请输入专业特长', trigger: 'blur' }],
  education: [{ required: true, message: '请选择学历', trigger: 'change' }]
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.doctor) {
        Object.assign(formData, props.doctor)
      } else {
        Object.assign(formData, defaultFormData)
        if (departments.value.length > 0) {
          formData.departmentId = departments.value[0].id
          formData.title = titleLevels.value[0]
        }
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
