<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1 class="page-title">学习概览</h1>
    </div>
    
    <el-row :gutter="20">
      <el-col :xs="12" :sm="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-icon primary">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="stat-value">{{ courseStore.totalCourses }}</div>
          <div class="stat-label">全部课程</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-icon success">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-value">{{ courseStore.completedCourses }}</div>
          <div class="stat-label">已完成</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-icon warning">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-value">{{ courseStore.learningCourses }}</div>
          <div class="stat-label">学习中</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-icon info">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-value">{{ courseStore.totalStudyHours }}</div>
          <div class="stat-label">累计学习(小时)</div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 24px;">
      <el-col :xs="24" :lg="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>学习中课程</span>
              <el-button type="primary" link @click="goToCourses">
                查看全部
              </el-button>
            </div>
          </template>
          
          <div v-if="learningCourses.length > 0">
            <el-table
              :data="learningCourses"
              :show-header="false"
              style="width: 100%;"
            >
              <el-table-column>
                <template #default="{ row }">
                  <div class="table-course-item">
                    <div class="course-info">
                      <div class="course-name">{{ row.name }}</div>
                      <div class="course-meta">
                        <el-tag size="small" :type="statusTagType(row.status)">
                          {{ LearningStatusMap[row.status] }}
                        </el-tag>
                        <span>{{ row.studiedHours }}/{{ row.totalHours }}h</span>
                      </div>
                    </div>
                    <div class="course-progress-mini">
                      <el-progress
                        :percentage="calculateProgress(row.studiedHours, row.totalHours)"
                        :stroke-width="6"
                        :show-text="false"
                      />
                    </div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="暂无学习中的课程" />
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          
          <el-timeline v-if="recentActivity.length > 0">
            <el-timeline-item
              v-for="log in recentActivity"
              :key="log.id"
              :type="timelineType(log.type)"
              :timestamp="formatDate(log.createdAt)"
              placement="top"
            >
              <div class="timeline-item-content">
                <div class="log-type">
                  <el-tag :type="timelineType(log.type)" size="small">
                    {{ OperationTypeMap[log.type] }}
                  </el-tag>
                </div>
                <div class="log-description" :title="log.description">
                  {{ log.description }}
                </div>
                <div v-if="log.courseName" class="log-course">
                  课程: {{ log.courseName }}
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无活动记录" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { useLogStore } from '@/stores/log'
import { LearningStatus, LearningStatusMap, OperationType, OperationTypeMap } from '@/types'
import { calculateProgress, formatDate } from '@/utils'

const router = useRouter()
const courseStore = useCourseStore()
const logStore = useLogStore()

const learningCourses = computed(() => 
  courseStore.courses
    .filter(c => c.status === LearningStatus.LEARNING)
    .slice(0, 5)
)

const recentActivity = computed(() => logStore.getRecentActivity(8))

const goToCourses = (): void => {
  router.push('/courses')
}

const statusTagType = (status: LearningStatus): string => {
  switch (status) {
    case LearningStatus.LEARNING:
      return 'warning'
    case LearningStatus.COMPLETED:
      return 'success'
    default:
      return 'info'
  }
}

const timelineType = (type: OperationType): string => {
  switch (type) {
    case OperationType.CHECK_IN:
    case OperationType.UPDATE_PROGRESS:
    case OperationType.ADD_NOTE:
      return 'success'
    case OperationType.DELETE_COURSE:
      return 'danger'
    case OperationType.UPDATE_STATUS:
    case OperationType.UPDATE_PLAN:
      return 'warning'
    default:
      return 'primary'
  }
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.table-course-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  
  .course-info {
    flex: 1;
    min-width: 0;
    
    .course-name {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 4px;
    }
    
    .course-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #909399;
    }
  }
  
  .course-progress-mini {
    width: 120px;
    flex-shrink: 0;
  }
}

.timeline-item-content {
  .log-type {
    margin-bottom: 4px;
  }
  
  .log-description {
    font-size: 13px;
    color: #606266;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .log-course {
    font-size: 12px;
    color: #909399;
  }
}

.el-timeline {
  margin-bottom: 0;
}
</style>
