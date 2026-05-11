<template>
  <el-container class="main-container">
    <el-aside 
      :width="isMobile && !isSidebarOpen ? '0px' : (isCollapsed ? '64px' : '220px')" 
      class="sidebar"
      :class="{ 'sidebar-mobile-open': isMobile && isSidebarOpen }"
    >
      <div class="logo">
        <el-icon class="logo-icon"><DataLine /></el-icon>
        <span v-show="!isCollapsed || isMobile" class="logo-text">财务管理</span>
        <el-icon 
          v-if="isMobile && isSidebarOpen" 
          class="mobile-close-btn"
          @click="toggleSidebar"
        >
          <Close />
        </el-icon>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        :collapse="isCollapsed && !isMobile"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <div 
      v-if="isMobile && isSidebarOpen" 
      class="sidebar-overlay"
      @click="toggleSidebar"
    />
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleSidebar">
            <Menu v-if="isMobile" />
            <template v-else>
              <Fold v-if="!isCollapsed" />
              <Expand v-else />
            </template>
          </el-icon>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRouteTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip content="快速记账" placement="bottom">
            <el-button type="primary" :icon="Plus" circle @click="handleQuickAdd" />
          </el-tooltip>
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span v-if="!isMobile" class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
    
    <BillDialog ref="billDialogRef" @success="handleBillSuccess" />
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BillDialog from '@/components/BillDialog.vue'
import type { Bill } from '@/types'
import { useBillStore } from '@/stores/bill'
import { useBudgetStore } from '@/stores/budget'
import { useLogStore } from '@/stores/log'
import { getCategoryName, getAccountName } from '@/utils'

const route = useRoute()
const router = useRouter()
const billStore = useBillStore()
const budgetStore = useBudgetStore()
const logStore = useLogStore()

const isCollapsed = ref(false)
const isSidebarOpen = ref(false)
const isMobile = ref(false)
const billDialogRef = ref<InstanceType<typeof BillDialog>>()

const menuItems = [
  { path: '/dashboard', title: '仪表盘', icon: 'DataLine' },
  { path: '/bills', title: '账单管理', icon: 'Document' },
  { path: '/budget', title: '预算管理', icon: 'Wallet' },
  { path: '/logs', title: '操作履历', icon: 'List' },
]

const activeMenu = computed(() => route.path)

const currentRouteTitle = computed(() => {
  const matched = menuItems.find(item => item.path === route.path)
  return matched?.title || ''
})

function checkMobile(): void {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    isSidebarOpen.value = false
  }
}

function toggleCollapse(): void {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar_collapsed', String(isCollapsed.value))
}

function toggleSidebar(): void {
  if (isMobile.value) {
    isSidebarOpen.value = !isSidebarOpen.value
  } else {
    toggleCollapse()
  }
}

function handleMenuSelect(): void {
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

function handleQuickAdd(): void {
  billDialogRef.value?.open()
}

function handleBillSuccess(bill: Bill, isEdit: boolean): void {
  const categoryName = getCategoryName(bill.categoryId)
  const accountName = getAccountName(bill.accountId)
  
  if (isEdit) {
    logStore.addLog('edit_bill', `编辑了一笔${bill.type === 'expense' ? '支出' : '收入'}`, 
      `分类: ${categoryName}, 金额: ¥${bill.amount}, 账户: ${accountName}`)
  } else {
    logStore.addLog('add_bill', `添加了一笔${bill.type === 'expense' ? '支出' : '收入'}`, 
      `分类: ${categoryName}, 金额: ¥${bill.amount}, 账户: ${accountName}`)
    
    if (bill.type === 'expense') {
      budgetStore.updateSpentByCategory(bill.categoryId, bill.amount, true)
      budgetStore.updateSpentByCategory('total', bill.amount, true)
    }
  }
}

function handleLogout(): void {
  ElMessage.info('退出登录')
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  const storedCollapsed = localStorage.getItem('sidebar_collapsed')
  if (storedCollapsed) {
    isCollapsed.value = storedCollapsed === 'true'
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped lang="scss">
.main-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 100;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #263445;
    flex-shrink: 0;
    position: relative;
    
    .logo-icon {
      font-size: 24px;
      flex-shrink: 0;
    }
    
    .logo-text {
      white-space: nowrap;
    }
    
    .mobile-close-btn {
      position: absolute;
      right: 12px;
      font-size: 18px;
      cursor: pointer;
      color: #fff;
      opacity: 0.7;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  .sidebar-menu {
    border-right: none;
    flex: 1;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
  }
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  flex-shrink: 0;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
    flex: 1;
    
    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: #606266;
      transition: color 0.3s;
      flex-shrink: 0;
      
      &:hover {
        color: #409eff;
      }
    }
    
    .breadcrumb {
      min-width: 0;
      overflow: hidden;
      flex-shrink: 1;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      
      .username {
        color: #606266;
      }
    }
  }
}

.main-content {
  background-color: $bg-color;
  padding: 20px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #c0c4cc;
    border-radius: 3px;
    
    &:hover {
      background-color: #909399;
    }
  }
  
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media screen and (max-width: $breakpoint-tablet) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    width: 0;
    
    &:not([style*="width: 0px"]) {
      width: 220px !important;
    }
  }
  
  .header {
    padding: 0 12px;
    
    .username {
      display: none;
    }
    
    .breadcrumb {
      :deep(.el-breadcrumb__item) {
        &:not(:last-child) {
          display: none;
        }
      }
    }
  }
  
  .main-content {
    padding: 12px;
  }
}

@media screen and (max-width: 480px) {
  .header {
    padding: 0 8px;
    
    .header-left {
      gap: 8px;
    }
    
    .header-right {
      gap: 8px;
    }
  }
  
  .main-content {
    padding: 8px;
  }
}
</style>
