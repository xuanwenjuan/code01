<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
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

      <div class="login-right">
        <h2 class="form-title">登录</h2>
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
          <el-form-item prop="phone">
            <el-input v-model="loginForm.phone" placeholder="请输入手机号" size="large">
              <template #prefix><el-icon><Phone /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" show-password>
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleLogin">
              登录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="form-footer">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
        <div class="tips">
          <p>提示：任意手机号和6位以上密码即可登录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { mockApi } from '@/utils/mockApi'
import { validatePhone, validatePassword } from '@/utils/validate'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const loginFormRef = ref(null)

const loginForm = reactive({
  phone: '',
  password: ''
})

const loginRules = {
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
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const res = await mockApi.login(loginForm.phone, loginForm.password)
      loading.value = false

      if (res.code === 200) {
        userStore.login(res.data.user, res.data.token)
        ElMessage.success('登录成功')
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } else {
        ElMessage.error(res.message)
      }
    }
  })
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
  display: flex;
  width: 900px;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
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

.login-right {
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

  .login-form {
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

  .tips {
    margin-top: 20px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;
    text-align: center;

    p {
      margin: 0;
      font-size: 13px;
      color: #909399;
    }
  }
}
</style>
