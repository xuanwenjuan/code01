<template>
  <div class="clinic-page">
    <div class="page-header">
      <div class="page-title">就诊管理</div>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddRegistration">
          <el-icon><Plus /></el-icon>
          新增挂号
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>候诊队列</span>
              <el-tag type="warning">{{ waitingList.length }} 人</el-tag>
            </div>
          </template>
          <div class="queue-list">
            <div
              v-for="reg in waitingList"
              :key="reg.id"
              :class="['queue-item', { active: selectedRegistration?.id === reg.id }]"
              @click="selectRegistration(reg)"
            >
              <div class="queue-number">
                <el-tag type="primary" effect="dark" size="large">
                  {{ reg.visitNumber }}
                </el-tag>
              </div>
              <div class="queue-info">
                <div class="patient-name">{{ reg.patientName }}</div>
                <div class="dept-doctor">{{ reg.departmentName }} - {{ reg.doctorName }}</div>
              </div>
              <div class="queue-status">
                <span class="status-tag status-waiting">候诊中</span>
              </div>
            </div>
            <el-empty v-if="waitingList.length === 0" description="暂无候诊患者" />
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="patient-detail">
          <template #header>
            <div class="card-header">
              <span>患者详情</span>
              <div class="actions" v-if="selectedRegistration">
                <template v-if="selectedRegistration.status === 'waiting'">
                  <el-button type="primary" @click="handleStartVisit">
                    <el-icon><VideoPlay /></el-icon>
                    开始接诊
                  </el-button>
                  <el-button type="danger" @click="handleCancel">退号</el-button>
                </template>
                <template v-else-if="selectedRegistration.status === 'ongoing'">
                  <el-button type="success" @click="handleCompleteVisit">
                    <el-icon><CircleCheck /></el-icon>
                    完成就诊
                  </el-button>
                  <el-button type="primary" @click="handleCreatePrescription">
                    <el-icon><Document /></el-icon>
                    开处方
                  </el-button>
                </template>
                <template v-else-if="selectedRegistration.status === 'completed'">
                  <el-button type="primary" @click="handleViewPrescription">
                    <el-icon><Document /></el-icon>
                    查看处方
                  </el-button>
                </template>
              </div>
            </div>
          </template>

          <div v-if="selectedRegistration" class="detail-content">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="叫号">
                <el-tag type="primary" effect="dark" size="large">
                  {{ selectedRegistration.visitNumber }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="就诊状态">
                <span :class="['status-tag', `status-${selectedRegistration.status}`]">
                  {{ getStatusLabel(selectedRegistration.status) }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="就诊日期">
                {{ selectedRegistration.scheduleDate }}
              </el-descriptions-item>
              <el-descriptions-item label="患者姓名">
                {{ selectedRegistration.patientName }}
              </el-descriptions-item>
              <el-descriptions-item label="就诊科室">
                {{ selectedRegistration.departmentName }}
              </el-descriptions-item>
              <el-descriptions-item label="接诊医生">
                {{ selectedRegistration.doctorName }}
              </el-descriptions-item>
              <el-descriptions-item label="时段">
                {{ selectedRegistration.timeSlot === 'morning' ? '上午' : '下午' }}
              </el-descriptions-item>
              <el-descriptions-item label="接诊时间" v-if="selectedRegistration.actualVisitTime">
                {{ selectedRegistration.actualVisitTime }}
              </el-descriptions-item>
              <el-descriptions-item label="完成时间" v-if="selectedRegistration.completeTime">
                {{ selectedRegistration.completeTime }}
              </el-descriptions-item>
            </el-descriptions>

            <el-divider />

            <el-card v-if="selectedRegistration.symptoms" class="info-card">
              <template #header>
                <span class="card-subtitle">主诉症状</span>
              </template>
              <p>{{ selectedRegistration.symptoms }}</p>
            </el-card>

            <el-card v-if="selectedRegistration.diagnosis" class="info-card">
              <template #header>
                <span class="card-subtitle">诊断结果</span>
              </template>
              <p>{{ selectedRegistration.diagnosis }}</p>
            </el-card>

            <el-card v-if="currentPrescription" class="info-card">
              <template #header>
                <div class="prescription-header">
                  <span class="card-subtitle">处方详情</span>
                  <el-tag :type="getPrescriptionStatusType(currentPrescription.status)" size="small">
                    {{ getPrescriptionStatusLabel(currentPrescription.status) }}
                  </el-tag>
                </div>
              </template>
              <el-table :data="currentPrescription.items" size="small" border>
                <el-table-column prop="medicineName" label="药品名称" />
                <el-table-column prop="specification" label="规格" />
                <el-table-column prop="dosage" label="剂量" />
                <el-table-column prop="usage" label="用法" />
                <el-table-column prop="quantity" label="数量" width="80" align="center" />
                <el-table-column prop="unit" label="单位" width="60" align="center" />
                <el-table-column prop="price" label="单价" width="100" align="right">
                  <template #default="{ row }">
                    ¥{{ row.price.toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
              <div class="prescription-total">
                总计：<span class="price">¥{{ currentPrescription.totalPrice.toFixed(2) }}</span>
              </div>
            </el-card>
          </div>

          <el-empty v-else description="请从左侧列表选择患者" />
        </el-card>
      </el-col>
    </el-row>

    <RegistrationDialog
      v-model:visible="registrationDialogVisible"
      @success="handleRegistrationSuccess"
    />

    <CompleteVisitDialog
      v-model:visible="completeDialogVisible"
      :registration="selectedRegistration"
      @success="handleCompleteSuccess"
    />

    <PrescriptionDialog
      v-model:visible="prescriptionDialogVisible"
      :registration="selectedRegistration"
      @success="handlePrescriptionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  VideoPlay,
  CircleCheck,
  Document
} from '@element-plus/icons-vue'
import type { Registration, VisitStatus, Prescription } from '@/types'
import { useClinicStore } from '@/stores/clinic'
import RegistrationDialog from '@/components/RegistrationDialog.vue'
import CompleteVisitDialog from '@/components/CompleteVisitDialog.vue'
import PrescriptionDialog from '@/components/PrescriptionDialog.vue'

const clinicStore = useClinicStore()

const registrationDialogVisible = ref(false)
const completeDialogVisible = ref(false)
const prescriptionDialogVisible = ref(false)
const selectedRegistration = ref<Registration | null>(null)
const currentPrescription = ref<Prescription | null>(null)

const waitingList = computed(() => {
  return clinicStore.registrations.filter(r => r.status === 'waiting')
})

function getStatusLabel(status: VisitStatus): string {
  const labels: Record<VisitStatus, string> = {
    waiting: '候诊中',
    ongoing: '就诊中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[status]
}

function getPrescriptionStatusType(status: string): string {
  const types: Record<string, string> = {
    pending: 'warning',
    issued: 'primary',
    dispensed: 'success'
  }
  return types[status] || 'info'
}

function getPrescriptionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待发药',
    issued: '已收费',
    dispensed: '已发药'
  }
  return labels[status] || status
}

function selectRegistration(reg: Registration) {
  selectedRegistration.value = reg
  loadPrescription()
}

async function loadPrescription() {
  if (selectedRegistration.value) {
    currentPrescription.value = await clinicStore.getPrescriptionByRegistration(selectedRegistration.value.id)
  }
}

function handleAddRegistration() {
  registrationDialogVisible.value = true
}

function handleRegistrationSuccess() {
  ElMessage.success('挂号成功')
  clinicStore.fetchRegistrations()
}

async function handleStartVisit() {
  if (!selectedRegistration.value) return
  try {
    await clinicStore.startVisit(selectedRegistration.value.id)
    ElMessage.success('已开始接诊')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function handleCancel() {
  if (!selectedRegistration.value) return
  try {
    await ElMessageBox.confirm(
      `确定要为「${selectedRegistration.value.patientName}」办理退号吗？`,
      '退号确认',
      {
        confirmButtonText: '确定退号',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await clinicStore.cancelRegistration(selectedRegistration.value.id)
    selectedRegistration.value = null
    ElMessage.success('退号成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退号失败')
    }
  }
}

function handleCompleteVisit() {
  completeDialogVisible.value = true
}

function handleCompleteSuccess() {
  ElMessage.success('就诊已完成')
  loadPrescription()
}

function handleCreatePrescription() {
  prescriptionDialogVisible.value = true
}

function handlePrescriptionSuccess() {
  ElMessage.success('处方已开具')
  loadPrescription()
}

async function handleViewPrescription() {
  if (currentPrescription.value) {
    ElMessageBox.alert(
      '请查看处方详情卡片',
      '处方详情',
      { confirmButtonText: '关闭' }
    )
  } else {
    ElMessage.info('该患者暂未开具处方')
  }
}

onMounted(() => {
  clinicStore.fetchRegistrations()
  clinicStore.fetchPatients()
  clinicStore.fetchPrescriptions()
})
</script>

<style scoped lang="scss">
.clinic-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .actions {
    display: flex;
    gap: 8px;
  }
}

.queue-list {
  max-height: 600px;
  overflow-y: auto;
}

.queue-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;

  &:hover {
    background-color: #f5f7fa;
  }

  &.active {
    background-color: #ecf5ff;
    border-left: 4px solid #409eff;
  }

  .queue-number {
    margin-right: 12px;
  }

  .queue-info {
    flex: 1;

    .patient-name {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }

    .dept-doctor {
      font-size: 12px;
      color: #909399;
    }
  }

  .queue-status {
    margin-left: 12px;
  }
}

.patient-detail {
  min-height: 600px;

  .detail-content {
    padding: 16px 0;
  }

  .info-card {
    margin-top: 16px;

    :deep(.el-card__header) {
      padding: 12px 20px;
    }
  }

  .card-subtitle {
    font-weight: 600;
    color: #303133;
  }

  .prescription-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .prescription-total {
    margin-top: 16px;
    text-align: right;
    font-size: 16px;

    .price {
      font-size: 20px;
      font-weight: 700;
      color: #f56c6c;
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
