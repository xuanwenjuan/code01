<template>
  <div class="user-center-page">
    <div class="container">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>个人中心</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="content-row">
        <aside class="sidebar">
          <div class="user-card">
            <el-avatar :size="64" :src="userStore.userInfo?.avatar" />
            <div class="user-name">{{ userStore.userInfo?.nickname }}</div>
            <div class="user-phone">{{ userStore.userInfo?.phone }}</div>
          </div>

          <el-menu
            :default-active="activeMenu"
            class="side-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/user/profile">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="/user/favorites">
              <el-icon><StarFilled /></el-icon>
              <span>我的收藏</span>
              <el-badge :value="userStore.favorites.length" :hidden="userStore.favorites.length === 0" class="menu-badge" />
            </el-menu-item>
            <el-menu-item index="/user/appointments">
              <el-icon><Calendar /></el-icon>
              <span>预约记录</span>
              <el-badge :value="pendingCount" :hidden="pendingCount === 0" class="menu-badge" />
            </el-menu-item>
            <el-menu-item index="/user/footprints">
              <el-icon><View /></el-icon>
              <span>浏览足迹</span>
            </el-menu-item>
            <el-menu-item index="logout" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-menu-item>
          </el-menu>
        </aside>

        <main class="main-content">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref(route.path)

const pendingCount = computed(() => {
  return userStore.appointments.filter((a) => a.status === 'pending').length
})

const handleMenuSelect = (index) => {
  if (index === 'logout') return
  router.push(index)
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
</script>

<style lang="scss" scoped>
.user-center-page {
  padding: 20px 0 40px;
}

.page-header {
  margin-bottom: 20px;
}

.content-row {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;

  .user-card {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    margin-bottom: 16px;

    .user-name {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin: 12px 0 4px 0;
    }

    .user-phone {
      font-size: 13px;
      color: #909399;
    }
  }

  .side-menu {
    border-right: none;
    background: #fff;
    border-radius: 8px;
    padding: 8px 0;

    .el-menu-item {
      display: flex;
      align-items: center;

      .menu-badge {
        margin-left: auto;
      }
    }
  }
}

.main-content {
  flex: 1;
  min-width: 0;
}
</style>
