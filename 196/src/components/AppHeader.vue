<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="logo" @click="$router.push('/')">
        <el-icon :size="32" color="#f97316"><TrendCharts /></el-icon>
        <span class="logo-text">蜂采网</span>
      </div>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索养蜂设备、蜂箱、摇蜜机..."
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch" type="primary">搜索</el-button>
          </template>
        </el-input>
      </div>

      <div class="header-actions">
        <template v-if="userStore.isLoggedIn">
          <div class="user-info" @click="$router.push('/profile')">
            <el-avatar :src="userStore.currentUser.avatar" :size="32" />
            <span class="user-name">{{ userStore.currentUser.name }}</span>
            <el-tag :type="userStore.isBuyer ? 'success' : 'warning'" size="small">
              {{ userStore.isBuyer ? '采购方' : '供货商' }}
            </el-tag>
          </div>
          <el-button text @click="$router.push('/orders')">
            <el-icon><Tickets /></el-icon>
            我的订单
          </el-button>
          <el-button text @click="$router.push('/favorites')">
            <el-icon><StarFilled /></el-icon>
            我的收藏
          </el-button>
          <el-button text @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </template>
        <template v-else>
          <el-button text @click="$router.push('/login')">登录</el-button>
          <el-button text @click="$router.push('/register')">注册</el-button>
        </template>
      </div>
    </div>

    <nav class="nav-bar">
      <div class="container">
        <ul class="nav-list">
          <li @click="$router.push('/')" :class="{ active: $route.name === 'Home' }">
            <el-icon><HomeFilled /></el-icon>
            首页
          </li>
          <li
            v-for="cat in productStore.categories"
            :key="cat.id"
            @click="$router.push(`/category/${cat.id}`)"
            :class="{ active: $route.params.id == cat.id }"
          >
            <el-icon><component :is="cat.icon" /></el-icon>
            {{ cat.name }}
          </li>
          <li @click="$router.push('/packages')" :class="{ active: $route.name === 'Packages' }">
            <el-icon><Goods /></el-icon>
            采购套餐
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useProductStore } from '@/stores'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()

const searchKeyword = ref('')

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ name: 'Category', params: { id: 'all' }, query: { keyword: searchKeyword.value } })
  }
}

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style lang="scss" scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;

  .logo-text {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-color);
  }
}

.search-bar {
  flex: 1;
  max-width: 600px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    .user-name {
      font-weight: 500;
    }
  }
}

.nav-bar {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);

  .nav-list {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0;

    li {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 12px 20px;
      color: #fff;
      cursor: pointer;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      &.active {
        background: #fff;
        color: var(--primary-color);
        font-weight: 600;
      }
    }
  }
}
</style>
