<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const menuItems = [
  { name: '订单管理', path: '/merchant/orders', icon: 'List' },
  { name: '商品管理', path: '/merchant/products', icon: 'Goods' }
]
</script>

<template>
  <div class="merchant-center">
    <div class="container">
      <div class="center-layout">
        <div class="sidebar">
          <div class="user-profile">
            <el-avatar :size="64" :src="userInfo?.avatar" />
            <div class="user-info">
              <h3 class="user-name">{{ userInfo?.nickname }}</h3>
              <p class="user-role">烘焙商家</p>
              <p class="company-name" v-if="userInfo?.companyName">{{ userInfo.companyName }}</p>
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
.merchant-center {
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
  color: #e6a23c;
  margin: 0 0 4px 0;
}

.company-name {
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
