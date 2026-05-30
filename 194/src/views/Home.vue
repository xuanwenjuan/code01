<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container hero-content">
        <div class="hero-text">
          <h1 class="hero-title">探索宇宙的无限可能</h1>
          <p class="hero-subtitle">专业天文观测器材采购平台，为您提供高品质的观测设备</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="goCategory('deepspace')">
              深空观测器材
            </el-button>
            <el-button size="large" @click="goCategory('planet')">
              行星观测器材
            </el-button>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">500+</span>
            <span class="stat-label">专业器材</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">50+</span>
            <span class="stat-label">合作品牌</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">10000+</span>
            <span class="stat-label">服务客户</span>
          </div>
        </div>
      </div>
    </section>

    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">器材品类分类</h2>
        <div class="category-grid">
          <div
            v-for="cat in equipmentStore.categoriesData"
            :key="cat.id"
            class="category-card card-hover"
            @click="goCategory(cat.id)"
          >
            <div class="category-icon">
              <el-icon :size="40" color="#409eff">
                <component :is="cat.icon" />
              </el-icon>
            </div>
            <h3>{{ cat.name }}</h3>
            <p>{{ cat.count }} 件商品</p>
          </div>
        </div>
      </div>
    </section>

    <section class="equipment-section deepspace-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon color="#667eea"><Moon /></el-icon>
            深空观测器材专区
          </h2>
          <el-button type="primary" text @click="goCategory('deepspace')">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="equipment-grid">
          <EquipmentCard
            v-for="item in equipmentStore.deepSpaceEquipments.slice(0, 4)"
            :key="item.id"
            :equipment="item"
          />
        </div>
      </div>
    </section>

    <section class="equipment-section planet-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon color="#f5576c"><Sunny /></el-icon>
            行星观测器材专区
          </h2>
          <el-button type="primary" text @click="goCategory('planet')">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="equipment-grid">
          <EquipmentCard
            v-for="item in equipmentStore.planetEquipments.slice(0, 4)"
            :key="item.id"
            :equipment="item"
          />
        </div>
      </div>
    </section>

    <section class="packages-section">
      <div class="container">
        <h2 class="section-title">天文观测成套设备采购套餐</h2>
        <div class="packages-grid">
          <div
            v-for="pkg in equipmentStore.packagesData"
            :key="pkg.id"
            class="package-card card-hover"
          >
            <div class="package-image">
              <img :src="pkg.image" :alt="pkg.name" />
              <el-tag type="danger" size="large" class="discount-tag">
                {{ pkg.discount }}
              </el-tag>
            </div>
            <div class="package-content">
              <h3 class="package-name">{{ pkg.name }}</h3>
              <p class="package-desc">{{ pkg.description }}</p>
              
              <div class="package-scenarios">
                <el-tag
                  v-for="scenario in pkg.scenarios"
                  :key="scenario"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ scenario }}
                </el-tag>
              </div>

              <div class="package-items">
                <h4>套餐包含：</h4>
                <ul>
                  <li v-for="item in pkg.items" :key="item.name">
                    <el-icon><Check /></el-icon>
                    {{ item.name }} x{{ item.quantity }}
                  </li>
                </ul>
              </div>

              <div class="package-suitable">
                <el-icon color="#67c23a"><UserFilled /></el-icon>
                <span>{{ pkg.suitableFor }}</span>
              </div>

              <div class="package-footer">
                <div class="price-info">
                  <span class="price-text">¥{{ pkg.price.toLocaleString() }}</span>
                  <span class="original-price">¥{{ pkg.originalPrice.toLocaleString() }}</span>
                </div>
                <el-button type="primary">立即采购</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEquipmentStore } from '@/store/equipment'
import { useUserStore } from '@/store/user'
import EquipmentCard from '@/components/EquipmentCard.vue'

const router = useRouter()
const equipmentStore = useEquipmentStore()
const userStore = useUserStore()

onMounted(() => {
  userStore.initUser()
})

function goCategory(type) {
  router.push(`/category/${type}`)
}
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 0;
}

.hero-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #fff;
  padding: 80px 0;
  margin-bottom: 60px;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=600&fit=crop') center/cover no-repeat;
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #fff 0%, #a8d8ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.hero-actions .el-button {
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  border-radius: 8px;
}

.hero-stats {
  display: flex;
  gap: 48px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.categories-section {
  margin-bottom: 60px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.category-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.category-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 4px;
}

.category-card p {
  font-size: 13px;
  color: #909399;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header .section-title {
  margin-bottom: 0;
}

.equipment-section {
  margin-bottom: 60px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.packages-section {
  margin-bottom: 60px;
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.package-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.package-image {
  position: relative;
  height: 200px;
}

.package-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-tag {
  position: absolute;
  top: 16px;
  right: 16px;
  border-radius: 20px;
}

.package-content {
  padding: 20px;
}

.package-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 8px;
}

.package-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}

.package-scenarios {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.package-items {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.package-items h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 8px;
}

.package-items ul {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.package-items li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.package-items .el-icon {
  color: #67c23a;
}

.package-suitable {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 16px;
}

.package-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.package-footer .price-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.package-footer .price-text {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

.package-footer .original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}
</style>
