<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import { useReadingStore } from '@/stores/readingStore'
import { useLogStore } from '@/stores/logStore'
import { getMockBooks, getMockRecords, getMockLogs } from '@/mock'
import { BOOK_CATEGORY_OPTIONS, OPERATION_TYPE_LABELS } from '@/constants'
import dayjs from 'dayjs'

const bookStore = useBookStore()
const readingStore = useReadingStore()
const logStore = useLogStore()

onMounted(() => {
  if (bookStore.books.length === 0) {
    bookStore.setBooks(getMockBooks())
  }
  if (readingStore.records.length === 0) {
    readingStore.records = getMockRecords()
  }
  if (logStore.logs.length === 0) {
    logStore.logs = getMockLogs()
  }
})

const statsCards = computed(() => [
  {
    title: '总藏书量',
    value: bookStore.totalBooks,
    icon: 'Collection',
    color: '#409eff',
    bgColor: 'rgba(64, 158, 255, 0.1)'
  },
  {
    title: '正在阅读',
    value: bookStore.readingBooks.length,
    icon: 'Reading',
    color: '#67c23a',
    bgColor: 'rgba(103, 194, 58, 0.1)'
  },
  {
    title: '已读完',
    value: bookStore.finishedBooks.length,
    icon: 'CircleCheck',
    color: '#e6a23c',
    bgColor: 'rgba(230, 162, 60, 0.1)'
  },
  {
    title: '今日阅读',
    value: `${readingStore.todayPagesRead}页`,
    icon: 'Calendar',
    color: '#f56c6c',
    bgColor: 'rgba(245, 108, 108, 0.1)'
  }
])

const readingStats = computed(() => ({
  streak: readingStore.checkInStreak,
  weeklyPages: readingStore.weeklyPagesRead,
  weeklyMinutes: readingStore.weeklyRecords.reduce((sum, r) => sum + r.duration, 0),
  goalPages: readingStore.goal.pagesPerDay,
  goalMinutes: readingStore.goal.minutesPerDay,
  goalBooks: readingStore.goal.booksPerYear
}))

const recentLogs = computed(() => logStore.recentLogs.slice(0, 10))

const getCategoryLabel = (category: string) => {
  const option = BOOK_CATEGORY_OPTIONS.find(opt => opt.value === category)
  return option?.label || category
}

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const formatOperationType = (type: string) => {
  return OPERATION_TYPE_LABELS[type as keyof typeof OPERATION_TYPE_LABELS] || type
}
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :xs="12" :sm="6" v-for="(card, index) in statsCards" :key="index">
        <el-card class="stat-card" :style="{ borderLeftColor: card.color }">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">{{ card.title }}</div>
              <div class="stat-value">{{ card.value }}</div>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: card.bgColor, color: card.color }">
              <el-icon :size="28"><component :is="card.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :lg="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>阅读统计</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-box">
                <div class="stat-box-icon" style="color: #e6a23c;">
                  <el-icon :size="36"><Fire /></el-icon>
                </div>
                <div class="stat-box-content">
                  <div class="stat-box-title">连续打卡</div>
                  <div class="stat-box-value">{{ readingStats.streak }} 天</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-box">
                <div class="stat-box-icon" style="color: #67c23a;">
                  <el-icon :size="36"><Document /></el-icon>
                </div>
                <div class="stat-box-content">
                  <div class="stat-box-title">本周阅读</div>
                  <div class="stat-box-value">{{ readingStats.weeklyPages }} 页</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-box">
                <div class="stat-box-icon" style="color: #409eff;">
                  <el-icon :size="36"><Clock /></el-icon>
                </div>
                <div class="stat-box-content">
                  <div class="stat-box-title">本周时长</div>
                  <div class="stat-box-value">{{ readingStats.weeklyMinutes }} 分钟</div>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-divider />

          <el-row :gutter="20">
            <el-col :span="8">
              <div class="goal-item">
                <div class="goal-label">年度读书目标</div>
                <el-progress :percentage="Math.min((bookStore.finishedBooks.length / readingStats.goalBooks) * 100, 100)">
                  <template #default="{ percentage }">
                    <span>{{ bookStore.finishedBooks.length }}/{{ readingStats.goalBooks }} 本</span>
                  </template>
                </el-progress>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="goal-item">
                <div class="goal-label">每日页数目标</div>
                <el-progress :percentage="Math.min((readingStore.todayPagesRead / readingStats.goalPages) * 100, 100)">
                  <template #default="{ percentage }">
                    <span>{{ readingStore.todayPagesRead }}/{{ readingStats.goalPages }} 页</span>
                  </template>
                </el-progress>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="goal-item">
                <div class="goal-label">每日时长目标</div>
                <el-progress :percentage="Math.min((readingStore.todayDuration / readingStats.goalMinutes) * 100, 100)">
                  <template #default="{ percentage }">
                    <span>{{ readingStore.todayDuration }}/{{ readingStats.goalMinutes }} 分钟</span>
                  </template>
                </el-progress>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近操作</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="log in recentLogs"
              :key="log.id"
              :timestamp="formatTime(log.createdAt)"
              placement="top"
            >
              <div class="log-item">
                <el-tag size="small">{{ formatOperationType(log.type) }}</el-tag>
                <div class="log-desc">{{ log.description }}</div>
              </div>
            </el-timeline-item>
            <el-timeline-item v-if="recentLogs.length === 0" type="info">
              暂无操作记录
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  .stat-card {
    :deep(.el-card__body) {
      padding: 20px;
    }

    border-left: 4px solid;
  }

  .stat-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stat-info {
    .stat-title {
      font-size: 14px;
      color: $text-secondary;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: $text-primary;
    }
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-weight: 600;
      font-size: 16px;
    }
  }

  .stat-box {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: $bg-color;
    border-radius: 8px;

    .stat-box-content {
      .stat-box-title {
        font-size: 13px;
        color: $text-secondary;
        margin-bottom: 4px;
      }

      .stat-box-value {
        font-size: 22px;
        font-weight: 600;
        color: $text-primary;
      }
    }
  }

  .goal-item {
    .goal-label {
      font-size: 13px;
      color: $text-secondary;
      margin-bottom: 8px;
    }
  }

  .log-item {
    .log-desc {
      font-size: 13px;
      color: $text-regular;
      margin-top: 6px;
      line-height: 1.5;
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .stat-value {
    font-size: 22px !important;
  }

  .stat-icon {
    width: 50px !important;
    height: 50px !important;

    .el-icon {
      font-size: 24px !important;
    }
  }
}
</style>
