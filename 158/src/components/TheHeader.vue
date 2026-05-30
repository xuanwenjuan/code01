<template>
  <header class="header">
    <div class="header-top">
      <div class="container">
        <div class="header-top-content">
          <div class="left">
            <span>欢迎来到美妆护肤商城！</span>
          </div>
          <div class="right">
            <template v-if="userStore.isLoggedIn">
              <el-dropdown @command="handleCommand">
                <span class="user-info">
                  <el-avatar :size="24" :src="userStore.user?.avatar" />
                  {{ userStore.user?.nickname }}
                  <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                    <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                    <el-dropdown-item command="favorites">我的收藏</el-dropdown-item>
                    <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
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
    </div>
    <div class="header-main">
      <div class="container">
        <div class="header-main-content">
          <router-link to="/" class="logo">
            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beauty%20cosmetics%20logo%20pink%20elegant&image_size=square" alt="logo" />
            <span>美妆商城</span>
          </router-link>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索商品"
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
          <router-link to="/cart" class="cart-btn">
            <el-badge :value="cartStore.totalCount" :max="99" class="cart-badge">
              <el-button type="primary" :icon="ShoppingCart" size="large">
                购物车
              </el-button>
            </el-badge>
          </router-link>
        </div>
      </div>
    </div>
    <div class="header-nav">
      <div class="container">
        <nav class="nav-list">
          <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
            <el-icon><HomeFilled /></el-icon>
            首页
          </router-link>
          <router-link
            v-for="cat in categories"
            :key="cat.id"
            :to="`/list?category=${cat.id}`"
            class="nav-item"
            :class="{ active: route.query.category == cat.id }"
          >
            {{ cat.icon }} {{ cat.name }}
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Search, ShoppingCart, HomeFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const productStore = useProductStore()

const searchKeyword = ref('')
const categories = productStore.getCategories()

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/list', query: { keyword: searchKeyword.value } })
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'orders':
      router.push('/user/orders')
      break
    case 'favorites':
      router.push('/user/favorites')
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
</script>

<style lang="scss" scoped>
.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;

  .header-top {
    background: #f8f8f8;
    border-bottom: 1px solid #eee;
    padding: 8px 0;
    font-size: 12px;
    color: #999;

    .header-top-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .right {
        a {
          color: #666;
          margin: 0 8px;

          &:hover {
            color: $primary-color;
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
            color: $primary-color;
          }
        }
      }
    }
  }

  .header-main {
    padding: 20px 0;

    .header-main-content {
      display: flex;
      align-items: center;
      gap: 40px;

      .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 24px;
        font-weight: bold;
        color: $primary-color;

        img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
      }

      .search-box {
        flex: 1;
        max-width: 600px;

        .search-input {
          :deep(.el-input__wrapper) {
            border-radius: 20px 0 0 20px;
          }

          :deep(.el-input-group__append) {
            border-radius: 0 20px 20px 0;
            background: $primary-color;
            border-color: $primary-color;
            color: #fff;

            .el-button {
              background: $primary-color;
              border-color: $primary-color;

              &:hover {
                background: $primary-dark;
                border-color: $primary-dark;
              }
            }
          }
        }
      }

      .cart-btn {
        .cart-badge {
          :deep(.el-button) {
            background: $primary-color;
            border-color: $primary-color;
            border-radius: 20px;

            &:hover {
              background: $primary-dark;
              border-color: $primary-dark;
            }
          }
        }
      }
    }
  }

  .header-nav {
    background: $primary-color;

    .nav-list {
      display: flex;
      align-items: center;

      .nav-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 14px 24px;
        color: #fff;
        font-size: 15px;
        transition: all 0.3s;

        &:hover,
        &.active {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
}
</style>
