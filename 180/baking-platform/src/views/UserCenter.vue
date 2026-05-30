<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const menuItems = [
  { name: '我的订单', path: '/user/orders', icon: 'List' },
  { name: '我的收藏', path: '/user/favorites', icon: 'Star' },
  { name: '个人资料', path: '/user/profile', icon: 'User' }
]

const isActive = (path) => route.path === path || route.path.startsWith(path)
</script>

<template>
  <div class="user-center">
    <div class="container">
      <div class="center-layout">
        <div class="sidebar">
          <div class="user-profile">
            <el-avatar :size="64" :src="userInfo?.avatar" />
            <div class="user-info">
              <h3 class="user-name">{{ userInfo?.nickname }}</h3>
              <p class="user-role">普通用户</p>
            </div>
          </div>
          <el-menu
            :default-active="route.path"
            class="sidebar-menu"
            @select="(index) => router.push(index)"
          >
            <el-menu-item 
              v-for="item in menuItems" 
              :key="item.path"
              :index="item.path"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.name }}</span>
            </el-menu-item>
          </el-menu>
        </div>
        <div class="main-content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-center {
  padding: 20px 0 40px;
}

.center-layout {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  padding: 20px 0;
  height: fit-content;
}

.user-profile {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.user-info {
  margin-top: 12px;
}

.user-name {
  font-size: 16px;
  color: #303133;
  margin: 0 0 4px 0;
}

.user-role {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.sidebar-menu {
  border-right: none;
}

.main-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-height: 600px;
}
</style>
