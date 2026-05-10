<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="24" color="#409eff"><Document /></el-icon>
          <span class="title">小型文具店货品管理系统</span>
        </div>
        <div class="operator-info">
          <el-tag type="info">操作员：{{ operator }}</el-tag>
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        mode="horizontal"
        router
        class="nav-menu"
      >
        <el-menu-item index="/categories">
          <el-icon><Folder /></el-icon>
          <span>货品分类管理</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>货品信息管理</span>
        </el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon><Box /></el-icon>
          <span>货品出入库管理</span>
        </el-menu-item>
        <el-menu-item index="/records">
          <el-icon><List /></el-icon>
          <span>操作履历管理</span>
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getOperator } from '@/utils/storage'

const route = useRoute()
const operator = getOperator()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.nav-menu {
  border-bottom: none;
  background: #f5f7fa;
}

.app-main {
  flex: 1;
  background: #f0f2f5;
  overflow: auto;
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px;
  }
  
  .title {
    font-size: 16px;
  }
}
</style>
