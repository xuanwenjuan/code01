<template>
  <div class="profile-page container">
    <h1 class="page-title">个人中心</h1>
    
    <div class="profile-content">
      <div class="profile-sidebar">
        <div class="user-card card">
          <div class="avatar-section">
            <el-avatar :size="80" :icon="UserFilled" />
            <h3 class="user-name">{{ userStore.userInfo?.nickname }}</h3>
            <el-tag :type="userStore.isMerchant ? 'success' : 'primary'" size="small">
              {{ userStore.isMerchant ? '商家用户' : '普通用户' }}
            </el-tag>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userStore.favorites.length }}</span>
              <span class="stat-label">收藏</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStore.getUserOrders().length }}</span>
              <span class="stat-label">订单</span>
            </div>
          </div>
        </div>
        
        <el-menu 
          :default-active="activeMenu" 
          class="profile-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="info">
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </el-menu-item>
          <el-menu-item index="orders">
            <el-icon><List /></el-icon>
            <span>我的订单</span>
          </el-menu-item>
          <el-menu-item index="favorites">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isMerchant" index="merchant">
            <el-icon><Shop /></el-icon>
            <span>商家中心</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="profile-main">
        <div class="card">
          <h2 class="section-title">个人信息</h2>
          <el-form 
            ref="profileFormRef"
            :model="profileForm" 
            :rules="profileRules" 
            label-width="100px"
            class="profile-form"
          >
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
            <el-form-item label="收货地址">
              <el-input 
                v-model="profileForm.address" 
                type="textarea" 
                :rows="2"
                placeholder="请输入收货地址"
              />
            </el-form-item>
            <el-form-item v-if="userStore.isMerchant" label="店铺名称">
              <el-input v-model="profileForm.shopName" disabled />
            </el-form-item>
            <el-form-item v-if="userStore.isMerchant" label="店铺简介">
              <el-input 
                v-model="profileForm.shopDescription" 
                type="textarea" 
                :rows="2"
                disabled
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave" :loading="saving">
                保存修改
              </el-button>
              <el-button @click="passwordDialogVisible = true">
                <el-icon><Lock /></el-icon>
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    
    <el-dialog 
      v-model="passwordDialogVisible" 
      title="修改密码" 
      width="480px"
      @close="resetPasswordForm"
    >
      <el-form 
        ref="passwordFormRef"
        :model="passwordForm" 
        :rules="passwordRules" 
        label-width="100px"
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
            placeholder="请输入新密码（至少6位，包含字母和数字）" 
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
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="saving">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { UserFilled, User, List, Star, Shop, Lock } from '@element-plus/icons-vue'
import { validateRules } from '@/utils/validation'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('info')
const profileFormRef = ref(null)
const saving = ref(false)
const passwordDialogVisible = ref(false)
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

const profileRules = {
  nickname: validateRules.nickname,
  email: validateRules.email,
  phone: validateRules.phone
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: validateRules.password,
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleMenuSelect = (index) => {
  switch (index) {
    case 'orders':
      router.push('/orders')
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'merchant':
      router.push('/merchant')
      break
  }
}

const handleSave = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    saving.value = true
    try {
      const { shopName, shopDescription, ...userData } = profileForm
      userStore.updateUserInfo(userData)
      ElMessage.success('保存成功')
    } catch (error) {
      ElMessage.error('保存失败')
    } finally {
      saving.value = false
    }
  })
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.resetFields()
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    if (passwordForm.oldPassword !== userStore.userInfo.password) {
      ElMessage.error('原密码错误')
      return
    }
    
    saving.value = true
    try {
      userStore.updatePassword(passwordForm.newPassword)
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
      resetPasswordForm()
    } catch (error) {
      ElMessage.error('密码修改失败')
    } finally {
      saving.value = false
    }
  })
}

onMounted(() => {
  if (userStore.userInfo) {
    Object.assign(profileForm, userStore.userInfo)
  }
})
</script>

<style lang="scss" scoped>
.profile-page {
  padding-top: 20px;
}

.profile-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.profile-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.user-card {
  margin-bottom: 20px;
  text-align: center;
}

.avatar-section {
  padding: 20px 0;
  border-bottom: 1px solid #f0ebe0;
  margin-bottom: 16px;
  
  .user-name {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 12px 0 8px;
  }
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #8b6914;
  }
  
  .stat-label {
    font-size: 13px;
    color: #888;
  }
}

.profile-menu {
  border-right: none;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(93, 78, 55, 0.08);
}

.profile-main {
  flex: 1;
  min-width: 0;
}

.profile-form {
  max-width: 600px;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
  }
}
</style>
