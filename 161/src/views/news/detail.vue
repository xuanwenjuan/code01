<template>
  <div class="news-detail-page" v-loading="loading">
    <div class="container" v-if="newsItem">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/news' }">资讯</el-breadcrumb-item>
        <el-breadcrumb-item>资讯详情</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="detail-content">
        <article class="news-article">
          <header class="article-header">
            <h1 class="article-title">{{ newsItem.title }}</h1>
            <div class="article-meta">
              <el-tag size="small" type="primary" effect="plain">{{ newsItem.category }}</el-tag>
              <span class="meta-item">
                <el-icon><User /></el-icon>
                {{ newsItem.author }}
              </span>
              <span class="meta-item">
                <el-icon><Clock /></el-icon>
                {{ newsItem.publishTime }}
              </span>
              <span class="meta-item">
                <el-icon><View /></el-icon>
                {{ newsItem.viewCount }} 阅读
              </span>
            </div>
          </header>

          <div class="article-body" v-html="newsItem.content"></div>
        </article>

        <aside class="sidebar">
          <div class="sidebar-card">
            <div class="sidebar-title">
              <el-icon><TrendCharts /></el-icon>
              相关推荐
            </div>
            <div class="related-list">
              <div
                v-for="item in relatedList"
                :key="item.id"
                class="related-item card-hover"
                @click="goDetail(item.id)"
              >
                <div class="related-title text-ellipsis-2">{{ item.title }}</div>
                <div class="related-meta">
                  <span>{{ item.category }}</span>
                  <span>{{ item.viewCount }}阅读</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockApi } from '@/utils/mockApi'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const newsItem = ref(null)
const relatedList = ref([])

const goDetail = (id) => {
  router.push(`/news/detail/${id}`)
  window.scrollTo(0, 0)
}

onMounted(async () => {
  const [detailRes, listRes] = await Promise.all([
    mockApi.getNewsDetail(route.params.id),
    mockApi.getNewsList({ page: 1, pageSize: 5 })
  ])

  if (detailRes.code === 200) {
    newsItem.value = detailRes.data
  } else {
    ElMessage.error('资讯不存在')
    router.push('/news')
  }

  if (listRes.code === 200) {
    relatedList.value = listRes.data.list.filter((item) => item.id !== Number(route.params.id)).slice(0, 5)
  }

  loading.value = false
})
</script>

<style lang="scss" scoped>
.news-detail-page {
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.detail-content {
  display: flex;
  gap: 24px;
}

.news-article {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  padding: 40px;
}

.article-header {
  padding-bottom: 24px;
  border-bottom: 1px solid #f5f7fa;
  margin-bottom: 30px;

  .article-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 16px 0;
    line-height: 1.4;
  }

  .article-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #909399;
    }
  }
}

.article-body {
  font-size: 15px;
  line-height: 1.8;
  color: #303133;

  :deep(h3) {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 24px 0 12px 0;
  }

  :deep(p) {
    margin: 0 0 16px 0;
    text-indent: 2em;
  }
}

.sidebar {
  width: 300px;
  flex-shrink: 0;

  .sidebar-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    position: sticky;
    top: 84px;

    .sidebar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 16px;
    }
  }

  .related-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .related-item {
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;

      .related-title {
        font-size: 14px;
        color: #303133;
        line-height: 1.5;
        margin-bottom: 6px;
      }

      .related-meta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
