<template>
  <div class="tutorials-page container">
    <div class="card">
      <div class="page-header">
        <h1 class="section-title" style="margin-bottom: 0">陶艺教程</h1>
        <p class="page-desc">从入门到精通，一步步学习陶艺制作技巧</p>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">难度：</span>
          <button
            v-for="level in levels"
            :key="level.value"
            class="filter-btn"
            :class="{ active: selectedLevel === level.value }"
            @click="selectedLevel = level.value"
          >
            {{ level.label }}
          </button>
        </div>
        <div class="filter-group">
          <span class="filter-label">分类：</span>
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="filter-btn"
            :class="{ active: selectedCategory === cat.value }"
            @click="selectedCategory = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <LoadingState v-if="loading" />
      <EmptyState
        v-else-if="filteredTutorials.length === 0"
        description="没有找到相关教程"
        icon="📚"
      />
      <div v-else class="tutorial-grid">
        <div
          v-for="tutorial in filteredTutorials"
          :key="tutorial.id"
          class="tutorial-card"
          @click="handleTutorialClick(tutorial)"
        >
          <div class="tutorial-cover">
            <img :src="tutorial.cover" :alt="tutorial.title" />
            <div class="tutorial-level" :class="tutorial.level">
              {{ tutorial.level }}
            </div>
            <div class="play-overlay">
              <el-icon :size="50"><VideoPlay /></el-icon>
            </div>
          </div>
          <div class="tutorial-content">
            <h3 class="tutorial-title text-ellipsis">{{ tutorial.title }}</h3>
            <p class="tutorial-desc text-ellipsis">{{ tutorial.description }}</p>
            <div class="tutorial-meta">
              <span class="meta-item">
                <el-icon><Timer /></el-icon>
                {{ tutorial.duration }}
              </span>
              <span class="meta-item">
                <el-icon><View /></el-icon>
                {{ formatViews(tutorial.views) }}
              </span>
              <span class="meta-item">
                <el-icon><User /></el-icon>
                {{ tutorial.author }}
              </span>
            </div>
            <div class="tutorial-category">
              <el-tag size="small" type="info">{{ tutorial.category }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'
import LoadingState from '@/components/common/LoadingState.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const appStore = useAppStore()

const loading = ref(true)
const selectedLevel = ref('all')
const selectedCategory = ref('all')

const levels = [
  { label: '全部', value: 'all' },
  { label: '入门', value: '入门' },
  { label: '中级', value: '中级' },
  { label: '高级', value: '高级' }
]

const categories = [
  { label: '全部', value: 'all' },
  { label: '基础技法', value: '基础技法' },
  { label: '拉坯技法', value: '拉坯技法' },
  { label: '施釉技法', value: '施釉技法' },
  { label: '装饰技法', value: '装饰技法' },
  { label: '烧制技术', value: '烧制技术' },
  { label: '趣味陶艺', value: '趣味陶艺' }
]

const filteredTutorials = computed(() => {
  return appStore.tutorials.filter(t => {
    if (selectedLevel.value !== 'all' && t.level !== selectedLevel.value) return false
    if (selectedCategory.value !== 'all' && t.category !== selectedCategory.value) return false
    return true
  })
})

const formatViews = (views) => {
  if (views >= 10000) {
    return (views / 10000).toFixed(1) + '万'
  }
  return views
}

const handleTutorialClick = (tutorial) => {
  ElMessage.info(`正在打开教程：${tutorial.title}`)
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style scoped>
.tutorials-page {
  padding-top: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-desc {
  color: #666;
  margin-top: 8px;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 30px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  color: #666;
  width: 60px;
  flex-shrink: 0;
}

.filter-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 20px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #d4a574;
  color: #d4a574;
}

.filter-btn.active {
  background: #d4a574;
  border-color: #d4a574;
  color: #fff;
}

.tutorial-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.tutorial-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #eee;
}

.tutorial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.tutorial-cover {
  position: relative;
  width: 100%;
  padding-top: 62.5%;
  overflow: hidden;
}

.tutorial-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tutorial-level {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: #fff;
}

.tutorial-level.入门 {
  background: #27ae60;
}

.tutorial-level.中级 {
  background: #f39c12;
}

.tutorial-level.高级 {
  background: #e74c3c;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}

.tutorial-card:hover .play-overlay {
  opacity: 1;
}

.tutorial-content {
  padding: 16px;
}

.tutorial-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.tutorial-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
  height: 36px;
}

.tutorial-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tutorial-category {
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}
</style>
