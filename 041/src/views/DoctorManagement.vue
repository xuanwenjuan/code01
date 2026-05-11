<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useHospitalStore } from '@/stores/hospital'
import type { Doctor, DoctorStatus, DoctorTitle } from '@/types'
import DoctorDialog from '@/components/DoctorDialog.vue'

const store = useHospitalStore()

const searchKeyword = ref('')
const filterTitle = ref<DoctorTitle | ''>('')
const filterStatus = ref<DoctorStatus | ''>('')

const filteredDoctors = computed(() => {
  let result = store.doctors
  
  if (store.selectedHospital) {
    result = result.filter(d => d.hospitalId === store.selectedHospital)
  }
  if (store.selectedDepartment) {
    result = result.filter(d => d.departmentId === store.selectedDepartment)
  }
  if (filterTitle.value) {
    result = result.filter(d => d.title === filterTitle.value)
  }
  if (filterStatus.value) {
    result = result.filter(d => d.status === filterStatus.value)
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(d => 
      d.name.toLowerCase().includes(keyword) ||
      d.specialty.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const dialogVisible = ref(false)
const editingDoctor = ref<Doctor | null>(null)

const statusMap: Record<DoctorStatus, { label: string; type: 'success' | 'danger' | 'warning' }> = {
  normal: { label: '正常出诊', type: 'success' },
  stop: { label: '停诊', type: 'danger' },
  substitute: { label: '替诊', type: 'warning' }
}

const handleAdd = () => {
  editingDoctor.value = null
  dialogVisible.value = true
}

const handleEdit = (doctor: Doctor) => {
  editingDoctor.value = doctor
  dialogVisible.value = true
}

const handleChangeStatus = async (doctor: Doctor, status: DoctorStatus) => {
  try {
    await ElMessageBox.confirm(
      `确定将医生 ${doctor.name} 的状态改为 ${statusMap[status].label}？`,
      '确认操作',
      { type: 'warning' }
    )
    await store.updateDoctorStatus(doctor.id, status)
    ElMessage.success('状态更新成功')
  } catch {
    // 用户取消
  }
}

const handleHospitalChange = (val: string | null) => {
  store.setSelectedHospital(val)
}

const handleDepartmentChange = (val: string | null) => {
  store.setSelectedDepartment(val)
}

const handleReset = () => {
  searchKeyword.value = ''
  filterTitle.value = ''
  filterStatus.value = ''
  store.setSelectedHospital(null)
  store.setSelectedDepartment(null)
}
</script>

<template>
  <div class="doctor-management">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 16px;">科室与医生管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加医生
          </el-button>
        </div>
      </template>
      
      <el-form :inline="true" class="filter-form">
        <el-form-item label="院区">
          <el-select
            v-model="store.selectedHospital"
            placeholder="全部院区"
            clearable
            style="width: 150px"
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
            v-model="store.selectedDepartment"
            placeholder="全部科室"
            clearable
            style="width: 150px"
            @change="handleDepartmentChange"
          >
            <el-option
              v-for="d in store.filteredDepartments"
              :key="d.id"
              :label="d.name"
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
            <el-option label="主任医师" value="主任医师" />
            <el-option label="副主任医师" value="副主任医师" />
            <el-option label="主治医师" value="主治医师" />
            <el-option label="住院医师" value="住院医师" />
            <el-option label="专家" value="专家" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="filterStatus"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option label="正常出诊" value="normal" />
            <el-option label="停诊" value="stop" />
            <el-option label="替诊" value="substitute" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="搜索">
          <el-input
            v-model="searchKeyword"
            placeholder="姓名/擅长领域"
            style="width: 180px"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="filteredDoctors" stripe v-loading="store.loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="姓名" width="100">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 10px;">
              <el-avatar :size="32" :src="row.avatar" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="职称" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.title === '专家'" type="danger" effect="dark">专家</el-tag>
            <span v-else>{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="hospitalName" label="院区" width="100" />
        <el-table-column prop="departmentName" label="科室" width="100" />
        <el-table-column prop="specialty" label="擅长领域" show-overflow-tooltip />
        <el-table-column prop="status" label="出诊状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type">
              {{ statusMap[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-dropdown trigger="click" @command="(cmd) => handleChangeStatus(row, cmd)">
              <el-button type="primary" link size="small">
                修改状态
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="normal">正常出诊</el-dropdown-item>
                  <el-dropdown-item command="stop">停诊</el-dropdown-item>
                  <el-dropdown-item command="substitute">替诊</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <DoctorDialog
      v-model:visible="dialogVisible"
      :doctor="editingDoctor"
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
