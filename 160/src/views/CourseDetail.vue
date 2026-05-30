<template>
  <div class="course-detail-page" v-loading="loading">
    <div v-if="course" class="course-hero">
      <div class="container hero-container">
        <div class="hero-left">
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item :to="{ path: '/courses' }">课程列表</el-breadcrumb-item>
              <el-breadcrumb-item>{{ course.name }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="course-tags">
            <el-tag :type="difficultyType" effect="dark" size="small">
              {{ getDifficultyText(course.difficulty) }}
            </el-tag>
            <el-tag type="success" effect="dark" size="small" v-if="course.price === 0">
              免费
            </el-tag>
            <el-tag type="warning" effect="dark" size="small">
              {{ course.categoryName }}
            </el-tag>
          </div>
          
          <h1 class="course-title">{{ course.name }}</h1>
          <p class="course-desc">{{ course.description }}</p>
          
          <div class="course-meta">
            <div class="meta-item">
              <div class="meta-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="meta-content">
                <span class="meta-value">{{ course.rating }}</span>
                <span class="meta-label">课程评分</span>
              </div>
            </div>
            <div class="meta-item">
              <div class="meta-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="meta-content">
                <span class="meta-value">{{ formatCount(course.studentCount) }}</span>
                <span class="meta-label">学习人数</span>
              </div>
            </div>
            <div class="meta-item">
              <div class="meta-icon">
                <el-icon><VideoPlay /></el-icon>
              </div>
              <div class="meta-content">
                <span class="meta-value">{{ course.lessonCount }}</span>
                <span class="meta-label">课时数量</span>
              </div>
            </div>
            <div class="meta-item">
              <div class="meta-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="meta-content">
                <span class="meta-value">{{ formatDuration(course.duration) }}</span>
                <span class="meta-label">总时长</span>
              </div>
            </div>
          </div>
          
          <div class="instructor-info">
            <div class="instructor-avatar-wrapper">
              <el-avatar :size="48" :src="course.instructor?.avatar" />
              <el-icon class="verified-icon" color="#67c23a"><CircleCheck /></el-icon>
            </div>
            <div class="instructor-detail">
              <div class="instructor-name-row">
                <span class="instructor-name">{{ course.instructor?.name }}</span>
                <el-tag type="primary" effect="plain" size="small">认证讲师</el-tag>
              </div>
              <span class="instructor-title">{{ course.instructor?.title }}</span>
            </div>
          </div>
        </div>
        
        <div class="hero-right">
          <div class="course-cover-lg">
            <img :src="course.cover" :alt="course.name" />
            <div class="cover-overlay">
              <el-button 
                v-if="hasPurchased"
                type="primary" 
                size="large"
                @click="startLearning"
              >
                <el-icon><VideoPlay /></el-icon>
                继续学习
              </el-button>
              <el-button 
                v-else
                type="primary" 
                size="large"
                :loading="buying"
                @click="handleBuy"
              >
                {{ course.price === 0 ? '免费学习' : '立即购买' }}
              </el-button>
            </div>
          </div>
          
          <div class="course-action-card">
            <div class="price-section">
              <div class="price-row">
                <span v-if="course.price === 0" class="free-price">免费</span>
                <template v-else>
                  <span class="current-price">¥{{ course.price }}</span>
                  <span v-if="course.originalPrice > course.price" class="original-price">
                    ¥{{ course.originalPrice }}
                  </span>
                  <span v-if="course.originalPrice > course.price" class="discount-tag">
                    {{ Math.round((1 - course.price / course.originalPrice) * 10) }}折
                  </span>
                </template>
              </div>
              <div class="price-tip">
                <el-icon color="#e6a23c"><InfoFilled /></el-icon>
                <span>购买后永久有效，支持离线观看</span>
              </div>
            </div>
            
            <div class="action-buttons">
              <el-button
                v-if="!hasPurchased"
                type="primary"
                size="large"
                class="buy-btn"
                :loading="buying"
                @click="handleBuy"
              >
                <el-icon><ShoppingCart /></el-icon>
                {{ course.price === 0 ? '立即加入学习' : '立即购买' }}
              </el-button>
              <el-button
                v-else
                type="success"
                size="large"
                class="buy-btn"
                @click="startLearning"
              >
                <el-icon><VideoPlay /></el-icon>
                开始学习
              </el-button>
              <el-button
                size="large"
                :type="isFavorited ? 'danger' : 'default'"
                class="favorite-btn"
                @click="handleFavorite"
              >
                <el-icon><Star :fill="isFavorited" /></el-icon>
                {{ isFavorited ? '已收藏' : '收藏课程' }}
              </el-button>
            </div>
            
            <div class="course-features">
              <div class="feature-item">
                <el-icon color="#67c23a"><CircleCheck /></el-icon>
                <span>高清视频画质</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67c23a"><CircleCheck /></el-icon>
                <span>配套源码资料</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67c23a"><CircleCheck /></el-icon>
                <span>讲师答疑服务</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67c23a"><CircleCheck /></el-icon>
                <span>学习社群交流</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="course" class="container course-content">
      <el-tabs v-model="activeTab" class="detail-tabs" type="card">
        <el-tab-pane label="课程简介" name="intro">
          <div class="tab-content">
            <div class="section-card">
              <h3 class="section-title">
                <el-icon color="#667eea"><MagicStick /></el-icon>
                课程亮点
              </h3>
              <div class="highlights-grid">
                <div v-for="(highlight, index) in course.highlights" :key="index" class="highlight-card">
                  <div class="highlight-number">{{ index + 1 }}</div>
                  <span class="highlight-text">{{ highlight }}</span>
                </div>
              </div>
            </div>
            
            <div class="section-card">
              <h3 class="section-title">
                <el-icon color="#667eea"><User /></el-icon>
                适合人群
              </h3>
              <ul class="suitable-list">
                <li>
                  <el-icon color="#67c23a"><Right /></el-icon>
                  零基础想要入门编程的学员
                </li>
                <li>
                  <el-icon color="#67c23a"><Right /></el-icon>
                  想要系统学习某一技术栈的开发者
                </li>
                <li>
                  <el-icon color="#67c23a"><Right /></el-icon>
                  希望提升职场竞争力的在职人员
                </li>
                <li>
                  <el-icon color="#67c23a"><Right /></el-icon>
                  对相关领域感兴趣的爱好者
                </li>
              </ul>
            </div>
            
            <div class="section-card">
              <h3 class="section-title">
                <el-icon color="#667eea"><CollectionTag /></el-icon>
                技术标签
              </h3>
              <div class="tags-list">
                <el-tag v-for="tag in course.tags" :key="tag" type="info" effect="plain" size="large">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="讲师介绍" name="instructor">
          <div class="tab-content instructor-tab">
            <div class="instructor-card">
              <div class="instructor-avatar-section">
                <el-avatar :size="100" :src="course.instructor?.avatar" />
                <div class="instructor-badge">
                  <el-icon color="#67c23a" size="20"><CircleCheck /></el-icon>
                </div>
              </div>
              <div class="instructor-info-detail">
                <h3 class="instructor-name-lg">{{ course.instructor?.name }}</h3>
                <p class="instructor-title-lg">{{ course.instructor?.title }}</p>
                <p class="instructor-desc">{{ course.instructor?.description }}</p>
                <div class="instructor-stats">
                  <div class="stat-card">
                    <span class="stat-value-lg">{{ course.instructor?.courseCount }}</span>
                    <span class="stat-label">门课程</span>
                  </div>
                  <div class="stat-card">
                    <span class="stat-value-lg">{{ formatCount(course.instructor?.totalStudents) }}</span>
                    <span class="stat-label">学员</span>
                  </div>
                  <div class="stat-card">
                    <span class="stat-value-lg">98%</span>
                    <span class="stat-label">好评率</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane :label="`课程目录 (${course.lessonCount})`" name="catalog">
          <div class="tab-content catalog-tab">
            <div class="catalog-header">
              <div class="catalog-info">
                <el-icon color="#667eea"><List /></el-icon>
                <span>共 {{ course.lessons.length }} 章 · {{ course.lessonCount }} 节课程</span>
              </div>
              <div class="catalog-actions">
                <el-button size="small" @click="expandAll">展开全部</el-button>
                <el-button size="small" @click="collapseAll">收起全部</el-button>
              </div>
            </div>
            
            <div class="chapters-list">
              <div
                v-for="chapter in course.lessons"
                :key="chapter.id"
                class="chapter-item"
              >
                <div class="chapter-header" @click="toggleChapter(chapter.id)">
                  <div class="chapter-left">
                    <el-icon class="chapter-icon" :class="{ 'expanded': expandedChapters.includes(chapter.id.toString()) }">
                      <ArrowRight />
                    </el-icon>
                    <span class="chapter-title">{{ chapter.title }}</span>
                  </div>
                  <div class="chapter-right">
                    <span class="chapter-count">{{ chapter.lessons.length }} 节</span>
                    <span class="chapter-duration">{{ getChapterDuration(chapter) }}</span>
                  </div>
                </div>
                
                <div v-show="expandedChapters.includes(chapter.id.toString())" class="chapter-content">
                  <div
                    v-for="lesson in chapter.lessons"
                    :key="lesson.id"
                    class="lesson-item"
                    :class="{ 
                      'can-play': canPlayLesson(lesson),
                      'locked': !canPlayLesson(lesson)
                    }"
                    @click="playLesson(lesson)"
                  >
                    <div class="lesson-left">
                      <div class="lesson-icon-wrapper">
                        <el-icon class="play-icon">
                          <VideoPlay />
                        </el-icon>
                      </div>
                      <span class="lesson-title">{{ lesson.title }}</span>
                    </div>
                    <div class="lesson-right">
                      <el-tag v-if="lesson.free" type="success" size="small" effect="light">
                        免费试看
                      </el-tag>
                      <el-tooltip v-else-if="!hasPurchased" content="请先购买课程" placement="top">
                        <el-icon color="#c0c4cc"><Lock /></el-icon>
                      </el-tooltip>
                      <span class="lesson-duration">{{ formatDuration(lesson.duration) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane :label="`学员评价 (${course.ratingCount})`" name="reviews">
          <div class="tab-content reviews-tab">
            <div class="reviews-summary-card">
              <div class="rating-section">
                <div class="rating-score-display">
                  <span class="score-big">{{ course.rating }}</span>
                  <div class="rating-details">
                    <el-rate v-model="course.rating" disabled :size="20" />
                    <span class="review-total">{{ course.ratingCount }} 条评价</span>
                  </div>
                </div>
                <div class="rating-distribution">
                  <div class="rating-item">
                    <span>5星</span>
                    <el-progress :percentage="85" :stroke-width="8" color="#67c23a" />
                    <span class="percent">85%</span>
                  </div>
                  <div class="rating-item">
                    <span>4星</span>
                    <el-progress :percentage="10" :stroke-width="8" color="#e6a23c" />
                    <span class="percent">10%</span>
                  </div>
                  <div class="rating-item">
                    <span>3星</span>
                    <el-progress :percentage="3" :stroke-width="8" color="#909399" />
                    <span class="percent">3%</span>
                  </div>
                  <div class="rating-item">
                    <span>2星</span>
                    <el-progress :percentage="1" :stroke-width="8" color="#f56c6c" />
                    <span class="percent">1%</span>
                  </div>
                  <div class="rating-item">
                    <span>1星</span>
                    <el-progress :percentage="1" :stroke-width="8" color="#f56c6c" />
                    <span class="percent">1%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="reviews-list">
              <div v-for="review in course.reviews.slice(0, 10)" :key="review.id" class="review-item">
                <div class="review-header">
                  <el-avatar :size="40" :src="review.userAvatar" />
                  <div class="review-user-info">
                    <div class="review-user-row">
                      <span class="user-name">{{ review.userName }}</span>
                      <el-rate v-model="review.rating" disabled :size="14" />
                    </div>
                    <span class="review-time">{{ formatDate(review.createTime) }}</span>
                  </div>
                </div>
                <p class="review-content">{{ review.content }}</p>
              </div>
              
              <div v-if="course.reviews.length > 10" class="load-more">
                <el-button type="primary" plain>查看更多评价</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <EmptyState v-else description="课程不存在或已下架" :show-action="true" action-text="返回列表" @action="goBack" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCourseStore } from '@/store/course'
import { useUserStore } from '@/store/user'
import EmptyState from '@/components/EmptyState.vue'
import {
  Star, User, VideoPlay, Clock, Lock, CircleCheck, 
  ShoppingCart, InfoFilled, MagicStick, Right,
  CollectionTag, List, ArrowRight, ArrowDown
} from '@element-plus/icons-vue'
import {
  getDifficultyText, formatCount, formatDuration, formatDate
} from '@/utils'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const userStore = useUserStore()

const loading = ref(false)
const activeTab = ref('intro')
const expandedChapters = ref(['1'])
const buying = ref(false)

const courseId = computed(() => parseInt(route.params.id))
const course = computed(() => courseStore.getCourseById(courseId.value))

const isFavorited = computed(() => {
  if (!userStore.isLoggedIn) return false
  return userStore.isFavorite(courseId.value)
})

const hasPurchased = computed(() => {
  if (!userStore.isLoggedIn) return false
  return userStore.hasPurchased(courseId.value)
})

const difficultyType = computed(() => {
  const map = { beginner: 'success', intermediate: 'warning', advanced: 'danger' }
  return map[course.value?.difficulty] || 'info'
})

const canPlayLesson = (lesson) => {
  return lesson.free || hasPurchased.value
}

const getChapterDuration = (chapter) => {
  const totalSeconds = chapter.lessons.reduce((sum, lesson) => sum + lesson.duration, 0)
  return formatDuration(totalSeconds)
}

const toggleChapter = (chapterId) => {
  const id = chapterId.toString()
  const index = expandedChapters.value.indexOf(id)
  if (index > -1) {
    expandedChapters.value.splice(index, 1)
  } else {
    expandedChapters.value.push(id)
  }
}

const expandAll = () => {
  if (course.value) {
    expandedChapters.value = course.value.lessons.map(ch => ch.id.toString())
  }
}

const collapseAll = () => {
  expandedChapters.value = []
}

const handleBuy = async () => {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  
  if (course.value.price > 0) {
    try {
      await ElMessageBox.confirm(
        `确定要购买《${course.value.name}》吗？\n价格：¥${course.value.price}`,
        '确认购买',
        {
          confirmButtonText: '确认购买',
          cancelButtonText: '再想想',
          type: 'info'
        }
      )
    } catch {
      return
    }
  }
  
  buying.value = true
  try {
    await userStore.buyCourse(course.value)
    ElMessage.success(course.value.price === 0 ? '已加入学习列表' : '购买成功，开始学习吧！')
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  } finally {
    buying.value = false
  }
}

const startLearning = () => {
  const firstLesson = course.value.lessons[0]?.lessons[0]
  if (firstLesson) {
    router.push(`/video-player/${courseId.value}/${firstLesson.id}`)
  }
}

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  
  const result = userStore.toggleFavorite(courseId.value)
  ElMessage.success(result ? '收藏成功' : '已取消收藏')
}

