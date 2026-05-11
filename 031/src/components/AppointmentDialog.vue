<template>
  <el-dialog
    v-model="visible"
    title="预约课程"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-alert
      v-if="conflictMessage"
      :title="conflictMessage"
      type="warning"
      show-icon
      :closable="false"
      class="mb-10"
    />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="会员" prop="memberId">
        <el-select
          v-model="form.memberId"
          placeholder="请选择会员"
          filterable
          style="width: 100%"
          @change="handleMemberChange"
        >
          <el-option
            v-for="member in members"
            :key="member.id"
            :label="`${member.name} - ${member.cardNumber}`"
            :value="member.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="课程" prop="courseId">
        <el-select
          v-model="form.courseId"
          placeholder="请选择课程"
          style="width: 100%"
          @change="handleCourseChange"
        >
          <el-option
            v-for="course in availableCourses"
            :key="course.id"
            :label="`${course.name} (${course.date} ${course.startTime}-${course.endTime}) - ${course.coachName}`"
            :value="course.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定预约</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Member, Course, Appointment } from '@/types'
import { useMemberStore } from '@/stores/member'

interface Props {
  modelValue: boolean
  members: Member[]
  courses: Course[]
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: Omit<Appointment, 'id' | 'status' | 'appointmentTime'>): void
}

const emit = defineEmits<Emits>()

const memberStore = useMemberStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const conflictMessage = ref('')

interface AppointmentForm {
  memberId: string
  courseId: string
  memberName: string
  phone: string
  courseName: string
  coachName: string
  remarks: string
}

const form = reactive<AppointmentForm>({
  memberId: '',
  courseId: '',
  memberName: '',
  phone: '',
  courseName: '',
  coachName: '',
  remarks: '',
})

const availableCourses = computed(() => {
  return props.courses.filter(
    (c) => c.status === 'upcoming' && c.currentParticipants < c.maxParticipants
  )
})

const rules: FormRules = {
  memberId: [{ required: true, message: '请选择会员', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      resetForm()
    }
  }
)

function resetForm() {
  Object.assign(form, {
    memberId: '',
    courseId: '',
    memberName: '',
    phone: '',
    courseName: '',
    coachName: '',
    remarks: '',
  })
  conflictMessage.value = ''
}

async function handleMemberChange(memberId: string) {
  const member = props.members.find((m) => m.id === memberId)
  if (member) {
    form.memberName = member.name
    form.phone = member.phone
  }
  await checkConflict()
}

function handleCourseChange(courseId: string) {
  const course = props.courses.find((c) => c.id === courseId)
  if (course) {
    form.courseName = course.name
    form.coachName = course.coachName
  }
}

async function checkConflict() {
  if (!form.memberId || !form.courseId) {
    conflictMessage.value = ''
    return
  }
  const course = props.courses.find((c) => c.id === form.courseId)
  if (!course) return

  const result = await memberStore.checkConflict(form.memberId, course.date, form.courseId)
  conflictMessage.value = result.hasConflict ? result.message || '' : ''
}

function handleClose() {
  formRef.value?.resetFields()
  visible.value = false
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', {
        memberId: form.memberId,
        memberName: form.memberName,
        phone: form.phone,
        courseId: form.courseId,
        courseName: form.courseName,
        coachName: form.coachName,
        remarks: form.remarks,
      })
    }
  })
}
</script>
