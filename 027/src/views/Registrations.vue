<template>
  <div class="registrations-page">
    <div class="page-header">
      <div class="page-title">挂号管理</div>
      <el-button type="primary" @click="handleAddRegistration">
        <el-icon><Plus /></el-icon>
        新增挂号
      </el-button>
    </div>

    <AdvancedFilter
      v-model="filterModel"
      @search="handleSearch"
    />

    <div class="queue-stats">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-item stat-waiting">
            <div class="value">{{ clinicStore.queueStats.waiting }}</div>
            <div class="label">候诊中</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item stat-ongoing">
            <div class="value">{{ clinicStore.queueStats.ongoing }}</div>
            <div class="label">就诊中</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item stat-completed">
            <div class="value">{{ clinicStore.queueStats.completed }}</div>
            <div class="label">已完成</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item stat-cancelled">
            <div class="value">{{ clinicStore.queueStats.cancelled }}</div>
            <div class="label">已取消</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-table
      :data="clinicStore.filteredRegistrations"
      v-loading="clinicStore.isLoading"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="visitNumber" label="叫号" width="80" align="center">
        <template #default="{ row }">
          <el-tag type="primary" size="large" effect="dark">
            {{ row.visitNumber }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="patientName" label="患者姓名" width="100" />
      <el-table-column label="科室" width="100">
        <template #default="{ row }">
          {{ row.departmentName }}
        </template>
      </el-table-column>
      <el-table-column label="医生" width="100">
        <template #default="{ row }">
          {{ row.doctorName }}
        </template>
      </el-table-column>
      <el-table-column label="职称" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ getDoctorTitle(row.doctorId) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="scheduleDate" label="就诊日期" width="120" />
      <el-table-column label="时段" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.timeSlot === 'morning' ? 'warning' : 'info'" size="small">
            {{ row.timeSlot === 'morning' ? '上午' : '下午' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <span :class="['status-tag', `status-${row.status}`]">
            {{ getStatusLabel(row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="symptoms" label="主诉" min-width="150" show-overflow-tooltip />
      <el-table-column prop="diagnosis" label="诊断" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 'waiting'">
            <el-button type="warning" link size="small" @click="handleStartVisit(row)">
              接诊
            </el-button>
            <el-button type="danger" link size="small" @click="handleCancel(row)">
              退号
            </el-button>
          </template>
          <template v-else-if="row.status === 'ongoing'">
            <el-button type="success" link size="small" @click="handleComplete(row)">
              完成
            </el-button>
          </template>
          <el-button type="primary" link size="small" @click="handleViewDetail(row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <RegistrationDialog
      v-model:visible="registrationDialogVisible"
      @success="handleRegistrationSuccess"
    />

    <CompleteVisitDialog
      v-model:visible="completeDialogVisible"
      :registration="currentRegistration"
      @success="handleCompleteSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { Registration, VisitStatus, FilterParams } from '@/types'
import { useSystemStore } from '@/stores/system'
import { useClinicStore } from '@/stores/clinic'
import AdvancedFilter from '@/components/AdvancedFilter.vue'
import RegistrationDialog from '@/components/RegistrationDialog.vue'
import CompleteVisitDialog from '@/components/CompleteVisitDialog.vue'

const systemStore = useSystemStore()
const clinicStore = useClinicStore()

const registrationDialogVisible = ref(false)
const completeDialogVisible = ref(false)
const currentRegistration = ref<Registration | null>(null)

const filterModel = reactive<FilterParams>({})

function getDoctorTitle(doctorId: string): string {
  return systemStore.getDoctorById(doctorId)?.title || '-'
}

function getStatusLabel(status: VisitStatus): string {
  const labels: Record<VisitStatus, string> = {
    waiting: '候诊中',
    ongoing: '就诊中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[status]
}

function handleAddRegistration() {
  registrationDialogVisible.value = true
}

function handleRegistrationSuccess() {
  ElMessage.success('挂号成功')
  clinicStore.fetchRegistrations()
}

async function handleStartVisit(row: Registration) {
  try {
    await clinicStore.startVisit(row.id)
    ElMessage.success('已开始接诊')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function handleCancel(row: Registration) {
  try {
    await ElMessageBox.confirm(
      `确定要为「${row.patientName}」办理退号吗？`,
      '退号确认',
      {
        confirmButtonText: '确定退号',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await clinicStore.cancelRegistration(row.id)
    ElMessage.success('退号成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退号失败')
    }
  }
}

function handleComplete(row: Registration) {
  currentRegistration.value = row
  completeDialogVisible.value = true
}

function handleCompleteSuccess() {
  ElMessage.success('就诊已完成')
}

function handleViewDetail(row: Registration) {
  ElMessageBox.alert(
    `
      <div style="line-height: 2">
        <p><strong>叫号：</strong>${row.visitNumber}</p>
        <p><strong>患者：</strong>${row.patientName}</p>
        <p><strong>科室：</strong>${row.departmentName}</p>
        <p><strong>医生：</strong>${row.doctorName}</p>
        <p><strong>就诊日期：</strong>${row.scheduleDate}</p>
        <p><strong>时段：</strong>${row.timeSlot === 'morning' ? '上午' : '下午'}</p>
        <p><strong>状态：</strong>${getStatusLabel(row.status)}</p>
        <p><strong>主诉：</strong>${row.symptoms || '-'}</p>
        <p><strong>诊断：</strong>${row.diagnosis || '-'}</p>
        ${row.actualVisitTime ? `<p><strong>接诊时间：</strong>${row.actualVisitTime}</p>` : ''}
        ${row.completeTime ? `<p><strong>完成时间：</strong>${row.completeTime}</p>` : ''}
      </div>
    `,
    '挂号详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

function handleSearch() {
  clinicStore.setFilterParams(filterModel)
}

import { onMounted } from 'vue'

onMounted(() => {
  clinicStore.fetchRegistrations()
  clinicStore.fetchPatients()
})
</script>

<style scoped lang="scss">
.registrations-page {
  padding: 20px;
}

.queue-stats {
  margin-bottom: 16px;

  .stat-item {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    text-align: center;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .label {
      font-size: 14px;
      color: #909399;
    }

    &.stat-waiting .value {
      color: #e6a23c;
    }

    &.stat-ongoing .value {
      color: #409eff;
    }

    &.stat-completed .value {
      color: #67c23a;
    }

    &.stat-cancelled .value {
      color: #909399;
    }
  }
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.status-waiting {
    background-color: #fef6f0;
    color: #e6a23c;
  }

  &.status-ongoing {
    background-color: #ecf5ff;
    color: #409eff;
  }

  &.status-completed {
    background-color: #f0f9eb;
    color: #67c23a;
  }

  &.status-cancelled {
    background-color: #f4f4f5;
    color: #909399;
  }
}
</style>
