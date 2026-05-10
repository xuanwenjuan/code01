<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stats-card stats-card-primary">
          <div class="icon-wrapper">
            <el-icon :size="32"><DataLine /></el-icon>
          </div>
          <div class="info">
            <div class="value">{{ clinicStore.queueStats.waiting }}</div>
            <div class="label">候诊中</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stats-card stats-card-info">
          <div class="icon-wrapper">
            <el-icon :size="32"><Stethoscope /></el-icon>
          </div>
          <div class="info">
            <div class="value">{{ clinicStore.queueStats.ongoing }}</div>
            <div class="label">就诊中</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stats-card stats-card-success">
          <div class="icon-wrapper">
            <el-icon :size="32"><CircleCheck /></el-icon>
          </div>
          <div class="info">
            <div class="value">{{ clinicStore.queueStats.completed }}</div>
            <div class="label">已完成</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stats-card stats-card-warning">
          <div class="icon-wrapper">
            <el-icon :size="32"><CircleClose /></el-icon>
          </div>
          <div class="info">
            <div class="value">{{ clinicStore.queueStats.cancelled }}</div>
            <div class="label">已取消</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>科室统计</span>
              <el-tag type="info">{{ systemStore.activeDepartments.length }} 个科室</el-tag>
            </div>
          </template>
          <el-table :data="systemStore.activeDepartments" size="small">
            <el-table-column prop="name" label="科室名称" />
            <el-table-column prop="location" label="位置" />
            <el-table-column label="医生数">
              <template #default="{ row }">
                <el-tag type="primary">{{ getDoctorCount(row.id) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日叫号</span>
              <el-tag type="warning">实时更新</el-tag>
            </div>
          </template>
          <div class="queue-display">
            <div class="current-number">
              <span class="label">当前叫号</span>
              <span class="number">{{ currentQueueNumber }}</span>
            </div>
            <div class="next-number">
              <span class="label">下一位</span>
              <span class="number">{{ nextQueueNumber }}</span>
            </div>
            <div class="waiting-list">
              <div class="waiting-header">等待队列</div>
              <div class="waiting-items">
                <span 
                  v-for="(num, index) in waitingNumbers" 
                  :key="index"
                  class="waiting-item"
                >
                  {{ num }}
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :xs="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近操作记录</span>
              <router-link to="/audit" class="view-all">查看全部</router-link>
            </div>
          </template>
          <el-table :data="recentLogs" size="small">
            <el-table-column prop="operatorName" label="操作人" width="100" />
            <el-table-column label="角色" width="100">
              <template #default="{ row }">
                <el-tag :type="getRoleType(row.operatorRole)" size="small">
                  {{ getRoleLabel(row.operatorRole) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operationDescription" label="操作类型" width="120" />
            <el-table-column prop="targetName" label="操作对象" />
            <el-table-column label="操作时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  DataLine,
  Stethoscope,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'
import { useSystemStore } from '@/stores/system'
import { useClinicStore } from '@/stores/clinic'
import { useAuditStore } from '@/stores/audit'
import type { UserRole } from '@/types'

const router = useRouter()
const systemStore = useSystemStore()
const clinicStore = useClinicStore()
const auditStore = useAuditStore()

const currentQueueNumber = computed(() => {
  const ongoing = clinicStore.registrations.find(r => r.status === 'ongoing')
  return ongoing?.visitNumber || '-'
})

const nextQueueNumber = computed(() => {
  const waiting = clinicStore.registrations.find(r => r.status === 'waiting')
  return waiting?.visitNumber || '-'
})

const waitingNumbers = computed(() => {
  return clinicStore.registrations
    .filter(r => r.status === 'waiting')
    .slice(0, 5)
    .map(r => r.visitNumber)
})

const recentLogs = computed(() => {
  return auditStore.filteredLogs.slice(0, 5)
})

function getDoctorCount(deptId: string): number {
  return systemStore.doctors.filter(d => d.departmentId === deptId).length
}

function getRoleType(role: UserRole): string {
  const types: Record<UserRole, string> = {
    admin: 'danger',
    doctor: 'primary',
    reception: 'success',
    nurse: 'warning'
  }
  return types[role] || 'info'
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: '管理员',
    doctor: '医生',
    reception: '挂号员',
    nurse: '护士'
  }
  return labels[role] || role
}

function formatTime(time: string): string {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  clinicStore.fetchRegistrations()
  clinicStore.fetchPatients()
  auditStore.fetchLogs()
})
</script>

<style scoped lang="scss">
.mt-4 {
  margin-top: 20px;
}

.stats-card {
  display: flex;
  align-items: center;
  padding: 24px;
  border-radius: 12px;
  color: #fff;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &.stats-card-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.stats-card-info {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &.stats-card-success {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  }

  &.stats-card-warning {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .icon-wrapper {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    margin-right: 16px;
  }

  .info {
    .value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .label {
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .view-all {
    color: #409eff;
    font-size: 14px;
  }
}

.queue-display {
  text-align: center;
  padding: 16px 0;

  .current-number, .next-number {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 32px;

    .label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .number {
      font-size: 48px;
      font-weight: 700;
      color: #409eff;
    }
  }

  .current-number {
    .number {
      color: #f56c6c;
    }
  }

  .waiting-list {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px dashed #ebeef5;

    .waiting-header {
      font-size: 14px;
      color: #909399;
      margin-bottom: 12px;
    }

    .waiting-items {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .waiting-item {
      padding: 4px 12px;
      background: #ecf5ff;
      color: #409eff;
      border-radius: 4px;
      font-weight: 600;
    }
  }
}
</style>