const playLesson = (lesson) => {
  if (!canPlayLesson(lesson)) {
    if (!userStore.isLoggedIn) {
      router.push({ path: '/login', query: { redirect: route.fullPath } })
      return
    }
    ElMessage.warning('请先购买该课程')
    return
  }
  router.push(`/video-player/${courseId.value}/${lesson.id}`)
}

const goBack = () => {
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
.course-detail-page {
  min-height: calc(100vh - 64px);
}

.course-hero {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px 0;
  color: #fff;
  margin-bottom: 30px;
}

.hero-container {
  display: flex;
  gap: 40px;
}

.hero-left {
  flex: 1;
}

.breadcrumb {
  margin-bottom: 16px;
  
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: rgba(255, 255, 255, 0.7);
      
      &:hover {
        color: #fff;
      }
    }
    
    &:last-child .el-breadcrumb__inner {
      color: #fff;
    }
  }
  
  :deep(.el-breadcrumb__separator) {
    color: rgba(255, 255, 255, 0.5);
  }
}

.course-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.course-title {
  font-size: 28px;
  margin-bottom: 12px;
  line-height: 1.4;
  font-weight: 600;
}

.course-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  line-height: 1.6;
}

.course-meta {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 10px;

    .meta-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
    }

    .meta-content {
      display: flex;
      flex-direction: column;

      .meta-value {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }

      .meta-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .instructor-avatar-wrapper {
    position: relative;

    .verified-icon {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #fff;
      border-radius: 50%;
      padding: 1px;
    }
  }

  .instructor-detail {
    display: flex;
    flex-direction: column;

    .instructor-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;

      .instructor-name {
        font-size: 15px;
        font-weight: 500;
        color: #fff;
      }
    }

    .instructor-title {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

.hero-right {
  width: 320px;
  flex-shrink: 0;
}

.course-cover-lg {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;

  img {
    width: 100%;
    display: block;
  }

  .cover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover .cover-overlay {
    opacity: 1;
  }
}

.course-action-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  color: #303133;

  .price-section {
    margin-bottom: 16px;

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 8px;

      .free-price {
        font-size: 32px;
        font-weight: bold;
        color: #67c23a;
      }

      .current-price {
        font-size: 32px;
        font-weight: bold;
        color: #f56c6c;
      }

      .original-price {
        font-size: 14px;
        color: #c0c4cc;
        text-decoration: line-through;
      }

      .discount-tag {
        padding: 2px 6px;
        background: #fef0f0;
        color: #f56c6c;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
    }

    .price-tip {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #909399;
    }
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;

    .buy-btn {
      width: 100%;
    }

    .favorite-btn {
      width: 100%;
    }
  }

  .course-features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #606266;
    }
  }
}

