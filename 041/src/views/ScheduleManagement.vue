<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useHospitalStore } from '@/stores/hospital'
import type { ScheduleSlot, ScheduleTime, DoctorTitle, SlotStatus, AdvancedFilter } from '@/types'
import ScheduleRuleDialog from '@/components/ScheduleRuleDialog.vue'

const store = useHospitalStore()

const dateRange = ref<[string, string] | null>([
  new Date().toISOString().split('T')[0],
  new Date().toISOString().split('T')[0]
])
const filterTitle = ref<DoctorTitle | ''>('')
const filterDepartment = ref('')
const filterHospital = ref('')
const filterStatus = ref<SlotStatus | ''>('')
const filterIsExpert = ref<boolean | null>(null)
const filterTime = ref<ScheduleTime | ''>('')
const searchKeyword = ref('')
const viewMode = ref<'card' | 'table'>('card')

const scheduleDialogVisible = ref(false)
const selectedDoctorId = ref<string | undefined>(undefined)

const dateRangeSlots = computed(() => {
  if (!dateRange.value) return store.slots
  const [start, end] = dateRange.value
  return store.slots.filter(s => s.date >= start && s.date <= end)
})

const filteredSlots = computed(() => {
  let result = dateRangeSlots.value
  
  if (filterHospital.value) {
    result = result.filter(s => s.hospitalId === filterHospital.value)
  }
  if (filterDepartment.value) {
    result = result.filter(s => s.departmentId === filterDepartment.value)
  }
  if (filterTime.value) {
    result = result.filter(s => s.time === filterTime.value)
  }
  if (filterTitle.value) {
    const titleDoctors = store.doctors.filter(d => d.title === filterTitle.value).map(d => d.id)
    result = result.filter(s => titleDoctors.includes(s.doctorId))
  }
  if (filterStatus.value) {
    result = result.filter(s => s.status === filterStatus.value)
  }
  if (filterIsExpert.value !== null) {
    result = result.filter(s => s.isExpert === filterIsExpert.value)
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
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

const stats = computed(() => {
  const slots = dateRangeSlots.value
  const todaySlots = slots.filter(s => s.date === new Date().toISOString().split('T')[0])
  return {
    totalSlots: slots.length,
    totalReserved: slots.reduce((sum, s) => sum + s.reserved, 0),
    totalAvailable: slots.reduce((sum, s) => sum + s.available, 0),
    lockedSlots: slots.filter(s => s.isLocked).length,
    todayTotal: todaySlots.length,
    todayReserved: todaySlots.reduce((sum, s) => sum + s.reserved, 0),
    expertSlots: slots.filter(s => s.isExpert).length
  }
})

const groupedSlots = computed(() => {
  const groups: Record<string, Record<string, ScheduleSlot[]>> = {}
  
  filteredSlots.value.forEach(slot => {
    if (!groups[slot.date]) {
      groups[slot.date] = { morning: [], afternoon: [], night: [] }
    }
    groups[slot.date][slot.time].push(slot)
  })
  
  return groups
})

const groupedSlotsArray = computed(() => {
  return Object.entries(groupedSlots.value).map(([date, times]) => ({
    date,
    times
  })).sort((a, b) => a.date.localeCompare(b.date))
})

const timeMap: Record<ScheduleTime, { label: string; icon: string }> = {
  morning: { label: '上午 (08:00-12:00)', icon: 'Sunny' },
  afternoon: { label: '下午 (14:00-17:30)', icon: 'PartlyCloudy' },
  night: { label: '夜间 (19:00-21:00)', icon: 'Moon' }
}

const timeLabelMap: Record<ScheduleTime, string> = {
  morning: '上午',
  afternoon: '下午',
  night: '夜间'
}

const statusMap: Record<SlotStatus, { label: string; type: 'success' | 'warning' | 'danger' | 'info'; color: string }> = {
  available: { label: '充足', type: 'success', color: '#67C23A' },
  limited: { label: '紧张', type: 'warning', color: '#E6A23C' },
  full: { label: '已满', type: 'danger', color: '#F56C6C' },
  locked: { label: '锁定', type: 'info', color: '#909399' }
}

const filteredDepartments = computed(() => {
  if (filterHospital.value) {
    return store.departments.filter(d => d.hospitalId === filterHospital.value)
  }
  return store.departments
})

const handleCreateSchedule = () => {
  selectedDoctorId.value = undefined
  scheduleDialogVisible.value = true
}

const handleCreateScheduleForDoctor = (doctorId: string) => {
  selectedDoctorId.value = doctorId
  scheduleDialogVisible.value = true
}

const handleLock = async (slot: ScheduleSlot) => {
  try {
    await ElMessageBox.confirm(
      `确定锁定 ${slot.doctorName} 的号源？锁定后将无法挂号。`,
      '确认操作',
      { type: 'warning' }
    )
    const success = await store.lockSlot(slot.id)
    if (success) ElMessage.success('号源已锁定')
  } catch {
    // 用户取消
  }
}

const handleUnlock = async (slot: ScheduleSlot) => {
  const success = await store.unlockSlot(slot.id)
  if (success) ElMessage.success('号源已解锁')
}

const handleRelease = async (slot: ScheduleSlot) => {
  if (slot.reserved === 0) {
    ElMessage.warning('当前号源没有已挂号患者')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定手动释放 ${slot.doctorName} 的号源？这将使已挂号数减1。`,
      '确认操作',
      { type: 'warning' }
    )
    const success = await store.releaseSlot(slot.id)
    if (success) ElMessage.success('号源释放成功')
  } catch {
    // 用户取消
  }
}

const handleAddStopNote = async (slot: ScheduleSlot) => {
  const { value: reason } = await ElMessageBox.prompt('请输入停诊原因', '添加停诊备注', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入停诊原因...',
    inputValidator: (value) => {
      if (!value) return '请输入停诊原因'
      return true
    }
  })
  
  if (reason) {
    await store.addStopNote(slot.id, reason)
    ElMessage.success('停诊备注已添加')
  }
}

const handleBatchLock = async () => {
  const lockableSlots = filteredSlots.value.filter(s => !s.isLocked && s.reserved === 0)
  if (lockableSlots.length === 0) {
    ElMessage.warning('当前筛选结果中没有可锁定的号源')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定锁定当前筛选结果中的 ${lockableSlots.length} 个未挂号号源？`,
      '批量锁定确认',
      { type: 'warning' }
    )
    const count = await store.batchLockSlots(lockableSlots.map(s => s.id))
    if (count > 0) {
      ElMessage.success(`已成功锁定 ${count} 个号源`)
    }
  } catch {
    // 用户取消
  }
}

const handleBatchUnlock = async () => {
  const unlockableSlots = filteredSlots.value.filter(s => s.isLocked)
  if (unlockableSlots.length === 0) {
    ElMessage.warning('当前筛选结果中没有已锁定的号源')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定解锁当前筛选结果中的 ${unlockableSlots.length} 个号源？`,
      '批量解锁确认',
      { type: 'warning' }
    )
    const count = await store.batchUnlockSlots(unlockableSlots.map(s => s.id))
    if (count > 0) {
      ElMessage.success(`已成功解锁 ${count} 个号源`)
    }
  } catch {
    // 用户取消
  }
}

const activeFilterCount = computed(() => {
  let count = 0
  if (filterHospital.value) count++
  if (filterDepartment.value) count++
  if (filterTitle.value) count++
  if (filterStatus.value) count++
  if (filterIsExpert.value !== null) count++
  if (filterTime.value) count++
  if (searchKeyword.value) count++
  return count
})

const handleHospitalChange = (val: string) => {
  if (!val) {
    filterDepartment.value = ''
  }
}

const handleReset = () => {
  filterDepartment.value = ''
  filterHospital.value = ''
  filterTitle.value = ''
  filterStatus.value = ''
  filterIsExpert.value = null
  filterTime.value = ''
  searchKeyword.value = ''
  dateRange.value = [
    new Date().toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  ]
}

const handleScheduleSuccess = () => {
  ElMessage.success('排班规则创建成功')
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  
  if (dateStr === today) return '今天'
  if (dateStr === tomorrow) return '明天'
  
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${dateStr} ${weekDays[date.getDay()]}`
}
</script>

<template>
  <div class="schedule-management">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6" :md="3">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #409EFF;">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalSlots }}</div>
            <div class="stat-label">总排班次</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="3">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #67C23A;">
            <el-icon><Tickets /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalReserved }}</div>
            <div class="stat-label">已挂号数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="3">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #E6A23C;">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalAvailable }}</div>
            <div class="stat-label">剩余号源</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="3">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #909399;">
            <el-icon><Lock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.lockedSlots }}</div>
            <div class="stat-label">已锁定</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card>
      <template #header>
        <div class="card-header">
          <span style="font-weight: 600; font-size: 16px;">
            排班与号源管理
            <el-tag v-if="activeFilterCount > 0" type="info" size="small" style="margin-left: 8px;">
              {{ activeFilterCount }} 个筛选条件
            </el-tag>
          </span>
          <div class="header-actions">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="card">卡片视图</el-radio-button>
              <el-radio-button label="table">表格视图</el-radio-button>
            </el-radio-group>
            <el-button type="primary" @click="handleCreateSchedule">
              <el-icon><Plus /></el-icon>
              创建排班
            </el-button>
          </div>
        </div>
      </template>
      
      <el-form :inline="true" class="filter-form">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="院区">
          <el-select
            v-model="filterHospital"
            placeholder="全部院区"
            clearable
            style="width: 120px"
            @change="handleHospitalChange"
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
            v-model="filterDepartment"
            placeholder="全部科室"
            clearable
            style="width: 140px"
            :disabled="!filterHospital"
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
            v-model="filterTime"
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
            v-model="filterTitle"
            placeholder="全部职称"
            clearable
            style="width: 120px"
          >
            <el-option label="专家" value="专家" />
            <el-option label="主任医师" value="主任医师" />
            <el-option label="副主任医师" value="副主任医师" />
            <el-option label="主治医师" value="主治医师" />
            <el-option label="住院医师" value="住院医师" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="filterStatus"
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
            v-model="filterIsExpert"
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
            v-model="searchKeyword"
            placeholder="医生/科室"
            style="width: 140px"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="warning" @click="handleBatchLock">批量锁定</el-button>
          <el-button type="success" @click="handleBatchUnlock">批量解锁</el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="filteredSlots.length === 0" class="empty-container">
        <el-empty description="当前筛选条件下暂无排班数据" :image-size="80">
          <el-button type="primary" @click="handleCreateSchedule">
            创建排班
          </el-button>
        </el-empty>
      </div>
      
      <div v-else-if="viewMode === 'card'" class="slots-container">
        <div v-for="group in groupedSlotsArray" :key="group.date" class="date-group">
          <div class="date-header">
            <el-icon><Calendar /></el-icon>
            <span class="date-text">{{ formatDate(group.date) }}</span>
            <el-tag type="info">{{ filteredSlots.filter(s => s.date === group.date).length }} 个号源</el-tag>
          </div>
          
          <div v-for="(slots, time) in group.times" :key="time" class="time-group">
            <div v-if="slots.length > 0" class="time-subheader">
              <el-icon><component :is="timeMap[time as ScheduleTime].icon" /></el-icon>
              <span>{{ timeMap[time as ScheduleTime].label }}</span>
              <el-tag type="info">{{ slots.length }} 位医生</el-tag>
            </div>
            
            <div v-if="slots.length > 0" class="slots-grid">
              <div
                v-for="slot in slots"
                :key="slot.id"
                class="slot-card"
                :class="{ 
                  'expert-card': slot.isExpert, 
                  'full-card': slot.status === 'full',
                  'locked-card': slot.isLocked
                }"
              >
                <div class="slot-header">
                  <div>
                    <span class="doctor-name">{{ slot.doctorName }}</span>
                    <el-tag v-if="slot.isExpert" type="danger" effect="dark" size="small">专家号</el-tag>
                  </div>
                  <el-tag :type="statusMap[slot.status].type" size="small">
                    {{ statusMap[slot.status].label }}
                  </el-tag>
                </div>
                
                <div class="slot-info">
                  <span>{{ slot.hospitalName }} - {{ slot.departmentName }}</span>
                </div>
                
                <div class="slot-fee">
                  <span class="fee-label">挂号费：</span>
                  <span class="fee-amount">¥{{ slot.fee.totalFee }}</span>
                  <span v-if="slot.fee.expertPremium > 0" class="fee-premium">
                    (含专家费¥{{ slot.fee.expertPremium }})
                  </span>
                </div>
                
                <div class="slot-progress">
                  <el-progress
                    :percentage="Math.round((slot.reserved / slot.total) * 100)"
                    :color="statusMap[slot.status].color"
                    :stroke-width="10"
                  />
                </div>
                
                <div class="slot-stats">
                  <div class="stat">
                    <span class="label">总量</span>
                    <span class="value">{{ slot.total }}</span>
                  </div>
                  <div class="stat">
                    <span class="label">已挂</span>
                    <span class="value" style="color: #E6A23C;">{{ slot.reserved }}</span>
                  </div>
                  <div class="stat">
                    <span class="label">剩余</span>
                    <span class="value" :style="{ color: statusMap[slot.status].color }">
                      {{ slot.available }}
                    </span>
                  </div>
                </div>
                
                <div v-if="slot.stopReason" class="slot-note">
                  <el-icon><Warning /></el-icon>
                  <span>{{ slot.stopReason }}</span>
                </div>
                
                <div class="slot-actions">
                  <el-tooltip content="创建排班" placement="top">
                    <el-button
                      type="primary"
                      link
                      size="small"
                      @click="handleCreateScheduleForDoctor(slot.doctorId)"
                    >
                      <el-icon><Calendar /></el-icon>
                    </el-button>
                  </el-tooltip>
                  
                  <el-tooltip content="添加停诊备注" placement="top">
                    <el-button
                      type="warning"
                      link
                      size="small"
                      @click="handleAddStopNote(slot)"
                    >
                      <el-icon><EditPen /></el-icon>
                    </el-button>
                  </el-tooltip>
                  
                  <el-tooltip v-if="slot.isLocked" content="解锁号源" placement="top">
                    <el-button
                      type="success"
                      link
                      size="small"
                      @click="handleUnlock(slot)"
                    >
                      <el-icon><Unlock /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip v-else content="锁定号源" placement="top">
                    <el-button
                      type="info"
                      link
                      size="small"
                      @click="handleLock(slot)"
                    >
                      <el-icon><Lock /></el-icon>
                    </el-button>
                  </el-tooltip>
                  
                  <el-tooltip content="释放号源" placement="top">
                    <el-button
                      type="danger"
                      link
                      size="small"
                      :disabled="slot.reserved === 0"
                      @click="handleRelease(slot)"
                    >
                      <el-icon><RefreshLeft /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <el-table v-else :data="filteredSlots" stripe>
        <el-table-column label="日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column label="时段" width="80">
          <template #default="{ row }">
            <el-tag>{{ timeLabelMap[row.time] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="医生" width="150">
          <template #default="{ row }">
            <div>
              <span style="font-weight: 600;">{{ row.doctorName }}</span>
              <el-tag v-if="row.isExpert" type="danger" effect="dark" size="small" style="margin-left: 6px;">专家</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="院区/科室" width="160">
          <template #default="{ row }">
            <div>{{ row.hospitalName }}</div>
            <div style="font-size: 12px; color: #909399;">{{ row.departmentName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="挂号费" width="100">
          <template #default="{ row }">
            <span style="font-weight: 600; color: #F56C6C;">¥{{ row.fee.totalFee }}</span>
          </template>
        </el-table-column>
        <el-table-column label="号源状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type" size="small">
              {{ statusMap[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="号源详情" width="160">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.reserved / row.total) * 100)"
              :format="() => `${row.reserved}/${row.total}`"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column label="停诊备注" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.stopReason" style="color: #F56C6C;">{{ row.stopReason }}</span>
            <span v-else style="color: #C0C4CC;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleCreateScheduleForDoctor(row.doctorId)">
              排班
            </el-button>
            <el-button type="warning" link size="small" @click="handleAddStopNote(row)">
              备注
            </el-button>
            <el-button v-if="row.isLocked" type="success" link size="small" @click="handleUnlock(row)">
              解锁
            </el-button>
            <el-button v-else type="info" link size="small" @click="handleLock(row)">
              锁定
            </el-button>
            <el-button type="danger" link size="small" :disabled="row.reserved === 0" @click="handleRelease(row)">
              释放
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <ScheduleRuleDialog
      v-model:visible="scheduleDialogVisible"
      :doctor-id="selectedDoctorId"
      @success="handleScheduleSuccess"
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-form {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.empty-container {
  padding: 40px;
}

.date-group {
  margin-bottom: 30px;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(90deg, #E6F7FF 0%, #fff 100%);
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #1890FF;
}

.date-text {
  flex: 1;
}

.time-group {
  margin-bottom: 20px;
}

.time-subheader {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #FAFAFA;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.slot-card {
  background: #fff;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
}

.slot-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.slot-card.expert-card {
  border-color: #F56C6C;
  background: linear-gradient(135deg, #FEF0F0 0%, #fff 100%);
}

.slot-card.full-card {
  opacity: 0.7;
}

.slot-card.locked-card {
  border-color: #909399;
  background: #fafafa;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.doctor-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-right: 8px;
}

.slot-info {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.slot-fee {
  margin-bottom: 12px;
  font-size: 13px;
}

.fee-label {
  color: #909399;
}

.fee-amount {
  color: #F56C6C;
  font-weight: 600;
  font-size: 16px;
  margin-left: 4px;
}

.fee-premium {
  color: #E6A23C;
  font-size: 12px;
  margin-left: 4px;
}

.slot-progress {
  margin-bottom: 12px;
}

.slot-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
}

.stat {
  text-align: center;
}

.stat .label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat .value {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.slot-note {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: #FEF0F0;
  border-radius: 4px;
  font-size: 12px;
  color: #F56C6C;
  margin-bottom: 12px;
}

.slot-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
}

@media screen and (max-width: 1024px) {
  .slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
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
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .slots-grid {
    grid-template-columns: 1fr;
  }
}
</style>
