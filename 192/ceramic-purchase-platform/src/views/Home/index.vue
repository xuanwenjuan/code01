<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="container">
        <el-carousel :interval="4000" height="380px">
          <el-carousel-item>
            <div class="carousel-slide slide-1">
              <div class="slide-content">
              </div>
            </div>
          </el-carousel-item>
          <el-carousel-item>
            <div class="carousel-slide slide-2">
              <div class="slide-content">
                <h2>精选高岭土</h2>
                <p>景德镇原产优质原料，品质保证</p>
                <el-button type="primary" size="large">立即选购</el-button>
              </div>
            </div>
          </el-carousel-item>
          <el-carousel-item>
            <div class="carousel-slide slide-3">
              <div class="slide-content">
                <h2>陶瓷创作套餐</h2>
                <p>一站式采购，省心又省钱</p>
                <el-button type="primary" size="large">查看套餐</el-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>

    <div class="container">
      <div class="category-section">
        <h3 class="section-title">原料品类分类</h3>
        <el-row :gutter="20">
          <el-col v-for="cat in categories" :key="cat.id" :span="4">
            <div class="category-card" @click="goToCategory(cat.id)">
              <el-icon :size="40" :color="'#409eff'"><component :is="cat.icon" /></el-icon>
              <div class="category-name">{{ cat.name }}</div>
              <div class="category-count">{{ cat.count }} 件商品</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="section zone-section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="hot-icon">🔥</span> 高温釉料专区
          </h3>
          <router-link to="/category/2" class="more-link">查看更多 <el-icon><ArrowRight /></el-icon></router-link>
        </div>
        <el-row :gutter="20">
          <el-col v-for="item in glazeMaterials" :key="item.id" :span="6">
            <MaterialCard :material="item" />
          </el-col>
        </el-row>
      </div>

      <div class="section zone-section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="hot-icon">🏺</span> 天然陶土专区
          </h3>
          <router-link to="/category/1" class="more-link">查看更多 <el-icon><ArrowRight /></el-icon></router-link>
        </div>
        <el-row :gutter="20">
          <el-col v-for="item in clayMaterials" :key="item.id" :span="6">
            <MaterialCard :material="item" />
          </el-col>
        </el-row>
      </div>

      <div class="section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="hot-icon">🎁</span> 陶瓷创作成套原料采购套餐推荐
          </h3>
        </div>
        <div class="packages-list">
          <div v-for="pkg in packages" :key="pkg.id" class="package-item">
            <router-link to="/">
              <PackageCard :pkg="pkg" />
            </router-link>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="hot-icon">⭐</span> 热门推荐
          </h3>
        </div>
        <el-row :gutter="20">
          <el-col v-for="item in hotMaterials" :key="item.id" :span="6">
            <MaterialCard :material="item" />
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockCategories } from '@/mock/categories'
import { mockMaterials } from '@/mock/materials'
import { mockPackages } from '@/mock/packages'
import MaterialCard from '@/components/MaterialCard.vue'
import PackageCard from '@/components/PackageCard.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const router = useRouter()
const categories = ref(mockCategories)
const packages = ref(mockPackages)

const glazeMaterials = computed(() => {
  return mockMaterials.filter(m => m.categoryId === 2).slice(0, 4)
})

const clayMaterials = computed(() => {
  return mockMaterials.filter(m => m.categoryId === 1).slice(0, 4)
})

const hotMaterials = computed(() => {
  return [...mockMaterials].sort((a, b) => b.sales - a.sales).slice(0, 4)
})

const goToCategory = (id) => {
  router.push(`/category/${id}`)
}
</script>

<style scoped>
.home-page {
  padding-bottom: 40px;
}

.hero-section {
  margin-bottom: 40px;
}

.carousel-slide {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.slide-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.slide-2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.slide-3 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.slide-content {
  position: absolute;
  left: 60px;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
}

.slide-content h2 {
  font-size: 42px;
  margin-bottom: 16px;
}

.slide-content p {
  font-size: 20px;
  margin-bottom: 24px;
  opacity: 0.9;
}

.category-section {
  margin-bottom: 40px;
}

.category-card {
  background: #fff;
  padding: 24px;
  text-align: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  margin-top: 12px;
  margin-bottom: 4px;
}

.category-count {
  font-size: 12px;
  color: #909399;
}

.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  padding-left: 12px;
  border-left: 4px solid #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hot-icon {
  font-size: 24px;
}

.more-link {
  color: #409eff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.more-link:hover {
  color: #66b1ff;
}

.packages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.package-item {
  display: block;
}

.zone-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  padding: 30px;
  border-radius: 12px;
}
</style>
