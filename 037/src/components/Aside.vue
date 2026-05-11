<template>
  <aside class="aside-container">
    <div class="logo">
      <el-icon><Reading /></el-icon>
      <span class="logo-text">学习管理</span>
    </div>
    <el-menu
      :default-active="activeRoute"
      :router="true"
      background-color="var(--sidebar-bg)"
      text-color="var(--sidebar-text)"
      active-text-color="var(--sidebar-text-active)"
    >
      <el-menu-item index="/dashboard">
        <el-icon><DataAnalysis /></el-icon>
        <template #title>学习概览</template>
      </el-menu-item>
      <el-menu-item index="/courses">
        <el-icon><Reading /></el-icon>
        <template #title>课程管理</template>
      </el-menu-item>
      <el-menu-item index="/progress">
        <el-icon><Timer /></el-icon>
        <template #title>学习进度</template>
      </el-menu-item>
      <el-menu-item index="/logs">
        <el-icon><Document /></el-icon>
        <template #title>操作履历</template>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeRoute = computed(() => route.path)
</script>

<style lang="scss" scoped>
.aside-container {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 220px;
  background: var(--sidebar-bg);
  z-index: 1000;
  transition: width 0.3s;
  
  @media (max-width: 1024px) {
    width: 60px;
    
    .logo-text {
      display: none;
    }
    
    .el-menu-item span {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    transform: translateX(-100%);
  }
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: var(--sidebar-text-active);
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .el-icon {
    font-size: 24px;
    margin-right: 8px;
  }
}

.el-menu {
  border-right: none;
  
  .el-menu-item {
    height: 56px;
    line-height: 56px;
    
    &.is-active {
      background: var(--sidebar-bg-active);
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .el-icon {
      font-size: 18px;
    }
  }
}
</style>
