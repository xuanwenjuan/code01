<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <span class="logo">🌸</span>
          <h1>花语轩</h1>
          <p>专业的鲜花花艺礼品订购平台</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><Van /></el-icon>
            <span>同城2小时送达</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Present /></el-icon>
            <span>精美包装</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Medal /></el-icon>
            <span>品质保证</span>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <h2 class="form-title">欢迎回来</h2>
        <p class="form-subtitle">登录您的账户，开始购物</p>
        
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="form-footer">
          <span>还没有账户？</span>
          <router-link to="/register" class="register-link">立即注册</router-link>
        </div>
        
        <div class="test-accounts">
          <p class="test-title">测试账号：</p>
          <p>admin / 123456</p>
          <p>user / 123456</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Van, Present, Medal } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const loginFormRef = ref(null)

const loginForm = ref({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate()
  
  try {
    loading.value = true
    await userStore.loginAction(loginForm.value.username, loginForm.value.password)
    ElMessage.success('登录成功')
    
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 900px;
  width: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-left {
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  padding: 60px 40px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  .brand {
    text-align: center;
    margin-bottom: 60px;
    
    .logo {
      font-size: 64px;
      display: block;
      margin-bottom: 16px;
    }
    
    h1 {
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    p {
      font-size: 14px;
      opacity: 0.9;
    }
  }
  
  .features {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      
      el-icon {
        background: rgba(255, 255, 255, 0.2);
        padding: 8px;
        border-radius: 50%;
      }
    }
  }
}

.login-right {
  padding: 60px 50px;
  
  .form-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
    color: $text-primary;
  }
  
  .form-subtitle {
    font-size: 14px;
    color: $text-secondary;
    margin-bottom: 40px;
  }
  
  .login-form {
    .el-form-item {
      margin-bottom: 24px;
    }
    
    .login-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      background: linear-gradient(135deg, $primary-color, $primary-dark);
      border: none;
      
      &:hover {
        opacity: 0.9;
      }
    }
  }
  
  .form-footer {
    text-align: center;
    font-size: 14px;
    color: $text-secondary;
    
    .register-link {
      color: $primary-color;
      margin-left: 4px;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .test-accounts {
    margin-top: 30px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;
    font-size: 13px;
    color: $text-secondary;
    
    .test-title {
      font-weight: 500;
      color: $text-primary;
      margin-bottom: 8px;
    }
    
    p {
      margin-bottom: 4px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
  }
  
  .login-left {
    display: none;
  }
  
  .login-right {
    padding: 40px 30px;
  }
}
</style>
