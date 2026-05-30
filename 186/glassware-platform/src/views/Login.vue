<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <el-icon size="48" color="#409eff"><Cup /></el-icon>
          <h1 class="brand-title">实验室玻璃器皿采购平台</h1>
          <p class="brand-desc">专业的实验室设备一站式采购服务平台</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon size="24" color="#67c23a"><CircleCheck /></el-icon>
            <span>品质保证 正品行货</span>
          </div>
          <div class="feature-item">
            <el-icon size="24" color="#67c23a"><CircleCheck /></el-icon>
            <span>专业配送 快速到达</span>
          </div>
          <div class="feature-item">
            <el-icon size="24" color="#67c23a"><CircleCheck /></el-icon>
            <span>售后无忧 贴心服务</span>
          </div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form">
          <h2 class="form-title">欢迎登录</h2>
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
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
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            <el-form-item label="角色" prop="role">
              <el-radio-group v-model="loginForm.role" size="large" style="width: 100%">
                <el-radio-button value="buyer" style="width: 50%">采购用户</el-radio-button>
                <el-radio-button value="supplier" style="width: 50%">供应商</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form>
          <div class="form-footer">
            <span>还没有账号？</span>
            <router-link to="/register" class="register-link">立即注册</router-link>
          </div>
          <div class="demo-accounts">
            <p class="demo-title">演示账号：</p>
            <p>采购用户：buyer001 / 123456</p>
            <p>供应商：supplier001 / 123456</p>
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
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  role: 'buyer'
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) {
    callback(new Error('用户名由4-20位字母、数字、下划线组成'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!/^.{6,20}$/.test(value)) {
    callback(new Error('密码长度为6-20位'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }]
}

const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        const success = userStore.login(loginForm.username, loginForm.password)
        loading.value = false
        if (success) {
          if (userStore.currentUser.role !== loginForm.role) {
            ElMessage.error('请选择正确的角色类型')
            userStore.logout()
            return
          }
          ElMessage.success('登录成功')
          router.push('/')
        } else {
          ElMessage.error('用户名或密码错误')
        }
      }, 500)
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 1000px;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
  width: 50%;
  padding: 60px 50px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .brand {
    .brand-title {
      font-size: 28px;
      margin: 20px 0 10px;
      font-weight: 600;
    }

    .brand-desc {
      font-size: 14px;
      opacity: 0.9;
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
      font-size: 15px;
    }
  }
}

.login-right {
  width: 50%;
  padding: 60px 50px;
  display: flex;
  align-items: center;

  .login-form {
    width: 100%;

    .form-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 30px;
      color: #303133;
    }

    .login-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin-top: 10px;
      background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
      border: none;

      &:hover {
        opacity: 0.9;
      }
    }

    .form-footer {
      text-align: center;
      margin-top: 20px;
      color: #909399;
      font-size: 14px;

      .register-link {
        color: #409eff;
        margin-left: 5px;
      }
    }

    .demo-accounts {
      margin-top: 30px;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 8px;
      font-size: 13px;
      color: #606266;
      line-height: 1.8;

      .demo-title {
        font-weight: 600;
        color: #303133;
        margin-bottom: 5px;
      }
    }
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left,
  .login-right {
    width: 100%;
    padding: 40px 30px;
  }
}
</style>
