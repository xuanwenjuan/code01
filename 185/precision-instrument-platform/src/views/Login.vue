<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <el-icon :size="48" color="#409eff"><Tools /></el-icon>
          <h1>精密仪器配件采购平台</h1>
          <p>专业的工业级精密配件采购服务平台</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24" color="#409eff"><CircleCheck /></el-icon>
            <span>正品保障 假一赔十</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#67c23a"><Van /></el-icon>
            <span>极速配送 全国包邮</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#e6a23c"><Service /></el-icon>
            <span>专业售后 技术支持</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-card">
          <h2>账号登录</h2>
          <p class="login-subtitle">请选择您的身份并登录</p>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-width="80px"
            class="login-form"
          >
            <el-form-item label="身份" prop="role">
              <el-radio-group v-model="loginForm.role" size="large" style="width: 100%">
                <el-radio-button value="buyer" style="width: 50%; text-align: center">
                  <el-icon><ShoppingCart /></el-icon>
                  采购用户
                </el-radio-button>
                <el-radio-button value="seller" style="width: 50%; text-align: center">
                  <el-icon><Shop /></el-icon>
                  仪器商家
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="账号" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入账号"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :loading="loading"
                @click="handleLogin"
              >
                登 录
              </el-button>
            </el-form-item>
          </el-form>

          <div class="login-tips">
            <p>测试账号：</p>
            <p>采购用户：buyer001 / 123456</p>
            <p>仪器商家：seller001 / 123456</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  User, Lock, ShoppingCart, Shop, CircleCheck, Van, Service, Tools
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  role: 'buyer',
  username: '',
  password: ''
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入账号'))
  } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) {
    callback(new Error('账号为4-20位字母、数字或下划线'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!/^[a-zA-Z0-9_]{6,20}$/.test(value)) {
    callback(new Error('密码为6-20位字母、数字或下划线'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        const result = userStore.login(loginForm.username, loginForm.password)
        loading.value = false

        if (result.success) {
          if (userStore.userInfo.role !== loginForm.role) {
            ElMessage.error(`该账号是${userStore.userInfo.role === 'buyer' ? '采购用户' : '仪器商家'}账号，请选择正确的身份`)
            return
          }
          ElMessage.success(result.message)
          router.push('/')
        } else {
          ElMessage.error(result.message)
        }
      }, 800)
    }
  })
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
  max-width: 960px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  padding: 60px 40px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand {
  margin-bottom: 60px;
}

.brand h1 {
  font-size: 28px;
  margin: 16px 0 8px;
  font-weight: 600;
}

.brand p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.login-right {
  padding: 60px 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 360px;
}

.login-card h2 {
  font-size: 24px;
  margin: 0 0 8px;
  color: #303133;
  font-weight: 600;
}

.login-subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0 0 32px;
}

.login-form :deep(.el-radio-button__inner) {
  width: 100%;
}

.login-tips {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.8;
}

.login-tips p {
  margin: 0;
}

@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .login-left {
    padding: 40px 30px;
  }

  .login-right {
    padding: 40px 30px;
  }

  .brand {
    margin-bottom: 30px;
  }
}
</style>
