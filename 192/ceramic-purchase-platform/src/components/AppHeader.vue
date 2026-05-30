<template>
  <header class="app-header">
    <div class="header-top">
      <div class="container flex justify-between items-center">
        <div class="welcome-text">欢迎来到陶瓷艺术原料采购平台</div>
        <div class="header-actions">
          <template v-if="userStore.isLoggedIn">
            <span class="user-greeting">
              <el-icon><User /></el-icon>
              {{ userStore.userInfo?.name }}
              <el-tag :type="userStore.isSupplier ? 'success' : 'primary'" size="small" class="ml-10">
                {{ userStore.isSupplier ? '供货商' : '采购方' }}
              </el-tag>
            </span>
            <el-dropdown @command="handleCommand">
              <span class="dropdown-trigger">
                <el-icon><CaretBottom /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon> 个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="orders">
                    <el-icon><Tickets /></el-icon> 我的订单
                  </el-dropdown-item>
                  <el-dropdown-item command="favorites">
                    <el-icon><Star /></el-icon> 我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item command="supplier" v-if="userStore.isSupplier">
                    <el-icon><OfficeBuilding /></el-icon> 供货商中心
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon> 退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="login-link">登录</router-link>
            <span class="divider">|</span>
            <router-link to="/register" class="register-link">注册</router-link>
          </template>
        </div>
      </div>
    </div>
    <div class="header-main">
      <div class="container flex items-center justify-between">
        <router-link to="/" class="logo">
          <span class="logo-icon">🏺</span>
          <span class="logo-text">瓷源购</span>
        </router-link>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索陶瓷原料..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prepend>
            <el-select v-model="searchType" style="width: 100px;">
              <el-option label="全部" value="" />
              <el-option label="陶土" value="陶土" />
              <el-option label="釉料" value="釉料" />
              <el-option label="颜料" value="颜料" />
            </el-select>
          </template>
          <template #append>
            <el-button @click="handleSearch" type="primary">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        <div class="header-right">
          <router-link to="/favorites" class="header-icon-btn">
            <el-badge :value="favoritesStore.totalCount" :hidden="favoritesStore.totalCount === 0" class="item">
              <el-icon :size="22"><Star /></el-icon>
            </el-badge>
            <span class="btn-text">收藏</span>
          </router-link>
          <div class="header-icon-btn cart-btn" @click="showCart = true">
            <el-badge :value="cartStore.totalCount" :hidden="cartStore.totalCount === 0" class="item">
              <el-icon :size="22"><ShoppingCart /></el-icon>
            </el-badge>
            <span class="btn-text">购物车</span>
          </div>
        </div>
      </div>
    </div>
    <div class="header-nav">
      <div class="container">
        <ul class="nav-list">
          <li>
            <router-link to="/">首页</router-link>
          </li>
          <li v-for="cat in categories" :key="cat.id">
            <router-link :to="`/category/${cat.id}`">{{ cat.name }}</router-link>
          </li>
          <li>
            <router-link to="/">陶瓷原料套餐</router-link>
          </li>
        </ul>
      </div>
    </div>

    <el-drawer v-model="showCart" title="购物车" direction="rtl" size="420px">
      <template v-if="cartStore.items.length > 0">
        <div class="cart-list">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <img :src="item.image" :alt="item.name" class="cart-item-img" />
            <div class="cart-item-info">
              <div class="cart-item-name">{{ item.name }}</div>
              <div class="cart-item-price">¥{{ item.price }} / {{ item.unit }}</div>
              <div class="cart-item-actions">
                <el-input-number v-model="item.quantity" :min="1" :max="99" size="small" @change="updateQuantity(item.id, item.quantity)" />
                <el-button type="danger" text @click="removeFromCart(item.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <div class="cart-footer">
          <div class="cart-total">
            合计：<span class="price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
          <el-button type="primary" @click="handleCheckout" :disabled="cartStore.items.length === 0">
            去结算 ({{ cartStore.totalCount }})
          </el-button>
        </div>
      </template>
      <EmptyState v-else description="购物车是空的" />
    </el-drawer>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useCartStore } from '@/store/cart'
import { useFavoritesStore } from '@/store/favorites'
import { useOrdersStore } from '@/store/orders'
import { mockCategories } from '@/mock/categories'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const ordersStore = useOrdersStore()

const categories = ref(mockCategories)
const searchKeyword = ref('')
const searchType = ref('')
const showCart = ref(false)

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/category/1', query: { keyword: searchKeyword.value } })
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
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
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/')
      }).catch(() => {})
      break
  }
}

const removeFromCart = (id) => {
  cartStore.removeFromCart(id)
  ElMessage.success('已移除')
}

const updateQuantity = (id, quantity) => {
  cartStore.updateQuantity(id, quantity)
}

const handleCheckout = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  const orderData = {
    items: cartStore.items.map(item => ({
      materialId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    totalAmount: cartStore.totalPrice,
    address: userStore.userInfo.address,
    contact: userStore.userInfo.name + ' ' + userStore.userInfo.phone
  }
  ordersStore.addOrder(orderData)
  cartStore.clearCart()
  showCart.value = false
  ElMessage.success('下单成功！')
  router.push('/orders')
}
</script>

<style scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-top {
  background: #f5f7fa;
  padding: 8px 0;
  font-size: 13px;
  color: #909399;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-greeting {
  display: flex;
  align-items: center;
  color: #606266;
}

.dropdown-trigger {
  cursor: pointer;
  color: #909399;
}

.login-link, .register-link {
  color: #606266;
}

.login-link:hover, .register-link:hover {
  color: #409eff;
}

.divider {
  color: #e4e7ed;
  margin: 0 8px;
}

.header-main {
  padding: 20px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.logo-icon {
  font-size: 36px;
}

.logo-text {
  background: linear-gradient(135deg, #2c5c97, #4a90d9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-input {
  width: 500px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.header-icon-btn:hover {
  color: #409eff;
}

.btn-text {
  font-size: 12px;
  margin-top: 4px;
}

.header-nav {
  background: #2c5c97;
}

.nav-list {
  display: flex;
  gap: 0;
}

.nav-list li {
  position: relative;
}

.nav-list li a {
  display: block;
  padding: 14px 28px;
  color: #fff;
  font-size: 15px;
  transition: background 0.3s;
}

.nav-list li a:hover,
.nav-list li a.router-link-active {
  background: rgba(255, 255, 255, 0.15);
}

.cart-list {
  max-height: 60vh;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.cart-item-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
}

.cart-item-price {
  color: #f56c6c;
  font-weight: bold;
  margin-bottom: 8px;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-total {
  font-size: 16px;
}

.cart-total .price {
  font-size: 22px;
}
</style>
