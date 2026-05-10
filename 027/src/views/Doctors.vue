<template>
  <div class="doctors-page">
    <div class="page-header">
      <div class="page-title">医生管理</div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增医生
      </el-button>
    </div>

    <div class="filter-bar">
      <el-select
        v-model="filterDept"
        placeholder="全部科室"
        clearable
        style="width: 200px"
      >
        <el-option
          v-for="dept in systemStore.activeDepartments"
          :key="dept.id"
          :label="dept.name"
          :value="dept.id"
        />
      </el-select>
      <el-select
        v-model="filterTitle"
        placeholder="全部职称"
        clearable
        style="width: 200px"
      >
        <el-option
          v-for="title in systemStore.titleLevels"
          :key="title"
          :label="title"
          :value="title"
        />
      </el-select>
      <el-input
        v-model="filterKeyword"
        placeholder="搜索医生姓名"
        clearable
        style="width: 200px"
      />
    </div>

    <el-table
      :data="filteredDoctors"
      v-loading="systemStore.isLoading"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column label="头像" width="80" align="center">
        <template #default="{ row }">
          <el-avatar :size="40" icon="UserFilled" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column label="性别" width="80" align="center">
        <template #default="{ row }">
          <el-icon :color="row.gender === 'male' ? '#409eff' : '#f56c6c'">
            <component :is="row.gender === 'male' ? 'Male' : 'Female'" />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column prop="age" label="年龄" width="80" align="center" />
      <el-table-column label="职称" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getTitleTagType(row.title)" size="small">
            {{ row.title }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="科室" width="120">
        <template #default="{ row }">
          {{ getDepartmentName(row.departmentId) }}
        </template>
      </el-table-column>
      <el-table-column prop="specialty" label="专业特长" min-width="150" show-overflow-tooltip />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleSchedule(row)">
            排班
          </el-button>
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <DoctorDialog
      v-model:visible="doctorDialogVisible"
      :title="dialogTitle"
      :doctor="currentDoctor"
      @submit="handleDoctorSubmit"
    />

    <ScheduleDialog
      v-model:visible="scheduleDialogVisible"
      :doctor="currentDoctor"
      @submit="handleScheduleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Male, Female } from '@element-plus/icons-vue'
import type { Doctor, TitleLevel } from '@/types'
import { useSystemStore } from '@/stores/system'
import DoctorDialog from '@/components/DoctorDialog.vue'
import ScheduleDialog from '@/components/ScheduleDialog.vue'

const systemStore = useSystemStore()

const filterDept = ref('')
const filterTitle = ref('')
const filterKeyword = ref('')

const doctorDialogVisible = ref(false)
const scheduleDialogVisible = ref(false)
const isEdit = ref(false)
const currentDoctor = ref<Doctor | null>(null)

const dialogTitle = computed(() => isEdit.value ? '编辑医生' : '新增医生')

const filteredDoctors = computed(() => {
  return systemStore.doctors.filter(doctor => {
    if (filterDept.value && doctor.departmentId !== filterDept.value) {
      return false
    }
    if (filterTitle.value && doctor.title !== filterTitle.value) {
      return false
    }
    if (filterKeyword.value) {
      if (!doctor.name.includes(filterKeyword.value)) {
        return false
      }
    }
    return true
  })
})

function getDepartmentName(deptId: string): string {
  return systemStore.getDepartmentById(deptId)?.name || '-'
}

function getTitleTagType(title: TitleLevel): string {
  const types: Record<TitleLevel, string> = {
    '主任医师': 'danger',
    '副主任医师': 'warning',
    '主治医师': 'primary',
    '住院医师': 'info',
    '医士': ''
  }
  return types[title]
}

function getStatusTagType(status: string): string {
  const types: Record<string, string> = {
    on_duty: 'success',
    off_duty: 'info',
    leave: 'warning'
  }
  return types[status] || ''
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    on_duty: '在岗',
    off_duty: '离岗',
    leave: '休假'
  }
  return labels[status] || status
}

function handleAdd() {
  isEdit.value = false
  currentDoctor.value = null
  doctorDialogVisible.value = true
}

function handleEdit(row: Doctor) {
  isEdit.value = true
  currentDoctor.value = row
  doctorDialogVisible.value = true
}

function handleSchedule(row: Doctor) {
  currentDoctor.value = row
  scheduleDialogVisible.value = true
}

function handleScheduleSuccess() {
  ElMessage.success('排班已更新')
}

async function handleDelete(row: Doctor) {
  try {
    await ElMessageBox.confirm(
      `确定要删除医生「${row.name}」吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await systemStore.deleteDoctor(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

async function handleDoctorSubmit(data: Partial<Doctor>) {
  try {
    if (isEdit.value && currentDoctor.value) {
      await systemStore.updateDoctor(currentDoctor.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await systemStore.createDoctor(data)
      ElMessage.success('新增成功')
    }
    doctorDialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}
</script>

<style scoped lang="scss">
.doctors-page {
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}
</style>
