<template>
  <div class="user-layout">
    <div class="container">
      <div class="user-content">
        <aside class="user-sidebar">
          <div class="user-info-card">
            <el-avatar :size="80" :src="userStore.userInfo?.avatar">
              {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="user-name">{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</div>
            <div class="user-level">
              <el-tag type="warning" size="small">VIP会员</el-tag>
            </div>
          </div>
          
          <el-menu
            :default-active="activeMenu"
            class="user-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="address">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <el-icon><Document /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="wishlist">
              <el-icon><Star /></el-icon>
              <span>心愿单</span>
            </el-menu-item>
            <el-menu-item index="footprints">
              <el-icon><Clock /></el-icon>
              <span>浏览足迹</span>
            </el-menu-item>
          </el-menu>
        </aside>

        <main class="user-main">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Location, Document, Star, Clock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref(route.name?.toLowerCase() || 'profile')

const handleMenuSelect = (index) => {
  activeMenu.value = index
  router.push(`/user/${index}`)
}

onMounted(() => {
  userStore.fetchAddresses()
})
</script>

<style lang="scss" scoped>
.user-layout {
  padding: 20px 0;
  background: $bg-color;
  min-height: calc(100vh - 140px);
  
  .user-content {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 24px;
    align-items: flex-start;
  }
  
  .user-sidebar {
    .user-info-card {
      background: #fff;
      border-radius: $radius;
      padding: 24px;
      text-align: center;
      margin-bottom: 16px;
      
      .user-name {
        margin-top: 12px;
        font-size: 16px;
        font-weight: 500;
        color: $text-primary;
      }
      
      .user-level {
        margin-top: 8px;
      }
    }
    
    .user-menu {
      border: none;
      background: #fff;
      border-radius: $radius;
      padding: 8px 0;
      
      :deep(.el-menu-item) {
        height: 48px;
        line-height: 48px;
        margin: 0;
        
        &.is-active {
          background: $primary-color + '10';
          color: $primary-color;
        }
        
        &:hover {
          background: $bg-color;
        }
      }
    }
  }
  
  .user-main {
    background: #fff;
    border-radius: $radius;
    padding: 24px;
    min-height: 600px;
  }
}

@media (max-width: 768px) {
  .user-layout {
    .user-content {
      grid-template-columns: 1fr;
    }
    
    .user-sidebar {
      .user-menu {
        display: flex;
        overflow-x: auto;
        
        :deep(.el-menu-item) {
          flex-shrink: 0;
          padding: 0 16px;
        }
      }
    }
  }
}
</style>
