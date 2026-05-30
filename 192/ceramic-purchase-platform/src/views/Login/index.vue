<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">🏺</span>
            <span class="logo-text">瓷源购</span>
          </div>
          <p class="welcome-text">欢迎登录陶瓷艺术原料采购平台</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item label="用户类型" prop="role">
            <el-radio-group v-model="loginForm.role" size="large" style="width: 100%">
              <el-radio-button value="buyer" style="width: 50%; text-align: center;">
                <el-icon><ShoppingBag /></el-icon> 采购方
              </el-radio-button>
              <el-radio-button value="supplier" style="width: 50%; text-align: center;">
                <el-icon><OfficeBuilding /></el-icon> 供货商
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

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

          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>

          <div class="form-footer">
            <span>还没有账号？</span>
            <router-link to="/register" class="register-link">立即注册</router-link>
          </div>
        </el-form>

        <div class="demo-accounts">
          <el-alert
            title="测试账号"
            type="info"
            :closable="false"
            show-icon
          >
            <div class="account-item">
              <span>采购方：</span>
              <code>buyer001 / 123456</code>
            </div>
            <div class="account-item">
              <span>供货商：</span>
              <code>supplier001 / 123456</code>
            </div>
          </el-alert>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  role: 'buyer'
})

const validateUsername = (rule, value, callback) => {
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!usernameRegex.test(value)) {
    callback(new Error('用户名必须是4-20位字母、数字或下划线'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  const passwordRegex = /^[a-zA-Z0-9_]{6,20}$/
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!passwordRegex.test(value)) {
    callback(new Error('密码必须是6-20位字母、数字或下划线'))
  } else {
    callback()
  }
}

const loginRules: FormRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  role: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    await userStore.login(loginForm.username, loginForm.password, loginForm.role)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 480px;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 48px;
}

.logo-text {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #2c5c97, #4a90d9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text {
  color: #606266;
  font-size: 15px;
}

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}

.register-link {
  color: #409eff;
  margin-left: 4px;
}

.register-link:hover {
  color: #66b1ff;
}

.demo-accounts {
  margin-top: 24px;
}

.account-item {
  font-size: 13px;
  color: #606266;
  margin-top: 4px;
}

.account-item code {
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
  color: #f56c6c;
}
</style>
