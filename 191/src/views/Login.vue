<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand-info">
          <el-icon :size="64" color="#d4af37"><Compass /></el-icon>
          <h1>考古勘探器材采购平台</h1>
          <p>专业考古器材一站式采购服务平台</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24" color="#d4af37"><Medal /></el-icon>
            <span>正品保证 专业品质</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#d4af37"><Van /></el-icon>
            <span>快速配送 全国包邮</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#d4af37"><Service /></el-icon>
            <span>专业售后 技术支持</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-form-wrapper">
          <h2 class="form-title">用户登录</h2>
          <p class="form-desc">请选择您的身份登录</p>

          <el-tabs v-model="loginType" class="login-tabs">
            <el-tab-pane label="考古单位采购方" name="buyer" />
            <el-tab-pane label="勘探器材供货商" name="supplier" />
          </el-tabs>

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
                <el-checkbox v-model="loginForm.remember">记住账号</el-checkbox>
                <a href="#" class="forgot-password">忘记密码?</a>
              </div>
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

          <div class="demo-accounts">
            <p class="demo-title">演示账号：</p>
            <div class="demo-list">
              <div class="demo-item">
                <span>采购方：</span>
                <code>buyer001 / 123456</code>
              </div>
              <div class="demo-item">
                <span>供货商：</span>
                <code>supplier001 / 123456</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { mockUsers } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loginType = ref('buyer')
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
    callback(new Error('账号格式不正确，4-20位字母数字下划线'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!/^[a-zA-Z0-9_]{6,20}$/.test(value)) {
    callback(new Error('密码格式不正确，6-20位字母数字下划线'))
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
  
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      setTimeout(() => {
        const user = mockUsers.find(
          u => u.username === loginForm.username && 
               u.password === loginForm.password &&
               u.role === loginType.value
        )

        if (user) {
          const { password, ...userInfo } = user
          userStore.login(userInfo)
          ElMessage.success('登录成功')
          
          const redirect = route.query.redirect || '/'
          router.push(redirect)
        } else {
          ElMessage.error('账号或密码错误，请检查后重试')
        }
        
        loading.value = false
      }, 800)
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-container {
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
}

.login-left {
  width: 45%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .brand-info {
    text-align: center;
    margin-bottom: 40px;

    h1 {
      font-size: 24px;
      color: #d4af37;
      margin: 16px 0 8px 0;
      font-weight: 600;
    }

    p {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .features {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #e0e0e0;
      font-size: 15px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

.login-right {
  width: 55%;
  padding: 50px 60px;

  .login-form-wrapper {
    max-width: 380px;
    margin: 0 auto;

    .form-title {
      font-size: 28px;
      color: #333;
      margin: 0 0 8px 0;
      font-weight: 600;
    }

    .form-desc {
      font-size: 14px;
      color: #909399;
      margin: 0 0 24px 0;
    }

    .login-tabs {
      margin-bottom: 24px;

      :deep(.el-tabs__nav) {
        width: 100%;
      }

      :deep(.el-tabs__item) {
        width: 50%;
        text-align: center;
      }
    }

    .login-form {
      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .forgot-password {
          color: #d4af37;
          font-size: 14px;

          &:hover {
            color: #8b6914;
          }
        }
      }

      .login-btn {
        width: 100%;
        height: 48px;
        font-size: 16px;
        border-radius: 8px;
        background: linear-gradient(135deg, #d4af37, #8b6914);
        border: none;

        &:hover {
          opacity: 0.9;
        }
      }
    }

    .demo-accounts {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px dashed #ebeef5;

      .demo-title {
        font-size: 14px;
        color: #909399;
        margin: 0 0 12px 0;
      }

      .demo-list {
        .demo-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;

          span {
            color: #909399;
          }

          code {
            background: #f5f7fa;
            padding: 2px 8px;
            border-radius: 4px;
            color: #d4af37;
            font-family: monospace;
          }
        }
      }
    }
  }
}
</style>
