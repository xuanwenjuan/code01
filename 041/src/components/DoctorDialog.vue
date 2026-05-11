<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Doctor, Department, DoctorTitle, DoctorStatus } from '@/types'
import { useHospitalStore } from '@/stores/hospital'

const props = defineProps<{
  visible: boolean
  doctor?: Doctor | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'saved'): void
}>()

const store = useHospitalStore()

const isEdit = computed(() => !!props.doctor)
const dialogTitle = computed(() => isEdit.value ? '编辑医生' : '添加医生')

const formData = ref({
  name: '',
  title: '主治医师' as DoctorTitle,
  departmentId: '',
  specialty: '',
  status: 'normal' as DoctorStatus
})

const rules = {
  name: [{ required: true, message: '请输入医生姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请选择职称', trigger: 'change' }],
  departmentId: [{ required: true, message: '请选择科室', trigger: 'change' }],
  specialty: [{ required: true, message: '请输入擅长领域', trigger: 'blur' }]
}

const titleOptions: { label: string; value: DoctorTitle }[] = [
  { label: '主任医师', value: '主任医师' },
  { label: '副主任医师', value: '副主任医师' },
  { label: '主治医师', value: '主治医师' },
  { label: '住院医师', value: '住院医师' },
  { label: '专家', value: '专家' }
]

const statusOptions: { label: string; value: DoctorStatus }[] = [
  { label: '正常出诊', value: 'normal' },
  { label: '停诊', value: 'stop' },
  { label: '替诊', value: 'substitute' }
]

watch(() => props.visible, (val) => {
  if (val && props.doctor) {
    formData.value = {
      name: props.doctor.name,
      title: props.doctor.title,
      departmentId: props.doctor.departmentId,
      specialty: props.doctor.specialty,
      status: props.doctor.status
    }
  } else if (val) {
    formData.value = {
      name: '',
      title: '主治医师',
      departmentId: '',
      specialty: '',
      status: 'normal'
    }
  }
})

const handleSubmit = async (formEl: any) => {
  if (!formEl) return
  
  await formEl.validate(async (valid: boolean) => {
    if (valid) {
      if (isEdit.value && props.doctor) {
        const dept = store.departments.find(d => d.id === formData.value.departmentId)
        Object.assign(props.doctor, {
          ...formData.value,
          departmentName: dept?.name || '',
          hospitalId: dept?.hospitalId || '',
          hospitalName: dept?.hospitalName || ''
        })
        store.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '编辑医生信息',
          operationDetail: `编辑医生信息：${props.doctor.name}`
        })
        ElMessage.success('医生信息更新成功')
      } else {
        const dept = store.departments.find(d => d.id === formData.value.departmentId)
        const newDoctor: Doctor = {
          id: `DOC${String(store.doctors.length + 1).padStart(3, '0')}`,
          ...formData.value,
          departmentName: dept?.name || '',
          hospitalId: dept?.hospitalId || '',
          hospitalName: dept?.hospitalName || '',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
        }
        store.doctors.unshift(newDoctor)
        store.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '添加医生',
          operationDetail: `添加新医生：${newDoctor.name}`
        })
        ElMessage.success('医生添加成功')
      }
      emit('update:visible', false)
      emit('saved')
    }
  })
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    v-model="visible"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="医生姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入医生姓名" />
      </el-form-item>
      
      <el-form-item label="职称" prop="title">
        <el-select v-model="formData.title" placeholder="请选择职称" style="width: 100%">
          <el-option
            v-for="item in titleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="所属科室" prop="departmentId">
        <el-select v-model="formData.departmentId" placeholder="请选择科室" style="width: 100%">
          <el-option
            v-for="dept in store.departments"
            :key="dept.id"
            :label="`${dept.hospitalName} - ${dept.name}`"
            :value="dept.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="擅长领域" prop="specialty">
        <el-input
          v-model="formData.specialty"
          type="textarea"
          :rows="2"
          placeholder="请输入擅长领域"
        />
      </el-form-item>
      
      <el-form-item label="出诊状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit(formRef)">确定</el-button>
    </template>
  </el-dialog>
</template>
