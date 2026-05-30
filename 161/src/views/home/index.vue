<template>
  <div class="home-page">
    <section class="banner-section">
      <el-carousel height="400px" :interval="4000" arrow="always">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-item" @click="goLink(banner.link)">
            <img :src="banner.image" :alt="banner.title" />
            <div class="banner-content">
              <h2 class="banner-title">{{ banner.title }}</h2>
              <p class="banner-subtitle">{{ banner.subtitle }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <div class="container">
      <section class="categories-section">
        <div class="category-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-item card-hover"
            @click="goLink(category.link)"
          >
            <div class="category-icon" :style="{ background: category.color + '15', color: category.color }">
              <el-icon :size="28"><component :is="category.icon" /></el-icon>
            </div>
            <div class="category-name">{{ category.name }}</div>
          </div>
        </div>
      </section>

      <section class="hot-houses-section">
        <div class="section-header">
          <h2 class="section-title">热门房源</h2>
          <router-link to="/house/list" class="more-link">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div v-loading="loading.houses" class="house-grid">
          <HouseCard v-for="house in hotHouses" :key="house.id" :house="house" />
        </div>
      </section>

      <div class="content-row">
        <section class="news-section">
          <div class="section-header">
            <h2 class="section-title">楼盘快讯</h2>
            <router-link to="/news" class="more-link">
              更多资讯 <el-icon><ArrowRight /></el-icon>
            </router-link>
          </div>
          <div v-loading="loading.news" class="news-list">
            <NewsCard v-for="item in newsList" :key="item.id" :news-item="item" />
          </div>
        </section>

        <aside class="sidebar">
          <div class="sidebar-card">
            <div class="sidebar-title">
              <el-icon><TrendCharts /></el-icon>
              热门搜索
            </div>
            <div class="hot-tags">
              <span
                v-for="(tag, index) in hotTags"
                :key="tag"
                class="hot-tag"
                :class="{ top: index < 3 }"
              >
                <em>{{ index + 1 }}</em>
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-title">
              <el-icon><Service /></el-icon>
              便民服务
            </div>
            <div class="service-list">
              <div class="service-item">
                <el-icon :size="22" color="#409eff"><Phone /></el-icon>
                <span>找房热线</span>
              </div>
              <div class="service-item">
                <el-icon :size="22" color="#67c23a"><Tools /></el-icon>
                <span>装修报价</span>
              </div>
              <div class="service-item">
                <el-icon :size="22" color="#e6a23c"><Calculator /></el-icon>
                <span>房贷计算</span>
              </div>
              <div class="service-item">
                <el-icon :size="22" color="#f56c6c"><Document /></el-icon>
                <span>租房合同</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseStore } from '@/stores/house'
import { mockApi } from '@/utils/mockApi'
import HouseCard from '@/components/HouseCard.vue'
import NewsCard from '@/components/NewsCard.vue'

const router = useRouter()
const houseStore = useHouseStore()

const banners = ref([])
const categories = ref([])
const hotHouses = ref([])
const newsList = ref([])
const hotTags = ref(['整租', '合租', '公寓', '地铁房', '学区房', '精装修', '拎包入住', '南北通透'])

const loading = computed(() => ({
  houses: houseStore.loading,
  news: false
}))

const goLink = (link) => {
  router.push(link)
}

onMounted(async () => {
  const [bannerRes, categoryRes, houseRes, newsRes] = await Promise.all([
    mockApi.getBanners(),
    mockApi.getCategories(),
    houseStore.getHotHouses(8),
    mockApi.getNewsList({ page: 1, pageSize: 4 })
  ])

  if (bannerRes.code === 200) banners.value = bannerRes.data
  if (categoryRes.code === 200) categories.value = categoryRes.data
  if (houseRes.code === 200) {
    hotHouses.value = houseRes.data
  }
  if (newsRes.code === 200) {
    newsList.value = newsRes.data.list
  }
})
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 40px;
}

.banner-section {
  margin-bottom: 30px;

  .banner-item {
    position: relative;
    width: 100%;
    height: 400px;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .banner-content {
      position: absolute;
      left: 10%;
      top: 50%;
      transform: translateY(-50%);
      color: #fff;

      .banner-title {
        font-size: 36px;
        font-weight: 600;
        margin-bottom: 12px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .banner-subtitle {
        font-size: 18px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

.categories-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 30px;

  .category-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 20px;
  }

  .category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 10px;
    border-radius: 8px;
    cursor: pointer;

    .category-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }

    .category-name {
      font-size: 14px;
      color: #303133;
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .section-title {
    margin: 0;
  }

  .more-link {
    display: flex;
    align-items: center;
    color: #909399;
    font-size: 14px;
    transition: color 0.2s;

    &:hover {
      color: #409eff;
    }
  }
}

.hot-houses-section {
  margin-bottom: 30px;

  .house-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

.content-row {
  display: flex;
  gap: 30px;
}

.news-section {
  flex: 1;

  .news-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.sidebar {
  width: 300px;
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

  .hot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .hot-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #f5f7fa;
      border-radius: 20px;
      font-size: 13px;
      color: #606266;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #ecf5ff;
        color: #409eff;
      }

      em {
        font-style: normal;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #c0c4cc;
        color: #fff;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &.top em {
        background: #f56c6c;
      }
    }
  }

  .service-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .service-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 8px;
      background: #f5f7fa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #ecf5ff;
      }

      span {
        font-size: 13px;
        color: #606266;
      }
    }
  }
}
</style>
