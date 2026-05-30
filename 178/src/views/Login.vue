<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="left-content">
          <div class="logo">
            <span class="logo-icon">🌱</span>
            <span class="logo-text">绿植之家</span>
          </div>
          <h1 class="welcome-title">欢迎回来</h1>
          <p class="welcome-desc">开启您的绿植之旅，让生活充满绿意</p>
          <div class="features">
            <div class="feature-item">
              <el-icon size="24" color="#4caf50"><Check /></el-icon>
              <span>海量绿植选择</span>
            </div>
            <div class="feature-item">
              <el-icon size="24" color="#4caf50"><Check /></el-icon>
              <span>专业养护指导</span>
            </div>
            <div class="feature-item">
              <el-icon size="24" color="#4caf50"><Check /></el-icon>
              <span>品质保障服务</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane label="登录" name="login">
            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              class="login-form"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  size="large"
                  prefix-icon="User"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleLogin"
                />
              </el-form-item>
              <el-button
                type="primary"
                size="large"
                class="submit-btn"
                :loading="loading"
                @click="handleLogin"
              >
                登录
              </el-button>
              <div class="demo-accounts">
                <p class="demo-title">演示账号：</p>
                <p>普通用户：user123 / 123456</p>
                <p>商家用户：merchant1 / 123456</p>
              </div>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="注册" name="register">
            <el-form
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
              class="login-form"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="registerForm.username"
                  placeholder="请输入用户名"
                  size="large"
                  prefix-icon="User"
                />
              </el-form-item>
              <el-form-item prop="nickname">
                <el-input
                  v-model="registerForm.nickname"
                  placeholder="请输入昵称"
                  size="large"
                  prefix-icon="Edit"
                />
              </el-form-item>
              <el-form-item prop="phone">
                <el-input
                  v-model="registerForm.phone"
                  placeholder="请输入手机号"
                  size="large"
                  prefix-icon="Phone"
                />
              </el-form-item>
              <el-form-item prop="email">
                <el-input
                  v-model="registerForm.email"
                  placeholder="请输入邮箱"
                  size="large"
                  prefix-icon="Message"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请确认密码"
                  size="large"
                  prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleRegister"
                />
              </el-form-item>
              <el-button
                type="success"
                size="large"
                class="submit-btn"
                :loading="loading"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { validateUsername, validatePassword, validateEmail, validatePhone, validateNickname } from '@/utils/validate'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }]
}

const registerRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  nickname: [{ validator: validateNickname, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        const result = userStore.login(loginForm.username, loginForm.password)
        loading.value = false
        
        if (result.success) {
          ElMessage.success(result.message)
          const redirect = route.query.redirect || '/'
          router.push(redirect)
        } else {
          ElMessage.error(result.message)
        }
      }, 500)
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        const { confirmPassword, ...userInfo } = registerForm
        const result = userStore.register(userInfo)
        loading.value = false
        
        if (result.success) {
          ElMessage.success(result.message)
          router.push('/')
        } else {
          ElMessage.error(result.message)
        }
      }, 500)
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  padding: 40px 20px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 900px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #2d5a27 0%, #4a7c42 100%);
  color: #fff;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.left-content {
  text-align: center;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
}

.logo-icon {
  font-size: 48px;
}

.logo-text {
  font-size: 32px;
  font-weight: bold;
}

.welcome-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 16px 0;
}

.welcome-desc {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 40px 0;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 250px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  text-align: left;
}

.login-right {
  width: 420px;
  padding: 40px;
}

.login-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 30px;
}

.login-form {
  width: 100%;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
  font-size: 16px;
}

.demo-accounts {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7f5;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
}

.demo-title {
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
}

.demo-accounts p {
  margin: 4px 0;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    padding: 40px 30px;
  }
  
  .login-right {
    width: 100%;
    padding: 30px;
  }
}
</style>
