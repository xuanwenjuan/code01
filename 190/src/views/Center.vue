<template>
  <div class="center-page container">
    <div class="center-layout flex">
      <aside class="sidebar">
        <div class="user-info-card">
          <div class="avatar">
            <el-icon :size="48"><User /></el-icon>
          </div>
          <div class="user-name">{{ userStore.userInfo?.name }}</div>
          <div class="user-role">
            <el-tag :type="userStore.userRole === 'purchaser' ? 'primary' : 'success'" size="small">
              {{ userStore.userRole === 'purchaser' ? '养殖场采购方' : '器械供货商' }}
            </el-tag>
          </div>
          <div class="user-company">{{ userStore.userInfo?.company }}</div>
        </div>

        <el-menu
          :default-active="activeMenu"
          class="center-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="orders">
            <el-icon><Tickets /></el-icon>
            <span>我的订单</span>
          </el-menu-item>
          <el-menu-item index="favorites">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </el-menu-item>
          <el-menu-item index="profile">
            <el-icon><Setting /></el-icon>
            <span>个人信息</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <main class="main-content flex-1">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path.split('/').pop())

function handleMenuSelect(index) {
  router.push(`/center/${index}`)
}
</script>

<style scoped>
.center-page {
  padding: 20px 0 40px;
}

.center-layout {
  gap: 20px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.user-info-card {
  background: #fff;
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  margin-bottom: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin: 0 auto 15px;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.user-role {
  margin-bottom: 8px;
}

.user-company {
  font-size: 13px;
  color: #909399;
}

.center-menu {
  border-right: none;
}

.main-content {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  min-height: 500px;
}
</style>
