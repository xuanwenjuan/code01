<template>
  <header class="app-header">
    <div class="header-top">
      <div class="container flex-between">
        <div class="welcome-text">欢迎来到汽车零部件选购平台！</div>
        <div class="header-links">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="20" :src="userStore.currentUser?.avatar" />
                {{ userStore.currentUser?.nickname || userStore.currentUser?.username }}
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon> 个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="orders">
                    <el-icon><Document /></el-icon> 我的订单
                  </el-dropdown-item>
                  <el-dropdown-item command="favorites">
                    <el-icon><Star /></el-icon> 我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon> 退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login">登录</router-link>
            <span class="divider">|</span>
            <router-link to="/register">注册</router-link>
          </template>
        </div>
      </div>
    </div>
    <div class="header-main">
      <div class="container flex-between">
        <router-link to="/" class="logo">
          <h1>🔧 汽配商城</h1>
        </router-link>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索汽车配件..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        <router-link to="/cart" class="cart-link">
          <el-button type="primary" size="large">
            <el-icon><ShoppingCart /></el-icon>
            购物车
            <el-badge :value="cartStore.totalCount" :max="99" class="cart-badge" />
          </el-button>
        </router-link>
      </div>
    </div>
    <div class="header-nav">
      <div class="container">
        <ul class="nav-list">
          <li><router-link to="/">首页</router-link></li>
          <li v-for="brand in carBrands" :key="brand.id">
            <router-link :to="`/list?brandId=${brand.id}`">
              {{ brand.logo }} {{ brand.name }}
            </router-link>
          </li>
          <li><router-link to="/list">全部配件</router-link></li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, User, Document, Star, SwitchButton, Search, ShoppingCart } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { carBrands } from '@/mock/data'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()
const searchKeyword = ref('')

onMounted(() => {
  userStore.checkLogin()
  cartStore.loadFromStorage()
})

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ name: 'List', query: { keyword: searchKeyword.value } })
  }
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
    }).catch(() => {})
  } else if (command === 'profile') {
    router.push('/profile/info')
  } else if (command === 'orders') {
    router.push('/profile/orders')
  } else if (command === 'favorites') {
    router.push('/profile/favorites')
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-top {
  background-color: #f5f7fa;
  padding: 8px 0;
  font-size: 12px;
  color: #666;
}

.welcome-text {
  color: #999;
}

.header-links {
  display: flex;
  align-items: center;
  gap: 16px;

  a {
    color: #666;
    transition: color 0.3s;

    &:hover {
      color: #409eff;
    }
  }

  .divider {
    color: #ddd;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: #666;

    &:hover {
      color: #409eff;
    }

    .el-icon {
      font-size: 12px;
    }
  }
}

.header-main {
  padding: 20px 0;
}

.logo h1 {
  font-size: 28px;
  color: #409eff;
  margin: 0;
  font-weight: 700;
}

.search-box {
  width: 500px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 24px 0 0 24px;
}

.search-input :deep(.el-input-group__append) {
  border-radius: 0 24px 24px 0;
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;

  .el-button {
    background-color: #409eff;
    border-color: #409eff;
    color: #fff;
  }
}

.cart-link {
  .cart-badge {
    margin-left: 8px;
  }
}

.header-nav {
  background-color: #409eff;
}

.nav-list {
  display: flex;
  gap: 0;
  margin: 0;
  padding: 0;

  li {
    position: relative;

    a {
      display: block;
      padding: 12px 24px;
      color: #fff;
      font-size: 15px;
      transition: background-color 0.3s;

      &:hover,
      &.router-link-active {
        background-color: rgba(255, 255, 255, 0.15);
      }
    }
  }
}

@media (max-width: 768px) {
  .header-main {
    flex-wrap: wrap;
    gap: 16px;
  }

  .search-box {
    width: 100%;
    order: 3;
  }

  .nav-list {
    overflow-x: auto;
    flex-wrap: nowrap;

    li {
      flex-shrink: 0;
    }
  }
}
</style>
