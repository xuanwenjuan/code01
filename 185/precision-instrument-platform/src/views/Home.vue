<template>
  <div class="home-page">
    <div class="banner-section">
      <div class="container">
        <el-carousel :interval="4000" arrow="hover" height="360px">
          <el-carousel-item v-for="banner in productStore.allBanners" :key="banner.id">
            <div class="banner-item" @click="goToLink(banner.link)">
              <img :src="banner.image" :alt="banner.title" />
              <div class="banner-content">
                <h2>{{ banner.title }}</h2>
                <p>{{ banner.subtitle }}</p>
                <el-button type="primary" size="large">立即查看</el-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>

    <div class="categories-section">
      <div class="container">
        <div class="section-title">
          <h2>配件品类分类</h2>
        </div>
        <div class="category-grid">
          <div
            class="category-item"
            v-for="category in productStore.allCategories"
            :key="category.id"
            @click="goToCategory(category.id)"
          >
            <div class="category-icon">
              <el-icon :size="40">
                <component :is="category.icon" />
              </el-icon>
            </div>
            <h3>{{ category.name }}</h3>
            <p>{{ category.count }} 件商品</p>
          </div>
        </div>
      </div>
    </div>

    <div class="products-section">
      <div class="container">
        <div class="section-title">
          <h2>热销配件</h2>
          <span class="more-link" @click="goToAll">查看更多 →</span>
        </div>
        <div class="product-grid">
          <ProductCard
            v-for="product in productStore.hotProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </div>

    <div class="products-section">
      <div class="container">
        <div class="section-title">
          <h2>新品推荐</h2>
          <span class="more-link" @click="goToAll">查看更多 →</span>
        </div>
        <div class="product-grid">
          <ProductCard
            v-for="product in productStore.newProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <div class="feature-grid">
          <div class="feature-item">
            <el-icon :size="36" color="#409eff"><CircleCheck /></el-icon>
            <h3>正品保障</h3>
            <p>原厂直供，假一赔十</p>
          </div>
          <div class="feature-item">
            <el-icon :size="36" color="#67c23a"><Van /></el-icon>
            <h3>极速配送</h3>
            <p>全国24小时内发货</p>
          </div>
          <div class="feature-item">
            <el-icon :size="36" color="#e6a23c"><Service /></el-icon>
            <h3>专业服务</h3>
            <p>一对一技术支持</p>
          </div>
          <div class="feature-item">
            <el-icon :size="36" color="#f56c6c"><SwitchButton /></el-icon>
            <h3>无忧售后</h3>
            <p>30天无理由退换</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/common/ProductCard.vue'
import {
  Sunny, Cpu, Setting, Monitor, CircleCheck, Link,
  MagicStick, RefreshRight, Service, Van, SwitchButton
} from '@element-plus/icons-vue'

const router = useRouter()
const productStore = useProductStore()

const goToCategory = (categoryId) => {
  productStore.setCategory(categoryId)
  router.push('/category')
}

const goToAll = () => {
  productStore.clearFilters()
  router.push('/category')
}

const goToLink = (link) => {
  router.push(link)
}
</script>

<style scoped>
.home-page {
  padding-bottom: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.banner-section {
  padding: 24px 0;
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.banner-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-content {
  position: absolute;
  left: 60px;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
}

.banner-content h2 {
  font-size: 36px;
  margin-bottom: 12px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.banner-content p {
  font-size: 18px;
  margin-bottom: 24px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.categories-section {
  padding: 24px 0 40px;
  background: #fff;
  margin-bottom: 24px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 16px;
}

.category-item {
  text-align: center;
  padding: 20px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f5f7fa;
}

.category-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.category-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 12px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.category-item:hover .category-icon {
  background: #409eff;
  color: #fff;
}

.category-item:hover .category-icon :deep(.el-icon) {
  color: #fff;
}

.category-item h3 {
  font-size: 14px;
  margin-bottom: 4px;
  color: #303133;
}

.category-item p {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

@media (max-width: 1024px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 600px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.products-section {
  padding: 32px 0;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title h2 {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.more-link {
  color: #909399;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;
}

.more-link:hover {
  color: #409eff;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}

.features-section {
  background: #fff;
  padding: 40px 0;
  margin-top: 24px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.feature-item {
  text-align: center;
}

.feature-item h3 {
  font-size: 16px;
  margin: 12px 0 6px;
  color: #303133;
}

.feature-item p {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}
</style>
