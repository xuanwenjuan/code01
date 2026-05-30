<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-layout">
        <aside class="profile-sidebar">
          <div class="user-card">
            <div class="user-avatar">
              <el-avatar :size="80">
                {{ userStore.userInfo?.name?.charAt(0) || 'U' }}
              </el-avatar>
            </div>
            <div class="user-info">
              <h3 class="user-name">{{ userStore.userInfo?.name }}</h3>
              <el-tag :type="userStore.userRole === 'supplier' ? 'warning' : 'primary'" size="small">
                {{ userStore.userRole === 'supplier' ? '供货商' : '采购商' }}
              </el-tag>
            </div>
          </div>
          <el-menu
            :default-active="activeMenu"
            class="profile-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/profile/orders">
              <el-icon><List /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="/profile/favorites">
              <el-icon><StarFilled /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="/profile/info">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <template v-if="userStore.userRole === 'supplier'">
              <el-menu-item index="/profile/products">
                <el-icon><Goods /></el-icon>
                <span>商品管理</span>
              </el-menu-item>
              <el-menu-item index="/profile/orders-manage">
                <el-icon><Document /></el-icon>
                <span>订单管理</span>
              </el-menu-item>
            </template>
          </el-menu>
          <div class="logout-btn">
            <el-button type="danger" plain @click="handleLogout" style="width: 100%;">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
        </aside>
        <main class="profile-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { List, StarFilled, User, Goods, Document, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

onMounted(() => {
  userStore.getUserInfo()
})

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push({ name: 'Home' })
}
</script>

<style lang="scss" scoped>
.profile-page {
  .profile-layout {
    display: flex;
    gap: 24px;
  }

  .profile-sidebar {
    width: 240px;
    flex-shrink: 0;

    .user-card {
      background: #fff;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin-bottom: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .user-avatar {
        margin-bottom: 12px;
      }

      .user-name {
        font-size: 18px;
        color: #303133;
        margin-bottom: 8px;
      }
    }

    .profile-menu {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: none;

      :deep(.el-menu-item) {
        height: 50px;
        line-height: 50px;

        &.is-active {
          background: #ecf5ff;
          color: #409eff;
        }
      }
    }

    .logout-btn {
      margin-top: 16px;
    }
  }

  .profile-content {
    flex: 1;
    min-height: 600px;
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
</style>
