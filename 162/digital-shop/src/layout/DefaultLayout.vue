<template>
  <div class="layout">
    <header class="header">
      <div class="top-bar">
        <div class="container">
          <div class="top-bar-left">
            <span>欢迎来到数码商城！</span>
          </div>
          <div class="top-bar-right">
            <template v-if="userStore.isLoggedIn">
              <span class="user-name">{{ userStore.userInfo?.username }}</span>
              <el-dropdown @command="handleCommand">
                <span class="dropdown-link">
                  个人中心 <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="user">个人中心</el-dropdown-item>
                    <el-dropdown-item command="order">我的订单</el-dropdown-item>
                    <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <router-link to="/login">请登录</router-link>
              <span class="divider">|</span>
              <router-link to="/login">免费注册</router-link>
            </template>
          </div>
        </div>
      </div>
      <div class="main-header">
        <div class="container">
          <div class="logo" @click="$router.push('/')">
            <el-icon :size="40" color="#409eff"><ShoppingBag /></el-icon>
            <span class="logo-text">数码商城</span>
          </div>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索商品"
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button type="primary" @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
          <div class="cart-btn" @click="$router.push('/cart')">
            <el-badge :value="cartStore.totalCount" :hidden="cartStore.totalCount === 0">
              <el-button type="primary">
                <el-icon><ShoppingCart /></el-icon>
                购物车
              </el-button>
            </el-badge>
          </div>
        </div>
      </div>
      <nav class="nav-bar">
        <div class="container">
          <div class="category-nav">
            <el-dropdown trigger="click" @command="handleCategoryClick">
              <span class="category-btn">
                <el-icon><Menu /></el-icon>
                全部商品分类
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu class="category-menu">
                  <el-dropdown-item
                    v-for="cat in categories"
                    :key="cat.id"
                    :command="cat.id"
                  >
                    <el-icon><component :is="cat.icon" /></el-icon>
                    {{ cat.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="nav-links">
            <router-link to="/">首页</router-link>
            <router-link to="/products">全部商品</router-link>
            <router-link to="/products?isNew=1">新品上市</router-link>
            <router-link to="/products?isHot=1">热卖爆款</router-link>
          </div>
        </div>
      </nav>
    </header>
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="footer">
      <div class="container">
        <div class="footer-links">
          <div class="link-group">
            <h4>购物指南</h4>
            <a href="#">购物流程</a>
            <a href="#">会员介绍</a>
            <a href="#">常见问题</a>
          </div>
          <div class="link-group">
            <h4>配送方式</h4>
            <a href="#">配送说明</a>
            <a href="#">配送范围</a>
            <a href="#">验货签收</a>
          </div>
          <div class="link-group">
            <h4>支付方式</h4>
            <a href="#">在线支付</a>
            <a href="#">银行转账</a>
            <a href="#">货到付款</a>
          </div>
          <div class="link-group">
            <h4>售后服务</h4>
            <a href="#">退换货政策</a>
            <a href="#">售后保障</a>
            <a href="#">联系客服</a>
          </div>
        </div>
        <div class="copyright">
          <p>Copyright © 2026 数码商城 版权所有</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, ShoppingBag, Search, ShoppingCart, Menu } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { categories } from '@/mock'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()
const searchKeyword = ref('')

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/products', query: { keyword: searchKeyword.value } })
  }
}

function handleCommand(command) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      ElMessage.success('退出登录成功')
      router.push('/')
    }).catch(() => {})
  } else if (command === 'user') {
    router.push('/user')
  } else if (command === 'order') {
    router.push('/user?tab=orders')
  }
}

function handleCategoryClick(categoryId) {
  router.push({ path: '/products', query: { categoryId } })
}
</script>

<style scoped lang="scss">
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.top-bar {
  height: 30px;
  background: #f5f5f5;
  line-height: 30px;
  font-size: 12px;
  color: #666;

  .container {
    display: flex;
    justify-content: space-between;
  }

  .top-bar-right {
    a {
      color: #666;
      margin: 0 5px;
      &:hover {
        color: #409eff;
      }
    }
    .divider {
      color: #ddd;
      margin: 0 5px;
    }
    .user-name {
      color: #409eff;
      margin-right: 10px;
    }
    .dropdown-link {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      &:hover {
        color: #409eff;
      }
    }
  }
}

.main-header {
  height: 100px;
  display: flex;
  align-items: center;

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .logo {
    display: flex;
    align-items: center;
    cursor: pointer;
    .logo-text {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-left: 10px;
    }
  }

  .search-box {
    width: 500px;
    .search-input {
      :deep(.el-input-group__append) {
        padding: 0;
        .el-button {
          border: none;
          height: 100%;
        }
      }
    }
  }

  .cart-btn {
    cursor: pointer;
  }
}

.nav-bar {
  height: 40px;
  background: #409eff;

  .container {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .category-nav {
    .category-btn {
      display: inline-flex;
      align-items: center;
      height: 40px;
      padding: 0 20px;
      background: #337ecc;
      color: #fff;
      cursor: pointer;
      gap: 5px;
    }
    :deep(.el-dropdown-menu) {
      width: 200px;
    }
    .category-menu {
      :deep(.el-dropdown-menu__item) {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
  }

  .nav-links {
    display: flex;
    margin-left: 30px;
    a {
      color: #fff;
      padding: 0 20px;
      height: 40px;
      line-height: 40px;
      &:hover, &.router-link-active {
        background: #337ecc;
      }
    }
  }
}

.main {
  flex: 1;
}

.footer {
  background: #fff;
  border-top: 1px solid #eee;
  padding: 30px 0;
  margin-top: 30px;

  .footer-links {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;

    .link-group {
      h4 {
        font-size: 14px;
        color: #333;
        margin-bottom: 10px;
      }
      a {
        display: block;
        font-size: 12px;
        color: #666;
        line-height: 24px;
        &:hover {
          color: #409eff;
        }
      }
    }
  }

  .copyright {
    text-align: center;
    font-size: 12px;
    color: #999;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
}
</style>
