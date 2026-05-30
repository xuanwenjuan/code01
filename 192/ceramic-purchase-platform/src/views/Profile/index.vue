<template>
  <div class="profile-page">
    <div class="container">
      <el-page-header @back="goBack" class="mb-20">
        <template #content>
          <span>个人中心</span>
        </template>
      </el-page-header>

      <div v-if="purchaseWarnings.length > 0" class="warnings-card card mb-20">
        <div class="warnings-header">
          <el-icon class="warning-icon"><Warning /></el-icon>
          <span class="warnings-title">采购预警提醒</span>
          <el-tag type="danger" size="small">{{ purchaseWarnings.length }} 条提醒</el-tag>
        </div>
        <div class="warnings-list">
          <div
            v-for="(warning, index) in purchaseWarnings"
            :key="index"
            class="warning-item"
            :class="warning.type"
          >
            <el-icon><Bell /></el-icon>
            <div class="warning-content">
              <div class="warning-title">{{ warning.title }}</div>
              <div class="warning-desc">{{ warning.description }}</div>
            </div>
            <el-button
              type="primary"
              size="small"
              link
              @click="handleWarningAction(warning)"
            >
              立即处理
            </el-button>
          </div>
        </div>
      </div>

      <el-row :gutter="20">
        <el-col :span="6">
          <div class="user-card card">
            <div class="user-avatar">
              <el-avatar :size="100" :src="userStore.userInfo?.avatar" />
            </div>
            <div class="user-name">{{ userStore.userInfo?.name }}</div>
            <div class="user-role">
              <el-tag :type="userStore.isSupplier ? 'success' : 'primary'" size="large">
                {{ userStore.isSupplier ? '供货商' : '采购方' }}
              </el-tag>
            </div>
            <div class="user-stats">
              <div class="stat-item">
                <div class="stat-value">{{ orderCount }}</div>
                <div class="stat-label">订单数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ favoritesStore.totalCount }}</div>
                <div class="stat-label">收藏</div>
              </div>
            </div>
          </div>

          <el-menu :default-active="activeMenu" class="side-menu" @select="handleMenuSelect">
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>基本信息</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <el-icon><Tickets /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="statistics" v-if="userStore.isBuyer">
              <el-icon><DataAnalysis /></el-icon>
              <span>原料用量统计</span>
            </el-menu-item>
            <el-menu-item index="supplier" v-if="userStore.isSupplier">
              <el-icon><OfficeBuilding /></el-icon>
              <span>供货商中心</span>
            </el-menu-item>
            <el-menu-item index="logout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-menu-item>
          </el-menu>
        </el-col>

        <el-col :span="18">
          <div class="content-card card" v-if="activeMenu === 'profile'">
            <h3 class="section-title">基本信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户名">
                {{ userStore.userInfo?.username }}
              </el-descriptions-item>
              <el-descriptions-item label="企业名称">
                {{ userStore.userInfo?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="联系电话">
                {{ userStore.userInfo?.phone }}
              </el-descriptions-item>
              <el-descriptions-item label="电子邮箱">
                {{ userStore.userInfo?.email }}
              </el-descriptions-item>
              <el-descriptions-item label="详细地址" :span="2">
                {{ userStore.userInfo?.address }}
              </el-descriptions-item>
              <el-descriptions-item label="营业执照">
                {{ userStore.userInfo?.businessLicense }}
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                {{ userStore.userInfo?.createdAt }}
              </el-descriptions-item>
            </el-descriptions>

            <el-divider />

            <h3 class="section-title">修改信息</h3>
            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
              style="max-width: 600px;"
            >
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="profileForm.phone" size="large" />
              </el-form-item>
              <el-form-item label="电子邮箱" prop="email">
                <el-input v-model="profileForm.email" size="large" />
              </el-form-item>
              <el-form-item label="详细地址" prop="address">
                <el-input v-model="profileForm.address" type="textarea" :rows="2" size="large" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="large" @click="handleUpdateProfile">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="content-card card" v-if="activeMenu === 'orders'">
            <div class="card-header">
              <h3 class="section-title">我的订单</h3>
              <el-button type="primary" link @click="router.push('/orders')">
                查看全部 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div v-if="recentOrders.length > 0" class="order-list">
              <div v-for="order in recentOrders" :key="order.id" class="order-item">
                <div class="order-header">
                  <span class="order-no">订单号：{{ order.orderNo }}</span>
                  <el-tag :type="orderStatusMap[order.status].color">
                    {{ orderStatusMap[order.status].label }}
                  </el-tag>
                </div>
                <div class="order-items">
                  <div v-for="item in order.items" :key="item.materialId" class="order-item-row">
                    <img :src="item.image" :alt="item.name" class="item-image" />
                    <div class="item-info">
                      <div class="item-name">{{ item.name }}</div>
                      <div class="item-price">¥{{ item.price }} x {{ item.quantity }}</div>
                    </div>
                  </div>
                </div>
                <div class="order-footer">
                  <span>下单时间：{{ order.createdAt }}</span>
                  <span class="order-total">合计：<span class="price">¥{{ order.totalAmount }}</span></span>
                </div>
              </div>
            </div>
            <EmptyState v-else description="暂无订单" show-action action-text="去采购" @action="goHome" />
          </div>

          <div class="content-card card" v-if="activeMenu === 'favorites'">
            <div class="card-header">
              <h3 class="section-title">我的收藏</h3>
              <el-button type="primary" link @click="router.push('/favorites')">
                查看全部 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div v-if="favoritesStore.items.length > 0" class="favorites-grid">
              <el-row :gutter="16">
                <el-col v-for="item in favoritesStore.items.slice(0, 4)" :key="item.id" :span="6">
                  <MaterialCard :material="item" />
                </el-col>
              </el-row>
            </div>
            <EmptyState v-else description="暂无收藏" show-action action-text="去逛逛" @action="goHome" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useFavoritesStore } from '@/store/favorites'
import { useOrdersStore } from '@/store/orders'
import { orderStatusMap } from '@/mock/orders'
import EmptyState from '@/components/EmptyState.vue'
import MaterialCard from '@/components/MaterialCard.vue'

const router = useRouter()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()
const ordersStore = useOrdersStore()

const activeMenu = ref('profile')
const profileFormRef = ref<FormInstance>()

const profileForm = reactive({
  phone: '',
  email: '',
  address: ''
})

const orderCount = computed(() => ordersStore.userOrders.length)
const recentOrders = computed(() => ordersStore.userOrders.slice(0, 3))

const purchaseWarnings = computed(() => {
  const warnings = []
  
  const pendingOrders = ordersStore.userOrders.filter(o => o.status === 'pending')
  if (pendingOrders.length > 0) {
    warnings.push({
      type: 'danger',
      title: '待付款订单提醒',
      description: `您有 ${pendingOrders.length} 个订单待付款，请及时处理`,
      action: 'orders'
    })
  }
  
  const shippedOrders = ordersStore.userOrders.filter(o => o.status === 'shipped')
  if (shippedOrders.length > 0) {
    warnings.push({
      type: 'warning',
      title: '待收货订单提醒',
      description: `您有 ${shippedOrders.length} 个订单已发货，请注意查收`,
      action: 'orders'
    })
  }
  
  const favoriteItems = favoritesStore.items.filter(item => item.tags && item.tags.includes('待采购'))
  if (favoriteItems.length > 0) {
    warnings.push({
      type: 'info',
      title: '待采购原料提醒',
      description: `您的收藏夹中有 ${favoriteItems.length} 件标记为"待采购"的原料`,
      action: 'favorites'
    })
  }
  
  const totalSpent = ordersStore.userOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0)
  if (totalSpent > 10000) {
    warnings.push({
      type: 'success',
      title: '采购量统计',
      description: `您本月采购金额已达 ¥${totalSpent.toFixed(2)}，可查看详细用量统计`,
      action: 'statistics'
    })
  }
  
  return warnings
})

