<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-left">
        <span class="logo">🏨</span>
        <span class="title">智慧酒店客房综合管理系统</span>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-icon><User /></el-icon>
            <span>{{ userStore.user?.name || '管理员' }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside class="aside" width="220px">
        <el-menu
          :default-active="activeMenu"
          class="aside-menu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataBoard /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/rooms">
            <el-icon><OfficeBuilding /></el-icon>
            <span>客房管理</span>
          </el-menu-item>
          <el-menu-item index="/room-types">
            <el-icon><House /></el-icon>
            <span>房型管理</span>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><Tickets /></el-icon>
            <span>预订与入住</span>
          </el-menu-item>
          <el-menu-item index="/operation-logs">
            <el-icon><Document /></el-icon>
            <span>操作履历</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useHotelStore } from '@/stores/hotel'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const hotelStore = useHotelStore()

const activeMenu = computed(() => route.path)

onMounted(() => {
  if (hotelStore.rooms.length === 0) {
    hotelStore.initData()
  }
})

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.clearUser()
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo {
      font-size: 28px;
    }

    .title {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      letter-spacing: 1px;
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
      cursor: pointer;
      transition: opacity 0.3s;

      &:hover {
        opacity: 0.85;
      }
    }
  }
}

.aside {
  background-color: #304156;
  height: calc(100vh - 60px);
  overflow-y: auto;

  .aside-menu {
    border-right: none;
    height: 100%;
  }
}

.main {
  background-color: #f0f2f5;
  padding: 0;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
