<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <div class="login-container">
      <div class="login-box">
      <div class="login-header">
        <h1>🌿 园林资材采购平台</h1>
        <p>专注园林园艺资材一站式采购</p>
      </div>
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="账号登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-width="80px"
          >
            <el-form-item label="账号" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                prefix-icon="User"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
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
            <el-form-item>
              <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              style="width: 100%;"
            >
              登录
            </el-button>
            </el-form-item>
          </el-form>
          <div class="login-tips">
            <p>采购商测试账号：buyer123 / 123456</p>
            <p>供货商测试账号：supplier123 / 123456</p>
          </div>
        </el-tab-pane>
        <el-tab-pane label="注册账号" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-width="100px"
          >
            <el-form-item label="用户类型" prop="role">
              <el-radio-group v-model="registerForm.role">
                <el-radio value="buyer">园林采购商</el-radio>
                <el-radio value="supplier">园艺资材供货商</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                size="large"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              />
              <div v-if="registerForm.password" class="password-strength">
                <div class="strength-bar">
                  <div 
                    v-for="i in 5" 
                    :key="i" 
                    class="strength-item"
                    :class="{ active: i <= passwordStrength.level }"
                    :style="{ background: i <= passwordStrength.level ? passwordStrength.color : '#ebeef5' }"
                  ></div>
                </div>
                <span class="strength-text" :style="{ color: passwordStrength.color }">
                  密码强度：{{ passwordStrength.text }}
                </span>
              </div>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              show-password
              />
            </el-form-item>
            <el-form-item label="真实姓名" prop="name">
              <el-input
                v-model="registerForm.name"
                placeholder="请输入真实姓名"
                size="large"
              />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入手机号码"
                size="large"
              />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱地址"
                size="large"
              />
            </el-form-item>
            <el-form-item label="公司名称" prop="company">
              <el-input
                v-model="registerForm.company"
                placeholder="请输入公司名称"
                size="large"
              />
            </el-form-item>
            <el-form-item>
              <el-button
              type="primary"
              size="large"
              :loading="registerLoading"
              @click="handleRegister"
              style="width: 100%;"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import {
  validateUsername,
  validatePassword,
  validatePhone,
  validateEmail,
  validateName,
  validateRequired
} from '@/utils/validator'

const userStore = useUserStore()
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

const activeTab = ref('login')
const loading = ref(false)
const registerLoading = ref(false)
const loginFormRef = ref()
const registerFormRef = ref()

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  role: 'buyer',
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  email: '',
  company: '',
  address: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
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
  role: [{ validator: validateRequired('请选择用户类型'), trigger: 'change' }],
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  name: [{ validator: validateName, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  company: [{ validator: validateRequired('请输入公司名称'), trigger: 'blur' }]
}

const passwordStrength = computed(() => {
  const pwd = registerForm.password
  if (!pwd) return { level: 0, text: '', color: '' }
  let score = 0
  if (pwd.length >= 6) score++
  if (pwd.length >= 10) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[!@#$%^&*]/.test(pwd)) score++
  
  const levels = [
    { level: 1, text: '弱', color: '#f56c6c' },
    { level: 2, text: '较弱', color: '#e6a23c' },
    { level: 3, text: '中', color: '#67c23a' },
    { level: 4, text: '较强', color: '#409eff' },
    { level: 5, text: '强', color: '#909399' }
  ]
  return levels[Math.min(score, 4)]
})

onMounted(() => {
  if (route.query.tab === 'register') {
    activeTab.value = 'register'
  }
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await userStore.login(loginForm)
        if (res.code === 200) {
          ElMessage.success('登录成功')
          const redirect = route.query.redirect || '/'
          router.push(redirect)
        } else {
          ElMessage.error(res.message)
        }
      } finally {
        loading.value = false
      }
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      registerLoading.value = true
      try {
        const res = await userStore.register(registerForm)
        if (res.code === 200) {
          ElMessage.success('注册成功，请登录')
          activeTab.value = 'login'
          loginForm.username = registerForm.username
          loginForm.password = registerForm.password
        } else {
          ElMessage.error(res.message)
        }
      } finally {
        registerLoading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;

  .login-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #67c23a 0%, #409eff 100%);
    opacity: 0.9;
  }

  .login-container {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-box {
    width: 500px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    padding: 40px;

    .login-header {
      text-align: center;
      margin-bottom: 30px;

      h1 {
        font-size: 28px;
        color: #67c23a;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #67c23a, #409eff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      p {
        color: #909399;
        font-size: 14px;
      }
    }

    .login-tabs {
      :deep(.el-tabs__nav-wrap::after) {
        display: none;
      }

      :deep(.el-tabs__header) {
        margin-bottom: 30px;
      }
    }

    .login-tips {
      margin-top: 20px;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 6px;
      font-size: 12px;
      color: #909399;

      p {
        margin: 5px 0;
      }
    }

    .password-strength {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 10px;

      .strength-bar {
        display: flex;
        gap: 3px;

        .strength-item {
          width: 30px;
          height: 6px;
          border-radius: 3px;
          background: #ebeef5;
          transition: all 0.3s;
        }
      }

      .strength-text {
        font-size: 12px;
        font-weight: 500;
      }
    }
  }
}
</style>
