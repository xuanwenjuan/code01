<script setup lang="ts">
import { computed } from 'vue'
import { useClubStore } from '@/stores/club'
import { useActivityStore } from '@/stores/activity'
import { useRegistrationStore } from '@/stores/registration'
import { ActivityStatus as AS, activityStatusLabels, RegistrationStatus as RS, clubCategoryLabels } from '@/types'
import { useRouter } from 'vue-router'

const router = useRouter()
const clubStore = useClubStore()
const activityStore = useActivityStore()
const registrationStore = useRegistrationStore()

const statistics = computed(() => {
  const clubs = clubStore.clubList.length
  const activities = activityStore.activityList.length
  const preparing = activityStore.getActivitiesByStatus(AS.PREPARING).length
  const signingUp = activityStore.getActivitiesByStatus(AS.SIGNING_UP).length
  const ended = activityStore.getActivitiesByStatus(AS.ENDED).length
  const cancelled = activityStore.getActivitiesByStatus(AS.CANCELLED).length
  const registrations = registrationStore.registrationList.length
  const checkedIn = registrationStore.getRegistrationsByStatus(RS.CHECKED_IN).length
  return {
    clubs,
    activities,
    preparing,
    signingUp,
    ended,
    cancelled,
    registrations,
    checkedIn
  }
})

const recentActivities = computed(() =>
  activityStore.activityList.slice(0, 5)
)

const activityStatusDistribution = computed(() => [
  {
    name: activityStatusLabels[AS.PREPARING],
    value: statistics.value.preparing,
    type: 'warning'
  },
  {
    name: activityStatusLabels[AS.SIGNING_UP],
    value: statistics.value.signingUp,
    type: 'success'
  },
  {
    name: activityStatusLabels[AS.ENDED],
    value: statistics.value.ended,
    type: 'info'
  },
  {
    name: activityStatusLabels[AS.CANCELLED],
    value: statistics.value.cancelled,
    type: 'danger'
  }
])

const clubStats = computed(() => {
  const categoryMap = new Map<string, number>()
  clubStore.clubList.forEach((club) => {
    const category = clubCategoryLabels[club.category]
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
  })
  return Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    count
  }))
})

function navigateTo(path: string): void {
  router.push(path)
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">系统概览</h1>
    </div>

    <el-row :gutter="20" class="mb-6">
      <el-col :span="6">
        <div class="stat-card cursor-pointer" @click="navigateTo('/clubs')">
          <div class="flex justify-between items-start">
            <div>
              <div class="stat-value text-blue-500">{{ statistics.clubs }}</div>
              <div class="stat-label">社团总数</div>
            </div>
            <el-icon :size="40" color="#409eff20">
              <OfficeBuilding />
            </el-icon>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card cursor-pointer" @click="navigateTo('/activities')">
          <div class="flex justify-between items-start">
            <div>
              <div class="stat-value text-green-500">{{ statistics.activities }}</div>
              <div class="stat-label">活动总数</div>
            </div>
            <el-icon :size="40" color="#67c23a20">
              <Calendar />
            </el-icon>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card cursor-pointer" @click="navigateTo('/registrations')">
          <div class="flex justify-between items-start">
            <div>
              <div class="stat-value text-orange-500">{{ statistics.registrations }}</div>
              <div class="stat-label">报名总数</div>
            </div>
            <el-icon :size="40" color="#e6a23c20">
              <User />
            </el-icon>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card cursor-pointer" @click="navigateTo('/logs')">
          <div class="flex justify-between items-start">
            <div>
              <div class="stat-value text-purple-500">{{ statistics.checkedIn }}</div>
              <div class="stat-label">已签到人数</div>
            </div>
            <el-icon :size="40" color="#90939920">
              <Check />
            </el-icon>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <div class="table-container mb-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">最近活动</h2>
            <el-button link type="primary" @click="navigateTo('/activities')">
              查看全部 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <el-table :data="recentActivities" stripe>
            <el-table-column prop="title" label="活动名称" min-width="180">
              <template #default="{ row }">
                <span class="font-medium">{{ row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="clubName" label="所属社团" width="140" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="
                    row.status === 'preparing'
                      ? 'warning'
                      : row.status === 'signing_up'
                      ? 'success'
                      : 'info'
                  "
                  effect="light"
                >
                  {{ activityStatusLabels[row.status] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="报名情况" width="160">
              <template #default="{ row }">
                <div class="flex items-center gap-2">
                  <el-progress
                    :percentage="Math.round((row.currentParticipants / row.maxParticipants) * 100)"
                    :stroke-width="10"
                    :status="
                      row.currentParticipants / row.maxParticipants >= 0.8 ? 'exception' : undefined
                    "
                  />
                  <span class="text-xs text-gray-500">
                    {{ row.currentParticipants }}/{{ row.maxParticipants }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="160" />
          </el-table>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="table-container mb-4">
          <h2 class="text-lg font-semibold mb-4">活动状态分布</h2>
          <div class="space-y-4">
            <div
              v-for="item in activityStatusDistribution"
              :key="item.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <el-tag :type="item.type" effect="light">
                  {{ item.name }}
                </el-tag>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-2xl font-bold">{{ item.value }}</span>
                <span class="text-gray-400">个活动</span>
              </div>
            </div>
            <el-divider />
            <div class="text-center">
              <div class="text-4xl font-bold text-gray-800">
                {{ statistics.activities }}
              </div>
              <div class="text-gray-500 mt-1">活动总数</div>
            </div>
          </div>
        </div>

        <div class="table-container">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">社团分布</h2>
            <el-button link type="primary" @click="navigateTo('/clubs')">
              管理 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <el-table :data="clubStats" stripe>
            <el-table-column prop="name" label="社团类别" />
            <el-table-column prop="count" label="数量" align="center">
              <template #default="{ row }">
                <el-tag type="primary" effect="plain">
                  {{ row.count }} 个
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.mb-6 {
  margin-bottom: 24px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-1 {
  margin-top: 4px;
}
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
.items-start {
  align-items: flex-start;
}
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
.font-medium {
  font-weight: 500;
}
.font-semibold {
  font-weight: 600;
}
.font-bold {
  font-weight: 700;
}
.text-lg {
  font-size: 18px;
}
.text-2xl {
  font-size: 24px;
}
.text-4xl {
  font-size: 36px;
}
.text-blue-500 {
  color: #409eff;
}
.text-green-500 {
  color: #67c23a;
}
.text-orange-500 {
  color: #e6a23c;
}
.text-purple-500 {
  color: #909399;
}
.text-gray-400 {
  color: #c0c4cc;
}
.text-gray-500 {
  color: #909399;
}
.text-gray-800 {
  color: #303133;
}
.text-xs {
  font-size: 12px;
}
.cursor-pointer {
  cursor: pointer;
}
.space-y-4 > * + * {
  margin-top: 16px;
}
.text-center {
  text-align: center;
}
</style>
