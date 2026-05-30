<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="logo" @click="goHome">
          <el-icon size="48" color="#409eff"><Compass /></el-icon>
          <h1>户外装备选购平台</h1>
        </div>
        <p class="slogan">探索自然，装备先行</p>
      </div>
      
      <div class="login-right">
        <h2 class="form-title">欢迎登录</h2>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
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
        
        <div class="form-footer">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
        
        <div class="quick-login">
          <p>快速体验：</p>
          <div class="quick-btns">
            <el-button size="small" @click="quickLogin('user', '123456')">普通用户</el-button>
            <el-button size="small" type="success" @click="quickLogin('merchant', '123456')">商家用户</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { validateUsername, validatePassword } from '@/utils/validate'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }]
}

const goHome = () => router.push('/')

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    await userStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    ElMessage.error(err.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const quickLogin = async (username, password) => {
  loading.value = true
  try {
    await userStore.login(username, password)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    ElMessage.error(err.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 900px;
  width: 100%;
}

.login-left {
  padding: 60px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  .logo {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    cursor: pointer;
    
    h1 {
      font-size: 28px;
      font-weight: 700;
    }
  }
  
  .slogan {
    font-size: 20px;
    opacity: 0.9;
  }
}

.login-right {
  padding: 60px 50px;
  
  .form-title {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 32px;
  }
  
  .login-form {
    margin-bottom: 24px;
  }
  
  .login-btn {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    
    &:hover {
      opacity: 0.9;
    }
  }
  
  .form-footer {
    text-align: center;
    color: #909399;
    
    a {
      color: #667eea;
      margin-left: 4px;
    }
  }
  
  .quick-login {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
    
    p {
      color: #909399;
      margin-bottom: 12px;
    }
    
    .quick-btns {
      display: flex;
      gap: 12px;
    }
  }
}
</style>
