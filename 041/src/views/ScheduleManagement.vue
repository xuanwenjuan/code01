<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useHospitalStore } from '@/stores/hospital'
import type { ScheduleSlot, ScheduleTime, DoctorTitle } from '@/types'

const store = useHospitalStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const filterTitle = ref<DoctorTitle | ''>('')
const filterDepartment = ref('')
const filterStatus = ref<'available' | 'limited' | 'full' | ''>('')

const filteredSlots = computed(() => {
  let result = store.slots.filter(s => s.date === selectedDate.value)
  
  if (filterDepartment.value) {
    const deptDoctors = store.doctors.filter(d => d.departmentId === filterDepartment.value).map(d => d.id)
    result = result.filter(s => deptDoctors.includes(s.doctorId))
  }
  if (filterTitle.value) {
    const titleDoctors = store.doctors.filter(d => d.title === filterTitle.value).map(d => d.id)
    result = result.filter(s => titleDoctors.includes(s.doctorId))
  }
  if (filterStatus.value) {
    result = result.filter(s => s.status === filterStatus.value)
  }
  
  return result
})

const groupedSlots = computed(() => {
  const groups: Record<string, ScheduleSlot[]> = {
    morning: [],
    afternoon: [],
    night: []
  }
  
  filteredSlots.value.forEach(slot => {
    groups[slot.time].push(slot)
  })
  
  return groups
})

const timeMap: Record<ScheduleTime, { label: string; icon: string }> = {
  morning: { label: '上午 (08:00-12:00)', icon: 'Sunny' },
  afternoon: { label: '下午 (14:00-17:30)', icon: 'PartlyCloudy' },
  night: { label: '夜间 (19:00-21:00)', icon: 'Moon' }
}

const statusMap = {
  available: { label: '充足', type: 'success' as const, color: '#67C23A' },
  limited: { label: '紧张', type: 'warning' as const, color: '#E6A23C' },
  full: { label: '已满', type: 'danger' as const, color: '#F56C6C' }
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
    if (success) {
      ElMessage.success('号源释放成功')
    }
  } catch {
    // 用户取消
  }
}

const handleReset = () => {
  filterDepartment.value = ''
  filterTitle.value = ''
  filterStatus.value = ''
}
</script>

<template>
  <div class="schedule-management">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 16px;">排班与号源管理</span>
        </div>
      </template>
      
      <el-form :inline="true" class="filter-form">
        <el-form-item label="日期">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="科室">
          <el-select
            v-model="filterDepartment"
            placeholder="全部科室"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="d in store.departments"
              :key="d.id"
              :label="`${d.hospitalName}-${d.name}`"
              :value="d.id"
            />
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
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="filterStatus"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option label="充足" value="available" />
            <el-option label="紧张" value="limited" />
            <el-option label="已满" value="full" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="slots-container">
        <div
          v-for="(time, key) in timeMap"
          :key="key"
          class="time-group"
        >
          <div class="time-header">
            <el-icon><component :is="time.icon" /></el-icon>
            <span>{{ time.label }}</span>
            <el-tag type="info">{{ groupedSlots[key as ScheduleTime].length }} 位医生</el-tag>
          </div>
          
          <div v-if="groupedSlots[key as ScheduleTime].length === 0" class="empty-slots">
            <el-empty description="暂无排班" :image-size="60" />
          </div>
          
          <div v-else class="slots-grid">
            <div
              v-for="slot in groupedSlots[key as ScheduleTime]"
              :key="slot.id"
              class="slot-card"
              :class="{ 'expert-card': slot.isExpert, 'full-card': slot.status === 'full' }"
            >
              <div class="slot-header">
                <span class="doctor-name">{{ slot.doctorName }}</span>
                <el-tag v-if="slot.isExpert" type="danger" effect="dark" size="small">专家号</el-tag>
              </div>
              
              <div class="slot-progress">
                <el-progress
                  :percentage="Math.round((slot.reserved / slot.total) * 100)"
                  :color="statusMap[slot.status].color"
                  :stroke-width="8"
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
              
              <div class="slot-status">
                <el-tag :type="statusMap[slot.status].type" size="small">
                  {{ statusMap[slot.status].label }}
                </el-tag>
              </div>
              
              <div class="slot-actions">
                <el-button
                  type="primary"
                  link
                  size="small"
                  :disabled="slot.reserved === 0"
                  @click="handleRelease(slot)"
                >
                  释放号源
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.filter-form {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.time-group {
  margin-bottom: 30px;
}

.time-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(90deg, #ECF5FF 0%, #fff 100%);
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.empty-slots {
  padding: 30px;
  background: #fafafa;
  border-radius: 4px;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.doctor-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
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

.slot-status {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.slot-actions {
  display: flex;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
}
</style>