.course-content {
  padding-bottom: 40px;
}

.detail-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
    background: #fff;
    border-radius: 8px;
    padding: 0 16px;
  }

  :deep(.el-tabs__nav) {
    border: none;
  }

  :deep(.el-tabs__item) {
    height: 48px;
    line-height: 48px;
  }

  :deep(.el-tabs__item.is-active) {
    color: #667eea;
  }

  :deep(.el-tabs__active-bar) {
    background-color: #667eea;
  }
}

.tab-content {
  .section-card {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 20px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #303133;
    }
  }
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .highlight-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf5 100%);
    border-radius: 8px;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    .highlight-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }

    .highlight-text {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }
}

.suitable-list {
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: #606266;
    font-size: 14px;
  }
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.instructor-tab {
  .instructor-card {
    display: flex;
    gap: 32px;
    background: #fff;
    border-radius: 8px;
    padding: 32px;

    .instructor-avatar-section {
      position: relative;
      flex-shrink: 0;

      .instructor-badge {
        position: absolute;
        bottom: 5px;
        right: 5px;
        background: #fff;
        border-radius: 50%;
        padding: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .instructor-info-detail {
      flex: 1;

      .instructor-name-lg {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #303133;
      }

      .instructor-title-lg {
        font-size: 16px;
        color: #667eea;
        margin-bottom: 16px;
        font-weight: 500;
      }

      .instructor-desc {
        color: #606266;
        line-height: 1.8;
        margin-bottom: 24px;
        font-size: 14px;
      }

      .instructor-stats {
        display: flex;
        gap: 48px;

        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;

          .stat-value-lg {
            font-size: 28px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .stat-label {
            font-size: 13px;
            color: #909399;
          }
        }
      }
    }
  }
}

.catalog-tab {
  .catalog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px 20px;
    background: #fff;
    border-radius: 8px;

    .catalog-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }

    .catalog-actions {
      display: flex;
      gap: 8px;
    }
  }

  .chapters-list {
    .chapter-item {
      background: #fff;
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;

      .chapter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #f5f7fa;
        }

        .chapter-left {
          display: flex;
          align-items: center;
          gap: 12px;

          .chapter-icon {
            transition: transform 0.3s;
            color: #667eea;

            &.expanded {
              transform: rotate(90deg);
            }
          }

          .chapter-title {
            font-size: 15px;
            font-weight: 500;
            color: #303133;
          }
        }

        .chapter-right {
          display: flex;
          align-items: center;
          gap: 16px;

          .chapter-count {
            font-size: 13px;
            color: #909399;
          }

          .chapter-duration {
            font-size: 13px;
            color: #667eea;
            font-weight: 500;
          }
        }
      }

      .chapter-content {
        border-top: 1px solid #f0f0f0;
      }

      .lesson-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px 12px 52px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #f5f7fa;
        }

        &.can-play:hover {
          .play-icon {
            color: #667eea;
          }
        }

        &.locked {
          cursor: not-allowed;
          opacity: 0.6;

          &:hover {
            background: transparent;
          }
        }

        .lesson-left {
          display: flex;
          align-items: center;
          gap: 10px;

          .lesson-icon-wrapper {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;

            .play-icon {
              color: #c0c4cc;
              font-size: 16px;
              transition: color 0.2s;
            }
          }

          .lesson-title {
            font-size: 14px;
            color: #303133;
          }
        }

        .lesson-right {
          display: flex;
          align-items: center;
          gap: 12px;

          .lesson-duration {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }
}

