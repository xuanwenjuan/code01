<template>
  <div class="center-page">
    <div class="container">
      <div class="center-layout">
        <div class="sidebar">
          <div class="user-info-card">
            <el-avatar :size="64" class="user-avatar">
              {{ userStore.userInfo?.name?.charAt(0) }}
            </el-avatar>
            <h3 class="user-name">{{ userStore.userInfo?.name }}</h3>
            <p class="user-role">
              <el-tag type="primary" effect="light">采购商</el-tag>
            </p>
            <p class="user-company">{{ userStore.userInfo?.company }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-value">{{ orderStore.orders.length }}</span>
                <span class="stat-label">订单</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ orderStore.favorites.length }}</span>
                <span class="stat-label">收藏</span>
              </div>
            </div>
          </div>

          <el-menu
            :default-active="activeMenu"
            class="side-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="orders">
              <el-icon><List /></el-icon>
              <span>采购订单</span>
              <el-badge
                v-if="pendingOrdersCount > 0"
                :value="pendingOrdersCount"
                class="menu-badge"
              />
            </el-menu-item>
            <el-menu-item index="favorites">
              <el-icon><StarFilled /></el-icon>
              <span>我的收藏</span>
              <el-badge
                v-if="orderStore.favorites.length > 0"
                :value="orderStore.favorites.length"
                class="menu-badge"
              />
            </el-menu-item>
            <el-menu-item index="profile">
              <el-icon><Setting /></el-icon>
              <span>账号设置</span>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="main-content">
          <transition name="fade" mode="out-in">
            <div v-show="activeMenu === 'orders'" key="orders" class="content-panel">
              <h2 class="panel-title">
                <el-icon><List /></el-icon>
                采购订单
              </h2>
              <OrderList
                :status="orderStatus"
                :loading="orderStore.loading"
                @update:status="orderStatus = $event"
                @view-detail="handleViewOrderDetail"
                @cancel="handleCancelOrder"
              />
            </div>

            <div v-show="activeMenu === 'favorites'" key="favorites" class="content-panel">
              <h2 class="panel-title">
                <el-icon><StarFilled /></el-icon>
                我的收藏
              </h2>
              <FavoriteList />
            </div>

            <div v-show="activeMenu === 'profile'" key="profile" class="content-panel">
              <h2 class="panel-title">
                <el-icon><Setting /></el-icon>
                账号设置
              </h2>

              <el-tabs v-model="profileTab" class="profile-tabs">
                <el-tab-pane label="基本信息" name="info">
                  <el-descriptions :column="2" border class="profile-desc">
                    <el-descriptions-item label="用户名">
                      {{ userStore.userInfo?.username }}
                    </el-descriptions-item>
                    <el-descriptions-item label="真实姓名">
                      {{ userStore.userInfo?.name }}
                    </el-descriptions-item>
                    <el-descriptions-item label="联系电话">
                      {{ userStore.userInfo?.phone }}
                    </el-descriptions-item>
                    <el-descriptions-item label="所属公司">
                      {{ userStore.userInfo?.company }}
                    </el-descriptions-item>
                    <el-descriptions-item label="账号角色">
                      <el-tag type="primary" effect="light">采购商</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="注册时间">
                      2023-01-01
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <el-tab-pane label="修改密码" name="password">
                  <el-form
                    ref="passwordFormRef"
                    :model="passwordForm"
                    :rules="passwordRules"
                    label-width="100px"
                    class="password-form"
                  >
                    <el-form-item label="原密码" prop="oldPassword">
                      <el-input
                        v-model="passwordForm.oldPassword"
                        type="password"
                        placeholder="请输入原密码"
                        show-password
                      />
                    </el-form-item>
                    <el-form-item label="新密码" prop="newPassword">
                      <el-input
                        v-model="passwordForm.newPassword"
                        type="password"
                        placeholder="请输入新密码（6-20位）"
                        show-password
                      />
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirmPassword">
                      <el-input
                        v-model="passwordForm.confirmPassword"
                        type="password"
                        placeholder="请再次输入新密码"
                        show-password
                      />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">
                        确认修改
                      </el-button>
                      <el-button @click="resetPasswordForm">重置</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane label="收货地址" name="address">
                  <div class="address-list">
                    <div
                      v-for="(addr, index) in addressList"
                      :key="index"
                      class="address-item card-hover"
                    >
                      <div class="address-info">
                        <div class="address-header">
                          <span class="address-name">{{ addr.name }}</span>
                          <span class="address-phone">{{ addr.phone }}</span>
                          <el-tag
                            v-if="addr.isDefault"
                            type="danger"
                            effect="light"
                            size="small"
                          >
                            默认
                          </el-tag>
                        </div>
                        <p class="address-detail">{{ addr.detail }}</p>
                      </div>
                      <div class="address-actions">
                        <el-button size="small" type="primary" link>编辑</el-button>
                        <el-button size="small" type="danger" link>删除</el-button>
                      </div>
                    </div>
                    <el-button type="primary" plain class="add-address-btn">
                      <el-icon><Plus /></el-icon>
                      新增收货地址
                    </el-button>
                  </div>
                </el-tab-pane>
              </el-tabs>

              <div class="profile-actions">
                <el-button type="danger" @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <el-dialog v-model="showOrderDetail" title="订单详情" width="600px">
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            {{ currentOrder.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">
            {{ currentOrder.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="收货地址">
            {{ currentOrder.address }}
          </el-descriptions-item>
        </el-descriptions>

        <h4 class="detail-title">采购图书</h4>
        <el-table :data="currentOrder.books" size="small">
          <el-table-column prop="name" label="图书名称" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">
              ¥{{ row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              ¥{{ (row.price * row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="order-total">
          <span>订单总额：</span>
          <span class="total-price">¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import OrderList from '@/components/common/OrderList.vue'
import FavoriteList from '@/components/common/FavoriteList.vue'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

const activeMenu = ref('orders')
const orderStatus = ref('all')
const profileTab = ref('info')
const showOrderDetail = ref(false)
const currentOrder = ref(null)
const changingPassword = ref(false)
const passwordFormRef = ref(ElForm)

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/,
      message: '密码需包含字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const addressList = ref([
  {
    id: 1,
    name: '张采购',
    phone: '13800138001',
    detail: '北京市朝阳区XX街道XX书店',
    isDefault: true
  },
  {
    id: 2,
    name: '李经理',
    phone: '13800138002',
    detail: '上海市浦东新区XX路XX书城',
    isDefault: false
  }
])

const pendingOrdersCount = computed(() => {
  return orderStore.orders.filter(o => o.status === 'pending').length
})

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    shipping: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待发货',
    shipping: '配送中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
}

const handleViewOrderDetail = (order) => {
  currentOrder.value = order
  showOrderDetail.value = true
}

const handleCancelOrder = (order) => {
  ElMessage.success(`订单 ${order.orderNo} 已取消`)
}

const handleChangePassword = async () => {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  changingPassword.value = true

  setTimeout(() => {
    changingPassword.value = false
    ElMessage.success('密码修改成功，请重新登录')
    resetPasswordForm()
    userStore.logout()
    router.push('/login')
  }, 1000)
}

const resetPasswordForm = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordFormRef.value?.resetFields()
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/')
  }).catch(() => {})
}
</script>

<style scoped>
.center-page {
  padding-top: 20px;
}

.center-layout {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
}

.user-info-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  margin-bottom: 16px;
}

.user-avatar {
  background: linear-gradient(135deg, #409eff, #67c23a);
  margin-bottom: 12px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.user-role {
  margin: 0 0 8px 0;
}

.user-company {
  font-size: 13px;
  color: #909399;
  margin: 0 0 16px 0;
}

.user-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: #ebeef5;
}

.side-menu {
  border-right: none;
  border-radius: 8px;
  overflow: hidden;
}

.menu-badge {
  margin-left: auto;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.content-panel {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-height: 500px;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #303133;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-tabs {
  margin-bottom: 20px;
}

.profile-desc {
  margin-bottom: 24px;
}

.password-form {
  max-width: 400px;
  padding: 20px 0;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 0;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.3s;
}

.address-info {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.address-name {
  font-weight: 600;
  color: #303133;
}

.address-phone {
  color: #606266;
}

.address-detail {
  color: #606266;
  margin: 0;
  font-size: 14px;
}

.address-actions {
  display: flex;
  gap: 8px;
}

.add-address-btn {
  border-style: dashed;
  padding: 20px;
  height: auto;
  font-size: 14px;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.order-detail {
  padding: 10px 0;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  color: #303133;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 16px;
}

.total-price {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
  margin-left: 8px;
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
