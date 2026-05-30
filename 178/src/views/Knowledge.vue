<template>
  <div class="knowledge-page">
    <div class="page-banner">
      <div class="container">
        <h1 class="banner-title">📚 绿植养护知识</h1>
        <p class="banner-desc">掌握专业养护技巧，让你的绿植茁壮成长</p>
      </div>
    </div>
    
    <div class="container">
      <div class="knowledge-content">
        <div class="sidebar">
          <el-card class="category-card">
            <template #header>
              <span class="card-title">知识分类</span>
            </template>
            <el-menu
              :default-active="selectedCategory"
              class="category-menu"
              @select="handleCategorySelect"
            >
              <el-menu-item index="all">
                <el-icon><Menu /></el-icon>
                <span>全部文章</span>
              </el-menu-item>
              <el-menu-item
                v-for="category in categories"
                :key="category"
                :index="category"
              >
                {{ category }}
              </el-menu-item>
            </el-menu>
          </el-card>

          <el-card class="hot-card">
            <template #header>
              <span class="card-title">热门文章</span>
            </template>
            <div class="hot-list">
              <div
                v-for="(item, index) in hotArticles"
                :key="item.id"
                class="hot-item"
                @click="goDetail(item.id)"
              >
                <span class="hot-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
                <span class="hot-title">{{ item.title }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <div class="main-content">
          <div class="search-section">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索养护知识..."
              size="large"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="articles-grid" v-loading="loading">
            <div
              v-for="article in filteredArticles"
              :key="article.id"
              class="article-card"
              @click="goDetail(article.id)"
            >
              <img :src="article.cover" :alt="article.title" class="article-cover" />
              <div class="article-info">
                <div class="article-meta">
                  <el-tag size="small" type="success">{{ article.category }}</el-tag>
                  <span class="article-views">
                    <el-icon><View /></el-icon>
                    {{ article.views }}
                  </span>
                </div>
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-desc">{{ article.description }}</p>
                <div class="article-footer">
                  <span class="article-author">
                    <el-icon><User /></el-icon>
                    {{ article.author }}
                  </span>
                  <span class="article-date">{{ article.createTime }}</span>
                </div>
              </div>
            </div>
          </div>

          <EmptyState
            v-if="!plantStore.loading && filteredArticles.length === 0"
            description="暂无相关文章"
            show-action
            action-text="查看全部"
            @action="selectedCategory = 'all'; searchKeyword = ''"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlantStore } from '@/stores/plant'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const plantStore = usePlantStore()

const loading = ref(false)
const selectedCategory = ref('all')
const searchKeyword = ref('')

const fetchData = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 300))
  loading.value = false
}

const categories = computed(() => {
  const cats = [...new Set(plantStore.knowledgeList.map(k => k.category))]
  return cats
})

const hotArticles = computed(() => {
  return [...plantStore.knowledgeList]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
})

const filteredArticles = computed(() => {
  let articles = plantStore.knowledgeList
  
  if (selectedCategory.value !== 'all') {
    articles = articles.filter(a => a.category === selectedCategory.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(keyword) ||
      a.description.toLowerCase().includes(keyword)
    )
  }
  
  return articles
})

const handleCategorySelect = (category) => {
  selectedCategory.value = category
}

const handleSearch = () => {
}

const goDetail = (id) => {
  router.push(`/knowledge/${id}`)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.knowledge-page {
  padding-bottom: 40px;
}

.page-banner {
  background: linear-gradient(135deg, #4a7c42 0%, #6b8e23 100%);
  padding: 60px 0;
  color: #fff;
  margin-bottom: 30px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.banner-title {
  font-size: 36px;
  margin: 0 0 10px 0;
}

.banner-desc {
  font-size: 16px;
  opacity: 0.95;
  margin: 0;
}

.knowledge-content {
  display: flex;
  gap: 30px;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.category-card,
.hot-card {
  margin-bottom: 20px;
}

.card-title {
  font-weight: bold;
}

.category-menu {
  border-right: none;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.hot-item:hover {
  background: #f5f7f5;
}

.hot-rank {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  color: #999;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.hot-rank.top {
  background: #f56c6c;
  color: #fff;
}

.hot-title {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.main-content {
  flex: 1;
}

.search-section {
  margin-bottom: 20px;
}

.articles-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  display: flex;
  gap: 20px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.article-card:hover {
  transform: translateX(5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.article-cover {
  width: 240px;
  height: 160px;
  object-fit: cover;
  flex-shrink: 0;
}

.article-info {
  flex: 1;
  padding: 15px 15px 15px 0;
  display: flex;
  flex-direction: column;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.article-views {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.article-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 15px 0;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #999;
}

.article-author {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .knowledge-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .article-card {
    flex-direction: column;
  }
  
  .article-cover {
    width: 100%;
    height: 200px;
  }
  
  .article-info {
    padding: 15px;
  }
}
</style>