.reviews-tab {
  .reviews-summary-card {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 20px;

    .rating-section {
      display: flex;
      gap: 40px;

      .rating-score-display {
        display: flex;
        align-items: center;
        gap: 16px;

        .score-big {
          font-size: 48px;
          font-weight: bold;
          color: #f5a623;
          line-height: 1;
        }

        .rating-details {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .review-total {
            font-size: 14px;
            color: #909399;
          }
        }
      }

      .rating-distribution {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .rating-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #606266;

          :deep(.el-progress) {
            flex: 1;
          }

          .percent {
            min-width: 40px;
            text-align: right;
            color: #909399;
          }
        }
      }
    }
  }

  .reviews-list {
    background: #fff;
    border-radius: 8px;
    padding: 24px;

    .review-item {
      padding: 20px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      &:first-child {
        padding-top: 0;
      }

      .review-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        .review-user-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;

          .review-user-row {
            display: flex;
            align-items: center;
            gap: 8px;

            .user-name {
              font-weight: 500;
              color: #303133;
              font-size: 14px;
            }
          }

          .review-time {
            font-size: 12px;
            color: #c0c4cc;
          }
        }
      }

      .review-content {
        color: #606266;
        line-height: 1.8;
        padding-left: 52px;
        font-size: 14px;
      }
    }

    .load-more {
      text-align: center;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
    }
  }
}

@media (max-width: 1024px) {
  .hero-container {
    flex-direction: column;
  }

  .hero-right {
    width: 100%;
  }

  .course-action-card {
    .course-features {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .highlights-grid {
    grid-template-columns: 1fr;
  }

  .instructor-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .instructor-stats {
    justify-content: center;
  }

  .rating-section {
    flex-direction: column;
    gap: 24px !important;
  }
}

@media (max-width: 640px) {
  .course-meta {
    gap: 16px;

    .meta-item {
      gap: 8px;

      .meta-icon {
        width: 32px;
        height: 32px;
      }

      .meta-content {
        .meta-value {
          font-size: 14px;
        }

        .meta-label {
          font-size: 11px;
        }
      }
    }
  }

  .course-action-card {
    .course-features {
      grid-template-columns: 1fr;
    }
  }

  .catalog-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start !important;
  }
}
</style>
