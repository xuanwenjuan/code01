<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-layout">
        <div class="profile-sidebar">
          <div class="user-info">
            <el-avatar :size="80" :src="userStore.currentUser?.avatar" />
            <div class="user-name">{{ userStore.currentUser?.nickname || userStore.currentUser?.username }}</div>
            <div class="user-phone">{{ userStore.currentUser?.phone }}</div>
          </div>
          <el-menu
            :default-active="activeMenu"
            class="profile-menu"
            router
          >
            <el-menu-item index="/profile/orders">
              <el-icon><Document /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="/profile/address">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
            <el-menu-item index="/profile/favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="/profile/history">
              <el-icon><Clock /></el-icon>
              <span>浏览记录</span>
            </el-menu-item>
            <el-menu-item index="/profile/info">
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </el-menu-item>
          </el-menu>
        </div>
        <div class="profile-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Location, Star, Clock, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 20px 0 40px;
}

.profile-layout {
  display: flex;
  gap: 24px;
}

.profile-sidebar {
  width: 240px;
  flex-shrink: 0;
}

.user-info {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;

  .el-avatar {
    margin-bottom: 12px;
  }

  .user-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .user-phone {
    font-size: 12px;
    color: #999;
  }
}

.profile-menu {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.profile-content {
  flex: 1;
  min-height: 600px;
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e4e7ed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .profile-layout {
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
  }

  .profile-menu {
    display: flex;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;

    .el-menu-item {
      flex-shrink: 0;
    }
  }
}
</style>
