<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1>专业植物标本制作器材采购平台</h1>
          <p>为科研机构、高校、博物馆提供一站式标本制作解决方案</p>
          <div class="hero-buttons">
            <el-button type="primary" size="large" @click="scrollToCategory">
              立即选购
            </el-button>
            <el-button size="large" @click="scrollToPackage">
              查看套餐
            </el-button>
          </div>
        </div>
      </div>
    </section>

    <section class="category-section" id="category-section">
      <div class="container">
        <h2 class="section-title">器材品类分类</h2>
        <el-row :gutter="20">
          <el-col :span="4" v-for="category in equipmentStore.categoryList" :key="category.id">
            <div class="category-card card-hover" @click="goCategory(category.id)">
              <el-icon :size="40" color="#409eff">
                <component :is="getIcon(category.icon)" />
              </el-icon>
              <h3>{{ category.name }}</h3>
              <p>{{ category.count }}件商品</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>

    <section class="special-section dehydration-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon :size="28" color="#e6a23c">
              <Sunny />
            </el-icon>
            脱水压制器材专区
          </h2>
          <router-link :to="{ path: '/category/2' }" class="more-link">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <el-row :gutter="20">
          <el-col :span="6" v-for="item in equipmentStore.dehydrationEquipments.slice(0, 4)" :key="item.id">
            <EquipmentCard :equipment="item" />
          </el-col>
        </el-row>
      </div>
    </section>

    <section class="special-section preservation-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon :size="28" color="#67c23a">
              <ShieldCheck />
            </el-icon>
            防腐保存器材专区
          </h2>
          <router-link :to="{ path: '/category/3' }" class="more-link">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <el-row :gutter="20">
          <el-col :span="6" v-for="item in equipmentStore.preservationEquipments.slice(0, 4)" :key="item.id">
            <EquipmentCard :equipment="item" />
          </el-col>
        </el-row>
      </div>
    </section>

    <section class="package-section" id="package-section">
      <div class="container">
        <h2 class="section-title">
          <el-icon :size="28" color="#f56c6c">
            <Present />
          </el-icon>
          成套器材采购套餐推荐
        </h2>
        <el-row :gutter="20">
          <el-col :span="6" v-for="pkg in equipmentStore.packageList" :key="pkg.id">
            <el-card class="package-card card-hover">
              <div class="package-tag">{{ pkg.tag }}</div>
              <div class="package-image">
                <img :src="pkg.image" :alt="pkg.name" />
              </div>
              <div class="package-content">
                <h3>{{ pkg.name }}</h3>
                <p class="package-desc">{{ pkg.description }}</p>
                <div class="package-items">
                  <span v-for="(item, index) in pkg.items.slice(0, 3)" :key="item.id">
                    {{ item.name }}
                    <span v-if="index < Math.min(pkg.items.length, 3) - 1">、</span>
                  </span>
                  <span v-if="pkg.items.length > 3">等{{ pkg.items.length }}件</span>
                </div>
                <div class="package-suitable">
                  <el-tag size="small" v-for="tag in pkg.suitableFor" :key="tag" type="info">
                    {{ tag }}
                  </el-tag>
                </div>
                <div class="package-footer">
                  <div class="price-info">
                    <span class="price">¥{{ pkg.price }}</span>
                    <span class="original-price">¥{{ pkg.originalPrice }}</span>
                  </div>
                  <el-button type="primary" size="small" @click="viewPackage(pkg)">
                    立即购买
                  </el-button>
                </div>
                <div class="package-stats">
                  <span>已售 {{ pkg.sales }}</span>
                  <el-rate v-model="pkg.rating" disabled :size="12" />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>

    <section class="recommend-section">
      <div class="container">
        <h2 class="section-title">
          <el-icon :size="28" color="#409eff">
            <Star />
          </el-icon>
          热门推荐
        </h2>
        <el-row :gutter="20">
          <el-col :span="6" v-for="item in hotEquipments" :key="item.id">
            <EquipmentCard :equipment="item" />
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEquipmentStore } from '@/stores/equipment'
import EquipmentCard from '@/components/EquipmentCard.vue'
import {
  Collection, Grid, Box, Document, View, Folder,
  ArrowRight, Sunny, ShieldCheck, Present, Star
} from '@element-plus/icons-vue'

const router = useRouter()
const equipmentStore = useEquipmentStore()

const iconMap = {
  Collection,
  Grid,
  Box,
  Document,
  View,
  Folder
}

function getIcon(name) {
  return iconMap[name] || Box
}

const hotEquipments = computed(() => {
  return [...equipmentStore.equipmentList]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 8)
})

function goCategory(id) {
  router.push(`/category/${id}`)
}

function scrollToCategory() {
  document.getElementById('category-section')?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToPackage() {
  document.getElementById('package-section')?.scrollIntoView({ behavior: 'smooth' })
}

function viewPackage(pkg) {
  if (pkg.items.length > 0) {
    router.push(`/equipment/${pkg.items[0].id}`)
  }
}
</script>

<style scoped>
.home-page {
  padding-bottom: 0;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 0;
  color: #fff;
  margin-bottom: 40px;
}

.hero-content {
  text-align: center;
}

.hero-content h1 {
  font-size: 36px;
  margin-bottom: 16px;
}

.hero-content p {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.category-section {
  margin-bottom: 40px;
}

.category-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.category-card h3 {
  font-size: 16px;
  margin: 12px 0 8px 0;
  color: #303133;
}

.category-card p {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.special-section {
  margin-bottom: 40px;
  padding: 32px 0;
  border-radius: 12px;
}

.dehydration-section {
  background: linear-gradient(135deg, #fff7e6 0%, #fff1e0 100%);
}

.preservation-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ed 100%);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.package-section {
  margin-bottom: 40px;
}

.package-card {
  position: relative;
  overflow: hidden;
}

.package-tag {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%);
  color: #fff;
  padding: 4px 16px;
  font-size: 12px;
  z-index: 10;
}

.package-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 16px;
}

.package-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.package-content h3 {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #303133;
}

.package-desc {
  font-size: 12px;
  color: #909399;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.package-items {
  font-size: 12px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}

.package-suitable {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 16px;
}

.package-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price {
  font-size: 20px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  font-size: 12px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.package-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.recommend-section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
