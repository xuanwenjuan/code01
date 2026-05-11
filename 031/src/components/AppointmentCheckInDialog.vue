<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
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

    <template v-if="mode === 'book'">
      <el-form ref="formRef" :model="bookForm" :rules="bookRules" label-width="100px">
        <el-form-item label="会员" prop="memberId">
          <el-select
            v-model="bookForm.memberId"
            placeholder="请选择会员"
            filterable
            style="width: 100%"
            @change="handleMemberChange"
          >
            <el-option
              v-for="member in availableMembers"
              :key="member.id"
              :label="`${member.name} - ${member.cardNumber} (${getCardTypeName(member.cardType)})`"
              :value="member.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="courseId">
          <el-select
            v-model="bookForm.courseId"
            placeholder="请选择课程"
            style="width: 100%"
            @change="handleCourseChange"
          >
            <el-option
              v-for="course in availableCourses"
              :key="course.id"
              :label="`${course.name} (${course.date} ${course.startTime}-${course.endTime}) - ${course.coachName}`"
              :value="course.id"
            >
              <div class="flex-between">
                <span>{{ course.name }}</span>
                <el-tag :type="course.currentParticipants >= course.maxParticipants ? 'danger' : 'success'" size="small">
                  {{ course.currentParticipants }}/{{ course.maxParticipants }}人
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="bookForm.remarks" type="textarea" :rows="2" placeholder="请输入备注（可选）" />
        </el-form-item>
      </el-form>
    </template>

    <template v-else-if="mode === 'checkIn'">
      <el-descriptions :column="1" border v-if="appointment">
        <el-descriptions-item label="会员">{{ appointment.memberName }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ appointment.phone }}</el-descriptions-item>
        <el-descriptions-item label="课程">{{ appointment.courseName }}</el-descriptions-item>
        <el-descriptions-item label="教练">{{ appointment.coachName }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">
          {{ formatDateTime(appointment.appointmentTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="预约状态">
          <el-tag type="warning" size="small">已预约</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div class="check-in-confirm mt-10">
        <el-alert
          title="确认签到？签到后次卡将自动扣减一次。"
          type="info"
          show-icon
          :closable="false"
        />
      </div>
    </template>

    <template v-else-if="mode === 'view'">
      <el-descriptions :column="1" border v-if="appointment">
        <el-descriptions-item label="会员">{{ appointment.memberName }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ appointment.phone }}</el-descriptions-item>
        <el-descriptions-item label="课程">{{ appointment.courseName }}</el-descriptions-item>
        <el-descriptions-item label="教练">{{ appointment.coachName }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">
          {{ formatDateTime(appointment.appointmentTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="签到时间">
          {{ appointment.checkInTime ? formatDateTime(appointment.checkInTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="取消时间">
          {{ appointment.cancelTime ? formatDateTime(appointment.cancelTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(appointment.status)" size="small">
            {{ getStatusText(appointment.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ appointment.operatorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ appointment.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>
    </template>

    <template v-else-if="mode === 'cancel'">
      <el-descriptions :column="1" border v-if="appointment">
        <el-descriptions-item label="会员">{{ appointment.memberName }}</el-descriptions-item>
        <el-descriptions-item label="课程">{{ appointment.courseName }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">
          {{ formatDateTime(appointment.appointmentTime) }}
        </el-descriptions-item>
      </el-descriptions>
      <el-form ref="cancelFormRef" :model="cancelForm" :rules="cancelRules" label-width="100px" class="mt-10">
        <el-form-item label="取消原因" prop="reason">
          <el-input
            v-model="cancelForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入取消原因"
          />
        </el-form-item>
      </el-form>
    </template>

    <template #footer>
      <template v-if="mode === 'view'">
        <el-button @click="handleClose">关闭</el-button>
      </template>
      <template v-else>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          {{ confirmButtonText }}
        </el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Member, Course, Appointment, AppointmentStatus, CardType } from '@/types'
import { useMemberStore } from '@/stores/member'
import { getCardTypeName, formatDateTime } from '@/utils/date'

type DialogMode = 'book' | 'checkIn' | 'view' | 'cancel'

interface Props {
  modelValue: boolean
  mode: DialogMode
  appointment?: Appointment | null
  members?: Member[]
  courses?: Course[]
}

const props = withDefaults(defineProps<Props>(), {
  appointment: null,
  members: () => [],
  courses: () => [],
})

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (
    e: 'book',
    data: Omit<Appointment, 'id' | 'status' | 'appointmentTime' | 'createTime' | 'updateTime'>
  ): void
  (e: 'checkIn', appointment: Appointment): void
  (e: 'cancel', appointment: Appointment, reason: string): void
}

const emit = defineEmits<Emits>()

const memberStore = useMemberStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref<FormInstance>()
const cancelFormRef = ref<FormInstance>()
const loading = ref(false)
const conflictMessage = ref('')

interface BookForm {
  memberId: string
  courseId: string
  memberName: string
  phone: string
  courseName: string
  coachName: string
  remarks: string
}

const bookForm = reactive<BookForm>({
  memberId: '',
  courseId: '',
  memberName: '',
  phone: '',
  courseName: '',
  coachName: '',
  remarks: '',
})

interface CancelForm {
  reason: string
}

const cancelForm = reactive<CancelForm>({
  reason: '',
})

const bookRules: FormRules = {
  memberId: [{ required: true, message: '请选择会员', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
}

const cancelRules: FormRules = {
  reason: [
    { required: true, message: '请输入取消原因', trigger: 'blur' },
    { min: 2, message: '原因至少2个字符', trigger: 'blur' },
  ],
}

const dialogTitle = computed(() => {
  const titles: Record<DialogMode, string> = {
    book: '预约课程',
    checkIn: '签到确认',
    view: '预约详情',
    cancel: '取消预约',
  }
  return titles[props.mode]
})

const confirmButtonText = computed(() => {
  const texts: Record<DialogMode, string> = {
    book: '确定预约',
    checkIn: '确认签到',
    view: '关闭',
    cancel: '确认取消',
  }
  return texts[props.mode]
})

const availableMembers = computed(() => {
  return props.members.filter((m) => m.status === 'normal')
})

const availableCourses = computed(() => {
  return props.courses.filter(
    (c) => c.status === 'upcoming' && c.currentParticipants < c.maxParticipants
  )
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      resetForm()
    }
  }
)

function resetForm() {
  Object.assign(bookForm, {
    memberId: '',
    courseId: '',
    memberName: '',
    phone: '',
    courseName: '',
    coachName: '',
    remarks: '',
  })
  Object.assign(cancelForm, {
    reason: '',
  })
  conflictMessage.value = ''
}

async function handleMemberChange(memberId: string) {
  const member = props.members.find((m) => m.id === memberId)
  if (member) {
    bookForm.memberName = member.name
    bookForm.phone = member.phone
  }
  await checkConflict()
}

function handleCourseChange(courseId: string) {
  const course = props.courses.find((c) => c.id === courseId)
  if (course) {
    bookForm.courseName = course.name
    bookForm.coachName = course.coachName
  }
}

async function checkConflict() {
  if (!bookForm.memberId || !bookForm.courseId) {
    conflictMessage.value = ''
    return
  }
  const course = props.courses.find((c) => c.id === bookForm.courseId)
  if (!course) return

  const result = await memberStore.checkConflict(bookForm.memberId, course.date, bookForm.courseId)
  conflictMessage.value = result.hasConflict ? result.message || '' : ''
}

function getStatusTagType(status: AppointmentStatus): 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<AppointmentStatus, 'success' | 'warning' | 'info' | 'danger'> = {
    booked: 'warning',
    checked_in: 'success',
    cancelled: 'info',
  }
  return map[status]
}

function getStatusText(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    booked: '已预约',
    checked_in: '已签到',
    cancelled: '已取消',
  }
  return map[status]
}

function handleClose() {
  formRef.value?.resetFields()
  cancelFormRef.value?.resetFields()
  visible.value = false
}

async function handleConfirm() {
  if (props.mode === 'book') {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (valid) {
        loading.value = true
        try {
          emit('book', {
            memberId: bookForm.memberId,
            memberName: bookForm.memberName,
            phone: bookForm.phone,
            courseId: bookForm.courseId,
            courseName: bookForm.courseName,
            coachName: bookForm.coachName,
            remarks: bookForm.remarks,
          })
        } finally {
          loading.value = false
        }
      }
    })
  } else if (props.mode === 'checkIn' && props.appointment) {
    loading.value = true
    try {
      emit('checkIn', props.appointment)
    } finally {
      loading.value = false
    }
  } else if (props.mode === 'cancel' && props.appointment) {
    if (!cancelFormRef.value) return
    await cancelFormRef.value.validate((valid) => {
      if (valid) {
        loading.value = true
        try {
          emit('cancel', props.appointment!, cancelForm.reason)
        } finally {
          loading.value = false
        }
      }
    })
  }
}
</script>

<style scoped>
.mb-10 {
  margin-bottom: 10px;
}

.mt-10 {
  margin-top: 10px;
}

.check-in-confirm {
  padding: 10px 0;
}
</style>
