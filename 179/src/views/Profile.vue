<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-layout">
        <div class="profile-sidebar">
          <div class="user-info-card vintage-border">
            <el-avatar :size="80" :src="userStore.userInfo?.avatar" />
            <h3 class="username">{{ userStore.userInfo?.nickname }}</h3>
            <p class="user-role">
              <el-tag :type="userStore.userRole === 'merchant' ? 'warning' : 'primary'" size="small">
                {{ userStore.userRole === 'merchant' ? '饰品商家' : '普通用户' }}
              </el-tag>
            </p>
          </div>
          
          <div class="menu-list vintage-border">
            <div 
              class="menu-item" 
              :class="{ active: activeMenu === 'profile' }"
              @click="activeMenu = 'profile'"
            >
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </div>
            <div 
              class="menu-item" 
              :class="{ active: activeMenu === 'security' }"
              @click="activeMenu = 'security'"
            >
              <el-icon><Lock /></el-icon>
              <span>账户安全</span>
            </div>
            <div 
              class="menu-item" 
              @click="router.push('/orders')"
            >
              <el-icon><Tickets /></el-icon>
              <span>我的订单</span>
            </div>
            <div 
              class="menu-item" 
              @click="router.push('/after-sales')"
            >
              <el-icon><Service /></el-icon>
              <span>售后申请</span>
            </div>
            <div 
              v-if="userStore.userRole === 'merchant'"
              class="menu-item" 
              @click="router.push('/merchant')"
            >
              <el-icon><Shop /></el-icon>
              <span>商家中心</span>
            </div>
            <div class="menu-item logout" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </div>
          </div>
        </div>
        
        <div class="profile-content">
          <div v-if="activeMenu === 'profile'" class="content-card vintage-border">
            <h3 class="card-title">个人信息</h3>
            
            <el-form :model="profileForm" label-width="100px" class="profile-form">
              <el-form-item label="用户名">
                <el-input v-model="profileForm.username" disabled />
              </el-form-item>
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item v-if="userStore.userRole === 'merchant'" label="店铺名称">
                <el-input v-model="profileForm.shopName" placeholder="请输入店铺名称" />
              </el-form-item>
              <el-form-item v-if="userStore.userRole === 'merchant'" label="店铺描述">
                <el-input v-model="profileForm.shopDescription" type="textarea" :rows="3" placeholder="请输入店铺描述" />
              </el-form-item>
              <el-form-item label="收货地址">
                <el-input v-model="profileForm.address" type="textarea" :rows="2" placeholder="请输入收货地址" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveProfile">保存修改</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div v-if="activeMenu === 'security'" class="content-card vintage-border">
            <h3 class="card-title">修改密码</h3>
            
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
                  show-password
                  placeholder="请输入原密码"
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  show-password
                  placeholder="请输入新密码（6-20位，包含大小写字母和数字）"
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  show-password
                  placeholder="请再次输入新密码"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
                <el-button @click="resetPasswordForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div class="content-card vintage-border">
            <h3 class="card-title">订单统计</h3>
            <div class="stats-grid">
              <div class="stat-card" @click="router.push('/orders')">
                <div class="stat-icon all">
                  <el-icon><ShoppingBag /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-num">{{ orderStats.total }}</span>
                  <span class="stat-label">全部订单</span>
                </div>
              </div>
              <div class="stat-card" @click="router.push('/orders?status=pending')">
                <div class="stat-icon pending">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-num">{{ orderStats.pending }}</span>
                  <span class="stat-label">待付款</span>
                </div>
              </div>
              <div class="stat-card" @click="router.push('/orders?status=paid')">
                <div class="stat-icon paid">
                  <el-icon><Money /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-num">{{ orderStats.paid }}</span>
                  <span class="stat-label">待发货</span>
                </div>
              </div>
              <div class="stat-card" @click="router.push('/orders?status=shipped')">
                <div class="stat-icon shipped">
                  <el-icon><Van /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-num">{{ orderStats.shipped }}</span>
                  <span class="stat-label">待收货</span>
                </div>
              </div>
              <div class="stat-card" @click="router.push('/orders?status=completed')">
                <div class="stat-icon completed">
                  <el-icon><CircleCheck /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-num">{{ orderStats.completed }}</span>
                  <span class="stat-label">已完成</span>
                </div>
              </div>
              <div class="stat-card" @click="router.push('/after-sales')">
                <div class="stat-icon aftersale">
                  <el-icon><Service /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-num">{{ afterSaleCount }}</span>
                  <span class="stat-label">售后申请</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, Tickets, Service, Shop, SwitchButton, ShoppingBag, Clock, Money, Van, CircleCheck } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { validators } from '@/utils/validators'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const orderStore = useOrderStore()

