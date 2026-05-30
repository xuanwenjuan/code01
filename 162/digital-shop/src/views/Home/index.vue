<template>
  <div class="home-page">
    <div class="container">
      <div class="banner-section">
        <div class="category-sidebar">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-item"
            @click="$router.push({ path: '/products', query: { categoryId: cat.id } })"
          >
            <el-icon><component :is="cat.icon" /></el-icon>
            <span>{{ cat.name }}</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        <div class="banner-slider">
          <el-carousel :interval="4000" height="400px">
            <el-carousel-item v-for="banner in banners" :key="banner.id">
              <img :src="banner.image" :alt="banner.title" class="banner-image" />
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="quick-actions">
          <div class="action-item" @click="$router.push('/products?isNew=1')">
            <el-icon :size="32" color="#ff9800"><Clock /></el-icon>
            <span>新品上市</span>
          </div>
          <div class="action-item" @click="$router.push('/products?isHot=1')">
            <el-icon :size="32" color="#f56c6c"><Star /></el-icon>
            <span>热卖爆款</span>
          </div>
          <div class="action-item" @click="$router.push('/products')">
            <el-icon :size="32" color="#67c23a"><Shop /></el-icon>
            <span>全部商品</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon color="#f56c6c"><Orange /></el-icon>
            爆款数码好物
          </h2>
          <router-link to="/products?isHot=1" class="more-link">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="product-grid">
          <ProductCard v-for="product in hotProducts" :key="product.id" :product="product" />
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon color="#409eff"><Medal /></el-icon>
            品牌专区
          </h2>
        </div>
        <div class="brand-list">
          <div
            v-for="brand in brands"
            :key="brand.id"
            class="brand-item card-hover"
            @click="$router.push({ path: '/products', query: { brandId: brand.id } })"
          >
            <img :src="brand.logo" :alt="brand.name" />
            <span>{{ brand.name }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon color="#67c23a"><Document /></el-icon>
            数码资讯
          </h2>
          <router-link to="/products" class="more-link">
            更多资讯 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="news-list">
          <div v-for="item in news" :key="item.id" class="news-item card-hover">
            <img :src="item.image" :alt="item.title" class="news-image" />
            <div class="news-info">
              <h3 class="news-title ellipsis-2">{{ item.title }}</h3>
              <span class="news-time">{{ item.createTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon color="#e6a23c"><Present /></el-icon>
            优惠活动
          </h2>
        </div>
        <div class="activity-list">
          <div v-for="activity in activities" :key="activity.id" class="activity-item card-hover">
            <img :src="activity.image" :alt="activity.title" class="activity-image" />
            <div class="activity-info">
              <span class="activity-tag">{{ activity.discount }}</span>
              <h3 class="activity-title">{{ activity.title }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowRight, Clock, Star, Shop, Orange, Medal, Document, Present } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import { categories, banners, brands, products, news, activities } from '@/mock'

const hotProducts = ref([])
const loading = ref(true)

onMounted(() => {
  setTimeout(() => {
    hotProducts.value = products.filter(p => p.isHot).slice(0, 8)
    loading.value = false
  }, 500)
})
</script>

<style scoped lang="scss">
.home-page {
  padding: 20px 0;
}

.banner-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;

  .category-sidebar {
    width: 200px;
    background: #fff;
    border-radius: 8px;
    padding: 10px 0;

    .category-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      cursor: pointer;
      gap: 10px;
      transition: all 0.3s ease;

      &:hover {
        background: #f5f7fa;
        color: #409eff;
      }

      .el-icon:last-child {
        margin-left: auto;
        font-size: 12px;
      }
    }
  }

  .banner-slider {
    flex: 1;
    border-radius: 8px;
    overflow: hidden;

    .banner-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .quick-actions {
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .action-item {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      gap: 8px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }

      span {
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      color: #333;
      margin: 0;
    }

    .more-link {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #999;
      font-size: 14px;

      &:hover {
        color: #409eff;
      }
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.brand-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 15px;

  .brand-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px;
    background: #fafafa;
    border-radius: 8px;
    cursor: pointer;

    img {
      width: 80px;
      height: 40px;
      object-fit: contain;
      margin-bottom: 10px;
    }

    span {
      font-size: 13px;
      color: #666;
    }
  }
}

.news-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  .news-item {
    background: #fafafa;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;

    .news-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .news-info {
      padding: 12px;

      .news-title {
        font-size: 14px;
        color: #333;
        line-height: 1.4;
        margin-bottom: 8px;
      }

      .news-time {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.activity-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  .activity-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;

    .activity-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }

    .activity-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 15px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));

      .activity-tag {
        display: inline-block;
        background: #ff4d4f;
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        margin-bottom: 5px;
      }

      .activity-title {
        color: #fff;
        font-size: 14px;
        margin: 0;
      }
    }
  }
}
</style>
