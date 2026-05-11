<template>
  <div class="dashboard">
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6" v-for="stat in statistics" :key="stat.title">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="30"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="flex-between">
              <span>近期预约</span>
              <el-button type="primary" link @click="$router.push('/appointments')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentAppointments" style="width: 100%" :height="300">
            <el-table-column prop="memberName" label="会员" width="100" />
            <el-table-column prop="courseName" label="课程" width="120" />
            <el-table-column prop="coachName" label="教练" width="100" />
            <el-table-column prop="appointmentTime" label="预约时间">
              <template #default="{ row }">
                {{ formatDateTime(row.appointmentTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="flex-between">
              <span>近期操作日志</span>
              <el-button type="primary" link @click="$router.push('/logs')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentLogs" style="width: 100%" :height="300">
            <el-table-column prop="operatorName" label="操作人" width="100" />
            <el-table-column prop="operationType" label="操作类型" width="120" />
            <el-table-column prop="operationModule" label="模块" width="100" />
            <el-table-column prop="targetName" label="目标" width="100" />
            <el-table-column prop="operationTime" label="时间">
              <template #default="{ row }">
                {{ formatDateTime(row.operationTime) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useMemberStore } from '@/stores/member'
import { useCardStore } from '@/stores/card'
import { useAppointmentStore } from '@/stores/appointment'
import { useLogStore } from '@/stores/log'
import type { AppointmentStatus } from '@/types'

const memberStore = useMemberStore()
const cardStore = useCardStore()
const appointmentStore = useAppointmentStore()
const logStore = useLogStore()

const statistics = ref([
  { title: '会员总数', value: 0, icon: 'User', color: '#409eff' },
  { title: '有效卡种', value: 0, icon: 'Tickets', color: '#67c23a' },
  { title: '待处理预约', value: 0, icon: 'Calendar', color: '#e6a23c' },
  { title: '今日签到', value: 0, icon: 'Check', color: '#f56c6c' },
])

const recentAppointments = computed(() => appointmentStore.appointments.slice(0, 10))
const recentLogs = computed(() => logStore.logs.slice(0, 10))

function getStatusType(status: AppointmentStatus): 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<AppointmentStatus, 'success' | 'warning' | 'info' | 'danger'> = {
    booked: 'warning',
    checked_in: 'success',
    cancelled: 'info',
  }
  return map[status]
}

function getStatusText(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    booked: '已预约',
    checked_in: '已签到',
    cancelled: '已取消',
  }
  return map[status]
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  await Promise.all([
    memberStore.fetchMembers(1, 100),
    cardStore.fetchCards(1, 100),
    appointmentStore.fetchAppointments(1, 10),
    logStore.fetchLogs(1, 10),
  ])

  statistics.value = [
    { title: '会员总数', value: memberStore.total, icon: 'User', color: '#409eff' },
    {
      title: '有效卡种',
      value: cardStore.cards.filter((c) => c.status === 'active').length,
      icon: 'Tickets',
      color: '#67c23a',
    },
    {
      title: '待处理预约',
      value: appointmentStore.appointments.filter((a) => a.status === 'booked').length,
      icon: 'Calendar',
      color: '#e6a23c',
    },
    {
      title: '今日签到',
      value: appointmentStore.appointments.filter((a) => {
        const today = new Date().toISOString().split('T')[0]
        return a.status === 'checked_in' && a.checkInTime?.startsWith(today)
      }).length,
      icon: 'Check',
      color: '#f56c6c',
    },
  ]
})
</script>

<style scoped>
.dashboard {
  min-height: 100%;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.mb-20 {
  margin-bottom: 20px;
}
</style>
