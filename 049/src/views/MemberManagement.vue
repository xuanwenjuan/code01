<template>
  <div class="member-management">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="会员列表" name="member">
        <SearchForm
          :initial-values="memberSearchForm"
          @search="handleMemberSearch"
          @reset="handleMemberReset"
        >
          <template #default="{ formData }">
            <el-form-item label="姓名">
              <el-input
                v-model="formData.name"
                placeholder="请输入会员姓名"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input
                v-model="formData.phone"
                placeholder="请输入手机号"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="会员等级">
              <el-select
                v-model="formData.memberLevel"
                placeholder="请选择等级"
                clearable
                style="width: 150px"
              >
                <el-option label="普通会员" value="普通会员" />
                <el-option label="银卡会员" value="银卡会员" />
                <el-option label="金卡会员" value="金卡会员" />
                <el-option label="钻石会员" value="钻石会员" />
              </el-select>
            </el-form-item>
          </template>
        </SearchForm>

        <el-table
          :data="paginatedMembers"
          border
          stripe
          style="width: 100%"
          v-loading="store.loading.memberList"
        >
          <el-table-column prop="name" label="姓名" min-width="120">
            <template #default="{ row }">
              <div class="name-cell">
                <el-avatar :size="36" :src="row.avatar" />
                <span class="name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="memberLevel" label="会员等级" width="120">
            <template #default="{ row }">
              <el-tag :type="getLevelType(row.memberLevel)" effect="dark">
                {{ row.memberLevel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="注册时间" min-width="180" />
          <template #empty>
            <EmptyState description="暂无会员数据" />
          </template>
        </el-table>

        <Pagination
          v-model="store.pagination.member.page"
          :total="filteredMembers.length"
          :page-size="store.pagination.member.pageSize"
          @size-change="handleMemberSizeChange"
        />
      </el-tab-pane>

      <el-tab-pane label="购课记录" name="purchase">
        <SearchForm
          :initial-values="purchaseSearchForm"
          @search="handlePurchaseSearch"
          @reset="handlePurchaseReset"
        >
          <template #default="{ formData }">
            <el-form-item label="会员姓名">
              <el-input
                v-model="formData.memberName"
                placeholder="请输入会员姓名"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="课程名称">
              <el-input
                v-model="formData.courseName"
                placeholder="请输入课程名称"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="formData.status"
                placeholder="请选择状态"
                clearable
                style="width: 150px"
              >
                <el-option label="有效" value="valid" />
                <el-option label="已过期" value="expired" />
                <el-option label="已用完" value="usedup" />
              </el-select>
            </el-form-item>
          </template>
        </SearchForm>

        <el-table :data="store.purchaseRecords" border stripe style="width: 100%">
          <el-table-column prop="memberName" label="会员姓名" width="120" />
          <el-table-column prop="courseName" label="课程名称" min-width="150" />
          <el-table-column prop="totalHours" label="总课时" width="100" align="center" />
          <el-table-column prop="remainingHours" label="剩余课时" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.remainingHours > 0 ? 'success' : 'danger'" effect="dark">
                {{ row.remainingHours }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="purchaseDate" label="购课日期" width="180" />
          <el-table-column prop="expireDate" label="到期日期" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" effect="dark">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <template #empty>
            <EmptyState description="暂无购课记录" />
          </template>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="约课记录" name="booking">
        <div class="table-header">
          <el-button type="primary" @click="handleAddBooking">
            <el-icon><Plus /></el-icon>
            新增约课
          </el-button>
        </div>

        <SearchForm
          :initial-values="bookingSearchForm"
          @search="handleBookingSearch"
          @reset="handleBookingReset"
        >
          <template #default="{ formData }">
            <el-form-item label="会员姓名">
              <el-input
                v-model="formData.memberName"
                placeholder="请输入会员姓名"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="教练">
              <el-input
                v-model="formData.coachName"
                placeholder="请输入教练姓名"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="formData.status"
                placeholder="请选择状态"
                clearable
                style="width: 150px"
              >
                <el-option label="已约" value="booked" />
                <el-option label="已完成" value="completed" />
                <el-option label="已取消" value="cancelled" />
                <el-option label="已过期" value="expired" />
              </el-select>
            </el-form-item>
          </template>
        </SearchForm>

        <el-table
          :data="store.bookings"
          border
          stripe
          style="width: 100%"
          v-loading="store.loading.bookingList"
        >
          <el-table-column prop="memberName" label="会员姓名" width="120" />
          <el-table-column prop="courseName" label="课程名称" min-width="150" />
          <el-table-column prop="coachName" label="教练" width="120" />
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="timeSlot" label="时段" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getBookingStatusType(row.status)" effect="dark">
                {{ getBookingStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'booked'"
                link
                type="success"
                @click="handleComplete(row)"
              >
                完成
              </el-button>
              <el-button
                v-if="row.status === 'booked'"
                link
                type="danger"
                @click="handleCancel(row)"
              >
                取消
              </el-button>
            </template>
          </el-table-column>
          <template #empty>
            <EmptyState description="暂无约课记录" />
          </template>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <FormDialog
      v-model="bookingDialogVisible"
      title="新增约课"
      :form-data="bookingForm"
      :rules="bookingRules"
      width="600px"
      :loading="bookingLoading"
      @submit="handleSubmitBooking"
    >
      <template #default="{ formData }">
        <el-form-item label="会员" prop="memberId">
          <el-select
            v-model="formData.memberId"
            placeholder="请选择会员"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="m in store.members"
              :key="m.id"
              :label="m.name"
              :value="m.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="courseId">
          <el-select
            v-model="formData.courseId"
            placeholder="请选择课程"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="c in store.onlineCourses"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教练" prop="coachId">
          <el-select
            v-model="formData.coachId"
            placeholder="请选择教练"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="c in store.activeCoaches"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="formData.date"
            type="date"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        <el-form-item label="时段" prop="timeSlot">
          <el-select v-model="formData.timeSlot" placeholder="请选择时段" style="width: 100%">
            <el-option
              v-for="slot in availableTimeSlots"
              :key="slot.value"
              :label="slot.label"
              :value="slot.value"
              :disabled="slot.disabled"
            />
          </el-select>
          <div v-if="conflictWarning" class="conflict-warning">
            <el-icon class="warning-icon"><Warning /></el-icon>
            <span>{{ conflictWarning }}</span>
          </div>
        </el-form-item>
      </template>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import Pagination from '@/components/Pagination.vue'
import EmptyState from '@/components/EmptyState.vue'
import type {
  Member,
  MemberLevel,
  PurchaseRecord,
  Booking,
  BookingStatus,
  PurchaseStatus,
  BookingForm,
  MemberSearchParams,
  BookingSearchParams
} from '@/types'

const store = useAppStore()
const activeTab = ref('member')
const bookingDialogVisible = ref(false)
const bookingLoading = ref(false)
const conflictWarning = ref('')

const memberSearchForm = reactive<MemberSearchParams>({
  name: '',
  phone: '',
  memberLevel: ''
})

const purchaseSearchForm = reactive({
  memberName: '',
  courseName: '',
  status: '' as PurchaseStatus | ''
})

const bookingSearchForm = reactive<BookingSearchParams>({
  memberName: '',
  coachName: '',
  status: ''
})

const filteredMembers = computed<Member[]>(() => {
  return store.members.filter(member => {
    const matchName = !memberSearchForm.name || member.name.includes(memberSearchForm.name)
    const matchPhone = !memberSearchForm.phone || member.phone.includes(memberSearchForm.phone)
    const matchLevel = !memberSearchForm.memberLevel || member.memberLevel === memberSearchForm.memberLevel
    return matchName && matchPhone && matchLevel
  })
})

const paginatedMembers = computed<Member[]>(() => {
  const { page, pageSize } = store.pagination.member
  const start = (page - 1) * pageSize
  return filteredMembers.value.slice(start, start + pageSize)
})

const bookingForm = reactive<BookingForm>({
  memberId: '',
  courseId: '',
  coachId: '',
  date: '',
  timeSlot: ''
})

const bookingRules = {
  memberId: [{ required: true, message: '请选择会员', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  coachId: [{ required: true, message: '请选择教练', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  timeSlot: [{ required: true, message: '请选择时段', trigger: 'change' }]
}

const timeSlotOptions = [
  { label: '09:00-10:00', value: '09:00-10:00' },
  { label: '10:00-11:00', value: '10:00-11:00' },
  { label: '11:00-12:00', value: '11:00-12:00' },
  { label: '14:00-15:00', value: '14:00-15:00' },
  { label: '15:00-16:00', value: '15:00-16:00' },
  { label: '16:00-17:00', value: '16:00-17:00' },
  { label: '17:00-18:00', value: '17:00-18:00' },
  { label: '18:00-19:00', value: '18:00-19:00' },
  { label: '19:00-20:00', value: '19:00-20:00' }
]

const availableTimeSlots = computed(() => {
  if (!bookingForm.coachId || !bookingForm.date) {
    return timeSlotOptions.map(slot => ({ ...slot, disabled: false }))
  }

  const bookedSlots = store.getBookingsByCoachAndDate(bookingForm.coachId, bookingForm.date)
  const bookedTimeSlots = bookedSlots.map(b => b.timeSlot)

  return timeSlotOptions.map(slot => ({
    ...slot,
    disabled: bookedTimeSlots.includes(slot.value)
  }))
})

watch([() => bookingForm.coachId, () => bookingForm.date, () => bookingForm.timeSlot], () => {
  if (bookingForm.coachId && bookingForm.date && bookingForm.timeSlot) {
    const hasConflict = store.checkBookingConflict(bookingForm)
    if (hasConflict) {
      conflictWarning.value = '该时段已被预约，请选择其他时段'
    } else {
      conflictWarning.value = ''
    }
  } else {
    conflictWarning.value = ''
  }
})

const disabledDate = (time: Date): boolean => {
  return time.getTime() < Date.now() - 8.64e7
}

const getLevelType = (level: MemberLevel): string => {
  const map: Record<MemberLevel, string> = {
    '普通会员': 'info',
    '银卡会员': '',
    '金卡会员': 'warning',
    '钻石会员': 'danger'
  }
  return map[level] || 'info'
}

const getStatusType = (status: PurchaseStatus): string => {
  const map: Record<PurchaseStatus, string> = {
    valid: 'success',
    expired: 'info',
    usedup: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: PurchaseStatus): string => {
  const map: Record<PurchaseStatus, string> = {
    valid: '有效',
    expired: '已过期',
    usedup: '已用完'
  }
  return map[status] || status
}

const getBookingStatusType = (status: BookingStatus): string => {
  const map: Record<BookingStatus, string> = {
    booked: 'primary',
    completed: 'success',
    cancelled: 'info',
    expired: 'danger'
  }
  return map[status] || 'info'
}

const getBookingStatusText = (status: BookingStatus): string => {
  const map: Record<BookingStatus, string> = {
    booked: '已约',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已过期'
  }
  return map[status] || status
}

const handleMemberSearch = (): void => {
  store.pagination.member.page = 1
  ElMessage.success('搜索完成')
}

const handleMemberReset = (): void => {
  store.pagination.member.page = 1
  ElMessage.info('已重置搜索条件')
}

const handleMemberSizeChange = (size: number): void => {
  store.pagination.member.pageSize = size
  store.pagination.member.page = 1
}

const handlePurchaseSearch = (): void => {
  ElMessage.success('搜索完成')
}

const handlePurchaseReset = (): void => {
  ElMessage.info('已重置搜索条件')
}

const handleBookingSearch = (): void => {
  ElMessage.success('搜索完成')
}

const handleBookingReset = (): void => {
  ElMessage.info('已重置搜索条件')
}

const handleAddBooking = (): void => {
  Object.assign(bookingForm, {
    memberId: '',
    courseId: '',
    coachId: '',
    date: '',
    timeSlot: ''
  })
  conflictWarning.value = ''
  bookingDialogVisible.value = true
}

const handleComplete = (row: Booking): void => {
  store.updateBookingStatus(row.id, 'completed')
  ElMessage.success('已完成')
}

const handleCancel = (row: Booking): void => {
  store.updateBookingStatus(row.id, 'cancelled')
  ElMessage.success('已取消')
}

const handleSubmitBooking = async (data: Record<string, unknown>): Promise<void> => {
  const formData = data as BookingForm

  // 双重检查冲突
  if (store.checkBookingConflict(formData)) {
    ElMessage.error('该时段已被预约，请选择其他时段')
    return
  }

  bookingLoading.value = true

  try {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    const member = store.members.find(m => m.id === formData.memberId)
    const course = store.courses.find(c => c.id === formData.courseId)
    const coach = store.coaches.find(c => c.id === formData.coachId)

    const newBooking: Booking = {
      ...formData,
      id: Date.now().toString(),
      memberName: member?.name || '',
      courseName: course?.name || '',
      coachName: coach?.name || '',
      status: 'booked',
      createdAt: new Date().toISOString()
    }

    store.addBooking(newBooking)
    ElMessage.success('约课成功')
    bookingDialogVisible.value = false
  } finally {
    bookingLoading.value = false
  }
}
</script>

<style scoped>
.name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.name {
  font-weight: 500;
}

.table-header {
  margin-bottom: 16px;
}

.conflict-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 13px;
}

.warning-icon {
  font-size: 16px;
}
</style>
