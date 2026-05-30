<template>
  <div class="video-player-page">
    <div class="player-container">
      <div class="video-wrapper">
        <video
          ref="videoRef"
          class="video-element"
          :src="currentLesson?.videoUrl"
          controls
          autoplay
          @timeupdate="onTimeUpdate"
          @ended="onVideoEnded"
        ></video>
        <div class="video-overlay" v-if="!isPlaying">
          <el-button circle size="large" @click="playVideo">
            <el-icon :size="30"><VideoPlay /></el-icon>
          </el-button>
        </div>
      </div>
      
      <div class="video-info">
        <h2 class="lesson-title">{{ currentLesson?.title }}</h2>
        <div class="lesson-meta">
          <span class="course-name">{{ course?.name }}</span>
          <span class="divider">|</span>
          <span>{{ formatDuration(currentLesson?.duration || 0) }}</span>
        </div>
      </div>
    </div>

    <div class="sidebar">
      <div class="sidebar-header">
        <h3>课程目录</h3>
        <el-button text size="small" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
      <div class="lesson-list">
        <div v-for="chapter in course?.lessons" :key="chapter.id" class="chapter-group">
          <div class="chapter-title">{{ chapter.title }}</div>
          <div
            v-for="lesson in chapter.lessons"
            :key="lesson.id"
            class="lesson-item"
            :class="{
              active: lesson.id === currentLessonId,
              completed: isLessonCompleted(lesson.id),
              locked: !lesson.free && !hasPurchased
            }"
            @click="selectLesson(lesson)"
          >
            <div class="lesson-item-left">
              <el-icon class="lesson-icon">
                <component :is="getLessonIcon(lesson)" />
              </el-icon>
              <span class="lesson-title">{{ lesson.title }}</span>
            </div>
            <div class="lesson-item-right">
              <el-tag v-if="lesson.free" type="success" size="small" effect="plain">
                免费
              </el-tag>
              <el-icon v-else-if="!hasPurchased" size="14" color="#c0c4cc"><Lock /></el-icon>
              <span class="lesson-duration">{{ formatDuration(lesson.duration) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCourseStore } from '@/store/course'
import { useUserStore } from '@/store/user'
import { VideoPlay, Lock, Check, ArrowLeft, CircleCheck } from '@element-plus/icons-vue'
import { formatDuration } from '@/utils'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const userStore = useUserStore()

const videoRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)

const courseId = computed(() => parseInt(route.params.courseId))
const currentLessonId = computed(() => parseInt(route.params.lessonId))
const course = computed(() => courseStore.getCourseById(courseId.value))

const hasPurchased = computed(() => {
  return userStore.hasPurchased(courseId.value)
})

const allLessons = computed(() => {
  if (!course.value) return []
  return course.value.lessons.flatMap(chapter => chapter.lessons)
})

const currentLesson = computed(() => {
  return allLessons.value.find(l => l.id === currentLessonId.value)
})

const completedLessons = ref([1, 2, 3])

const isLessonCompleted = (lessonId) => {
  return completedLessons.value.includes(lessonId)
}

const getLessonIcon = (lesson) => {
  if (isLessonCompleted(lesson.id)) return CircleCheck
  if (lesson.id === currentLessonId.value) return VideoPlay
  if (!lesson.free && !hasPurchased.value) return Lock
  return VideoPlay
}

const canPlayLesson = (lesson) => {
  return lesson.free || hasPurchased.value
}

const selectLesson = (lesson) => {
  if (!canPlayLesson(lesson)) {
    ElMessage.warning('请先购买该课程')
    return
  }
  router.push(`/video-player/${courseId.value}/${lesson.id}`)
}

const playVideo = () => {
  if (videoRef.value) {
    videoRef.value.play()
    isPlaying.value = true
  }
}

const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    const progress = Math.round((currentTime.value / videoRef.value.duration) * 100)
    
    if (progress > 0 && currentLesson.value) {
      const totalLessons = allLessons.value.length
      const currentIndex = allLessons.value.findIndex(l => l.id === currentLessonId.value)
      const overallProgress = Math.round(((currentIndex + (progress / 100)) / totalLessons) * 100)
      userStore.updateLearningProgress(courseId.value, currentLessonId.value, overallProgress)
    }
  }
}

const onVideoEnded = () => {
  isPlaying.value = false
  if (!completedLessons.value.includes(currentLessonId.value)) {
    completedLessons.value.push(currentLessonId.value)
  }
  
  const currentIndex = allLessons.value.findIndex(l => l.id === currentLessonId.value)
  if (currentIndex < allLessons.value.length - 1) {
    const nextLesson = allLessons.value[currentIndex + 1]
    if (canPlayLesson(nextLesson)) {
      ElMessage.success('本课时已完成，即将播放下一课时')
      setTimeout(() => {
        router.push(`/video-player/${courseId.value}/${nextLesson.id}`)
      }, 1500)
    }
  } else {
    ElMessage.success('恭喜你，已完成全部课程学习！')
  }
}

const goBack = () => {
  router.push(`/course/${courseId.value}`)
}

onMounted(() => {
  if (!course.value) {
    router.push('/courses')
    return
  }
  
  if (currentLesson.value && !canPlayLesson(currentLesson.value)) {
    ElMessage.warning('请先购买该课程')
    router.push(`/course/${courseId.value}`)
  }
})

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
})
</script>

<style lang="scss" scoped>
.video-player-page {
  display: flex;
  min-height: calc(100vh - 64px);
  background: #000;
}

.player-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #000;
}

.video-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;

  .video-element {
    width: 100%;
    max-height: calc(100vh - 64px - 80px);
    object-fit: contain;
  }

  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    cursor: pointer;
  }
}

.video-info {
  padding: 16px 24px;
  background: #1a1a1a;
  color: #fff;

  .lesson-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .lesson-meta {
    font-size: 13px;
    color: #909399;

    .course-name {
      color: #667eea;
    }

    .divider {
      margin: 0 12px;
    }
  }
}

.sidebar {
  width: 320px;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e4e7ed;

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .lesson-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
  }

  .chapter-group {
    margin-bottom: 12px;

    .chapter-title {
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      background: #f5f7fa;
    }
  }

  .lesson-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 13px;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #ecf5ff;
      color: #667eea;

      .lesson-icon {
        color: #667eea;
      }
    }

    &.completed {
      color: #67c23a;

      .lesson-icon {
        color: #67c23a;
      }
    }

    &.locked {
      color: #c0c4cc;
      cursor: not-allowed;

      &:hover {
        background: transparent;
      }
    }

    .lesson-item-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      overflow: hidden;

      .lesson-icon {
        flex-shrink: 0;
        font-size: 14px;
        color: #c0c4cc;
      }

      .lesson-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .lesson-item-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      .lesson-duration {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

@media (max-width: 768px) {
  .video-player-page {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: 300px;
    border-left: none;
    border-top: 1px solid #e4e7ed;
  }
}
</style>
