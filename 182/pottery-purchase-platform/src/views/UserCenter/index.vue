<template>
  <div class="user-center container">
    <div class="user-layout">
      <div class="user-sidebar">
        <div class="user-info-card">
          <el-avatar :size="80" :src="userStore.userInfo?.avatar">
            {{ userStore.userInfo?.nickname?.charAt(0) }}
          </el-avatar>
          <h3 class="username">{{ userStore.userInfo?.nickname }}</h3>
          <el-tag v-if="userStore.userInfo?.level" type="warning" size="small">
            {{ userStore.userInfo?.level }}
          </el-tag>
          <el-tag v-else type="success" size="small">
            {{ userStore.userInfo?.role === 'supplier' ? '供应商' : '普通用户' }}
          </el-tag>
        </div>
        <el-menu
          :default-active="activeMenu" class="user-menu" @select="handleMenuSelect">
          <el-menu-item index="profile">
            <template #title>
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </template>
          </el-menu-item>
          <el-menu-item index="orders">
            <template #title>
              <el-icon><ShoppingBag /></el-icon>
              <span>我的订单</span>
            </template>
          </el-menu-item>
          <el-menu-item index="favorites">
            <template #title>
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </template>
          </el-menu-item>
          <el-menu-item index="settings">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>账号设置</span>
            </template>
          </el-menu-item>
          <el-menu-item index="logout" @click="handleLogout">
            <template #title>
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </template>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="user-content">
        <div v-if="activeMenu === 'profile'" class="content-section">
          <h2 class="section-title">个人信息</h2>
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="profileForm.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profileForm.phone" placeholder="请输入手机号" maxlength="11" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="收货地址" prop="address">
              <el-input
                v-model="profileForm.address"
                type="textarea"
                :rows="3"
                placeholder="请输入收货地址"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveProfile">保存修改</el-button>
              <el-button @click="resetProfile">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-if="activeMenu === 'settings'" class="content-section">
          <h2 class="section-title">账号设置</h2>
          <el-card class="settings-card">
            <h3>修改密码</h3>
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
              style="max-width: 400px;"
            >
              <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码（至少6位）" />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="changingPwd" @click="changePassword">确认修改</el-button>
                <el-button @click="resetPassword">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const activeMenu = ref('profile')
const saving = ref(false)
const changingPwd = ref(false)

const profileFormRef = ref()
const profileForm = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  address: ''
})

const passwordFormRef = ref()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

const validateNickname = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入昵称'))
  } else if (value.length < 2 || value.length > 20) {
    callback(new Error('昵称长度为2-20个字符'))
  } else {
    callback()
  }
}

const validateNewPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const profileRules = {
  nickname: [{ validator: validateNickname, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  address: [{ required: true, message: '请输入收货地址', trigger: 'blur' }]
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [{ validator: validateNewPassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

onMounted(() => {
  if (userStore.userInfo) {
    profileForm.username = userStore.userInfo.username
    profileForm.nickname = userStore.userInfo.nickname
    profileForm.phone = userStore.userInfo.phone
    profileForm.email = userStore.userInfo.email
    profileForm.address = userStore.userInfo.address || ''
  }
})

const handleMenuSelect = (index) => {
  if (index === 'orders') {
    router.push('/user/orders')
  } else if (index === 'favorites') {
    router.push('/user/favorites')
  } else {
    activeMenu.value = index
  }
}

const saveProfile = async () => {
  try {
    await profileFormRef.value.validate()
    saving.value = true
    userStore.updateUserInfo({
      nickname: profileForm.nickname,
      phone: profileForm.phone,
      email: profileForm.email,
      address: profileForm.address
    })
    ElMessage.success('保存成功')
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    saving.value = false
  }
}

const resetProfile = () => {
  if (userStore.userInfo) {
    profileForm.nickname = userStore.userInfo.nickname
    profileForm.phone = userStore.userInfo.phone
    profileForm.email = userStore.userInfo.email
    profileForm.address = userStore.userInfo.address || ''
  }
  profileFormRef.value?.clearValidate()
}

const changePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    changingPwd.value = true
    ElMessage.success('密码修改成功')
    resetPassword()
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    changingPwd.value = false
  }
}

const resetPassword = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.user-center {
  padding-top: 20px;
}

.user-layout {
  display: flex;
  gap: 24px;
}

.user-sidebar {
  width: 220px;
  flex-shrink: 0;
}

.user-info-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  margin-bottom: 16px;
}

.user-info-card .el-avatar {
  margin-bottom: 12px;
}

.username {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.user-menu {
  border-right: none;
}

.user-content {
  flex: 1;
  min-width: 0;
}

.content-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-height: 600px;
}

.profile-form {
  max-width: 500px;
}

.settings-card {
  max-width: 600px;
}

.settings-card h3 {
  margin-bottom: 20px;
  font-size: 18px;
}
</style>
