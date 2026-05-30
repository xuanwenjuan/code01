<template>
  <div class="profile-page">
    <div class="container">
      <div class="calibration-reminder" v-if="calibrationReminders.length > 0">
        <el-alert
          :title="`您有 ${calibrationReminders.length} 台器材需要校准！`"
          type="warning"
          show-icon
          :closable="false"
        >
          <template #default>
            <div class="reminder-content">
              <span v-for="order in calibrationReminders" :key="order.id" class="reminder-item">
                {{ order.equipmentName }}（下次校准：{{ order.nextCalibration }}）
              </span>
              <el-button type="warning" size="small" @click="goToOrders">
                立即处理
              </el-button>
            </div>
          </template>
        </el-alert>
      </div>

      <div class="profile-layout">
        <aside class="sidebar">
          <div class="user-card">
            <el-avatar :size="80" :src="userStore.userInfo?.avatar">
              {{ userStore.userInfo?.name?.charAt(0) }}
            </el-avatar>
            <h3 class="user-name">{{ userStore.userInfo?.name }}</h3>
            <el-tag :type="userStore.isBuyer ? 'primary' : 'success'" size="large">
              {{ userStore.isBuyer ? '采购方' : '供货商' }}
            </el-tag>
            <p class="user-org">
              {{ userStore.isBuyer ? userStore.userInfo?.organization : userStore.userInfo?.company }}
            </p>
          </div>

          <el-menu
            :default-active="activeMenu"
            class="profile-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/profile/orders">
              <el-icon><Tickets /></el-icon>
              <span>订单管理</span>
            </el-menu-item>
            <el-menu-item index="/profile/favorites">
              <el-icon><StarFilled /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="/profile/usage-stats">
              <el-icon><DataLine /></el-icon>
              <span>使用统计</span>
            </el-menu-item>
            <el-menu-item index="/profile/info">
              <el-icon><UserFilled /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
          </el-menu>

          <div class="sidebar-actions" v-if="userStore.isBuyer">
            <div class="action-section">
              <h4 class="section-title">采购方专属</h4>
              <el-button type="primary" block @click="goToOrders">
                <el-icon><ShoppingCartFull /></el-icon>
                发起采购
              </el-button>
              <el-button block @click="goToUsageStats">
                <el-icon><Timer /></el-icon>
                查看使用报告
              </el-button>
            </div>
          </div>

          <div class="sidebar-actions" v-else>
            <div class="action-section">
              <h4 class="section-title">供货商专属</h4>
              <el-button type="success" block>
                <el-icon><Goods /></el-icon>
                管理商品
              </el-button>
              <el-button block>
                <el-icon><TrendCharts /></el-icon>
                销售数据
              </el-button>
            </div>
          </div>
        </aside>

        <div class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useOrderStore } from '@/store/order'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

const activeMenu = ref(route.path)

const calibrationReminders = computed(() => {
  return orderStore.getCalibrationReminders()
})

onMounted(() => {
  activeMenu.value = route.path
})

function handleMenuSelect(index) {
  router.push(index)
}

function goToOrders() {
  router.push('/profile/orders')
}

function goToUsageStats() {
  router.push('/profile/usage-stats')
}
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 40px 0;
}

.calibration-reminder {
  margin-bottom: 24px;
}

.reminder-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.reminder-item {
  font-size: 13px;
  color: #e6a23c;
}

.profile-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
}

.sidebar {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.sidebar-actions {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin: 0 0 8px;
}

.user-card {
  padding: 32px 24px;
  text-align: center;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: #fff;
}

.user-card .el-avatar {
  margin-bottom: 12px;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.user-card .el-tag {
  margin-bottom: 8px;
}

.user-org {
  font-size: 13px;
  opacity: 0.9;
}

.profile-menu {
  border-right: none;
  padding: 16px 0;
}

.profile-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 0;
}

.profile-menu .el-menu-item.is-active {
  background: #ecf5ff;
  color: #409eff;
}

.main-content {
  background: #fff;
  border-radius: 12px;
  min-height: 600px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
