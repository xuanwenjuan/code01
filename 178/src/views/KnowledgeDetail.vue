<template>
  <div class="knowledge-detail-page">
    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/knowledge' }">养护知识</el-breadcrumb-item>
          <el-breadcrumb-item>{{ article?.title }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div v-loading="loading" v-if="article" class="article-content">
        <div class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <el-tag type="success">{{ article.category }}</el-tag>
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ article.author }}
            </span>
            <span class="meta-item">
              <el-icon><View /></el-icon>
              {{ article.views }} 阅读
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ article.createTime }}
            </span>
          </div>
        </div>

        <div class="article-body">
          <img :src="article.cover" :alt="article.title" class="article-cover" />
          <div class="article-html" v-html="formatContent(article.content)"></div>
        </div>

        <div class="article-footer">
          <div class="article-actions">
            <el-button @click="goBack">
              <el-icon><ArrowLeft /></el-icon>
              返回列表
            </el-button>
            <el-button type="primary" @click="shareArticle">
              <el-icon><Share /></el-icon>
              分享文章
            </el-button>
          </div>

          <div class="recommend-section">
            <h3 class="section-title">推荐阅读</h3>
            <div class="recommend-list">
              <div
                v-for="item in recommendArticles"
                :key="item.id"
                class="recommend-item"
                @click="goDetail(item.id)"
              >
                <img :src="item.cover" :alt="item.title" class="recommend-cover" />
                <div class="recommend-info">
                  <h4 class="recommend-title">{{ item.title }}</h4>
                  <p class="recommend-desc">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        v-if="!loading && !article"
        description="文章不存在或已删除"
        show-action
        action-text="返回列表"
        @action="$router.push('/knowledge')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlantStore } from '@/stores/plant'
import { ElMessage } from 'element-plus'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const plantStore = usePlantStore()

const loading = ref(false)
const article = ref(null)

const recommendArticles = computed(() => {
  if (!article.value) return []
  return plantStore.knowledgeList
    .filter(k => k.id !== article.value.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
})

const formatContent = (content) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/## (.*)/g, '<h2 style="color: #2d5a27; margin: 24px 0 16px; font-size: 22px;">$1</h2>')
    .replace(/### (.*)/g, '<h3 style="color: #4a7c42; margin: 20px 0 12px; font-size: 18px;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #333;">$1</strong>')
    .replace(/- (.*)/g, '<li style="margin: 8px 0; padding-left: 8px;">$1</li>')
    .replace(/\d+\. (.*)/g, '<li style="margin: 8px 0; padding-left: 8px;">$1</li>')
}

const goBack = () => {
  router.back()
}

const shareArticle = () => {
  ElMessage.success('链接已复制到剪贴板')
}

const goDetail = (id) => {
  router.push(`/knowledge/${id}`)
  window.scrollTo(0, 0)
}

onMounted(() => {
  const id = route.params.id
  loading.value = true
  setTimeout(() => {
    article.value = plantStore.getKnowledgeById(id)
    loading.value = false
  }, 300)
})
</script>

<style scoped>
.knowledge-detail-page {
  padding: 20px 0 60px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.article-content {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.article-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.article-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 15px 0;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #999;
}

.article-body {
  margin-bottom: 40px;
}

.article-cover {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 30px;
}

.article-html {
  font-size: 16px;
  line-height: 2;
  color: #444;
}

.article-html :deep(h2) {
  color: #2d5a27;
  margin: 24px 0 16px;
  font-size: 22px;
  font-weight: bold;
}

.article-html :deep(h3) {
  color: #4a7c42;
  margin: 20px 0 12px;
  font-size: 18px;
  font-weight: bold;
}

.article-html :deep(strong) {
  color: #333;
  font-weight: bold;
}

.article-html :deep(li) {
  margin: 8px 0;
  padding-left: 8px;
}

.article-footer {
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.article-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
}

.recommend-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.recommend-item {
  cursor: pointer;
  transition: transform 0.3s;
}

.recommend-item:hover {
  transform: translateY(-3px);
}

.recommend-cover {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.recommend-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin: 0 0 6px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommend-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .article-content {
    padding: 20px;
  }
  
  .article-title {
    font-size: 22px;
  }
  
  .recommend-list {
    grid-template-columns: 1fr;
  }
}
</style>
