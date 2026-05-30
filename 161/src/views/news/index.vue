<template>
  <div class="news-page">
    <div class="container">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>资讯</el-breadcrumb-item>
        </el-breadcrumb>
        <h1 class="page-title">房产资讯</h1>
      </div>

      <div class="content-row">
        <div class="main-content">
          <div class="category-tabs">
            <span
              class="tab-item"
              :class="{ active: activeCategory === 'all' }"
              @click="activeCategory = 'all'; fetchNewsList()"
            >全部</span>
            <span
              v-for="cat in categories"
              :key="cat.code"
              class="tab-item"
              :class="{ active: activeCategory === cat.code }"
              @click="activeCategory = cat.code; fetchNewsList()"
            >{{ cat.name }}</span>
          </div>

          <div v-loading="loading" class="news-list">
            <NewsCard v-for="item in newsList" :key="item.id" :news-item="item" />
          </div>

          <EmptyState v-if="!loading && newsList.length === 0" description="暂无相关资讯" />

          <div v-if="total > 0" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 30]"
              :total="total"
              layout="total, prev, pager, next"
              background
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
        </div>

        <aside class="sidebar">
          <div class="sidebar-card">
            <div class="sidebar-title">
              <el-icon><TrendCharts /></el-icon>
              热门资讯
            </div>
            <div class="hot-news-list">
              <div
                v-for="(item, index) in hotNewsList"
                :key="item.id"
                class="hot-news-item card-hover"
                @click="goDetail(item.id)"
              >
                <span class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
                <span class="title text-ellipsis">{{ item.title }}</span>
              </div>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-title">
              <el-icon><Collection /></el-icon>
              推荐阅读
            </div>
            <div class="recommend-list">
              <div
                v-for="item in recommendList"
                :key="item.id"
                class="recommend-item card-hover"
                @click="goDetail(item.id)"
              >
                <img :src="item.image" :alt="item.title" />
                <div class="recommend-info">
                  <div class="recommend-title text-ellipsis-2">{{ item.title }}</div>
                  <div class="recommend-meta">
                    <span>{{ item.category }}</span>
                    <span>{{ item.viewCount }}阅读</span>
                  </div>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { mockApi } from '@/utils/mockApi'
import NewsCard from '@/components/NewsCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()

const loading = ref(false)
const activeCategory = ref('all')
const categories = ref([])
const newsList = ref([])
const hotNewsList = ref([])
const recommendList = ref([])
const total = ref(0)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const goDetail = (id) => {
  router.push(`/news/detail/${id}`)
}

const fetchNewsList = async () => {
  loading.value = true
  const res = await mockApi.getNewsList({
    category: activeCategory.value === 'all' ? '' : activeCategory.value,
    page: pagination.page,
    pageSize: pagination.pageSize
  })
  if (res.code === 200) {
    newsList.value = res.data.list
    total.value = res.data.total
  }
  loading.value = false
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchNewsList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchNewsList()
}

onMounted(async () => {
  const [catRes, newsRes, hotRes] = await Promise.all([
    mockApi.getNewsCategories(),
    mockApi.getNewsList({ page: 1, pageSize: 10 }),
    mockApi.getNewsList({ page: 1, pageSize: 10 })
  ])

  if (catRes.code === 200) categories.value = catRes.data
  if (newsRes.code === 200) {
    newsList.value = newsRes.data.list
    total.value = newsRes.data.total
  }
  if (hotRes.code === 200) {
    hotNewsList.value = hotRes.data.list.slice(0, 5)
    recommendList.value = hotRes.data.list.slice(5, 10)
  }
})
</script>

<style lang="scss" scoped>
.news-page {
  padding: 20px 0 40px;
}

.page-header {
  margin-bottom: 20px;

  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 20px 0 0 0;
  }
}

.content-row {
  display: flex;
  gap: 24px;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.category-tabs {
  display: flex;
  gap: 8px;
  background: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 20px;

  .tab-item {
    padding: 6px 16px;
    border-radius: 4px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: #409eff;
    }

    &.active {
      background: #409eff;
      color: #fff;
    }
  }
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;

  .sidebar-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;

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

  .hot-news-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .hot-news-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;

      .rank {
        width: 22px;
        height: 22px;
        border-radius: 4px;
        background: #c0c4cc;
        color: #fff;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.top {
          background: #f56c6c;
        }
      }

      .title {
        font-size: 14px;
        color: #303133;
        flex: 1;
        min-width: 0;
      }
    }
  }

  .recommend-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .recommend-item {
      display: flex;
      gap: 10px;
      padding: 10px;
      border-radius: 6px;
      cursor: pointer;

      img {
        width: 100px;
        height: 70px;
        object-fit: cover;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .recommend-info {
        flex: 1;
        min-width: 0;

        .recommend-title {
          font-size: 13px;
          color: #303133;
          line-height: 1.4;
          margin-bottom: 6px;
        }

        .recommend-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>
