<template>
  <el-container class="app-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="app-aside">
      <div class="logo">
        <span v-if="!isCollapse">软装设计管理</span>
        <span v-else>软装</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/material">
          <el-icon><Box /></el-icon>
          <template #title>素材管理</template>
        </el-menu-item>
        <el-menu-item index="/designer">
          <el-icon><User /></el-icon>
          <template #title>设计师管理</template>
        </el-menu-item>
        <el-menu-item index="/order">
          <el-icon><Document /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item index="/contract">
          <el-icon><Tickets /></el-icon>
          <template #title>合同管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><Avatar /></el-icon>
              <span>管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const isCollapse = ref(false)
  
  const activeMenu = computed(() => route.path)
  
  const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value
  }
  </script>
  
  <style scoped lang="scss">
  .app-container {
    height: 100vh;
  }
  
  .app-aside {
    background-color: #304156;
    transition: width 0.3s;
    
    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 18px;
      font-weight: bold;
      background-color: #2b2f3a;
    }
  }
  
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    border-bottom: 1px solid #e6e6e6;
    padding: 0 20px;
    
    .collapse-icon {
      font-size: 20px;
      cursor: pointer;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
  }
  
  .app-main {
    background-color: #f0f2f5;
    overflow-y: auto;
  }
  </style>
