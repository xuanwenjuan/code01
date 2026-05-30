<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <h1 class="logo">智慧学堂</h1>
          <p class="slogan">让学习更简单，让成长更高效</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><VideoPlay /></el-icon>
            <div>
              <h3>精品课程</h3>
              <p>1000+优质课程，覆盖全领域</p>
            </div>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><User /></el-icon>
            <div>
              <h3>名师授课</h3>
              <p>行业专家倾心打造</p>
            </div>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Medal /></el-icon>
            <div>
              <h3>权威认证</h3>
              <p>完成学习获得证书</p>
            </div>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-form-card">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">登录账号开始学习</p>
          
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
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
              <div class="form-options">
                <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
                <a href="#" class="forgot-password">忘记密码？</a>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-btn"
                :loading="logging"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>

          <div class="form-footer">
            <span>还没有账号？</span>
            <router-link to="/register" class="register-link">立即注册</router-link>
          </div>

          <div class="demo-tip">
            <el-icon><InfoFilled /></el-icon>
            演示账号: admin / 123456
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { VideoPlay, User, Medal, Lock, InfoFilled } from '@element-plus/icons-vue'
import { validationRules } from '@/utils'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref()
const logging = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456',
  remember: true
})

const loginRules = {
  username: validationRules.username,
  password: validationRules.loginPassword
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    logging.value = true
    
    await userStore.login(loginForm.username, loginForm.password)
    
    ElMessage.success('登录成功')
    
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    logging.value = false
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
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
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
  flex: 1;
  padding: 60px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .brand {
    margin-bottom: 60px;

    .logo {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 12px;
    }

    .slogan {
      font-size: 16px;
      opacity: 0.9;
    }
  }

  .features {
    display: flex;
    flex-direction: column;
    gap: 32px;

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      p {
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }
}

.login-right {
  width: 420px;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form-card {
  width: 100%;

  .form-title {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 8px;
  }

  .form-subtitle {
    font-size: 14px;
    color: #909399;
    margin-bottom: 32px;
  }
}

.login-form {
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .forgot-password {
      color: #667eea;
      font-size: 14px;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .login-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }
}

.form-footer {
  text-align: center;
  font-size: 14px;
  color: #909399;
  margin-top: 20px;

  .register-link {
    color: #667eea;
    margin-left: 4px;

    &:hover {
      opacity: 0.8;
    }
  }
}

.demo-tip {
  margin-top: 24px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 8px;

  .el-icon {
    color: #667eea;
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    padding: 40px 24px;
  }

  .login-right {
    width: 100%;
    padding: 40px 24px;
  }
}
</style>
