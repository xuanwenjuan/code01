<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  DataBoard, 
  Monitor, 
  Document, 
  DocumentChecked, 
  Fold, 
  Expand,
  UserFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isCollapse = ref(false)
const activeMenu = ref(route.path)

const menuItems = [
  { path: '/dashboard', title: '数据概览', icon: DataBoard },
  { path: '/assets', title: '资产管理', icon: Monitor },
  { path: '/borrow', title: '领用管理', icon: Document },
  { path: '/logs', title: '操作日志', icon: DocumentChecked }
]

const activeIndex = computed(() => route.path)

onMounted(() => {
  activeMenu.value = route.path
})

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
  router.push(index)
}
</script>

<template>
  <el-container class="main-layout">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="main-aside">
      <div class="logo">
        <el-icon :size="24" class="logo-icon"><Monitor /></el-icon>
        <span v-if="!isCollapse" class="logo-text">IT资产管理</span>
      </div>
      <el-menu
        :default-active="activeIndex"
        :collapse="isCollapse"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        @select="handleMenuSelect"
        class="main-menu"
      >
        <el-menu-item 
          v-for="item in menuItems" 
          :key="item.path" 
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="main-header">
        <div class="header-left">
          <el-button 
            :icon="isCollapse ? Expand : Fold" 
            text 
            @click="isCollapse = !isCollapse"
          />
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta?.title || '数据概览' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.main-aside {
  background-color: #001529;
  transition: width 0.3s;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border-bottom: 1px solid #1f2d3d;
    
    .logo-icon {
      color: #409EFF;
    }
    
    .logo-text {
      margin-left: 10px;
      font-size: 16px;
      font-weight: bold;
    }
  }
  
  .main-menu {
    border-right: none;
  }
}

.main-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .breadcrumb {
      margin-left: 20px;
    }
  }
  
  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .username {
        margin-left: 8px;
      }
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .main-aside {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    
    &.is-collapsed {
      width: 0;
    }
  }
}
</style>
