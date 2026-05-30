<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="logo" @click="goHome">
        <span class="logo-icon">✨</span>
        <span class="logo-text">古韵饰品</span>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">首页</router-link>
        <router-link to="/products" class="nav-item" :class="{ active: route.path === '/products' }">全部饰品</router-link>
        <div class="nav-item category-dropdown" @mouseenter="showCategories = true" @mouseleave="showCategories = false">
          饰品分类
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          <div v-show="showCategories" class="dropdown-menu">
            <router-link 
              v-for="cat in productStore.categories" 
              :key="cat.id" 
              :to="`/products?category=${cat.id}`"
              class="dropdown-item"
            >
              <span>{{ cat.icon }}</span>
              <span>{{ cat.name }}</span>
            </router-link>
          </div>
        </div>
      </nav>
      
      <div class="header-actions">
        <div class="search-box">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索复古饰品..." 
            size="small"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        
        <div class="cart-icon" @click="showCart = true">
          <el-badge :value="cartStore.cartCount" :hidden="cartStore.cartCount === 0">
            <el-icon :size="22"><ShoppingCart /></el-icon>
          </el-badge>
        </div>
        
        <div v-if="userStore.isLoggedIn" class="user-menu" @mouseenter="showUserMenu = true" @mouseleave="showUserMenu = false">
          <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
          <span class="username">{{ userStore.userInfo?.nickname }}</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          <div v-show="showUserMenu" class="user-dropdown">
            <router-link to="/profile" class="dropdown-item">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </router-link>
            <router-link to="/orders" class="dropdown-item">
              <el-icon><Tickets /></el-icon>
              <span>我的订单</span>
            </router-link>
            <router-link to="/after-sales" class="dropdown-item">
              <el-icon><Service /></el-icon>
              <span>售后申请</span>
            </router-link>
            <router-link v-if="userStore.userRole === 'merchant'" to="/merchant" class="dropdown-item">
              <el-icon><Shop /></el-icon>
              <span>商家中心</span>
            </router-link>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </div>
          </div>
        </div>
        
        <div v-else class="auth-buttons">
          <router-link to="/login" class="login-btn">登录</router-link>
          <router-link to="/register" class="register-btn">注册</router-link>
        </div>
      </div>
    </div>
    
    <el-drawer v-model="showCart" title="购物车" size="400px">
      <div v-if="cartStore.items.length === 0" class="empty-state">
        <el-icon><ShoppingCart /></el-icon>
        <p>购物车是空的</p>
        <el-button type="primary" @click="router.push('/products')">去逛逛</el-button>
      </div>
      <div v-else>
        <div v-for="(item, index) in cartStore.items" :key="`${item.id}-${item.size}`" class="cart-item">
          <img :src="item.image" :alt="item.name" class="cart-item-img" />
          <div class="cart-item-info">
            <p class="cart-item-name">{{ item.name }}</p>
            <p v-if="item.size" class="cart-item-size">尺码：{{ item.size }}</p>
            <p class="cart-item-price">¥{{ item.price }}</p>
          </div>
          <div class="cart-item-actions">
            <el-input-number 
              v-model="item.quantity" 
              :min="1" 
              :max="item.stock" 
              size="small"
              @change="cartStore.updateQuantity(index, $event)"
            />
            <el-button type="danger" text @click="cartStore.removeItem(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="cart-footer">
          <div class="cart-total">
            合计：<span class="price">¥{{ cartStore.cartTotal.toFixed(2) }}</span>
          </div>
          <el-button type="primary" @click="handleCheckout" :disabled="cartStore.items.length === 0">
            结算
          </el-button>
        </div>
      </div>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const productStore = useProductStore()
const cartStore = useCartStore()

const searchKeyword = ref('')
const showCategories = ref(false)
const showUserMenu = ref(false)
const showCart = ref(false)

onMounted(() => {
  userStore.checkAuth()
  cartStore.loadCart()
})

const goHome = () => {
  router.push('/')
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/products', query: { keyword: searchKeyword.value } })
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  }).catch(() => {})
}

const handleCheckout = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    showCart.value = false
    router.push('/login')
    return
  }
  ElMessage.success('订单提交成功！')
  cartStore.clearCart()
  showCart.value = false
  router.push('/orders')
}
</script>

<style lang="scss" scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  height: 80px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  
  .logo-icon {
    font-size: 28px;
    margin-right: 8px;
  }
  
  .logo-text {
    font-size: 22px;
    font-weight: 700;
    color: #d4af37;
    letter-spacing: 2px;
  }
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  position: relative;
  padding: 8px 16px;
  color: #e8dcc4;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover, &.active {
    color: #d4af37;
  }
  
  &.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 2px;
    background: #d4af37;
    border-radius: 1px;
  }
}

.arrow-icon {
  font-size: 12px;
  transition: transform 0.3s;
}

.category-dropdown:hover .arrow-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 150px;
  z-index: 1001;
  margin-top: 8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f0e1;
    color: #8b6914;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  width: 240px;
  
  :deep(.el-input__wrapper) {
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: none;
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    
    &.is-focus {
      background: #fff;
      box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.3);
    }
  }
  
  :deep(.el-input__inner) {
    color: #e8dcc4;
    
    &::placeholder {
      color: rgba(232, 220, 196, 0.6);
    }
  }
  
  :deep(.el-input-group__append) {
    background: transparent;
    border: none;
    
    .el-button {
      background: transparent;
      border: none;
      color: #d4af37;
    }
  }
}

.cart-icon {
  cursor: pointer;
  color: #e8dcc4;
  transition: color 0.3s;
  
  &:hover {
    color: #d4af37;
  }
  
  :deep(.el-badge__content) {
    background: #c0392b;
  }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #e8dcc4;
  position: relative;
  
  .username {
    font-size: 14px;
  }
  
  &:hover {
    color: #d4af37;
  }
  
  &:hover .arrow-icon {
    transform: rotate(180deg);
  }
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 160px;
  z-index: 1001;
  margin-top: 8px;
  color: #333;
  
  .dropdown-divider {
    height: 1px;
    background: #eee;
    margin: 8px 0;
  }
  
  .logout {
    color: #c0392b;
    
    &:hover {
      background: #fef0f0;
      color: #c0392b;
    }
  }
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .login-btn {
    color: #e8dcc4;
    padding: 6px 16px;
    border-radius: 4px;
    transition: all 0.3s;
    
    &:hover {
      color: #d4af37;
    }
  }
  
  .register-btn {
    color: #2c1810;
    background: linear-gradient(135deg, #d4af37, #b8960c);
    padding: 6px 20px;
    border-radius: 20px;
    font-weight: 500;
    transition: all 0.3s;
    
    &:hover {
      background: linear-gradient(135deg, #e5c158, #c9a71d);
      transform: translateY(-1px);
    }
  }
}

.cart-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  &-info {
    flex: 1;
    
    .cart-item-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .cart-item-size {
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }
    
    .cart-item-price {
      color: #c0392b;
      font-weight: 600;
    }
  }
  
  &-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
}

.cart-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .cart-total {
    font-size: 16px;
    
    .price {
      font-size: 20px;
    }
  }
}
</style>
