<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { MedicationReminder, MedicationStatus, FamilyMember, Medicine } from '@/types'
import { useReminderStore } from '@/stores/reminder'
import { useMedicineStore } from '@/stores/medicine'
import { getTodayString } from '@/utils/date'

interface ReminderFormData {
  medicineId: string
  medicineName: string
  memberId: string
  memberName: string
  dosage: string
  scheduledTime: string
  date: string
  status: MedicationStatus
  actualTime: string | null
  createdAt: string
  updatedAt: string
}

interface SelectOption {
  value: string
  label: string
}

interface Props {
  visible: boolean
  reminder?: MedicationReminder | null
}

const props = withDefaults(defineProps<Props>(), {
  reminder: null
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const reminderStore = useReminderStore()
const medicineStore = useMedicineStore()

const isEdit = computed<boolean>(() => !!props.reminder)
const dialogTitle = computed<string>(() => isEdit.value ? '编辑用药提醒' : '新增用药提醒')

const formData = ref<ReminderFormData>({
  medicineId: '',
  medicineName: '',
  memberId: '',
  memberName: '',
  dosage: '',
  scheduledTime: '',
  date: getTodayString(),
  status: 'pending',
  actualTime: null,
  createdAt: '',
  updatedAt: ''
})

const memberOptions = computed<SelectOption[]>(() => {
  return reminderStore.familyMembers.map((m: FamilyMember) => ({
    value: m.id,
    label: `${m.name} (${m.relation})`
  }))
})

const medicineOptions = computed<SelectOption[]>(() => {
  return medicineStore.medicines.map((m: Medicine) => ({
    value: m.id,
    label: m.name
  }))
})

const formRef = ref<FormInstance>()

const rules: FormRules = {
  memberId: [{ required: true, message: '请选择家庭成员', trigger: 'change' }],
  medicineId: [{ required: true, message: '请选择药品', trigger: 'change' }],
  dosage: [{ required: true, message: '请输入用量', trigger: 'blur' }],
  scheduledTime: [{ required: true, message: '请选择提醒时间', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

function resetForm(): void {
  formData.value = {
    medicineId: '',
    medicineName: '',
    memberId: '',
    memberName: '',
    dosage: '',
    scheduledTime: '',
    date: getTodayString(),
    status: 'pending',
    actualTime: null,
    createdAt: '',
    updatedAt: ''
  }
}

watch(
  () => props.visible,
  (val: boolean) => {
    if (val) {
      resetForm()
      if (props.reminder) {
        formData.value = {
          medicineId: props.reminder.medicineId,
          medicineName: props.reminder.medicineName,
          memberId: props.reminder.memberId,
          memberName: props.reminder.memberName,
          dosage: props.reminder.dosage,
          scheduledTime: props.reminder.scheduledTime,
          date: props.reminder.date,
          status: props.reminder.status,
          actualTime: props.reminder.actualTime,
          createdAt: props.reminder.createdAt,
          updatedAt: props.reminder.updatedAt
        }
      }
    }
  }
)

function handleMemberChange(val: string): void {
  const member = reminderStore.getMemberById(val)
  if (member) {
    formData.value.memberName = member.name
  }
}

function handleMedicineChange(val: string): void {
  const medicine = medicineStore.getMedicineById(val)
  if (medicine) {
    formData.value.medicineName = medicine.name
  }
}

function handleClose(): void {
  emit('update:visible', false)
  resetForm()
}

async function handleSubmit(): Promise<void> {
  if (!formRef.value) return
  await formRef.value.validate()
  
  const reminderData = {
    medicineId: formData.value.medicineId,
    medicineName: formData.value.medicineName,
    memberId: formData.value.memberId,
    memberName: formData.value.memberName,
    dosage: formData.value.dosage,
    scheduledTime: formData.value.scheduledTime,
    date: formData.value.date,
    status: 'pending' as const,
    actualTime: null
  }
  
  if (isEdit.value && props.reminder) {
    reminderStore.updateReminder(props.reminder.id, {
      ...reminderData,
      createdAt: props.reminder.createdAt
    })
    ElMessage.success('用药提醒更新成功')
  } else {
    reminderStore.addReminder(reminderData)
    ElMessage.success('用药提醒添加成功')
  }
  
  emit('success')
  handleClose()
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="500px"
    @update:model-value="(val: boolean) => emit('update:visible', val)"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="家庭成员" prop="memberId">
        <el-select 
          v-model="formData.memberId" 
          placeholder="请选择家庭成员" 
          style="width: 100%"
          @change="handleMemberChange"
        >
          <el-option
            v-for="item in memberOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="药品" prop="medicineId">
        <el-select 
          v-model="formData.medicineId" 
          placeholder="请选择药品" 
          style="width: 100%"
          @change="handleMedicineChange"
        >
          <el-option
            v-for="item in medicineOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用量" prop="dosage">
        <el-input v-model="formData.dosage" placeholder="如：1粒/1片" />
      </el-form-item>
      <el-form-item label="提醒时间" prop="scheduledTime">
        <el-time-picker
          v-model="formData.scheduledTime"
          placeholder="选择提醒时间"
          style="width: 100%"
          value-format="HH:mm"
        />
      </el-form-item>
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="formData.date"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
