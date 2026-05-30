<template>
  <div class="home-page">
    <div class="banner-section">
      <div class="banner-content">
        <h1 class="banner-title">🌿 绿植之家</h1>
        <p class="banner-subtitle">让绿色走进生活，让自然触手可及</p>
        <div class="banner-features">
          <div class="feature-item">
            <span class="feature-icon">🚚</span>
            <span>全国配送</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✅</span>
            <span>品质保证</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📚</span>
            <span>专业指导</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="categories-section">
        <h2 class="section-title">
          <el-icon><Grid /></el-icon>
          绿植分类
        </h2>
        <div class="categories-grid">
          <div
            v-for="category in plantStore.categories"
            :key="category.id"
            class="category-card"
            @click="selectCategory(category.id)"
            :class="{ active: selectedCategory === category.id }"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </div>
        </div>
      </div>

      <div class="hot-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><HotWater /></el-icon>
            热门推荐
          </h2>
          <router-link to="/knowledge" class="more-link">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="plants-grid" v-loading="plantStore.loading">
          <PlantCard
            v-for="plant in displayPlants"
            :key="plant.id"
            :plant="plant"
          />
        </div>
        <EmptyState
          v-if="!plantStore.loading && displayPlants.length === 0"
          description="暂无相关绿植"
          show-action
          action-text="查看全部"
          @action="selectedCategory = null"
        />
      </div>

      <div class="knowledge-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><Reading /></el-icon>
            养护知识
          </h2>
          <router-link to="/knowledge" class="more-link">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="knowledge-grid">
          <div
            v-for="item in knowledgeList"
            :key="item.id"
            class="knowledge-card"
            @click="goKnowledgeDetail(item.id)"
          >
            <img :src="item.cover" :alt="item.title" class="knowledge-cover" />
            <div class="knowledge-info">
              <span class="knowledge-category">{{ item.category }}</span>
              <h3 class="knowledge-title">{{ item.title }}</h3>
              <p class="knowledge-desc">{{ item.description }}</p>
              <div class="knowledge-meta">
                <span><el-icon><View /></el-icon> {{ item.views }}</span>
                <span>{{ item.createTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlantStore } from '@/stores/plant'
import PlantCard from '@/components/PlantCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const plantStore = usePlantStore()
const selectedCategory = ref(null)

const knowledgeList = computed(() => plantStore.knowledgeList.slice(0, 3))

const displayPlants = computed(() => {
  const keyword = route.query.keyword
  if (keyword) {
    return plantStore.searchPlants(keyword)
  }
  if (selectedCategory.value) {
    return plantStore.getPlantsByCategory(selectedCategory.value)
  }
  return plantStore.hotPlants
})

const selectCategory = (categoryId) => {
  selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId
}

const goKnowledgeDetail = (id) => {
  router.push(`/knowledge/${id}`)
}

onMounted(() => {
  plantStore.fetchPlants()
})
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 200px);
}

.banner-section {
  background: linear-gradient(135deg, #2d5a27 0%, #4a7c42 50%, #6b8e23 100%);
  padding: 80px 0;
  color: #fff;
  margin-bottom: 40px;
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.banner-title {
  font-size: 48px;
  margin: 0 0 16px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-subtitle {
  font-size: 20px;
  margin: 0 0 30px 0;
  opacity: 0.95;
}

.banner-features {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 40px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.feature-icon {
  font-size: 32px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
}

.more-link {
  color: #4caf50;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.more-link:hover {
  color: #388e3c;
}

.categories-section {
  margin-bottom: 40px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
}

.category-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.category-card.active {
  border-color: #4caf50;
  background: #f1f8e9;
}

.category-icon {
  display: block;
  font-size: 36px;
  margin-bottom: 10px;
}

.category-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.knowledge-section {
  margin-top: 40px;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.knowledge-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.knowledge-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.knowledge-cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.knowledge-info {
  padding: 15px;
}

.knowledge-category {
  display: inline-block;
  padding: 4px 10px;
  background: #e8f5e9;
  color: #4caf50;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 10px;
}

.knowledge-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.knowledge-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.knowledge-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.knowledge-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .plants-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .knowledge-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .plants-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
  .banner-title {
    font-size: 32px;
  }
  .banner-subtitle {
    font-size: 16px;
  }
  .banner-features {
    gap: 30px;
  }
}
</style>
