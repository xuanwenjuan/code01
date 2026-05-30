<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-header">
        <el-avatar :size="80" :src="userStore.currentUser.avatar" />
        <div class="user-info">
          <div class="user-name-row">
            <h2 class="user-name">{{ userStore.currentUser.nickname }}</h2>
            <el-tag v-if="userStore.isBlogger" type="warning" size="large" effect="dark">
              手作博主
            </el-tag>
            <el-tag v-else type="info" size="large">
              普通用户
            </el-tag>
          </div>
          <p class="user-account">账号：{{ userStore.currentUser.username }}</p>
          <div v-if="userStore.isBlogger" class="blogger-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userStore.currentUser.followers }}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStore.currentUser.works }}</span>
              <span class="stat-label">作品</span>
            </div>
          </div>
        </div>
        <el-button type="danger" plain @click="logout">
          <el-icon :size="16"><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
      
      <div class="profile-content">
        <div class="profile-menu">
          <div class="menu-section-title">个人中心</div>
          <div 
            v-for="item in menuItems" 
            :key="item.path"
            class="menu-item"
            :class="{ active: activeMenu === item.path }"
            @click="goTo(item.path)"
          >
            <el-icon :size="18" class="menu-icon">{{ item.iconComponent }}</el-icon>
            <span class="menu-text">{{ item.name }}</span>
            <el-badge 
              v-if="item.count > 0" 
              :value="item.count" 
              class="menu-badge" 
              :type="item.badgeType"
            />
          </div>
        </div>
        
        <div class="profile-main">
          <div class="stats-cards">
            <div class="stat-card">
              <div class="stat-icon orders">
                <el-icon :size="28"><ShoppingBag /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ orderStats.all }}</div>
                <div class="stat-label">全部订单</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon pending">
                <el-icon :size="28"><Clock /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ orderStats.pending }}</div>
                <div class="stat-label">待发货</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon shipped">
                <el-icon :size="28"><Van /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ orderStats.shipped }}</div>
                <div class="stat-label">已发货</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon favorites">
                <el-icon :size="28"><Star /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ favoriteCount }}</div>
                <div class="stat-label">我的收藏</div>
              </div>
            </div>
          </div>
          
          <h3 class="section-title">
            <el-icon :size="18"><User /></el-icon>
            个人信息
          </h3>
          <el-card class="info-card" shadow="hover">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户名">
                {{ userStore.currentUser.username }}
              </el-descriptions-item>
              <el-descriptions-item label="昵称">
                {{ userStore.currentUser.nickname }}
              </el-descriptions-item>
              <el-descriptions-item label="用户角色">
                <el-tag :type="userStore.isBlogger ? 'warning' : 'info'">
                  {{ userStore.isBlogger ? '手作博主' : '普通用户' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                2023-06-15
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
          
          <h3 class="section-title" style="margin-top: 30px;">
            <el-icon :size="18"><Lock /></el-icon>
            账户安全
          </h3>
          <el-card class="security-card" shadow="hover">
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
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
                  placeholder="请输入新密码（6-20位）"
                  @input="checkPasswordStrength"
                />
                <div v-if="passwordForm.newPassword" class="password-strength">
                  <div class="strength-bars">
                    <div 
                      v-for="i in 4" 
                      :key="i" 
                      class="strength-bar"
                      :class="[getStrengthClass(i), { active: i <= passwordStrength }]"
                    ></div>
                  </div>
                  <span class="strength-text">{{ strengthText }}</span>
                </div>
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
                <el-button type="primary" @click="changePassword">
                  <el-icon :size="16"><Check /></el-icon>
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { useFavoriteStore } from '@/stores/favorite'
import { ShoppingBag, Star, User, SwitchButton, Lock, Check, Clock, Van } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const orderStore = useOrderStore()
const favoriteStore = useFavoriteStore()

const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordStrength = ref(0)

const orderStats = computed(() => orderStore.getStatusStats())
const favoriteCount = computed(() => favoriteStore.favoriteCount)

const activeMenu = ref('/profile')

const menuItems = computed(() => [
  { 
    name: '个人中心', 
    path: '/profile', 
    iconComponent: User, 
    count: 0 
  },
  { 
    name: '我的订单', 
    path: '/orders', 
    iconComponent: ShoppingBag, 
    count: orderStats.value.pending + orderStats.value.shipped,
    badgeType: 'warning'
  },
  { 
    name: '我的收藏', 
    path: '/favorites', 
    iconComponent: Star, 
    count: favoriteCount.value,
    badgeType: 'danger'
  }
])

const strengthText = computed(() => {
  const texts = ['极弱', '弱', '一般', '强', '非常强']
  return texts[passwordStrength.value]
})

const getStrengthClass = (index) => {
  const classes = ['', 'weak', 'normal', 'strong', 'very-strong']
  return classes[passwordStrength.value]
}

const checkPasswordStrength = () => {
  const pwd = passwordForm.newPassword
  let strength = 0
  
  if (!pwd) {
    passwordStrength.value = 0
    return
  }
  
  if (pwd.length >= 6) strength++
  if (pwd.length >= 10) strength++
  if (/[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[^A-Za-z0-9]/.test(pwd)) strength++
  
  passwordStrength.value = Math.min(strength, 4)
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const goTo = (path) => {
  router.push(path)
}

const logout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定退出',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  }).catch(() => {})
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordStrength.value = 0
  } catch (error) {}
}

onMounted(() => {
  activeMenu.value = route.path
  orderStore.loadOrders()
  favoriteStore.loadFavorites()
})
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 30px 0 60px;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 24px;
  color: #fff;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  
  .user-info {
    flex: 1;
    
    .user-name-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      
      .user-name {
        font-size: 24px;
        margin: 0;
      }
    }
    
    .user-account {
      opacity: 0.85;
      margin-bottom: 12px;
    }
    
    .blogger-stats {
      display: flex;
      gap: 40px;
      
      .stat-item {
        text-align: center;
        
        .stat-value {
          display: block;
          font-size: 20px;
          font-weight: 600;
        }
        
        .stat-label {
          font-size: 12px;
          opacity: 0.85;
        }
      }
    }
  }
}

.profile-content {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.profile-menu {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  height: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .menu-section-title {
    padding: 12px 16px;
    font-size: 12px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    color: #666;
    margin-bottom: 4px;
    
    &:hover {
      background: #f5f7fa;
    }
    
    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      
      .menu-icon {
        color: #fff;
      }
    }
    
    .menu-text {
      flex: 1;
    }
    
    .menu-badge {
      :deep(.el-badge__content) {
        transform: scale(0.85);
      }
    }
  }
}

.profile-main {
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 30px;
    
    @media (max-width: 900px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }
      
      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        
        &.orders {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        &.pending {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        
        &.shipped {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        
        &.favorites {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
      }
      
      .stat-content {
        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          line-height: 1.2;
        }
        
        .stat-label {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
  }
  
  .info-card,
  .security-card {
    border-radius: 12px;
    margin-bottom: 20px;
  }
  
  .password-strength {
    margin-top: 8px;
    
    .strength-bars {
      display: flex;
      gap: 4px;
      margin-bottom: 4px;
      
      .strength-bar {
        flex: 1;
        height: 4px;
        background: #f0f0f0;
        border-radius: 2px;
        transition: all 0.3s;
        
        &.active {
          &.weak {
            background: #f56c6c;
          }
          
          &.normal {
            background: #e6a23c;
          }
          
          &.strong {
            background: #67c23a;
          }
          
          &.very-strong {
            background: #409eff;
          }
        }
      }
    }
    
    .strength-text {
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
