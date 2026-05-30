<template>
  <div class="learning-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">学习中心</h1>
        <p class="page-subtitle">继续你的学习之旅</p>
      </div>

      <div class="learning-stats card">
        <div class="stat-item">
          <span class="stat-value">{{ purchasedCourses.length }}</span>
          <span class="stat-label">已购课程</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ completedCourses.length }}</span>
          <span class="stat-label">已完成课程</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalStudyHours }}</span>
          <span class="stat-label">学习时长(h)</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ averageProgress }}%</span>
          <span class="stat-label">平均进度</span>
        </div>
      </div>

      <div class="course-tabs">
        <el-tabs v-model="activeTab" class="learning-tabs">
          <el-tab-pane label="学习中" name="learning">
            <div v-loading="loading" class="course-list">
              <div
                v-for="item in learningCourses"
                :key="item.course.id"
                class="course-item card"
                @click="goToCourse(item.course.id)"
              >
                <div class="course-cover">
                  <img :src="item.course.cover" :alt="item.course.name" />
                  <div class="progress-overlay">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ item.progress }}%</span>
                  </div>
                </div>
                <div class="course-info">
                  <h3 class="course-name">{{ item.course.name }}</h3>
                  <p class="course-instructor">{{ item.course.instructor?.name }}</p>
                  <div class="course-meta">
                    <span>上次学习: {{ formatDate(item.lastStudyTime) }}</span>
                  </div>
                  <el-button type="primary" size="small" class="continue-btn">
                    继续学习
                  </el-button>
                </div>
              </div>
              <EmptyState
                v-if="learningCourses.length === 0 && !loading"
                description="还没有正在学习的课程"
                :show-action="true"
                action-text="去选课"
                @action="goToCourses"
              />
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="已完成" name="completed">
            <div v-loading="loading" class="course-list">
              <div
                v-for="item in completedCourses"
                :key="item.course.id"
                class="course-item card"
                @click="goToCourseDetail(item.course.id)"
              >
                <div class="course-cover">
                  <img :src="item.course.cover" :alt="item.course.name" />
                  <div class="completed-badge">
                    <el-icon size="20"><CircleCheck /></el-icon>
                    <span>已完成</span>
                  </div>
                </div>
                <div class="course-info">
                  <h3 class="course-name">{{ item.course.name }}</h3>
                  <p class="course-instructor">{{ item.course.instructor?.name }}</p>
                  <div class="course-meta">
                    <span>完成时间: {{ formatDate(item.lastStudyTime) }}</span>
                  </div>
                  <el-button type="success" size="small" class="continue-btn" disabled>
                    已完成
                  </el-button>
                </div>
              </div>
              <EmptyState
                v-if="completedCourses.length === 0 && !loading"
                description="还没有完成的课程"
                :show-action="true"
                action-text="去学习"
                @action="activeTab = 'learning'"
              />
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="全部课程" name="all">
            <div v-loading="loading" class="course-list">
              <div
                v-for="item in allCourses"
                :key="item.course.id"
                class="course-item card"
                @click="goToCourse(item.course.id)"
              >
                <div class="course-cover">
                  <img :src="item.course.cover" :alt="item.course.name" />
                  <div v-if="item.progress === 100" class="completed-badge">
                    <el-icon size="20"><CircleCheck /></el-icon>
                  </div>
                  <div v-else class="progress-overlay">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ item.progress }}%</span>
                  </div>
                </div>
                <div class="course-info">
                  <h3 class="course-name">{{ item.course.name }}</h3>
                  <p class="course-instructor">{{ item.course.instructor?.name }}</p>
                  <div class="course-meta">
                    <span v-if="item.lastStudyTime">上次学习: {{ formatDate(item.lastStudyTime) }}</span>
                    <span v-else>尚未开始</span>
                  </div>
                  <el-button
                    :type="item.progress === 100 ? 'success' : 'primary'"
                    size="small"
                    class="continue-btn"
                    :disabled="item.progress === 100"
                  >
                    {{ item.progress === 100 ? '已完成' : '继续学习' }}
                  </el-button>
                </div>
              </div>
              <EmptyState
                v-if="allCourses.length === 0 && !loading"
                description="还没有购买任何课程"
                :show-action="true"
                action-text="去选课"
                @action="goToCourses"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useCourseStore } from '@/store/course'
import EmptyState from '@/components/EmptyState.vue'
import { CircleCheck } from '@element-plus/icons-vue'
import { formatDate } from '@/utils'

const userStore = useUserStore()
const courseStore = useCourseStore()
const router = useRouter()

const loading = ref(false)
const activeTab = ref('learning')

const purchasedCourses = computed(() => {
  return userStore.orders
    .filter(o => o.status === 'paid')
    .map(order => {
      const course = courseStore.getCourseById(order.courseId)
      const record = userStore.learningRecords.find(r => r.courseId === order.courseId)
      return {
        course,
        progress: record?.progress || 0,
        lastStudyTime: record?.lastStudyTime
      }
    })
    .filter(item => item.course)
})

const learningCourses = computed(() => {
  return purchasedCourses.value.filter(item => item.progress < 100)
})

const completedCourses = computed(() => {
  return purchasedCourses.value.filter(item => item.progress === 100)
})

const allCourses = computed(() => purchasedCourses.value)

const totalStudyHours = computed(() => {
  const totalSeconds = purchasedCourses.value.reduce((sum, item) => {
    const courseDuration = item.course?.duration || 0
    return sum + (courseDuration * item.progress / 100)
  }, 0)
  return Math.round(totalSeconds / 3600)
})

const averageProgress = computed(() => {
  if (purchasedCourses.value.length === 0) return 0
  const totalProgress = purchasedCourses.value.reduce((sum, item) => sum + item.progress, 0)
  return Math.round(totalProgress / purchasedCourses.value.length)
})

const goToCourse = (courseId) => {
  const course = courseStore.getCourseById(courseId)
  const record = userStore.learningRecords.find(r => r.courseId === courseId)
  const lessonId = record?.lastLessonId || course?.lessons[0]?.lessons[0]?.id
  if (lessonId) {
    router.push(`/video-player/${courseId}/${lessonId}`)
  }
}

const goToCourseDetail = (courseId) => {
  router.push(`/course/${courseId}`)
}

const goToCourses = () => {
  router.push('/courses')
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.learning-page {
  padding: 30px 0;
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #303133;
  }

  .page-subtitle {
    font-size: 14px;
    color: #909399;
  }
}

.learning-stats {
  display: flex;
  justify-content: space-around;
  padding: 24px;
  margin-bottom: 30px;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

.course-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  min-height: 300px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.course-item {
  display: flex;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;

  .course-cover {
    position: relative;
    width: 160px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .progress-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 10px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));

      .progress-bar {
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 4px;

        .progress-fill {
          height: 100%;
          background: #67c23a;
          transition: width 0.3s;
        }
      }

      .progress-text {
        font-size: 11px;
        color: #fff;
      }
    }

    .completed-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #67c23a;
      background: rgba(255, 255, 255, 0.95);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      gap: 2px;
    }
  }

  .course-info {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;

    .course-name {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }

    .course-instructor {
      font-size: 12px;
      color: #909399;
      margin-bottom: 8px;
    }

    .course-meta {
      font-size: 12px;
      color: #c0c4cc;
      margin-bottom: auto;
    }

    .continue-btn {
      align-self: flex-start;
    }
  }
}
</style>
