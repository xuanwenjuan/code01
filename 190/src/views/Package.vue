<template>
  <div class="package-page container">
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>采购套餐</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">养殖场成套设备采购套餐</h1>
      <p class="page-desc">一站式采购解决方案，省心更省钱</p>
    </div>

    <div class="package-grid">
      <el-card 
        class="package-card card-hover" 
        v-for="pkg in productStore.packageList" 
        :key="pkg.id"
      >
        <div class="package-tag">{{ pkg.tag }}</div>
        <div class="package-image">
          <el-image :src="pkg.image" fit="cover" height="240" />
        </div>
        <div class="package-info">
          <h3 class="package-name">{{ pkg.name }}</h3>
          <p class="package-desc">{{ pkg.description }}</p>
          <div class="package-items-title">套餐包含：</div>
          <ul class="package-items">
            <li v-for="(item, idx) in pkg.items" :key="idx">
              <el-icon color="#67c23a"><Check /></el-icon>
              {{ item }}
            </li>
          </ul>
          <div class="package-footer">
            <div class="package-price">
              <span class="price-label">套餐价</span>
              <span class="current-price">¥{{ pkg.price.toLocaleString() }}</span>
              <span class="original-price">¥{{ pkg.originalPrice.toLocaleString() }}</span>
            </div>
            <div class="package-savings">{{ pkg.savings }}</div>
          </div>
          <el-button type="primary" size="large" class="package-btn" block>
            立即咨询采购
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()
</script>

<style scoped>
.package-page {
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 10px;
}

.page-desc {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.package-card {
  position: relative;
  overflow: hidden;
}

.package-tag {
  position: absolute;
  top: 15px;
  left: -30px;
  background: #f56c6c;
  color: #fff;
  padding: 5px 40px;
  font-size: 14px;
  transform: rotate(-45deg);
  z-index: 10;
  font-weight: bold;
}

.package-image {
  margin: -20px -20px 20px;
}

.package-name {
  font-size: 22px;
  font-weight: bold;
  margin: 0 0 12px;
  color: #303133;
}

.package-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.6;
}

.package-items-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
}

.package-items {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
}

.package-items li {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.package-footer {
  padding: 15px 0;
  border-top: 1px solid #ebeef5;
  margin-bottom: 15px;
}

.package-price {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}

.price-label {
  font-size: 14px;
  color: #606266;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.package-savings {
  font-size: 14px;
  color: #67c23a;
  font-weight: 500;
}

.package-btn {
  font-size: 16px;
}
</style>
