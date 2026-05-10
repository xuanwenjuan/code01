<template>
  <el-dialog
    :model-value="visible"
    title="患者挂号"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="新建患者" name="new">
        <el-form
          ref="patientFormRef"
          :model="patientForm"
          :rules="patientRules"
          label-width="100px"
        >
          <el-form-item label="姓名" prop="name">
            <el-input v-model="patientForm.name" placeholder="请输入患者姓名" />
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="patientForm.gender">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="年龄" prop="age">
            <el-input-number
              v-model="patientForm.age"
              :min="1"
              :max="120"
              placeholder="请输入年龄"
            />
          </el-form-item>
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="patientForm.idCard" placeholder="请输入身份证号" />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="patientForm.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="地址" prop="address">
            <el-input v-model="patientForm.address" placeholder="请输入地址" />
          </el-form-item>
          <el-form-item label="紧急联系人" prop="emergencyContact">
            <el-input v-model="patientForm.emergencyContact" placeholder="请输入紧急联系人" />
          </el-form-item>
          <el-form-item label="紧急电话" prop="emergencyPhone">
            <el-input v-model="patientForm.emergencyPhone" placeholder="请输入紧急联系电话" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="已有患者" name="existing">
        <el-form
          ref="existingFormRef"
          :model="existingForm"
          :rules="existingRules"
          label-width="100px"
        >
          <el-form-item label="患者搜索" prop="patientId">
            <el-select
              v-model="existingForm.patientId"
              filterable
              placeholder="搜索患者（姓名或电话）"
              style="width: 100%"
              :loading="searchingPatients"
              :filter-method="searchPatients"
            >
              <el-option
                v-for="patient in filteredPatients"
                :key="patient.id"
                :label="`${patient.name} - ${patient.phone}`"
                :value="patient.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <el-divider />

    <el-form
      ref="regFormRef"
      :model="registrationForm"
      :rules="registrationRules"
      label-width="100px"
    >
      <el-form-item label="挂号科室" prop="departmentId">
        <el-select
          v-model="registrationForm.departmentId"
          placeholder="请选择科室"
          style="width: 100%"
          @change="handleDepartmentChange"
        >
          <el-option
            v-for="dept in departments"
            :key="dept.id"
            :label="dept.name"
            :value="dept.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="挂号医生" prop="doctorId">
        <el-select
          v-model="registrationForm.doctorId"
          placeholder="请选择医生"
          style="width: 100%"
          :disabled="!registrationForm.departmentId"
        >
          <el-option
            v-for="doctor in availableDoctors"
            :key="doctor.id"
            :label="`${doctor.name} - ${doctor.title}`"
            :value="doctor.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="就诊日期" prop="scheduleDate">
        <el-date-picker
          v-model="registrationForm.scheduleDate"
          type="date"
          placeholder="选择就诊日期"
          style="width: 100%"
          :disabled-date="disabledDate"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="就诊时段" prop="timeSlot">
        <el-radio-group v-model="registrationForm.timeSlot">
          <el-radio value="morning">上午（8:00-12:00）</el-radio>
          <el-radio value="afternoon">下午（14:00-17:30）</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="主诉症状" prop="symptoms">
        <el-input
          v-model="registrationForm.symptoms"
          type="textarea"
          :rows="2"
          placeholder="请输入主诉症状（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确认挂号
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules, SelectOption } from 'element-plus'
import dayjs from 'dayjs'
import type { Patient, Department, Doctor } from '@/types'
import { useSystemStore } from '@/stores/system'
import { useClinicStore } from '@/stores/clinic'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const systemStore = useSystemStore()
const clinicStore = useClinicStore()

const activeTab = ref<'new' | 'existing'>('new')
const patientFormRef = ref<FormInstance>()
const existingFormRef = ref<FormInstance>()
const regFormRef = ref<FormInstance>()
const loading = ref(false)
const searchingPatients = ref(false)

const departments = computed(() => systemStore.activeDepartments)

const availableDoctors = computed(() => {
  if (!registrationForm.value.departmentId) return []
  return systemStore.getDoctorsByDepartment(registrationForm.value.departmentId)
})

const filteredPatients = computed(() => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return clinicStore.patients
  return clinicStore.patients.filter(p => 
    p.name.includes(keyword) || p.phone.includes(keyword)
  )
})

const searchKeyword = ref('')

const patientForm = reactive<Partial<Patient>>({
  name: '',
  gender: 'male',
  age: 30,
  idCard: '',
  phone: '',
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  medicalHistory: ''
})

const existingForm = reactive({
  patientId: ''
})

const registrationForm = reactive({
  departmentId: '',
  doctorId: '',
  scheduleDate: dayjs().format('YYYY-MM-DD'),
  timeSlot: 'morning' as 'morning' | 'afternoon',
  symptoms: ''
})

const patientRules: FormRules = {
  name: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'change' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const existingRules: FormRules = {
  patientId: [{ required: true, message: '请选择患者', trigger: 'change' }]
}

const registrationRules: FormRules = {
  departmentId: [{ required: true, message: '请选择科室', trigger: 'change' }],
  doctorId: [{ required: true, message: '请选择医生', trigger: 'change' }],
  scheduleDate: [{ required: true, message: '请选择就诊日期', trigger: 'change' }],
  timeSlot: [{ required: true, message: '请选择就诊时段', trigger: 'change' }]
}

function disabledDate(time: Date): boolean {
  return time.getTime() < Date.now() - 8.64e7
}

function searchPatients(keyword: string) {
  searchKeyword.value = keyword
}

function handleDepartmentChange() {
  registrationForm.doctorId = ''
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      resetForms()
      clinicStore.fetchPatients()
    }
  }
)

function resetForms() {
  activeTab.value = 'new'
  searchKeyword.value = ''
  Object.assign(patientForm, {
    name: '',
    gender: 'male',
    age: 30,
    idCard: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: ''
  })
  existingForm.patientId = ''
  Object.assign(registrationForm, {
    departmentId: '',
    doctorId: '',
    scheduleDate: dayjs().format('YYYY-MM-DD'),
    timeSlot: 'morning' as const,
    symptoms: ''
  })
}

function handleClose() {
  emit('update:visible', false)
}

async function handleSubmit() {
  let patientId = ''
  let patientName = ''

  if (activeTab.value === 'new') {
    await patientFormRef.value?.validate()
    const patient = await clinicStore.createPatient(patientForm)
    patientId = patient.id
    patientName = patient.name
  } else {
    await existingFormRef.value?.validate()
    const patient = clinicStore.patients.find(p => p.id === existingForm.patientId)
    if (patient) {
      patientId = patient.id
      patientName = patient.name
    }
  }

  await regFormRef.value?.validate()

  const doctor = systemStore.getDoctorById(registrationForm.doctorId)
  const dept = systemStore.getDepartmentById(registrationForm.departmentId)

  if (!doctor || !dept) return

  loading.value = true
  try {
    await clinicStore.createRegistration({
      patientId,
      patientName,
      doctorId: registrationForm.doctorId,
      doctorName: doctor.name,
      departmentId: registrationForm.departmentId,
      departmentName: dept.name,
      scheduleDate: registrationForm.scheduleDate,
      timeSlot: registrationForm.timeSlot,
      symptoms: registrationForm.symptoms
    })
    emit('success')
    emit('update:visible', false)
  } finally {
    loading.value = false
  }
}
</script>
