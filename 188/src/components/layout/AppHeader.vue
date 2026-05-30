<template>
  <header class="app-header">
    <div class="header-top">
      <div class="container flex-between">
        <div class="header-left">
          <span>欢迎来到园林园艺资材采购平台</span>
        </div>
        <div class="header-right">
          <template v-if="!userStore.isLoggedIn">
            <el-button type="text" @click="goToLogin">登录</el-button>
            <el-button type="text" @click="goToRegister">免费注册</el-button>
          </template>
          <template v-else>
            <span class="welcome">您好，{{ userStore.userInfo?.name }}</span>
            <el-button type="text" @click="goToProfile">个人中心</el-button>
            <el-button type="text" @click="handleLogout">退出登录</el-button>
          </template>
        </div>
      </div>
    </div>
    <div class="header-main">
      <div class="container flex-between">
        <div class="logo" @click="goHome">
          <h1>🌿 园林资材采购平台</h1>
        </div>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索您需要的园林资材..."
            size="large"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="large" @click="goToProfile">
            <el-icon><User /></el-icon>
            <span>会员中心</span>
          </el-button>
        </div>
      </div>
    </div>
    <div class="header-nav">
      <div class="container">
        <ul class="nav-list">
          <li class="nav-item" :class="{ active: activeNav === 'home' }" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            首页
          </li>
          <li class="nav-item" :class="{ active: activeNav === 'category' }">
            <el-dropdown trigger="hover" @command="handleCategoryClick">
              <span class="nav-link">
                <el-icon><Menu /></el-icon>
                全部商品分类
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="cat in categories" :key="cat.id" :command="cat.id">
                    <span style="margin-right: 8px;">{{ cat.icon }}</span>
                    {{ cat.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </li>
          <li class="nav-item" :class="{ active: activeNav === 'cold' }" @click="goToSpecial('cold')">
            <el-icon><Cherry /></el-icon>
            耐寒绿植专区
          </li>
          <li class="nav-item" :class="{ active: activeNav === 'preservative' }" @click="goToSpecial('preservative')">
            <el-icon><Box /></el-icon>
            防腐园艺用品
          </li>
          <li class="nav-item" :class="{ active: activeNav === 'package' }" @click="goToPackage">
            <el-icon><Present /></el-icon>
            工程采购套餐
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, User, HomeFilled, Menu, ArrowDown, Cherry, Box, Present } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getCategoriesApi } from '@/api/product'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const searchKeyword = ref('')
const categories = ref([])
const activeNav = ref('home')

onMounted(async () => {
  const res = await getCategoriesApi()
  if (res.code === 200) {
    categories.value = res.data
  }
  updateActiveNav()
})

const updateActiveNav = () => {
  const name = route.name
  if (name === 'Home') activeNav.value = 'home'
  else if (name === 'Category') activeNav.value = 'category'
  else if (name === 'SpecialZone') {
    activeNav.value = route.params.type
  } else if (name === 'Package') {
    activeNav.value = 'package'
  }
}

const goHome = () => {
  router.push({ name: 'Home' })
}

const goToLogin = () => {
  router.push({ name: 'Login' })
}

const goToRegister = () => {
  router.push({ name: 'Login', query: { tab: 'register' } })
}

const goToProfile = () => {
  if (userStore.isLoggedIn) {
    router.push({ name: 'Profile' })
  } else {
    router.push({ name: 'Login' })
  }
}

const goToSpecial = (type) => {
  router.push({ name: 'SpecialZone', params: { type } })
}

const goToPackage = () => {
  router.push({ name: 'Package' })
}

const handleCategoryClick = (categoryId) => {
  router.push({ name: 'Category', params: { id: categoryId } })
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ name: 'Category', query: { keyword: searchKeyword.value } })
  }
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push({ name: 'Home' })
}
</script>

<style lang="scss" scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-top {
    background: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
    font-size: 12px;
    color: #606266;
    padding: 8px 0;

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .welcome {
        color: #67c23a;
      }
    }
  }

  .header-main {
    padding: 20px 0;

    .logo {
      cursor: pointer;

      h1 {
        font-size: 28px;
        color: #67c23a;
        margin: 0;
        font-weight: 700;
        background: linear-gradient(135deg, #67c23a, #409eff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .search-box {
      width: 500px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .header-nav {
    background: linear-gradient(135deg, #67c23a 0%, #409eff 100%);

    .nav-list {
      display: flex;
      gap: 0;

      .nav-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 24px;
        color: #fff;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover,
        &.active {
          background: rgba(255, 255, 255, 0.2);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }
  }
}
</style>
