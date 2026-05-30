<template>
  <header class="app-header">
    <div class="container header-container">
      <div class="logo" @click="goHome">
        <h1>智慧学堂</h1>
        <span class="slogan">让学习更简单</span>
      </div>
      
      <nav class="nav-menu">
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :router="true"
          background-color="transparent"
          text-color="#333"
          active-text-color="#667eea"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/courses">课程列表</el-menu-item>
          <el-menu-item index="/learning" v-if="userStore.isLoggedIn">学习中心</el-menu-item>
        </el-menu>
      </nav>

      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div v-if="userStore.isLoggedIn" class="user-area">
          <el-badge :value="userStore.favorites.length" :hidden="userStore.favorites.length === 0" class="favorite-badge">
            <el-button text @click="goToProfile('favorites')">
              <el-icon :size="20"><Star /></el-icon>
            </el-button>
          </el-badge>
          
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="36" :src="userStore.userInfo?.avatar" />
              <span class="username">{{ userStore.userInfo?.nickname }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="learning">
                  <el-icon><VideoPlay /></el-icon>学习中心
                </el-dropdown-item>
                <el-dropdown-item command="favorites">
                  <el-icon><Star /></el-icon>我的收藏
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div v-else class="auth-area">
          <el-button text @click="goLogin">登录</el-button>
          <el-button type="primary" @click="goRegister">注册</el-button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Star, User, VideoPlay, SwitchButton } from '@element-plus/icons-vue'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const searchKeyword = ref('')

const activeMenu = computed(() => {
  if (route.path.startsWith('/course/')) return '/courses'
  if (route.path.startsWith('/profile')) return '/learning'
  return route.path
})

const goHome = () => {
  router.push('/')
}

const goLogin = () => {
  router.push('/login')
}

const goRegister = () => {
  router.push('/register')
}

const goToProfile = (tab) => {
  router.push({ path: '/profile', query: { tab } })
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/courses', query: { keyword: searchKeyword.value } })
  }
}

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'learning':
      router.push('/learning')
      break
    case 'favorites':
      router.push({ path: '/profile', query: { tab: 'favorites' } })
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/')
      } catch {}
      break
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  display: flex;
  align-items: center;
  height: 64px;
}

.logo {
  display: flex;
  align-items: baseline;
  cursor: pointer;
  margin-right: 40px;

  h1 {
    font-size: 24px;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }

  .slogan {
    font-size: 12px;
    color: #909399;
    margin-left: 8px;
  }
}

.nav-menu {
  flex: 1;

  :deep(.el-menu) {
    border-bottom: none;
  }

  :deep(.el-menu-item) {
    height: 64px;
    line-height: 64px;
    font-size: 15px;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-input {
  width: 240px;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 16px;

  .favorite-badge {
    cursor: pointer;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    .username {
      font-size: 14px;
      color: #303133;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.auth-area {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
