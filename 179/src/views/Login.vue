<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card vintage-border">
        <div class="login-header">
          <h2>欢迎回来</h2>
          <p>登录您的古韵饰品账号</p>
        </div>
        
        <el-form 
          ref="loginFormRef"
          :model="loginForm" 
          :rules="loginRules" 
          class="login-form"
          @submit.prevent="handleLogin"
        >
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
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
              <span class="forgot-password">忘记密码？</span>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              class="login-btn"
              :loading="userStore.loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="login-footer">
          <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
        </div>
        
        <div class="demo-accounts">
          <p class="demo-title">演示账号：</p>
          <p>普通用户：user123 / 123456</p>
          <p>商家账号：merchant123 / 123456</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { validators, createValidator } from '@/utils/validators'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginRules = {
  username: [
    { 
      validator: createValidator({
        ...validators.username,
        requiredMessage: '请输入用户名'
      }),
      trigger: 'blur'
    }
  ],
  password: [
    { 
      validator: createValidator({
        ...validators.simplePassword,
        requiredMessage: '请输入密码'
      }),
      trigger: 'blur'
    }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    await userStore.login(loginForm.username, loginForm.password)
    ElMessage.success('登录成功')
    
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f0e1 0%, #e8dcc4 100%);
  padding: 40px 20px;
}

.login-container {
  width: 100%;
  max-width: 440px;
}

.login-card {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  
  h2 {
    font-size: 28px;
    font-weight: 700;
    color: #2c1810;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: #999;
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
  
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    padding: 8px 16px;
  }
  
  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #d4af37;
  }
  
  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #d4af37;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 14px;
}

.forgot-password {
  color: #d4af37;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #d4af37, #b8960c);
  border: none;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  padding: 14px;
  
  &:hover {
    background: linear-gradient(135deg, #e5c158, #c9a71d);
  }
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
  
  a {
    color: #d4af37;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.demo-accounts {
  margin-top: 32px;
  padding: 16px;
  background: #faf8f5;
  border-radius: 8px;
  font-size: 12px;
  color: #999;
  
  .demo-title {
    font-weight: 500;
    color: #666;
    margin-bottom: 8px;
  }
  
  p {
    margin-bottom: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
