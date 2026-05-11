<template>
  <div class="appointments-page">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span>预约管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增预约
          </el-button>
        </div>
      </template>

      <el-form :model="filters" inline class="mb-10">
        <el-form-item label="预约状态">
          <el-select v-model="filters.appointmentStatus" placeholder="全部" clearable style="width: 150px">
            <el-option label="已预约" value="booked" />
            <el-option label="已签到" value="checked_in" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员">
          <el-input v-model="filters.memberName" placeholder="请输入会员姓名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="filters.phone" placeholder="请输入手机号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="课程">
          <el-input v-model="filters.courseName" placeholder="请输入课程名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="教练">
          <el-input v-model="filters.coachName" placeholder="请输入教练姓名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="appointmentStore.appointments" v-loading="appointmentStore.loading" style="width: 100%">
        <el-table-column prop="memberName" label="会员" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="courseName" label="课程" width="120" />
        <el-table-column prop="coachName" label="教练" width="100" />
        <el-table-column prop="appointmentTime" label="预约时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.appointmentTime) }}
          </template>
        </el-table-column>
        <el-table-column label="签到时间" width="180">
          <template #default="{ row }">
            {{ row.checkInTime ? formatDateTime(row.checkInTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="取消时间" width="180">
          <template #default="{ row }">
            {{ row.cancelTime ? formatDateTime(row.cancelTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAppointmentStatusTagType(row.status)" size="small">
              {{ getAppointmentStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'booked'"
              type="success"
              link
              size="small"
              @click="handleCheckIn(row)"
            >
              签到
            </el-button>
            <el-button
              v-if="row.status === 'booked'"
              type="danger"
              link
              size="small"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
            <el-button type="primary" link size="small" @click="handleView(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper mt-10">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="appointmentStore.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <AppointmentCheckInDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :appointment="currentAppointment"
      :members="allMembers"
      :courses="upcomingCourses"
      @book="handleBook"
      @checkIn="handleDialogCheckIn"
      @cancel="handleDialogCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import type { Appointment, AppointmentStatus, FilterOptions } from '@/types'
import { useAppointmentStore } from '@/stores/appointment'
import { useMemberStore } from '@/stores/member'
import { useCourseStore } from '@/stores/course'
import AppointmentCheckInDialog from '@/components/AppointmentCheckInDialog.vue'
import {
  formatDateTime,
  getAppointmentStatusName,
  getAppointmentStatusTagType,
} from '@/utils/date'

type DialogMode = 'book' | 'checkIn' | 'view' | 'cancel'

const appointmentStore = useAppointmentStore()
const memberStore = useMemberStore()
const courseStore = useCourseStore()

const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('book')
const currentAppointment = ref<Appointment | null>(null)

const filters = reactive<FilterOptions>({
  appointmentStatus: '',
  memberName: '',
  phone: '',
  courseName: '',
  coachName: '',
})

const allMembers = computed(() => memberStore.members)
const upcomingCourses = computed(() => courseStore.courses)

async function loadData() {
  await appointmentStore.fetchAppointments(currentPage.value, pageSize.value, filters)
}

function handleSearch() {
  currentPage.value = 1
  loadData()
}

function handleReset() {
  filters.appointmentStatus = ''
  filters.memberName = ''
  filters.phone = ''
  filters.courseName = ''
  filters.coachName = ''
  handleSearch()
}

function handleSizeChange(val: number) {
  pageSize.value = val
  loadData()
}

function handleCurrentChange(val: number) {
  currentPage.value = val
  loadData()
}

function handleAdd() {
  currentAppointment.value = null
  dialogMode.value = 'book'
  dialogVisible.value = true
}

function handleCheckIn(row: Appointment) {
  currentAppointment.value = row
  dialogMode.value = 'checkIn'
  dialogVisible.value = true
}

function handleCancel(row: Appointment) {
  currentAppointment.value = row
  dialogMode.value = 'cancel'
  dialogVisible.value = true
}

function handleView(row: Appointment) {
  currentAppointment.value = row
  dialogMode.value = 'view'
  dialogVisible.value = true
}

async function handleBook(
  data: Omit<Appointment, 'id' | 'status' | 'appointmentTime' | 'createTime' | 'updateTime'>
) {
  await appointmentStore.createAppointment(data)
  ElMessage.success('预约成功')
  dialogVisible.value = false
}

async function handleDialogCheckIn(appointment: Appointment) {
  await appointmentStore.checkIn(appointment.id, appointment.memberName, appointment.courseName)
  ElMessage.success('签到成功')
  dialogVisible.value = false
}

async function handleDialogCancel(appointment: Appointment, reason: string) {
  await appointmentStore.cancelAppointment(
    appointment.id,
    appointment.memberName,
    appointment.courseName,
    reason
  )
  ElMessage.success('取消成功')
  dialogVisible.value = false
}

onMounted(async () => {
  await Promise.all([
    loadData(),
    memberStore.fetchMembers(1, 100),
    courseStore.fetchUpcomingCourses(),
  ])
})

watch([currentPage, pageSize], () => {
  loadData()
})
</script>

<style scoped>
.appointments-page {
  min-height: 100%;
}

.mb-10 {
  margin-bottom: 10px;
}

.mt-10 {
  margin-top: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
