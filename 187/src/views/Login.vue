<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <el-icon :size="48" color="#409eff"><Reading /></el-icon>
          <h1>线上书店采购平台</h1>
          <p>一站式图书采购解决方案</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24" color="#67c23a"><Select /></el-icon>
            <span>百万图书品类齐全</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#e6a23c"><Money /></el-icon>
            <span>批量采购价格优惠</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#f56c6c"><Van /></el-icon>
            <span>全国配送快速到达</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-card">
          <h2>账号登录</h2>
          <p class="login-tip">请选择您的身份类型登录</p>
          
          <el-radio-group v-model="loginForm.role" class="role-selector">
            <el-radio-button value="buyer">
              <el-icon><User /></el-icon>
              采购商
            </el-radio-button>
            <el-radio-button value="merchant">
              <el-icon><Shop /></el-icon>
              书店商家
            </el-radio-button>
          </el-radio-group>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入账号"
                size="large"
                clearable
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
              :loading="logging"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form>

          <div class="demo-accounts">
            <p>演示账号：</p>
            <p>采购商：buyer / 123456</p>
            <p>商家：merchant / 123456</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { mockUsers } from '@/mock/data'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loginFormRef = ref(ElForm)
const logging = ref(false)

const loginForm = ref({
  role: 'buyer',
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return

  logging.value = true

  await new Promise(resolve => setTimeout(resolve, 800))

  const user = mockUsers.find(
    u => u.username === loginForm.value.username &&
         u.password === loginForm.value.password &&
         u.role === loginForm.value.role
  )

  if (user) {
    userStore.login({
      user: { ...user },
      token: 'mock-token-' + Date.now()
    })

    ElMessage.success('登录成功')

    const redirect = route.query.redirect || (user.role === 'merchant' ? '/merchant' : '/center')
    router.push(redirect)
  } else {
    ElMessage.error('账号或密码错误，请检查账号类型')
  }

  logging.value = false
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 124px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
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
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: #fff;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand {
  text-align: center;
}

.brand h1 {
  font-size: 28px;
  margin: 16px 0 8px 0;
}

.brand p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
}

.login-right {
  flex: 1;
  padding: 60px 50px;
}

.login-card h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.login-tip {
  color: #909399;
  margin: 0 0 24px 0;
  font-size: 14px;
}

.role-selector {
  width: 100%;
  margin-bottom: 24px;
}

.role-selector :deep(.el-radio-button__inner) {
  width: 50%;
  text-align: center;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.demo-accounts {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

.demo-accounts p {
  margin: 0;
}

.demo-accounts p:first-child {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}
</style>