const validatePhone = (rule, value, callback) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!value) {
    callback(new Error('请输入手机号码'))
  } else if (!phoneRegex.test(value)) {
    callback(new Error('请输入正确的11位手机号码'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/
  if (!value) {
    callback(new Error('请输入邮箱地址'))
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

const profileRules: FormRules = {
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'orders') {
    router.push('/orders')
  } else if (index === 'favorites') {
    router.push('/favorites')
  } else if (index === 'statistics') {
    router.push('/statistics')
  } else if (index === 'supplier') {
    router.push('/supplier')
  } else if (index === 'logout') {
    ElMessage.success('已退出登录')
    userStore.logout()
    router.push('/login')
  }
}

const handleWarningAction = (warning) => {
  if (warning.action === 'orders') {
    router.push('/orders')
  } else if (warning.action === 'favorites') {
    router.push('/favorites')
  } else if (warning.action === 'statistics') {
    router.push('/statistics')
  }
}

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}

const handleUpdateProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    userStore.updateUserInfo(profileForm)
    ElMessage.success('信息修改成功')
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  if (userStore.userInfo) {
    profileForm.phone = userStore.userInfo.phone
    profileForm.email = userStore.userInfo.email
    profileForm.address = userStore.userInfo.address
  }
})
</script>

<style scoped>
.profile-page {
  padding-bottom: 40px;
}

.mb-20 {
  margin-bottom: 20px;
}

.warnings-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  border-left: 4px solid #f56c6c;
}

.warnings-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.warning-icon {
  font-size: 24px;
  color: #f56c6c;
}

.warnings-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.warnings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #fafafa;
}

.warning-item.danger {
  background: #fef0f0;
  border-left: 3px solid #f56c6c;
}

.warning-item.warning {
  background: #fdf6ec;
  border-left: 3px solid #e6a23c;
}

.warning-item.info {
  background: #ecf5ff;
  border-left: 3px solid #409eff;
}

.warning-item.success {
  background: #f0f9eb;
  border-left: 3px solid #67c23a;
}

.warning-item .el-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.warning-item.danger .el-icon {
  color: #f56c6c;
}

.warning-item.warning .el-icon {
  color: #e6a23c;
}

.warning-item.info .el-icon {
  color: #409eff;
}

.warning-item.success .el-icon {
  color: #67c23a;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.warning-desc {
  font-size: 13px;
  color: #909399;
}

.user-card {
  padding: 30px 20px;
  text-align: center;
  margin-bottom: 20px;
}

.user-avatar {
  margin-bottom: 16px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.user-role {
  margin-bottom: 20px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.side-menu {
  border-radius: 8px;
}

.content-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f5f7fa;
}

.order-no {
  font-size: 14px;
  color: #606266;
}

.order-items {
  padding: 16px 20px;
}

.order-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.order-item-row:last-child {
  margin-bottom: 0;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.item-price {
  font-size: 13px;
  color: #909399;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fafafa;
  font-size: 13px;
  color: #606266;
}

.order-total {
  font-size: 14px;
}

.order-total .price {
  font-size: 18px;
}

.favorites-grid {
  margin-top: 20px;
}
</style>
