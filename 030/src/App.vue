<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommunityStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const store = useCommunityStore()

const isCollapsed = ref(false)

const menuItems = computed(() => [
  { path: '/dashboard', title: '数据概览', icon: 'DataBoard' },
  { path: '/buildings', title: '楼宇与住户管理', icon: 'OfficeBuilding' },
  { path: '/work-orders', title: '报修与工单管理', icon: 'Document' },
  { path: '/payments', title: '缴费管理', icon: 'Money' },
  { path: '/operation-logs', title: '操作履历与审计', icon: 'Clock' }
])

function handleMenuSelect(index: string) {
  router.push(index)
}
</script>

<template>
  <el-container class="app-container">
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="app-aside">
      <div class="logo">
        <el-icon class="logo-icon" :size="32" color="#409EFF">
          <HomeFilled />
        </el-icon>
        <span v-show="!isCollapsed" class="logo-text">智慧社区</span>
      </div>
      
      <el-menu
        :default-active="route.path"
        class="app-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :collapse="isCollapsed"
        :collapse-transition="false"
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <el-icon
            class="collapse-btn"
            :size="20"
            @click="isCollapsed = !isCollapsed"
          >
            <component :is="isCollapsed ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32" :icon="'UserFilled'" />
              <span class="user-name">{{ store.currentUser.name }}</span>
              <el-tag 
                :type="{
                  admin: 'danger',
                  property: 'primary',
                  maintenance: 'warning'
                }[store.currentUser.role]"
                size="small"
              >
                {{ {
                  admin: '管理员',
                  property: '物业',
                  maintenance: '维修'
                }[store.currentUser.role] }}
              </el-tag>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
}

.app-container {
  width: 100%;
  height: 100%;
}

.app-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow-x: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #2b3a4a;
    border-bottom: 1px solid #1f2d3d;

    .logo-text {
      color: white;
      font-size: 18px;
      font-weight: bold;
      white-space: nowrap;
    }
  }

  .app-menu {
    border-right: none;
  }
}

.app-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .collapse-btn {
      cursor: pointer;
      color: #606266;
      transition: color 0.3s;

      &:hover {
        color: #409EFF;
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 6px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      .user-name {
        font-size: 14px;
        color: #303133;
      }
    }
  }
}

.app-main {
  background-color: #f0f2f5;
  padding: 20px;
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
