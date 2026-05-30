<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-left">
        <div class="logo">
          <el-icon :size="48" color="#409eff"><House /></el-icon>
          <h1>同城租房</h1>
          <p>为您提供优质的租房买房服务</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><Check /></el-icon>
            <span>真实房源，房东直租</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Check /></el-icon>
            <span>安全保障，交易透明</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Check /></el-icon>
            <span>专业服务，贴心管家</span>
          </div>
        </div>
      </div>

      <div class="register-right">
        <h2 class="form-title">注册</h2>
        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" class="register-form">
          <el-form-item prop="phone">
            <el-input v-model="registerForm.phone" placeholder="请输入手机号" size="large">
              <template #prefix><el-icon><Phone /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code">
            <div class="code-input">
              <el-input v-model="registerForm.code" placeholder="请输入验证码" size="large">
                <template #prefix><el-icon><Key /></el-icon></template>
              </el-input>
              <el-button
                :disabled="countdown > 0"
                size="large"
                @click="sendCode"
                class="code-btn"
              >
                {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" size="large" show-password>
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" size="large" show-password>
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleRegister">
              注册
            </el-button>
          </el-form-item>
        </el-form>
        <div class="form-footer">
          <span>已有账号？</span>
          <router-link to="/login">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { mockApi } from '@/utils/mockApi'
import { validatePhone, validatePassword } from '@/utils/validate'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const countdown = ref(0)
const registerFormRef = ref(null)

const registerForm = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const registerRules = {
  phone: [
    { validator: (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'))
      } else if (!validatePhone(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  password: [
    { validator: (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入密码'))
      } else if (!validatePassword(value)) {
        callback(new Error('密码长度需在6-20位之间'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: (rule, value, callback) => {
      if (!value) {
        callback(new Error('请确认密码'))
      } else if (value !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

const sendCode = async () => {
  if (!validatePhone(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  const res = await mockApi.sendCode(registerForm.phone)
  if (res.code === 200) {
    ElMessage.success(`验证码已发送：${res.data.code}`)
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const res = await mockApi.register(registerForm.phone, registerForm.password, registerForm.code)
      loading.value = false

      if (res.code === 200) {
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } else {
        ElMessage.error(res.message)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-container {
  display: flex;
  width: 900px;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-left {
  width: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  color: #fff;
  display: flex;
  flex-direction: column;

  .logo {
    margin-bottom: 40px;

    h1 {
      font-size: 32px;
      font-weight: 600;
      margin: 16px 0 8px 0;
    }

    p {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
    }
  }

  .features {
    flex: 1;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      font-size: 15px;
    }
  }
}

.register-right {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .form-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 30px 0;
  }

  .register-form {
    .code-input {
      display: flex;
      gap: 10px;

      .code-btn {
        flex-shrink: 0;
        width: 140px;
      }
    }

    .submit-btn {
      width: 100%;
    }
  }

  .form-footer {
    text-align: center;
    color: #909399;
    font-size: 14px;
    margin-top: 20px;

    a {
      color: #409eff;
      margin-left: 4px;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
