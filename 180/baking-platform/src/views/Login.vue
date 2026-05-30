<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9!@#$%^&*]+$/, message: '密码只能包含字母、数字和特殊字符', trigger: 'blur' }
  ]
}

async function handleLogin(formEl) {
  if (!formEl) return
  try {
    await formEl.validate()
    loading.value = true
    await userStore.login(loginForm.username, loginForm.password)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    if (err.message) {
      ElMessage.error(err.message)
    }
  } finally {
    loading.value = false
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="login-banner">
          <el-icon :size="80" color="#fff"><Goods /></el-icon>
          <h1>烘焙原料商城</h1>
          <p>精选优质原料，烘焙美好时光</p>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form-wrapper">
          <h2 class="login-title">欢迎登录</h2>
          <p class="login-subtitle">请输入您的账号信息</p>
          
          <el-form 
            ref="loginFormRef"
            :model="loginForm" 
            :rules="rules" 
            size="large"
            @submit.prevent="handleLogin(loginFormRef)"
          >
            <el-form-item prop="username">
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入用户名"
                prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin(loginFormRef)"
              />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="loading"
                class="login-btn"
                @click="handleLogin(loginFormRef)"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>

          <div class="login-tips">
            <p>测试账号：</p>
            <p>普通用户：user123 / 123456</p>
            <p>烘焙商家：merchant123 / 123456</p>
          </div>

          <div class="login-footer">
            <span>还没有账号？</span>
            <el-button text @click="goToRegister">立即注册</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
  padding: 40px 20px;
}

.login-container {
  width: 900px;
  height: 560px;
  display: flex;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
  width: 400px;
  background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-banner {
  text-align: center;
  color: #fff;
}

.login-banner h1 {
  font-size: 32px;
  margin: 20px 0 12px 0;
}

.login-banner p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 360px;
}

.login-title {
  font-size: 28px;
  color: #303133;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0 0 32px 0;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.login-tips {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.8;
}

.login-tips p {
  margin: 0;
}

.login-footer {
  text-align: center;
  font-size: 14px;
  color: #606266;
}
</style>
