<template>
  <div class="layout-wrapper">
    <el-header class="layout-header">
      <div class="container header-inner">
        <div class="header-left" @click="$router.push('/home')">
          <div class="logo">
            <el-icon :size="32" color="#8B4513"><Shop /></el-icon>
            <span class="logo-text">非遗集采</span>
          </div>
        </div>
        
        <div class="header-center">
          <el-menu 
            :default-active="activeMenu" 
            mode="horizontal" 
            :ellipsis="false"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/home">首页</el-menu-item>
            <el-menu-item index="/products">原料市场</el-menu-item>
            <template v-if="userStore.isLoggedIn">
              <el-menu-item index="/orders" v-if="userStore.isBuyer">我的订单</el-menu-item>
              <el-menu-item index="/supplier-orders" v-if="userStore.isSupplier">订单管理</el-menu-item>
              <el-menu-item index="/favorites" v-if="userStore.isBuyer">我的收藏</el-menu-item>
            </template>
          </el-menu>
        </div>

        <div class="header-right">
          <el-input 
            v-model="searchKeyword"
            placeholder="搜索原料..." 
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <template v-if="userStore.isLoggedIn">
            <el-dropdown trigger="click">
              <div class="user-info">
                <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                  {{ userStore.userInfo?.name?.charAt(0) }}
                </el-avatar>
                <span class="user-name">{{ userStore.userInfo?.name }}</span>
                <el-icon><CaretBottom /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/profile')">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" @click="$router.push('/login')">登录</el-button>
          </template>
        </div>
      </div>
    </el-header>

    <main class="layout-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <el-footer class="layout-footer">
      <div class="container footer-inner">
        <div class="footer-left">
          <div class="footer-logo">
            <el-icon :size="24" color="#8B4513"><Shop /></el-icon>
            <span>非遗手作原料集采平台</span>
          </div>
          <p class="footer-desc">传承千年工艺 · 甄选天然原料</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>关于我们</h4>
            <a href="#">平台介绍</a>
            <a href="#">入驻流程</a>
            <a href="#">联系我们</a>
          </div>
          <div class="link-group">
            <h4>帮助中心</h4>
            <a href="#">采购指南</a>
            <a href="#">支付方式</a>
            <a href="#">配送说明</a>
          </div>
          <div class="link-group">
            <h4>联系方式</h4>
            <p>客服热线：400-888-8888</p>
            <p>邮箱：service@yichai.com</p>
            <p>地址：北京市朝阳区非遗文化园</p>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 非遗手作原料集采平台 版权所有</p>
      </div>
    </el-footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import { Shop, Search, CaretBottom, User, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const searchKeyword = ref('')

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/product/')) return '/products'
  return path
})

function handleMenuSelect(index) {
  router.push(index)
}

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/products', query: { keyword: searchKeyword.value } })
  }
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/home')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid $border-color;
  padding: 0;
  height: auto;

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }

  .header-left {
    cursor: pointer;

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;

      .logo-text {
        font-size: 20px;
        font-weight: 700;
        color: $primary-color;
        letter-spacing: 2px;
      }
    }
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;

    :deep(.el-menu) {
      border-bottom: none;
      background: transparent;

      .el-menu-item {
        height: 64px;
        line-height: 64px;
        border-bottom: 3px solid transparent;
        font-size: 15px;

        &.is-active {
          color: $primary-color;
          border-bottom-color: $primary-color;
        }

        &:hover {
          color: $primary-color;
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .search-input {
      width: 240px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .user-name {
        font-size: 14px;
        color: $text-color;
      }
    }
  }
}

.layout-main {
  flex: 1;
}

.layout-footer {
  background: #2c2c2c;
  color: #ccc;
  padding: 0;
  height: auto;

  .footer-inner {
    display: flex;
    justify-content: space-between;
    padding: 40px 20px;
  }

  .footer-left {
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 12px;
    }

    .footer-desc {
      font-size: 13px;
      color: #999;
    }
  }

  .footer-links {
    display: flex;
    gap: 60px;

    .link-group {
      h4 {
        font-size: 14px;
        color: #fff;
        margin-bottom: 16px;
      }

      a, p {
        display: block;
        font-size: 13px;
        color: #999;
        margin-bottom: 8px;
        cursor: pointer;

        &:hover {
          color: $accent-color;
        }
      }
    }
  }

  .footer-bottom {
    text-align: center;
    padding: 20px;
    border-top: 1px solid #444;
    font-size: 12px;
    color: #666;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .header-center {
    display: none;
  }

  .header-right .search-input {
    display: none;
  }

  .footer-inner {
    flex-direction: column;
    gap: 30px;
  }

  .footer-links {
    flex-wrap: wrap;
    gap: 30px;
  }
}
</style>
