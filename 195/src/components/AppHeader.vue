<template>
  <header class="app-header">
    <div class="container header-inner">
      <div class="logo" @click="goHome">
        <span class="logo-icon">🪵</span>
        <span class="logo-text">传统木雕工具采购平台</span>
      </div>

      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        class="header-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/packages">成套工具</el-menu-item>
        <el-sub-menu index="category">
          <template #title>工具分类</template>
          <el-menu-item
            v-for="cat in categoryList"
            :key="cat.id"
            :index="`/category/${cat.id}`"
          >
            <span>{{ cat.icon }} {{ cat.name }}</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索木雕工具..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>

        <el-dropdown v-if="userStore.isLoggedIn" @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
            <span class="user-name">{{ userStore.userInfo?.name }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="center">
                <el-icon><User /></el-icon> 个人中心
              </el-dropdown-item>
              <el-dropdown-item command="orders">
                <el-icon><List /></el-icon> 订单管理
              </el-dropdown-item>
              <el-dropdown-item command="favorites">
                <el-icon><Star /></el-icon> 我的收藏
              </el-dropdown-item>
              <el-dropdown-item v-if="userStore.isSupplier" command="supplier">
                <el-icon><OfficeBuilding /></el-icon> 供货商中心
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button v-else type="primary" @click="goLogin">
          登录
        </el-button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, User, List, Star, OfficeBuilding, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useToolStore } from '@/stores/tool'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const toolStore = useToolStore()

const searchKeyword = ref('')

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/category')) return 'category'
  return path
})

const categoryList = computed(() => toolStore.categoryList)

const goHome = () => {
  router.push('/')
}

const goLogin = () => {
  router.push('/login')
}

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  router.push({ path: '/', query: { search: searchKeyword.value } })
}

const handleCommand = (command) => {
  switch (command) {
    case 'center':
      router.push('/center')
      break
    case 'orders':
      router.push('/orders')
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'supplier':
      router.push('/supplier')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  .logo-icon {
    font-size: 28px;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 600;
    background: linear-gradient(135deg, #8b4513, #d2691e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.header-menu {
  flex: 1;
  border-bottom: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 260px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 8px;

  &:hover {
    opacity: 0.8;
  }

  .user-name {
    font-size: 14px;
    color: #333;
  }
}
</style>
