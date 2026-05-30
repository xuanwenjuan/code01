<template>
  <div class="main-layout h-full flex">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside bg-white border-r">
      <div class="logo h-16 flex items-center justify-center text-xl font-bold text-primary">
        <span v-if="!isCollapse">健身管理系统</span>
        <span v-else>健身</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        class="border-none"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>数据概览</template>
        </el-menu-item>
        <el-menu-item index="/coach">
          <el-icon><User /></el-icon>
          <template #title>教练管理</template>
        </el-menu-item>
        <el-menu-item index="/course">
          <el-icon><Reading /></el-icon>
          <template #title>课程管理</template>
        </el-menu-item>
        <el-menu-item index="/member">
          <el-icon><Avatar /></el-icon>
          <template #title>会员管理</template>
        </el-menu-item>
        <el-menu-item index="/stats">
          <el-icon><TrendCharts /></el-icon>
          <template #title>消课统计</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <el-header class="header bg-white border-b flex items-center justify-between px-4">
        <el-icon class="text-xl cursor-pointer" @click="isCollapse = !isCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
        <div class="flex items-center gap-4">
          <el-dropdown>
            <span class="flex items-center gap-2 cursor-pointer">
              <el-avatar :size="32">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="hidden sm:inline">管理员</span>
            </span>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main flex-1 overflow-auto bg-gray-50 p-4">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.main-layout {
  min-width: 320px;
}

.aside {
  transition: width 0.3s;
}

.logo {
  color: #409eff;
}

.header {
  height: 64px;
}

@media (max-width: 768px) {
  .aside {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
  }

  .header, .main {
    margin-left: 64px;
  }
}
</style>
