<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHospitalStore } from '@/stores/hospital'
import type { ScheduleSlot, ScheduleTime, Doctor, DoctorTitle } from '@/types'
import SlotDialog from '@/components/SlotDialog.vue'

const store = useHospitalStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedDepartment = ref('')
const selectedTime = ref<ScheduleTime | ''>('')
const filterTitle = ref<DoctorTitle | ''>('')
const searchKeyword = ref('')

const dialogVisible = ref(false)
const selectedSlot = ref<ScheduleSlot | null>(null)

const availableSlots = computed(() => {
  let result = store.slots.filter(s => s.date === selectedDate.value)
  
  if (selectedDepartment.value) {
    const deptDoctors = store.doctors.filter(d => d.departmentId === selectedDepartment.value).map(d => d.id)
    result = result.filter(s => deptDoctors.includes(s.doctorId))
  }
  if (selectedTime.value) {
    result = result.filter(s => s.time === selectedTime.value)
  }
  if (filterTitle.value) {
    const titleDoctors = store.doctors.filter(d => d.title === filterTitle.value).map(d => d.id)
    result = result.filter(s => titleDoctors.includes(s.doctorId))
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    const matchedDoctors = store.doctors.filter(d => d.name.toLowerCase().includes(keyword)).map(d => d.id)
    result = result.filter(s => matchedDoctors.includes(s.doctorId))
  }
  
  return result.sort((a, b) => {
    if (a.isExpert !== b.isExpert) return a.isExpert ? -1 : 1
    return a.available - b.available
  })
})

const getDoctor = (doctorId: string): Doctor | undefined => {
  return store.doctors.find(d => d.id === doctorId)
}

const timeMap: Record<ScheduleTime, string> = {
  morning: '上午',
  afternoon: '下午',
  night: '夜间'
}

const statusMap = {
  available: { label: '充足', type: 'success' as const },
  limited: { label: '紧张', type: 'warning' as const },
  full: { label: '已满', type: 'danger' as const }
}

const handleRegister = (slot: ScheduleSlot) => {
  if (slot.status === 'full') return
  selectedSlot.value = slot
  dialogVisible.value = true
}

const handleSuccess = () => {
  // 刷新数据
}

const handleReset = () => {
  selectedDepartment.value = ''
  selectedTime.value = ''
  filterTitle.value = ''
  searchKeyword.value = ''
}
</script>

<template>
  <div class="registration">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 16px;">患者挂号</span>
        </div>
      </template>
      
      <el-form :inline="true" class="filter-form">
        <el-form-item label="挂号日期">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            :disabled-date="(date) => date.getTime() < Date.now() - 86400000"
          />
        </el-form-item>
        
        <el-form-item label="科室">
          <el-select
            v-model="selectedDepartment"
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
        
        <el-form-item label="时段">
          <el-select
            v-model="selectedTime"
            placeholder="全部时段"
            clearable
            style="width: 120px"
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
          </el-select>
        </el-form-item>
        
        <el-form-item label="搜索医生">
          <el-input
            v-model="searchKeyword"
            placeholder="输入医生姓名"
            style="width: 150px"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-empty
        v-if="availableSlots.length === 0"
        description="暂无可用号源"
        :image-size="100"
      />
      
      <el-table
        v-else
        :data="availableSlots"
        stripe
        v-loading="store.loading"
      >
        <el-table-column type="index" label="序号" width="60" />
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
        <el-table-column label="院区/科室" width="180">
          <template #default="{ row }">
            <div>
              <div>{{ getDoctor(row.doctorId)?.hospitalName }}</div>
              <div style="font-size: 12px; color: #909399;">
                {{ getDoctor(row.doctorId)?.departmentName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="时段" width="100">
          <template #default="{ row }">
            <el-tag>{{ timeMap[row.time] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="号源状态" width="120">
          <template #default="{ row }">
            <div style="text-align: center;">
              <el-tag :type="statusMap[row.status].type" size="small">
                {{ statusMap[row.status].label }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="号源详情" width="200">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.reserved / row.total) * 100)"
              :format="() => `${row.reserved}/${row.total}`"
              :stroke-width="10"
            />
          </template>
        </el-table-column>
        <el-table-column label="剩余号源" width="100">
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
              :disabled="row.status === 'full'"
              @click="handleRegister(row)"
            >
              挂号
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
.filter-form {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>
