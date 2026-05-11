<template>
  <div class="members-page">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span>会员管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增会员
          </el-button>
        </div>
      </template>

      <el-form :model="filters" inline class="mb-10">
        <el-form-item label="卡种">
          <el-select v-model="filters.cardType" placeholder="全部" clearable style="width: 150px">
            <el-option label="月卡" value="month" />
            <el-option label="季卡" value="quarter" />
            <el-option label="年卡" value="year" />
            <el-option label="次卡" value="times" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员状态">
          <el-select v-model="filters.memberStatus" placeholder="全部" clearable style="width: 150px">
            <el-option label="正常" value="normal" />
            <el-option label="已过期" value="expired" />
            <el-option label="已冻结" value="frozen" />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="filters.memberName" placeholder="请输入姓名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="filters.phone" placeholder="请输入手机号" clearable style="width: 150px" />
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

      <el-table :data="memberStore.members" v-loading="memberStore.loading" style="width: 100%">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="cardNumber" label="会员卡号" width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="cardType" label="卡种" width="100">
          <template #default="{ row }">
            {{ getCardTypeName(row.cardType) }}
          </template>
        </el-table-column>
        <el-table-column label="到期日期" width="120">
          <template #default="{ row }">
            <span :class="{ 'text-danger': isExpired(row.expiryDate) }">
              {{ row.expiryDate || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="剩余" width="100">
          <template #default="{ row }">
            <span v-if="row.cardType === 'times'">{{ row.remainingTimes }}次</span>
            <span v-else-if="row.remainingDays !== undefined">{{ row.remainingDays }}天</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getMemberStatusTagType(row.status)" size="small">
              {{ getMemberStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额(元)" width="100">
          <template #default="{ row }">
            ¥{{ row.balance }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              v-if="row.status !== 'frozen'"
              type="warning"
              link
              size="small"
              @click="handleFreeze(row)"
            >
              冻结
            </el-button>
            <el-button v-else type="success" link size="small" @click="handleUnfreeze(row)">
              解冻
            </el-button>
            <el-button type="success" link size="small" @click="handleRenew(row)">
              续卡
            </el-button>
            <el-button type="primary" link size="small" @click="handleAppointment(row)">
              预约
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
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
          :total="memberStore.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <MemberDialog v-model="dialogVisible" :member="currentMember" @submit="handleMemberSubmit" />

    <AppointmentCheckInDialog
      v-model="appointmentDialogVisible"
      mode="book"
      :members="allMembers"
      :courses="upcomingCourses"
      @book="handleAppointmentSubmit"
    />

    <el-dialog v-model="renewDialogVisible" title="续卡" width="450px">
      <el-descriptions :column="1" border v-if="renewMember">
        <el-descriptions-item label="会员">{{ renewMember.name }}</el-descriptions-item>
        <el-descriptions-item label="卡种">{{ getCardTypeName(renewMember.cardType) }}</el-descriptions-item>
        <el-descriptions-item label="到期日期">
          <span :class="{ 'text-danger': isExpired(renewMember.expiryDate) }">
            {{ renewMember.expiryDate || '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="剩余">
          {{ renewMember.cardType === 'times' ? `${renewMember.remainingTimes}次` : `${renewMember.remainingDays}天` }}
        </el-descriptions-item>
      </el-descriptions>
      <el-form ref="renewFormRef" :model="renewForm" :rules="renewRules" label-width="100px" class="mt-10">
        <el-form-item label="续卡天数" prop="renewDays" v-if="renewMember?.cardType !== 'times'">
          <el-select v-model="renewForm.renewDays" placeholder="请选择续卡天数" style="width: 100%">
            <el-option label="30天（月卡）" :value="30" />
            <el-option label="90天（季卡）" :value="90" />
            <el-option label="365天（年卡）" :value="365" />
          </el-select>
        </el-form-item>
        <el-form-item label="续卡次数" prop="renewTimes" v-else>
          <el-select v-model="renewForm.renewTimes" placeholder="请选择续卡次数" style="width: 100%">
            <el-option label="10次" :value="10" />
            <el-option label="30次" :value="30" />
            <el-option label="50次" :value="50" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="renewLoading" @click="handleRenewSubmit">确认续卡</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Member, CardType, MemberStatus, FilterOptions, Appointment } from '@/types'
import { useMemberStore } from '@/stores/member'
import { useCourseStore } from '@/stores/course'
import { useAppointmentStore } from '@/stores/appointment'
import MemberDialog from '@/components/MemberDialog.vue'
import AppointmentCheckInDialog from '@/components/AppointmentCheckInDialog.vue'
import { getCardTypeName, getMemberStatusName, getMemberStatusTagType, isExpired } from '@/utils/date'

const memberStore = useMemberStore()
const courseStore = useCourseStore()
const appointmentStore = useAppointmentStore()

const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const appointmentDialogVisible = ref(false)
const renewDialogVisible = ref(false)
const currentMember = ref<Member | null>(null)
const renewMember = ref<Member | null>(null)
const renewFormRef = ref<FormInstance>()
const renewLoading = ref(false)

const filters = reactive<FilterOptions>({
  cardType: '',
  memberStatus: '',
  memberName: '',
  phone: '',
})

interface RenewForm {
  renewDays: number | undefined
  renewTimes: number | undefined
}

const renewForm = reactive<RenewForm>({
  renewDays: undefined,
  renewTimes: undefined,
})

const renewRules: FormRules = {
  renewDays: [
    {
      required: true,
      message: '请选择续卡天数',
      trigger: 'change',
      validator: (_rule, value, callback) => {
        if (renewMember.value?.cardType !== 'times' && !value) {
          callback(new Error('请选择续卡天数'))
        } else {
          callback()
        }
      },
    },
  ],
  renewTimes: [
    {
      required: true,
      message: '请选择续卡次数',
      trigger: 'change',
      validator: (_rule, value, callback) => {
        if (renewMember.value?.cardType === 'times' && !value) {
          callback(new Error('请选择续卡次数'))
        } else {
          callback()
        }
      },
    },
  ],
}

const allMembers = computed(() => memberStore.members)
const upcomingCourses = computed(() => courseStore.courses)

async function loadData() {
  await memberStore.fetchMembers(currentPage.value, pageSize.value, filters)
}

function handleSearch() {
  currentPage.value = 1
  loadData()
}

function handleReset() {
  filters.cardType = ''
  filters.memberStatus = ''
  filters.memberName = ''
  filters.phone = ''
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
  currentMember.value = null
  dialogVisible.value = true
}

function handleEdit(row: Member) {
  currentMember.value = { ...row }
  dialogVisible.value = true
}

function handleFreeze(row: Member) {
  ElMessageBox.confirm(`确定要冻结会员 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await memberStore.updateMemberStatus(row.id, 'frozen', row.name)
      ElMessage.success('冻结成功')
    })
    .catch(() => {})
}

function handleUnfreeze(row: Member) {
  ElMessageBox.confirm(`确定要解冻会员 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await memberStore.updateMemberStatus(row.id, 'normal', row.name)
      ElMessage.success('解冻成功')
    })
    .catch(() => {})
}

function handleAppointment(row: Member) {
  currentMember.value = row
  appointmentDialogVisible.value = true
}

function handleDelete(row: Member) {
  ElMessageBox.confirm(`确定要删除会员 "${row.name}" 吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error',
  })
    .then(async () => {
      await memberStore.deleteMember(row.id, row.name)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

function handleRenew(row: Member) {
  renewMember.value = row
  renewForm.renewDays = undefined
  renewForm.renewTimes = undefined
  renewDialogVisible.value = true
}

async function handleRenewSubmit() {
  if (!renewFormRef.value || !renewMember.value) return

  await renewFormRef.value.validate(async (valid) => {
    if (valid) {
      renewLoading.value = true
      try {
        await memberStore.renewMember(renewMember.value.id, renewMember.value.name, {
          renewDays: renewForm.renewDays,
          renewTimes: renewForm.renewTimes,
        })
        ElMessage.success('续卡成功')
        renewDialogVisible.value = false
      } finally {
        renewLoading.value = false
      }
    }
  })
}

async function handleMemberSubmit(data: Partial<Member>) {
  if (data.id) {
    await memberStore.updateMember(data.id, data)
    ElMessage.success('更新成功')
  } else {
    await memberStore.createMember(data as Omit<Member, 'id' | 'cardNumber'>)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
}

async function handleAppointmentSubmit(
  data: Omit<Appointment, 'id' | 'status' | 'appointmentTime' | 'createTime' | 'updateTime'>
) {
  await appointmentStore.createAppointment(data)
  ElMessage.success('预约成功')
  appointmentDialogVisible.value = false
}

onMounted(async () => {
  await Promise.all([loadData(), courseStore.fetchUpcomingCourses()])
})

watch([currentPage, pageSize], () => {
  loadData()
})
</script>

<style scoped>
.members-page {
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

.text-danger {
  color: #f56c6c;
  font-weight: 500;
}
</style>
