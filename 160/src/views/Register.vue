<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-left">
        <div class="brand">
          <h1 class="logo">智慧学堂</h1>
          <p class="slogan">加入我们，开启学习之旅</p>
        </div>
        <div class="benefits">
          <h3>注册即享</h3>
          <ul>
            <li><el-icon><Check /></el-icon> 免费试听所有课程第一节</li>
            <li><el-icon><Check /></el-icon> 每日签到获取积分</li>
            <li><el-icon><Check /></el-icon> 专属学习顾问服务</li>
            <li><el-icon><Check /></el-icon> 参与社区交流讨论</li>
          </ul>
        </div>
      </div>

      <div class="register-right">
        <div class="register-form-card">
          <h2 class="form-title">创建账号</h2>
          <p class="form-subtitle">填写信息完成注册</p>
          
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名(4-20个字符)"
                size="large"
                prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="nickname">
              <el-input
                v-model="registerForm.nickname"
                placeholder="请输入昵称"
                size="large"
                prefix-icon="UserFilled"
              />
            </el-form-item>
            
            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱"
                size="large"
                prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入手机号"
                size="large"
                prefix-icon="Phone"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码(6-20位)"
                size="large"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                size="large"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleRegister"
              />
            </el-form-item>
            
            <el-form-item prop="agree">
              <el-checkbox v-model="registerForm.agree">
                我已阅读并同意
                <a href="#" class="link">《用户协议》</a>
                和
                <a href="#" class="link">《隐私政策》</a>
              </el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="register-btn"
                :loading="registering"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>

          <div class="form-footer">
            <span>已有账号？</span>
            <router-link to="/login" class="login-link">立即登录</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { Check, User, UserFilled, Message, Phone, Lock } from '@element-plus/icons-vue'
import { validationRules } from '@/utils'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref()
const registering = ref(false)

const registerForm = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const passwordRef = computed(() => registerForm.password)

const registerRules = {
  username: validationRules.username,
  nickname: validationRules.nickname,
  email: validationRules.email,
  phone: validationRules.phone,
  password: validationRules.password,
  confirmPassword: [
    ...validationRules.password,
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  agree: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请阅读并同意用户协议'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    registering.value = true
    
    await userStore.register({
      username: registerForm.username,
      nickname: registerForm.nickname,
      email: registerForm.email,
      phone: registerForm.phone
    })
    
    ElMessage.success('注册成功')
    router.push('/')
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    registering.value = false
  }
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
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-left {
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

  .benefits {
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    ul {
      display: flex;
      flex-direction: column;
      gap: 16px;

      li {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        opacity: 0.9;

        .el-icon {
          color: #67c23a;
          font-size: 18px;
        }
      }
    }
  }
}

.register-right {
  width: 420px;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-form-card {
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
    margin-bottom: 24px;
  }
}

.register-form {
  .register-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }

  .link {
    color: #667eea;
  }
}

.form-footer {
  text-align: center;
  font-size: 14px;
  color: #909399;
  margin-top: 20px;

  .login-link {
    color: #667eea;
    margin-left: 4px;

    &:hover {
      opacity: 0.8;
    }
  }
}

@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
  }

  .register-left {
    padding: 40px 24px;
  }

  .register-right {
    width: 100%;
    padding: 40px 24px;
  }
}
</style>
