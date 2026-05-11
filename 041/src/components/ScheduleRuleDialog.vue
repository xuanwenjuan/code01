<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useHospitalStore } from '@/stores/hospital'
import type { ScheduleRule, ScheduleTime, Doctor, Department } from '@/types'

const props = defineProps<{
  visible: boolean
  doctorId?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const store = useHospitalStore()

const formRef = ref()
const loading = ref(false)

const defaultEndDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().split('T')[0]
})

const formData = ref({
  doctorId: '',
  departmentId: '',
  date: new Date().toISOString().split('T')[0],
  times: [] as ScheduleTime[],
  maxPatients: 25,
  repeatMode: 'none' as 'none' | 'daily' | 'weekly',
  repeatDays: [] as number[],
  repeatEndDate: defaultEndDate.value,
  notes: ''
})

const rules = {
  doctorId: [{ required: true, message: '请选择医生', trigger: 'change' }],
  departmentId: [{ required: true, message: '请选择科室', trigger: 'change' }],
  date: [{ required: true, message: '请选择起始日期', trigger: 'change' }],
  times: [
    { 
      required: true, 
      type: 'array' as const, 
      min: 1, 
      message: '请至少选择一个出诊时段', 
      trigger: 'change' 
    }
  ],
  maxPatients: [
    { required: true, message: '请输入最大接诊人数', trigger: 'blur' },
    { type: 'number' as const, min: 5, max: 50, message: '接诊人数应在5-50之间', trigger: 'blur' }
  ],
  repeatEndDate: [
    { 
      validator: (rule: any, value: string, callback: (error?: Error) => void) => {
        if (formData.value.repeatMode !== 'none' && !value) {
          callback(new Error('请选择重复结束日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const timeOptions = [
  { label: '上午 (08:00-12:00)', value: 'morning' },
  { label: '下午 (14:00-17:30)', value: 'afternoon' },
  { label: '夜间 (19:00-21:00)', value: 'night' }
]

const weekDays = [
  { label: '周日', value: 0 },
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 }
]

const availableDoctors = computed(() => {
  if (formData.value.departmentId) {
    return store.doctors.filter(d => d.departmentId === formData.value.departmentId && d.status !== 'stop')
  }
  return store.doctors.filter(d => d.status !== 'stop')
})

const filteredDepartments = computed(() => {
  return store.departments
})

watch(() => formData.value.departmentId, (deptId) => {
  if (deptId) {
    const doctors = store.doctors.filter(d => d.departmentId === deptId && d.status !== 'stop')
    if (!doctors.find(d => d.id === formData.value.doctorId)) {
      formData.value.doctorId = ''
    }
  }
})

watch(() => formData.value.doctorId, (docId) => {
  if (docId) {
    const doctor = store.doctors.find(d => d.id === docId)
    if (doctor) {
      formData.value.maxPatients = doctor.title === '专家' ? 15 : 25
    }
  }
})

watch(() => props.visible, (val) => {
  if (val) {
    resetForm()
    if (props.doctorId) {
      formData.value.doctorId = props.doctorId
      const doctor = store.doctors.find(d => d.id === props.doctorId)
      if (doctor) {
        formData.value.departmentId = doctor.departmentId
      }
    }
  }
})

const resetForm = () => {
  formData.value = {
    doctorId: props.doctorId || '',
    departmentId: '',
    date: new Date().toISOString().split('T')[0],
    times: [],
    maxPatients: 25,
    repeatMode: 'none',
    repeatDays: [],
    repeatEndDate: defaultEndDate.value,
    notes: ''
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      
      const doctor = store.doctors.find(d => d.id === formData.value.doctorId)
      if (!doctor) {
        ElMessage.error('医生信息不存在')
        loading.value = false
        return
      }
      
      const scheduleData = {
        doctorId: formData.value.doctorId,
        departmentId: formData.value.departmentId,
        date: formData.value.date,
        times: formData.value.times,
        maxPatients: Number(formData.value.maxPatients),
        repeatMode: formData.value.repeatMode,
        repeatDays: formData.value.repeatMode === 'weekly' ? formData.value.repeatDays : undefined,
        repeatEndDate: formData.value.repeatMode !== 'none' ? formData.value.repeatEndDate : undefined,
        isExpert: doctor.title === '专家',
        notes: formData.value.notes
      }
      
      const result = await store.createScheduleRule(scheduleData)
      
      loading.value = false
      
      if (result) {
        ElMessage.success(`排班创建成功！已生成 ${result.generatedCount} 个号源时段`)
        emit('update:visible', false)
        emit('success')
      } else {
        ElMessage.error('排班创建失败')
      }
    }
  })
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    title="设置排班"
    v-model="visible"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属科室" prop="departmentId">
            <el-select
              v-model="formData.departmentId"
              placeholder="请选择科室"
              style="width: 100%"
            >
              <el-option
                v-for="dept in filteredDepartments"
                :key="dept.id"
                :label="`${dept.hospitalName} - ${dept.name}`"
                :value="dept.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="医生" prop="doctorId">
            <el-select
              v-model="formData.doctorId"
              placeholder="请选择医生"
              style="width: 100%"
              :disabled="!!props.doctorId"
            >
              <el-option
                v-for="doctor in availableDoctors"
                :key="doctor.id"
                :label="`${doctor.name} (${doctor.title})`"
                :value="doctor.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="起始日期" prop="date">
            <el-date-picker
              v-model="formData.date"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              :disabled-date="(date) => date.getTime() < Date.now() - 86400000"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="最大接诊" prop="maxPatients">
            <el-input-number
              v-model="formData.maxPatients"
              :min="5"
              :max="50"
              :step="5"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="出诊时段" prop="times">
        <el-checkbox-group v-model="formData.times">
          <el-checkbox
            v-for="time in timeOptions"
            :key="time.value"
            :label="time.value"
          >
            {{ time.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      
      <el-divider content-position="left">重复设置</el-divider>
      
      <el-form-item label="重复模式">
        <el-radio-group v-model="formData.repeatMode">
          <el-radio label="none">不重复</el-radio>
          <el-radio label="daily">每日重复</el-radio>
          <el-radio label="weekly">每周重复</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item
        v-if="formData.repeatMode !== 'none'"
        label="结束日期"
        prop="repeatEndDate"
      >
        <el-date-picker
          v-model="formData.repeatEndDate"
          type="date"
          placeholder="选择结束日期"
          value-format="YYYY-MM-DD"
          :disabled-date="(date) => date.getTime() < new Date(formData.date).getTime()"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item
        v-if="formData.repeatMode === 'weekly'"
        label="重复周几"
      >
        <el-checkbox-group v-model="formData.repeatDays">
          <el-checkbox
            v-for="day in weekDays"
            :key="day.value"
            :label="day.value"
          >
            {{ day.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="formData.notes"
          type="textarea"
          :rows="2"
          placeholder="可选，输入排班备注"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        确认创建
      </el-button>
    </template>
  </el-dialog>
</template>
