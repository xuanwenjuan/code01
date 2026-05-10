<template>
  <el-container class="app-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon :size="24" color="#409EFF"><ShoppingBag /></el-icon>
        <span class="logo-text">宠物用品管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><Menu /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>用品管理</span>
        </el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon><Box /></el-icon>
          <span>出入库管理</span>
        </el-menu-item>
        <el-menu-item index="/operations">
          <el-icon><Document /></el-icon>
          <span>操作履历</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">
          <span>{{ currentTitle }}</span>
        </div>
        <div class="header-user">
          <el-avatar :size="32" icon="UserFilled" />
          <span class="user-name">管理员</span>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const activeMenu = computed(() => route.path);
const currentTitle = computed(() => route.meta.title || '宠物用品店管理系统');
</script>

<style scoped>
.app-container {
  height: 100%;
}

.sidebar {
  background-color: #304156;
  overflow-x: hidden;
}

.logo {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #2b2f3a;
}

.logo-text {
  margin-left: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.el-menu {
  border-right: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  color: #606266;
}

.main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style>