const activeMenu = ref('profile')
const passwordFormRef = ref(null)

const profileForm = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  address: '',
  shopName: '',
  shopDescription: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const orderStats = computed(() => {
  return orderStore.getOrderStatistics()
})

const afterSaleCount = computed(() => {
  return orderStore.userAfterSales.length
})

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!validators.password.pattern.test(value)) {
          callback(new Error(validators.password.message))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

onMounted(() => {
  initProfileForm()
  
  const status = route.query.status
  if (status) {
    router.push('/orders')
  }
})

watch(() => route.query.tab, (newVal) => {
  if (newVal === 'security') {
    activeMenu.value = 'security'
  }
})

const initProfileForm = () => {
  if (userStore.userInfo) {
    profileForm.username = userStore.userInfo.username
    profileForm.nickname = userStore.userInfo.nickname
    profileForm.email = userStore.userInfo.email
    profileForm.phone = userStore.userInfo.phone
    profileForm.address = userStore.userInfo.address || ''
    profileForm.shopName = userStore.userInfo.shopName || ''
    profileForm.shopDescription = userStore.userInfo.shopDescription || ''
  }
}

const handleSaveProfile = () => {
  const updateData = {
    nickname: profileForm.nickname,
    email: profileForm.email,
    phone: profileForm.phone,
    address: profileForm.address
  }
  
  if (userStore.userRole === 'merchant') {
    updateData.shopName = profileForm.shopName
    updateData.shopDescription = profileForm.shopDescription
  }
  
  const success = userStore.updateUserInfo(updateData)
  if (success) {
    ElMessage.success('个人信息已保存')
  } else {
    ElMessage.error('保存失败，请重试')
  }
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    
    const result = userStore.changePassword(
      passwordForm.oldPassword,
      passwordForm.newPassword
    )
    
    if (result.success) {
      ElMessage.success(result.message)
      resetPasswordForm()
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('Validation failed:', error)
  }
}

const resetPasswordForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
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
.profile-page {
  padding: 40px 0;
}

.profile-layout {
  display: flex;
  gap: 24px;
}

.profile-sidebar {
  width: 240px;
  flex-shrink: 0;
}

.user-info-card {
  background: #fff;
  padding: 30px 20px;
  text-align: center;
  margin-bottom: 20px;
  
  .username {
    font-size: 18px;
    font-weight: 600;
    color: #2c1810;
    margin: 16px 0 8px;
  }
  
  .user-role {
    font-size: 14px;
  }
}

.menu-list {
  background: #fff;
  padding: 12px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
  color: #333;
  
  &:hover {
    background: #f5f0e1;
    color: #8b6914;
  }
  
  &.active {
    background: #f5f0e1;
    color: #8b6914;
    border-left: 3px solid #d4af37;
  }
  
  &.logout {
    color: #c0392b;
    
    &:hover {
      background: #fef0f0;
      color: #c0392b;
    }
  }
  
  .el-icon {
    font-size: 18px;
  }
}

.profile-content {
  flex: 1;
}

.content-card {
  background: #fff;
  padding: 30px;
  margin-bottom: 24px;
  
  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }
}

.profile-form,
.password-form {
  max-width: 500px;
  
  :deep(.el-button--primary) {
    background: linear-gradient(135deg, #d4af37, #b8960c);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #e5c158, #c9a71d);
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #faf8f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    
    &.all {
      background: linear-gradient(135deg, #d4af37, #b8960c);
    }
    &.pending {
      background: linear-gradient(135deg, #faad14, #d48806);
    }
    &.paid {
      background: linear-gradient(135deg, #52c41a, #389e0d);
    }
    &.shipped {
      background: linear-gradient(135deg, #1890ff, #096dd9);
    }
    &.completed {
      background: linear-gradient(135deg, #722ed1, #531dab);
    }
    &.aftersale {
      background: linear-gradient(135deg, #eb2f96, #c41d7f);
    }
  }
  
  .stat-info {
    display: flex;
    flex-direction: column;
    
    .stat-num {
      font-size: 24px;
      font-weight: 700;
      color: #2c1810;
    }
    
    .stat-label {
      font-size: 13px;
      color: #666;
    }
  }
}

@media (max-width: 768px) {
  .profile-layout {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
