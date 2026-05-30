<template>
  <div class="user-center-page">
    <div class="container">
      <div class="user-center-layout">
        <aside class="sidebar">
          <div class="user-info-card">
            <el-avatar :size="64" :src="userStore.user?.avatar" />
            <div class="user-name">{{ userStore.user?.nickname }}</div>
            <div class="user-level">
              <el-tag size="small" type="warning">{{ userStore.user?.level }}</el-tag>
            </div>
            <div class="user-assets">
              <div class="asset-item">
                <span class="value">{{ userStore.user?.points }}</span>
                <span class="label">积分</span>
              </div>
              <div class="asset-item">
                <span class="value">¥{{ userStore.user?.balance?.toFixed(2) }}</span>
                <span class="label">余额</span>
              </div>
            </div>
          </div>
          <el-menu
            :default-active="activeMenu"
            router
            class="user-menu"
          >
            <el-menu-item index="/user/profile">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="/user/orders">
              <el-icon><List /></el-icon>
              <span>订单记录</span>
            </el-menu-item>
            <el-menu-item index="/user/address">
              <el-icon><Location /></el-icon>
              <span>地址管理</span>
            </el-menu-item>
            <el-menu-item index="/user/favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
          </el-menu>
        </aside>
        <main class="main-content">
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { User, List, Location, Star } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.user-center-page {
  padding: 20px 0;

  .user-center-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 20px;
  }

  .sidebar {
    .user-info-card {
      background: #fff;
      border-radius: $border-radius;
      padding: 24px;
      text-align: center;
      margin-bottom: 16px;

      .user-name {
        font-size: 18px;
        font-weight: 600;
        margin-top: 12px;
        margin-bottom: 8px;
      }

      .user-level {
        margin-bottom: 16px;
      }

      .user-assets {
        display: flex;
        justify-content: center;
        gap: 24px;
        padding-top: 16px;
        border-top: 1px solid $border-light;

        .asset-item {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .value {
            font-size: 20px;
            font-weight: 600;
            color: $primary-color;
          }

          .label {
            font-size: 12px;
            color: $text-secondary;
          }
        }
      }
    }

    .user-menu {
      background: #fff;
      border-radius: $border-radius;
      border: none;

      .el-menu-item {
        height: 50px;
        line-height: 50px;

        &:hover {
          background: #fff5f7;
        }

        &.is-active {
          background: $primary-color;
          color: #fff;

          &:hover {
            background: $primary-color;
          }
        }
      }
    }
  }

  .main-content {
    background: #fff;
    border-radius: $border-radius;
    padding: 24px;
    min-height: 600px;
  }
}

@media (max-width: 1200px) {
  .user-center-page {
    .user-center-layout {
      grid-template-columns: 1fr;
    }
  }
}
</style>
