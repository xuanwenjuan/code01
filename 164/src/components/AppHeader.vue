<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="logo" @click="goHome">
        <span class="logo-icon">🌸</span>
        <span class="logo-text">花语轩</span>
      </div>
      
      <nav class="nav-menu">
        <router-link 
          v-for="item in navItems" 
          :key="item.path" 
          :to="item.path"
          class="nav-item"
          active-class="active"
        >
          {{ item.name }}
        </router-link>
      </nav>

      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索鲜花..."
          :prefix-icon="Search"
          size="default"
          class="search-input"
          @keyup.enter="handleSearch"
        />
      </div>

      <div class="header-right">
        <router-link to="/cart" class="cart-link">
          <el-badge :value="cartStore.totalCount" :hidden="cartStore.totalCount === 0" class="cart-badge">
            <el-icon :size="20"><ShoppingCart /></el-icon>
          </el-badge>
          <span>购物车</span>
        </router-link>

        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand" class="user-dropdown">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
              <span class="username">{{ userStore.userInfo?.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="orders">
                  <el-icon><List /></el-icon>我的订单
                </el-dropdown-item>
                <el-dropdown-item command="wishlist">
                  <el-icon><Star /></el-icon>心愿单
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login" class="login-link">
            <el-icon :size="20"><User /></el-icon>
            <span>登录</span>
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ShoppingCart, User, ArrowDown, List, Star, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

const searchKeyword = ref('')

const navItems = [
  { path: '/', name: '首页' },
  { path: '/list', name: '鲜花商城' },
  { path: '/list?purpose=1', name: '爱情鲜花' },
  { path: '/list?purpose=2', name: '生日祝福' },
  { path: '/list?purpose=6', name: '婚礼用花' }
]

const goHome = () => {
  router.push('/')
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/list',
      query: { keyword: searchKeyword.value.trim() }
    })
  }
}

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'orders':
      router.push('/user/orders')
      break
    case 'wishlist':
      router.push('/user/wishlist')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await userStore.logoutAction()
        ElMessage.success('退出成功')
        router.push('/')
      } catch {}
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 30px;
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
      font-size: 22px;
      font-weight: bold;
      background: linear-gradient(135deg, $primary-color, $primary-dark);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
  
  .nav-menu {
    display: flex;
    gap: 24px;
    
    .nav-item {
      color: $text-secondary;
      font-size: 15px;
      transition: color 0.3s;
      
      &:hover, &.active {
        color: $primary-color;
      }
    }
  }
  
  .search-box {
    flex: 1;
    max-width: 300px;
    
    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: 20px;
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .cart-link, .login-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: $text-secondary;
      font-size: 14px;
      transition: color 0.3s;
      
      &:hover {
        color: $primary-color;
      }
    }
    
    .cart-badge {
      :deep(.el-badge__content) {
        background: $primary-color;
      }
    }
    
    .user-dropdown {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        
        .username {
          font-size: 14px;
          color: $text-secondary;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        &:hover {
          .username {
            color: $primary-color;
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .app-header {
    .nav-menu {
      display: none;
    }
    
    .search-box {
      max-width: 200px;
    }
  }
}
</style>
