<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="bg-overlay"></div>
    </div>

    <div class="login-content">
      <div class="login-left">
        <div class="logo-section">
          <el-icon :size="64" color="#fff"><Camera /></el-icon>
          <h1 class="platform-title">星图采购平台</h1>
          <p class="platform-subtitle">专业的天文观测器材采购平台</p>
        </div>

        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><ShoppingCart /></el-icon>
            <span>专业器材采购</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><StarFilled /></el-icon>
            <span>品质保障</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><User /></el-icon>
            <span>专业服务</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-card">
          <h2 class="login-title">账号登录</h2>

          <el-tabs v-model="activeRole" class="role-tabs">
            <el-tab-pane label="采购方登录" name="buyer">
              <el-icon><OfficeBuilding /></el-icon>
            </el-tab-pane>
            <el-tab-pane label="供货商登录" name="supplier">
              <el-icon><OfficeBuilding /></el-icon>
            </el-tab-pane>
          </el-tabs>

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
                placeholder="请输入账号"
                size="large"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-btn"
                :loading="loading"
                @click="handleLogin"
              >
                登 录
              </el-button>
            </el-form-item>
          </el-form>

          <div class="login-tips">
            <p>测试账号：</p>
            <p>采购方：buyer01 / 123456</p>
            <p>供货商：supplier01 / 123456</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const activeRole = ref('buyer')
const loading = ref(false)
const loginFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入账号'))
  } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) {
    callback(new Error('账号为4-20位字母、数字、下划线'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }]
}

async function handleLogin() {
  if (!loginFormRef.value) {
    await loginFormRef.value.validate()
  }
  
  loading.value = true
  try {
    await userStore.login(loginForm.username, loginForm.password, activeRole.value)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  background: url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop') center/cover no-repeat;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.85) 0%, rgba(103, 194, 58, 0.85) 100%);
}

.login-content {
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 40px;
}

.login-left {
  flex: 1;
  padding: 60px;
  color: #fff;
}

.logo-section {
  margin-bottom: 60px;
}

.platform-title {
  font-size: 42px;
  font-weight: 700;
  margin: 20px 0 12px;
  background: linear-gradient(90deg, #fff 0%, #e0f0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.platform-subtitle {
  font-size: 18px;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 18px;
  opacity: 0.95;
}

.login-right {
  width: 420px;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 24px;
  text-align: center;
}

.role-tabs {
  margin-bottom: 24px;
}

.login-form {
  margin-top: 24px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
  border: none;
}

.login-btn:hover {
  opacity: 0.9;
}

.login-tips {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

.login-tips p:first-child {
  font-weight: 600;
  color: #1f2d3d;
}
</style>
