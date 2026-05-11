<template>
  <div class="app-container">
    <el-container class="main-container">
      <el-aside :width="isCollapsed ? '64px' : '200px'" class="sidebar">
        <div class="logo">
          <el-icon><Location /></el-icon>
          <span v-show="!isCollapsed" class="logo-text">旅行管理</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="menu"
          :collapse="isCollapsed"
          router
          background-color="#001529"
          text-color="#ffffffb3"
          active-text-color="#ffffff"
        >
          <el-menu-item index="/trips">
            <el-icon><Calendar /></el-icon>
            <template #title>行程管理</template>
          </el-menu-item>
          <el-menu-item index="/checkin">
            <el-icon><Camera /></el-icon>
            <template #title>打卡与预算</template>
          </el-menu-item>
          <el-menu-item index="/logs">
            <el-icon><Document /></el-icon>
            <template #title>操作履历</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="toggleCollapse">
              <Fold v-if="!isCollapsed" />
              <Expand v-else />
            </el-icon>
            <span class="page-title">{{ pageTitle }}</span>
          </div>
          <div class="header-right">
            <el-icon><User /></el-icon>
            <span>管理员</span>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapsed = ref(false)

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => (route.meta.title as string) || '首页')

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style lang="scss" scoped>
.app-container {
  width: 100%;
  height: 100vh;
}

.main-container {
  height: 100%;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #1f2937;

    .logo-text {
      white-space: nowrap;
    }
  }

  .menu {
    border-right: none;
  }
}

.header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: #666;
      transition: color 0.3s;

      &:hover {
        color: #409eff;
      }
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 24px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px !important;

    .logo-text {
      display: none;
    }
  }

  .header {
    padding: 0 16px;

    .page-title {
      font-size: 16px;
    }

    .header-right span {
      display: none;
    }
  }

  .main-content {
    padding: 16px;
  }
}
</style>
