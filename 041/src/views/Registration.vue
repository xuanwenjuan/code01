<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useHospitalStore } from '@/stores/hospital'
import type { ScheduleSlot, ScheduleTime, Doctor, DoctorTitle, RegistrationRecord, SlotStatus } from '@/types'
import SlotDialog from '@/components/SlotDialog.vue'

const store = useHospitalStore()

const activeTab = ref<'slots' | 'records'>('slots')

const slotFilter = reactive({
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  hospitalId: '',
  departmentId: '',
  time: '' as ScheduleTime | '',
  title: '' as DoctorTitle | '',
  status: '' as SlotStatus | '',
  isExpert: null as boolean | null,
  keyword: ''
})

const recordFilter = reactive({
  startDate: '',
  endDate: '',
  patientName: '',
  doctorName: '',
  status: ''
})

const dialogVisible = ref(false)
const selectedSlot = ref<ScheduleSlot | null>(null)

const getDoctor = (doctorId: string): Doctor | undefined => {
  return store.doctors.find(d => d.id === doctorId)
}

const filteredDepartments = computed(() => {
  if (slotFilter.hospitalId) {
    return store.departments.filter(d => d.hospitalId === slotFilter.hospitalId)
  }
  return store.departments
})

const availableSlots = computed(() => {
  let result = store.slots
  
  if (slotFilter.startDate && slotFilter.endDate) {
    result = result.filter(s => s.date >= slotFilter.startDate && s.date <= slotFilter.endDate)
  }
  if (slotFilter.hospitalId) {
    result = result.filter(s => s.hospitalId === slotFilter.hospitalId)
  }
  if (slotFilter.departmentId) {
    result = result.filter(s => s.departmentId === slotFilter.departmentId)
  }
  if (slotFilter.time) {
    result = result.filter(s => s.time === slotFilter.time)
  }
  if (slotFilter.title) {
    const titleDoctors = store.doctors.filter(d => d.title === slotFilter.title).map(d => d.id)
    result = result.filter(s => titleDoctors.includes(s.doctorId))
  }
  if (slotFilter.status) {
    result = result.filter(s => s.status === slotFilter.status)
  }
  if (slotFilter.isExpert !== null) {
    result = result.filter(s => s.isExpert === slotFilter.isExpert)
  }
  if (slotFilter.keyword) {
    const keyword = slotFilter.keyword.toLowerCase()
    result = result.filter(s => 
      s.doctorName.toLowerCase().includes(keyword) ||
      s.departmentName.toLowerCase().includes(keyword)
    )
  }
  
  return result.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    if (a.isExpert !== b.isExpert) return a.isExpert ? -1 : 1
    return a.available - b.available
  })
})

const registrationRecords = computed(() => {
  let result = store.registrationRecords
  
  if (recordFilter.startDate && recordFilter.endDate) {
    result = result.filter(r => r.date >= recordFilter.startDate && r.date <= recordFilter.endDate)
  }
  if (recordFilter.patientName) {
    result = result.filter(r => r.patientName.includes(recordFilter.patientName))
  }
  if (recordFilter.doctorName) {
    result = result.filter(r => r.doctorName.includes(recordFilter.doctorName))
  }
  if (recordFilter.status) {
    result = result.filter(r => r.status === recordFilter.status)
  }
  
  return result.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
})

const slotStats = computed(() => {
  const slots = availableSlots.value
  return {
    total: slots.length,
    available: slots.filter(s => s.status === 'available').length,
    limited: slots.filter(s => s.status === 'limited').length,
    full: slots.filter(s => s.status === 'full').length,
    locked: slots.filter(s => s.status === 'locked').length,
    totalFee: slots.reduce((sum, s) => sum + s.fee.totalFee * s.reserved, 0)
  }
})

const recordStats = computed(() => {
  const records = registrationRecords.value
  return {
    total: records.length,
    registered: records.filter(r => r.status === 'registered').length,
    checked: records.filter(r => r.status === 'checked').length,
    cancelled: records.filter(r => r.status === 'cancelled').length,
    totalFee: records.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.fee.totalFee, 0),
    refundFee: records.filter(r => r.status === 'cancelled').reduce((sum, r) => sum + r.fee.totalFee, 0)
  }
})

