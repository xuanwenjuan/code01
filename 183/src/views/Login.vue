<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="logo-section">
          <el-icon :size="56" color="#8b6914"><Camera /></el-icon>
          <h1 class="logo-text">复古胶片相机</h1>
          <p class="logo-subtitle">探索经典，记录美好</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><Star /></el-icon>
            <span>精选复古相机</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><ShieldCheck /></el-icon>
            <span>品质保证</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Service /></el-icon>
            <span>专业售后</span>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <h2 class="login-title">欢迎回来</h2>
        <p class="login-subtitle">请登录您的账户</p>
        
        <el-form 
          ref="loginFormRef"
          :model="loginForm" 
          :rules="loginRules" 
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="用户名" 
              size="large"
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="密码" 
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-button 
            type="primary" 
            size="large" 
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form>
        
        <div class="login-footer">
          <p>
            还没有账户？
            <router-link to="/register" class="register-link">立即注册</router-link>
          </p>
        </div>
        
        <div class="demo-accounts">
          <p class="demo-title">测试账户：</p>
          <p>普通用户：user123 / 123456</p>
          <p>商家账户：merchant1 / 123456</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { Camera, Star, ShieldCheck, Service, User, Lock } from '@element-plus/icons-vue'
import { validateRules } from '@/utils/validation'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: validateRules.username,
  password: validateRules.password
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      await userStore.login(loginForm.username, loginForm.password)
      ElMessage.success('登录成功')
      
      const redirect = route.query.redirect || '/'
      router.replace(redirect)
    } catch (error) {
      ElMessage.error(error.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: calc(100vh - 70px - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5e6c8 0%, #e8dcc0 100%);
}

.login-container {
  display: flex;
  max-width: 900px;
  width: 100%;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(93, 78, 55, 0.15);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #5d4e37 0%, #2c2416 100%);
  padding: 60px 40px;
  color: #f5e6c8;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-text {
  font-size: 28px;
  font-weight: bold;
  margin: 16px 0 8px;
  font-family: 'Georgia', serif;
}

.logo-subtitle {
  font-size: 14px;
  color: #c4b088;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  
  .el-icon {
    color: #8b6914;
  }
}

.login-right {
  flex: 1;
  padding: 60px 50px;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #888;
  margin-bottom: 32px;
}

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  background: #8b6914;
  border-color: #8b6914;
  
  &:hover {
    background: #a67c00;
    border-color: #a67c00;
  }
}

.login-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-link {
  color: #8b6914;
  font-weight: 600;
  
  &:hover {
    color: #a67c00;
  }
}

.demo-accounts {
  margin-top: 30px;
  padding: 16px;
  background: #f5f1e8;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  
  .demo-title {
    font-weight: 600;
    color: #5d4e37;
    margin-bottom: 8px;
  }
  
  p {
    margin: 4px 0;
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    padding: 40px 30px;
  }
  
  .login-right {
    padding: 40px 30px;
  }
}
</style>
