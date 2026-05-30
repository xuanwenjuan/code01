<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-layout">
        <div class="sidebar">
          <div class="user-card">
            <el-avatar :size="80" :src="userStore.userInfo?.avatar" />
            <h3 class="username">{{ userStore.userInfo?.nickname }}</h3>
            <p class="user-role">
              <el-tag :type="userStore.isMerchant ? 'success' : 'primary'">
                {{ userStore.isMerchant ? '商家用户' : '普通用户' }}
              </el-tag>
            </p>
          </div>
          
          <el-menu
            :default-active="activeMenu"
            class="side-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="profile">
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
            <el-menu-item index="password">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </el-menu-item>
            <el-menu-item v-if="userStore.isMerchant" index="merchant">
              <el-icon><Shop /></el-icon>
              <span>商家中心</span>
            </el-menu-item>
          </el-menu>
        </div>
        
        <div class="content">
          <div v-show="activeMenu === 'profile'" class="tab-content">
            <h3 class="content-title">个人信息</h3>
            <el-form
              ref="profileForm"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
            >
              <el-form-item label="用户名">
                <span>{{ userStore.userInfo?.username }}</span>
              </el-form-item>
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="profileForm.nickname" />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="profileForm.phone" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" />
              </el-form-item>
              <el-form-item label="注册时间">
                <span>{{ formatDate(userStore.userInfo?.createdAt) }}</span>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateProfile">保存修改</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div v-show="activeMenu === 'password'" class="tab-content">
            <h3 class="content-title">修改密码</h3>
            <el-form
              ref="passwordForm"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
            >
              <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updatePassword">确认修改</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { validateNickname, validatePhone, validateEmail, validatePassword, formatDate } from '@/utils/validate'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('profile')
const profileForm = reactive({
  nickname: '',
  phone: '',
  email: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileRules = {
  nickname: [{ validator: validateNickname, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }]
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

onMounted(() => {
  if (userStore.userInfo) {
    profileForm.nickname = userStore.userInfo.nickname
    profileForm.phone = userStore.userInfo.phone
    profileForm.email = userStore.userInfo.email
  }
})

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'orders') {
    router.push('/orders')
  } else if (index === 'favorites') {
    router.push('/favorites')
  } else if (index === 'merchant') {
    router.push('/merchant')
  }
}

const updateProfile = async () => {
  if (!profileForm.value) return
  
  try {
    await profileForm.value.validate()
    await userStore.updateProfile(profileForm)
    ElMessage.success('修改成功')
  } catch (err) {
    if (err.message) {
      ElMessage.error(err.message || '修改失败')
    }
  }
}

const updatePassword = async () => {
  if (!passwordForm.value) return
  
  try {
    await passwordForm.value.validate()
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    if (err.message) {
      ElMessage.error(err.message || '修改失败')
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 40px 0;
}

.profile-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
}

.sidebar {
  .user-card {
    background: #fff;
    border-radius: 12px;
    padding: 32px 24px;
    text-align: center;
    margin-bottom: 16px;
    
    .username {
      margin: 16px 0 8px;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
  }
  
  .side-menu {
    background: #fff;
    border-radius: 12px;
    border: none;
  }
}

.content {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  min-height: 500px;
  
  .content-title {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 24px;
  }
}
</style>