const timeMap: Record<ScheduleTime, string> = {
  morning: '上午',
  afternoon: '下午',
  night: '夜间'
}

const statusMap = {
  available: { label: '充足', type: 'success' as const },
  limited: { label: '紧张', type: 'warning' as const },
  full: { label: '已满', type: 'danger' as const },
  locked: { label: '锁定', type: 'info' as const }
}

const recordStatusMap: Record<string, { label: string; type: 'primary' | 'success' | 'danger' | 'warning' }> = {
  registered: { label: '已挂号', type: 'primary' },
  checked: { label: '已签到', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
}

const handleRegister = (slot: ScheduleSlot) => {
  if (slot.status === 'full' || slot.status === 'locked') return
  selectedSlot.value = slot
  dialogVisible.value = true
}

const handleCancelRegistration = async (record: RegistrationRecord) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      '请输入取消原因',
      '取消挂号',
      {
        confirmButtonText: '确认取消',
        cancelButtonText: '返回',
        inputPlaceholder: '请输入取消原因...',
        type: 'warning'
      }
    )
    
    if (reason) {
      const success = await store.cancelRegistration(record.id, reason)
      if (success) {
        ElMessage.success('取消挂号成功')
      }
    }
  } catch {
    // 用户取消
  }
}

const handleCheckIn = async (record: RegistrationRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定对患者 ${record.patientName} 进行签到？`,
      '确认签到',
      { type: 'info' }
    )
    const success = await store.checkInPatient(record.id)
    if (success) {
      ElMessage.success('签到成功')
    } else {
      ElMessage.error('签到失败，该记录可能已签到或已取消')
    }
  } catch {
    // 用户取消
  }
}

const handleSuccess = () => {
  ElMessage.success('挂号成功')
}

const slotActiveFilterCount = computed(() => {
  let count = 0
  if (slotFilter.hospitalId) count++
  if (slotFilter.departmentId) count++
  if (slotFilter.time) count++
  if (slotFilter.title) count++
  if (slotFilter.status) count++
  if (slotFilter.isExpert !== null) count++
  if (slotFilter.keyword) count++
  return count
})

const recordActiveFilterCount = computed(() => {
  let count = 0
  if (recordFilter.startDate) count++
  if (recordFilter.patientName) count++
  if (recordFilter.doctorName) count++
  if (recordFilter.status) count++
  return count
})

const handleSlotHospitalChange = (val: string) => {
  if (!val) {
    slotFilter.departmentId = ''
  }
}

const handleResetSlotFilter = () => {
  slotFilter.startDate = new Date().toISOString().split('T')[0]
  slotFilter.endDate = new Date().toISOString().split('T')[0]
  slotFilter.hospitalId = ''
  slotFilter.departmentId = ''
  slotFilter.time = ''
  slotFilter.title = ''
  slotFilter.status = ''
  slotFilter.isExpert = null
  slotFilter.keyword = ''
}

const handleResetRecordFilter = () => {
  recordFilter.startDate = ''
  recordFilter.endDate = ''
  recordFilter.patientName = ''
  recordFilter.doctorName = ''
  recordFilter.status = ''
}

const formatDate = (dateStr: string) => {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  
  if (dateStr === today) return '今天'
  if (dateStr === tomorrow) return '明天'
  return dateStr
}
</script>

<template>
  <div class="registration">
    <div v-if="activeTab === 'slots'">
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="6" :md="3">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: #409EFF;">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ slotStats.total }}</div>
              <div class="stat-label">总号源</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: #67C23A;">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ slotStats.available }}</div>
              <div class="stat-label">可挂号</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: #F56C6C;">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ slotStats.full }}</div>
              <div class="stat-label">已挂满</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: #E6A23C;">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ slotStats.totalFee.toLocaleString() }}</div>
              <div class="stat-label">已收挂号费</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div v-else>
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="6" :md="3">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: #409EFF;">
              <el-icon><Tickets /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ recordStats.total }}</div>
              <div class="stat-label">总挂号数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: #67C23A;">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ recordStats.checked }}</div>
              <div class="stat-label">已签到</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: #E6A23C;">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ recordStats.totalFee.toLocaleString() }}</div>
              <div class="stat-label">实收费用</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: #909399;">
              <el-icon><Refund /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ recordStats.refundFee.toLocaleString() }}</div>
              <div class="stat-label">退费金额</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 16px;">
            患者挂号管理
            <el-tag v-if="(activeTab === 'slots' && slotActiveFilterCount > 0) || (activeTab === 'records' && recordActiveFilterCount > 0)" type="info" size="small" style="margin-left: 8px;">
              {{ activeTab === 'slots' ? slotActiveFilterCount : recordActiveFilterCount }} 个筛选条件
            </el-tag>
          </span>
          <el-tabs v-model="activeTab" style="margin: 0;">
            <el-tab-pane label="挂号池" name="slots" />
            <el-tab-pane label="挂号记录" name="records" />
          </el-tabs>
        </div>
      </template>
      
      <div v-show="activeTab === 'slots'">
        <el-form :inline="true" class="filter-form">
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="[slotFilter.startDate, slotFilter.endDate]"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item label="院区">
            <el-select
              v-model="slotFilter.hospitalId"
              placeholder="全部院区"
              clearable
              style="width: 110px"
              @change="handleSlotHospitalChange"
            >
              <el-option
                v-for="h in store.hospitals"
                :key="h.id"
                :label="h.name"
                :value="h.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="科室">
            <el-select
              v-model="slotFilter.departmentId"
              placeholder="全部科室"
              clearable
              style="width: 130px"
              :disabled="!slotFilter.hospitalId"
            >
              <el-option
                v-for="d in filteredDepartments"
                :key="d.id"
                :label="d.name"
                :value="d.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="时段">
            <el-select
              v-model="slotFilter.time"
              placeholder="全部时段"
              clearable
              style="width: 100px"
            >
              <el-option label="上午" value="morning" />
              <el-option label="下午" value="afternoon" />
              <el-option label="夜间" value="night" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="职称">
            <el-select
              v-model="slotFilter.title"
              placeholder="全部职称"
              clearable
              style="width: 110px"
            >
              <el-option label="专家" value="专家" />
              <el-option label="主任医师" value="主任医师" />
              <el-option label="副主任医师" value="副主任医师" />
              <el-option label="主治医师" value="主治医师" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select
              v-model="slotFilter.status"
              placeholder="全部状态"
              clearable
              style="width: 100px"
            >
              <el-option label="充足" value="available" />
              <el-option label="紧张" value="limited" />
              <el-option label="已满" value="full" />
              <el-option label="锁定" value="locked" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="专家号">
            <el-select
              v-model="slotFilter.isExpert"
              placeholder="全部"
              clearable
              style="width: 80px"
            >
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="搜索">
            <el-input
              v-model="slotFilter.keyword"
              placeholder="医生/科室"
              style="width: 130px"
              clearable
            />
          </el-form-item>
          
          <el-form-item>
            <el-button @click="handleResetSlotFilter">重置</el-button>
          </el-form-item>
        </el-form>
        
        <el-empty
          v-if="availableSlots.length === 0"
          description="暂无符合条件的号源"
          :image-size="100"
        />
        
        <el-table
          v-else
          :data="availableSlots"
          stripe
          v-loading="store.loading"
        >
          <el-table-column label="日期" width="100">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          <el-table-column label="医生" width="180">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 10px;">
                <el-avatar :size="36" :src="getDoctor(row.doctorId)?.avatar" />
                <div>
                  <div style="font-weight: 600;">
                    {{ row.doctorName }}
                    <el-tag v-if="row.isExpert" type="danger" effect="dark" size="small" style="margin-left: 8px;">专家</el-tag>
                  </div>
                  <div style="font-size: 12px; color: #909399;">
                    {{ getDoctor(row.doctorId)?.title }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="院区/科室" width="160">
            <template #default="{ row }">
              <div>{{ row.hospitalName }}</div>
              <div style="font-size: 12px; color: #909399;">{{ row.departmentName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="时段" width="80">
            <template #default="{ row }">
              <el-tag>{{ timeMap[row.time] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="挂号费" width="110">
            <template #default="{ row }">
              <div>
                <span style="font-size: 16px; font-weight: 600; color: #F56C6C;">
                  ¥{{ row.fee.totalFee }}
                </span>
                <div v-if="row.fee.expertPremium > 0" style="font-size: 11px; color: #E6A23C;">
                  含专家费¥{{ row.fee.expertPremium }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="号源状态" width="80">
            <template #default="{ row }">
              <div style="text-align: center;">
                <el-tag :type="statusMap[row.status].type" size="small">
                  {{ statusMap[row.status].label }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="号源详情" width="160">
            <template #default="{ row }">
              <el-progress
                :percentage="Math.round((row.reserved / row.total) * 100)"
                :format="() => `${row.reserved}/${row.total}`"
                :stroke-width="10"
              />
            </template>
          </el-table-column>
          <el-table-column label="剩余号源" width="90">
            <template #default="{ row }">
              <span
                :style="{
                  fontWeight: 700,
                  color: row.available === 0 ? '#F56C6C' : row.available <= 5 ? '#E6A23C' : '#67C23A'
                }"
              >
                {{ row.available }} 号
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                :disabled="row.status === 'full' || row.status === 'locked'"
                @click="handleRegister(row)"
              >
                挂号
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div v-show="activeTab === 'records'">
        <el-form :inline="true" class="filter-form">
          <el-form-item label="挂号日期">
            <el-date-picker
              v-model="[recordFilter.startDate, recordFilter.endDate]"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item label="患者姓名">
            <el-input
              v-model="recordFilter.patientName"
              placeholder="输入患者姓名"
              style="width: 110px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="医生">
            <el-input
              v-model="recordFilter.doctorName"
              placeholder="输入医生姓名"
              style="width: 110px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select
              v-model="recordFilter.status"
              placeholder="全部状态"
              clearable
              style="width: 100px"
            >
              <el-option label="已挂号" value="registered" />
              <el-option label="已签到" value="checked" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button @click="handleResetRecordFilter">重置</el-button>
          </el-form-item>
        </el-form>
        
        <el-empty
          v-if="registrationRecords.length === 0"
          description="暂无挂号记录"
          :image-size="100"
        />
        
        <el-table v-else :data="registrationRecords" stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="patientName" label="患者姓名" width="100" />
          <el-table-column prop="doctorName" label="医生" width="100" />
          <el-table-column label="日期/时段" width="180">
            <template #default="{ row }">
              <div>{{ row.date }}</div>
              <div style="font-size: 12px; color: #909399;">
                {{ timeMap[row.time] }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="挂号费" width="100">
            <template #default="{ row }">
              <span style="font-weight: 600; color: #F56C6C;">¥{{ row.fee.totalFee }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="recordStatusMap[row.status].type" size="small">
                {{ recordStatusMap[row.status].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="挂号时间" width="170">
            <template #default="{ row }">
              {{ new Date(row.registeredAt).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column v-if="recordFilter.status === 'cancelled'" label="取消原因" width="150" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.cancelReason || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'registered'"
                type="success"
                link
                size="small"
                @click="handleCheckIn(row)"
              >
                签到
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                :disabled="row.status !== 'registered'"
                @click="handleCancelRegistration(row)"
              >
                取消挂号
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <SlotDialog
      v-model:visible="dialogVisible"
      mode="register"
      :slot="selectedSlot"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-card .el-card__body {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px !important;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.filter-form {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

:deep(.el-tabs__item) {
  font-weight: 500;
}

@media screen and (max-width: 768px) {
  .stats-row {
    margin-bottom: 10px;
  }
  
  .stat-value {
    font-size: 18px !important;
  }
  
  .stat-label {
    font-size: 11px !important;
  }
  
  .filter-form :deep(.el-form-item) {
    display: flex;
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
